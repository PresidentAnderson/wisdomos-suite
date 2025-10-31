/**
 * Coach Factory - Area-Specific Coaching Intelligence
 *
 * Routes voice coaching sessions to specialized coaches based on:
 * - Life area classification (10 areas)
 * - Current fulfillment score
 * - Restoration mode (score < 30) vs Play mode (score >= 40)
 *
 * Integrates with:
 * - Phoenix Wisdom Coach (voice sessions)
 * - Fulfillment Display (area scores)
 * - WE2/WE3 Relationship Assessment
 * - Autobiography Timeline (fulfillment signals)
 */

import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

// =====================================================
// Type Definitions
// =====================================================

export type LifeAreaId =
  // Systemic / Structural (5 areas)
  | 'work'
  | 'finance'
  | 'living-environment'
  | 'legal-civic'
  | 'time-energy-management'
  // Relational / Human (5 areas)
  | 'romantic-intimacy'
  | 'family'
  | 'friendships'
  | 'professional-network'
  | 'community-belonging'
  // Inner / Personal (5 areas)
  | 'physical-health'
  | 'mental-health'
  | 'emotional-wellbeing'
  | 'personal-growth'
  | 'spirituality-meaning'
  // Creative / Expressive (5 areas)
  | 'creative-expression'
  | 'hobbies-play'
  | 'style-aesthetics'
  | 'humor-levity'
  | 'sensuality-pleasure'
  // Exploratory / Expansive (5 areas)
  | 'travel-adventure'
  | 'learning-education'
  | 'innovation-experimentation'
  | 'nature-environment'
  | 'curiosity-wonder'
  // Integrative / Legacy (5 areas)
  | 'purpose-mission'
  | 'values-integrity'
  | 'legacy-impact'
  | 'contribution-service'
  | 'wisdom-integration'

export type CoachMode = 'restoration' | 'play' | 'unknown'

export interface CoachConfig {
  id: string
  life_area_id: LifeAreaId
  coach_name: string
  restoration_prompt: string
  play_prompt: string
  dialogue_policies: {
    structural?: string
    immediate?: string
    generative?: string
    representational?: string
  }
}

export interface RoutingResult {
  lifeArea: LifeAreaId
  areaScore: number
  coachMode: CoachMode
  coachName: string
  contextualResponse: string
  relationshipContext?: {
    relationshipName: string
    weScore?: number
    shouldTriggerAssessment: boolean
    triggerReason?: string
  }
  fulfillmentSignal?: {
    signalType: 'breakthrough' | 'setback' | 'progress' | 'milestone'
    emotionalCharge: number // -5 to +5
    description: string
  }
}

// =====================================================
// Coach Factory Class
// =====================================================

export class CoachFactory {
  private supabase: ReturnType<typeof createClient>

  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase
  }

  /**
   * Main routing method - classifies transcript and routes to appropriate coach
   */
  async routeSession(params: {
    transcript: string
    tags: string[]
    themes: string[]
    sentiment: any
    userId: string
  }): Promise<RoutingResult> {
    try {
      // Step 1: Classify life area from transcript
      const lifeArea = await this.classifyLifeArea(
        params.transcript,
        params.tags,
        params.themes
      )

      // Step 2: Fetch current area score from fulfillment display
      const areaScore = await this.getAreaScore(params.userId, lifeArea)

      // Step 3: Determine coach mode based on score
      const coachMode = this.determineCoachMode(areaScore)

      // Step 4: Load coach config for this area
      const config = await this.getCoachConfig(lifeArea)

      // Step 5: Check for relationship mentions
      const relationshipContext = await this.analyzeRelationshipContext(
        params.transcript,
        params.tags,
        params.userId
      )

      // Step 6: Check for fulfillment signals
      const fulfillmentSignal = await this.detectFulfillmentSignal(
        params.transcript,
        params.sentiment,
        areaScore
      )

      // Step 7: Generate contextual response
      const contextualResponse = await this.generateResponse({
        transcript: params.transcript,
        config,
        mode: coachMode,
        areaScore,
        sentiment: params.sentiment,
        relationshipContext,
      })

      return {
        lifeArea,
        areaScore,
        coachMode,
        coachName: config.coach_name,
        contextualResponse,
        relationshipContext,
        fulfillmentSignal,
      }
    } catch (error) {
      console.error('[CoachFactory] Routing error:', error)
      throw error
    }
  }

  /**
   * Classifies transcript into one of 10 life areas using GPT-4o-mini
   */
  private async classifyLifeArea(
    transcript: string,
    tags: string[],
    themes: string[]
  ): Promise<LifeAreaId> {
    try {
      const prompt = `Classify this journal entry into ONE of these 30 life areas:

**Systemic / Structural (Foundation)**
1. work - Career, job, professional performance
2. finance - Money, income, investments, financial planning
3. living-environment - Home, living space, physical environment
4. legal-civic - Legal matters, civic duties, documentation
5. time-energy-management - Schedule, productivity, energy allocation

**Relational / Human (Connections)**
6. romantic-intimacy - Romantic relationships, intimacy, partnership
7. family - Family bonds, parents, siblings, children
8. friendships - Close friends, social connections
9. professional-network - Colleagues, mentors, professional relationships
10. community-belonging - Community involvement, belonging, social groups

**Inner / Personal (Self)**
11. physical-health - Body, fitness, physical wellness
12. mental-health - Mental wellness, therapy, psychological health
13. emotional-wellbeing - Emotions, emotional regulation, feelings
14. personal-growth - Learning, self-improvement, development
15. spirituality-meaning - Spirituality, purpose, existential questions

**Creative / Expressive (Expression)**
16. creative-expression - Art, music, writing, creative projects
17. hobbies-play - Fun activities, games, recreational pursuits
18. style-aesthetics - Personal style, beauty, aesthetic choices
19. humor-levity - Humor, playfulness, lightness
20. sensuality-pleasure - Sensual experiences, pleasure, enjoyment

**Exploratory / Expansive (Growth)**
21. travel-adventure - Travel, exploration, adventures
22. learning-education - Education, courses, skill acquisition
23. innovation-experimentation - Trying new things, experimenting
24. nature-environment - Nature connection, environmental awareness
25. curiosity-wonder - Curiosity, wonder, discovery

**Integrative / Legacy (Purpose)**
26. purpose-mission - Life purpose, mission, calling
27. values-integrity - Core values, integrity, ethics
28. legacy-impact - What you leave behind, long-term impact
29. contribution-service - Giving back, service, helping others
30. wisdom-integration - Integration of experiences, wisdom

Context:
Transcript: "${transcript.substring(0, 500)}"
Tags: ${tags.join(', ')}
Themes: ${themes.join(', ')}

Respond with ONLY the life area ID (e.g., "work" or "romantic-intimacy"). No explanation.`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50,
      })

      const classification = response.choices[0]?.message?.content?.trim() as LifeAreaId

      // Validate classification
      const validAreas: LifeAreaId[] = [
        // Systemic / Structural
        'work', 'finance', 'living-environment', 'legal-civic', 'time-energy-management',
        // Relational / Human
        'romantic-intimacy', 'family', 'friendships', 'professional-network', 'community-belonging',
        // Inner / Personal
        'physical-health', 'mental-health', 'emotional-wellbeing', 'personal-growth', 'spirituality-meaning',
        // Creative / Expressive
        'creative-expression', 'hobbies-play', 'style-aesthetics', 'humor-levity', 'sensuality-pleasure',
        // Exploratory / Expansive
        'travel-adventure', 'learning-education', 'innovation-experimentation', 'nature-environment', 'curiosity-wonder',
        // Integrative / Legacy
        'purpose-mission', 'values-integrity', 'legacy-impact', 'contribution-service', 'wisdom-integration',
      ]

      if (validAreas.includes(classification)) {
        return classification
      }

      // Default fallback
      console.warn('[CoachFactory] Invalid classification, defaulting to personal-growth')
      return 'personal-growth'
    } catch (error) {
      console.error('[CoachFactory] Classification error:', error)
      return 'personal-growth' // Safe default
    }
  }

  /**
   * Fetches current fulfillment score for a specific life area
   */
  private async getAreaScore(userId: string, lifeArea: LifeAreaId): Promise<number> {
    try {
      // Query fulfillment_display_items for the user's current score
      const { data, error } = await this.supabase
        .from('fulfillment_display_items')
        .select('current_score')
        .eq('user_id', userId)
        .eq('area_slug', lifeArea)
        .single()

      if (error) {
        console.warn(`[CoachFactory] No score found for ${lifeArea}, defaulting to 50`)
        return 50 // Neutral default
      }

      return data?.current_score ?? 50
    } catch (error) {
      console.error('[CoachFactory] Error fetching area score:', error)
      return 50 // Safe default
    }
  }

  /**
   * Determines coach mode based on score thresholds
   * < 30: Restoration mode (healing, support)
   * >= 40: Play mode (growth, challenge)
   * 30-39: Unknown (transitional)
   */
  private determineCoachMode(score: number): CoachMode {
    if (score < 30) return 'restoration'
    if (score >= 40) return 'play'
    return 'unknown' // Transitional zone
  }

  /**
   * Loads coach config from database
   */
  private async getCoachConfig(lifeArea: LifeAreaId): Promise<CoachConfig> {
    try {
      const { data, error } = await this.supabase
        .from('coach_factory_config')
        .select('*')
        .eq('life_area_id', lifeArea)
        .single()

      if (error) throw error

      return data as CoachConfig
    } catch (error) {
      console.error('[CoachFactory] Error loading coach config:', error)
      throw new Error(`Coach config not found for area: ${lifeArea}`)
    }
  }

  /**
   * Analyzes transcript for relationship mentions and determines if WE assessment needed
   */
  private async analyzeRelationshipContext(
    transcript: string,
    tags: string[],
    userId: string
  ): Promise<RoutingResult['relationshipContext'] | undefined> {
    try {
      // Check if transcript mentions relationships
      const relationshipKeywords = [
        'relationship',
        'partner',
        'friend',
        'family',
        'spouse',
        'boyfriend',
        'girlfriend',
        'husband',
        'wife',
        'colleague',
        'friend',
      ]

      const hasRelationshipMention = relationshipKeywords.some(
        (keyword) =>
          transcript.toLowerCase().includes(keyword) ||
          tags.some((tag) => tag.toLowerCase().includes(keyword))
      )

      if (!hasRelationshipMention) return undefined

      // Use GPT to extract relationship name and assess if WE assessment needed
      const prompt = `Analyze this journal entry for relationship context:

"${transcript.substring(0, 800)}"

Tasks:
1. Extract the name(s) of any people mentioned (first name only)
2. Determine if the user seems distressed or conflicted about this relationship
3. If distressed, provide a brief reason (1 sentence)

Respond in JSON format:
{
  "relationshipName": "Name or 'Unknown'",
  "isDistressed": true/false,
  "reason": "Brief reason if distressed"
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')

      return {
        relationshipName: analysis.relationshipName || 'Unknown',
        shouldTriggerAssessment: analysis.isDistressed || false,
        triggerReason: analysis.reason,
      }
    } catch (error) {
      console.error('[CoachFactory] Relationship analysis error:', error)
      return undefined
    }
  }

  /**
   * Detects significant fulfillment signals (breakthroughs, setbacks)
   */
  private async detectFulfillmentSignal(
    transcript: string,
    sentiment: any,
    areaScore: number
  ): Promise<RoutingResult['fulfillmentSignal'] | undefined> {
    try {
      const prompt = `Analyze this journal entry for significant life moments:

"${transcript.substring(0, 800)}"

Sentiment: ${JSON.stringify(sentiment)}

Determine if this represents:
- breakthrough: Major positive shift or realization
- setback: Significant challenge or disappointment
- progress: Steady improvement or growth
- milestone: Achievement or important marker
- none: Regular reflection, nothing significant

Also rate emotional charge from -5 (very negative) to +5 (very positive).

Respond in JSON:
{
  "signalType": "breakthrough|setback|progress|milestone|none",
  "emotionalCharge": -5 to +5,
  "description": "Brief 1-sentence description"
}`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      })

      const signal = JSON.parse(response.choices[0]?.message?.content || '{}')

      // Only return if it's a significant signal
      if (signal.signalType === 'none') return undefined

      return {
        signalType: signal.signalType,
        emotionalCharge: signal.emotionalCharge || 0,
        description: signal.description || 'Significant moment detected',
      }
    } catch (error) {
      console.error('[CoachFactory] Signal detection error:', error)
      return undefined
    }
  }

  /**
   * Generates contextual coach response using appropriate prompt
   */
  private async generateResponse(params: {
    transcript: string
    config: CoachConfig
    mode: CoachMode
    areaScore: number
    sentiment: any
    relationshipContext?: RoutingResult['relationshipContext']
  }): Promise<string> {
    try {
      const { transcript, config, mode, areaScore, sentiment, relationshipContext } = params

      // Select appropriate prompt based on mode
      let systemPrompt = ''
      if (mode === 'restoration') {
        systemPrompt = config.restoration_prompt
      } else if (mode === 'play') {
        systemPrompt = config.play_prompt
      } else {
        // Transitional mode - blend both prompts
        systemPrompt = `You are a supportive coach helping someone in transition. Their current score is ${areaScore}/100. Balance encouragement with practical support. ${config.restoration_prompt}`
      }

      // Add dialogue policy context
      const dialogueContext = `
Dialogue Policies:
- Structural: ${config.dialogue_policies.structural}
- Immediate: ${config.dialogue_policies.immediate}
- Generative: ${config.dialogue_policies.generative}
- Representational: ${config.dialogue_policies.representational}

Current Context:
- Life Area: ${config.life_area_id}
- Mode: ${mode}
- Score: ${areaScore}/100
- Sentiment: ${sentiment?.primary || 'neutral'}
${relationshipContext ? `- Relationship mentioned: ${relationshipContext.relationshipName}` : ''}
`

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\n${dialogueContext}\n\nRespond in under 150 words. Be warm and human.`,
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
        temperature: 0.8,
        max_tokens: 250,
      })

      return response.choices[0]?.message?.content || 'Thank you for sharing. I hear you.'
    } catch (error) {
      console.error('[CoachFactory] Response generation error:', error)
      return 'Thank you for sharing your reflection. I appreciate your openness.'
    }
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Creates a CoachFactory instance with Supabase client
 */
export function createCoachFactory(supabase: ReturnType<typeof createClient>): CoachFactory {
  return new CoachFactory(supabase)
}
