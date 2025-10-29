/**
 * AI-Powered Journal Analysis Service
 *
 * Purpose: Automatically extract fulfillment scores from journal entries using OpenAI GPT-4
 * Features:
 * - Identifies mentioned life areas from journal text
 * - Extracts confidence-weighted scores (0-5) per area
 * - Provides reasoning for each score
 * - Handles ambiguous text gracefully
 *
 * @module ai-journal-analysis
 * @version 1.0
 */

import OpenAI from 'openai';

// =====================================================
// TYPES
// =====================================================

export interface AnalyzedScore {
  area_code: string;
  score: number; // 0-5
  confidence: number; // 0-1
  reasoning: string;
}

export interface JournalAnalysisResult {
  scores: AnalyzedScore[];
  sentiment: number; // -1 to 1
  summary: string;
  areas_mentioned: string[];
  token_usage?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface AnalysisError {
  error: string;
  fallback?: boolean;
}

// =====================================================
// LIFE AREA DEFINITIONS (16 canonical areas)
// =====================================================

export const LIFE_AREAS = {
  WRK: {
    name: 'Work/Enterprise',
    emoji: '🧱',
    description: 'Professional work, business operations, enterprise activities, career progress, job satisfaction, work output'
  },
  PUR: {
    name: 'Purpose/Calling',
    emoji: '✨',
    description: 'Life mission, calling, deeper purpose alignment, meaningful contribution, sense of direction'
  },
  MUS: {
    name: 'Music (Creative)',
    emoji: '🎵',
    description: 'Musical composition, production, creative musical expression, songwriting, performances'
  },
  WRT: {
    name: 'Writing (Creative)',
    emoji: '✍️',
    description: 'Written creative works, manuscripts, publications, blogging, journaling, books'
  },
  SPE: {
    name: 'Public Speaking',
    emoji: '🎤',
    description: 'Public presentations, talks, speaking engagements, teaching, workshops'
  },
  LRN: {
    name: 'Learning & Growth',
    emoji: '📚',
    description: 'Continuous learning, skill development, personal growth, courses, reading, education'
  },
  HLT: {
    name: 'Health & Vitality',
    emoji: '🩺',
    description: 'Physical health, fitness, nutrition, vitality, sleep, exercise, medical care'
  },
  SPF: {
    name: 'Spiritual Development',
    emoji: '🕊️',
    description: 'Spiritual practices, connection, inner development, meditation, prayer, mindfulness'
  },
  FIN: {
    name: 'Finance & Wealth Health',
    emoji: '💹',
    description: 'Financial security, wealth building, fiscal health, budgeting, investments, income'
  },
  FAM: {
    name: 'Family',
    emoji: '🏡',
    description: 'Family relationships, boundaries, rituals, parents, siblings, children, extended family'
  },
  FRD: {
    name: 'Friendship',
    emoji: '🤝',
    description: 'Close friendships, reciprocity, connection, social bonds, friend gatherings'
  },
  COM: {
    name: 'Community',
    emoji: '🏘️',
    description: 'Community engagement, service, belonging, volunteering, local involvement'
  },
  LAW: {
    name: 'Law & Justice',
    emoji: '⚖️',
    description: 'Legal matters, justice pursuit, compliance, contracts, rights, advocacy'
  },
  INT: {
    name: 'Integrity & Recovery',
    emoji: '🧭',
    description: 'Personal integrity, promise-keeping, recovery, honesty, ethical alignment'
  },
  FOR: {
    name: 'Forgiveness & Reconciliation',
    emoji: '🤍',
    description: 'Forgiveness work, amends, reconciliation, letting go, healing relationships'
  },
  AUT: {
    name: 'Autobiography (Narrative)',
    emoji: '📖',
    description: 'Life narrative, story coherence, meaning-making, life review, legacy'
  },
} as const;

// =====================================================
// SYSTEM PROMPT
// =====================================================

const SYSTEM_PROMPT = `You are an expert life coach and journal analyst for WisdomOS, a phoenix transformation platform. Your role is to analyze journal entries and extract fulfillment scores across 16 life areas.

## Your Task
Read the journal entry and identify which life areas are mentioned. For each area mentioned, provide:
1. A score from 0-5 indicating the person's current state in that area
2. A confidence score (0-1) indicating how certain you are based on the text
3. Clear reasoning explaining your score

## Scoring Scale (0-5)
- **0-1**: Critical gap - significant struggle, distress, or absence
- **2-3**: Friction - challenges present but being addressed, mixed feelings
- **4**: Healthy - functioning well, generally positive
- **5**: Excellent - thriving, exceptional satisfaction, peak state

## The 16 Life Areas
${Object.entries(LIFE_AREAS).map(([code, area]) =>
  `- **${code}** (${area.emoji} ${area.name}): ${area.description}`
).join('\n')}

## Guidelines
1. **Be Conservative**: Only extract areas that are clearly mentioned or strongly implied
2. **Context Matters**: Consider the overall tone and specific details mentioned
3. **Confidence Scoring**:
   - 0.8-1.0: Area explicitly discussed with clear sentiment
   - 0.5-0.7: Area implied or briefly mentioned
   - 0.3-0.4: Tangentially related or uncertain
4. **Multiple Mentions**: If an area is mentioned multiple times, synthesize into one score
5. **Sentiment Analysis**: Extract overall sentiment (-1 negative to +1 positive)
6. **Ambiguity Handling**: If text is vague, lower confidence and explain in reasoning

## Response Format
Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "sentiment": <number between -1 and 1>,
  "summary": "<1-2 sentence summary of entry>",
  "areas_mentioned": ["<AREA_CODE1>", "<AREA_CODE2>"],
  "scores": [
    {
      "area_code": "<AREA_CODE>",
      "score": <0-5>,
      "confidence": <0-1>,
      "reasoning": "<clear explanation of score>"
    }
  ]
}

Remember: Only include areas that are actually present in the text. It's better to identify 2-3 areas accurately than to guess at 10.`;

// =====================================================
// OPENAI CLIENT
// =====================================================

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    openaiClient = new OpenAI({
      apiKey,
      // For client-side usage in Next.js
      dangerouslyAllowBrowser: true,
    });
  }

  return openaiClient;
}

// =====================================================
// MAIN ANALYSIS FUNCTION
// =====================================================

export async function analyzeJournalEntry(
  journalText: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<JournalAnalysisResult | AnalysisError> {
  try {
    // Validate input
    if (!journalText || journalText.trim().length === 0) {
      return {
        error: 'Journal text is empty',
        fallback: false,
      };
    }

    // Check for minimum text length
    if (journalText.trim().length < 20) {
      return {
        error: 'Journal text too short for meaningful analysis (minimum 20 characters)',
        fallback: false,
      };
    }

    // Get OpenAI client
    const client = getOpenAIClient();

    // Make API call
    const completion = await client.chat.completions.create({
      model: options?.model || 'gpt-4o', // GPT-4 Optimized
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this journal entry:\n\n${journalText}`,
        },
      ],
      temperature: options?.temperature || 0.3, // Lower temperature for more consistent analysis
      max_tokens: options?.maxTokens || 1000,
      response_format: { type: 'json_object' }, // Force JSON output
    });

    // Extract response
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return {
        error: 'OpenAI returned empty response',
        fallback: false,
      };
    }

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return {
        error: 'Failed to parse AI response as JSON',
        fallback: false,
      };
    }

    // Validate response structure
    if (!parsedResponse.scores || !Array.isArray(parsedResponse.scores)) {
      return {
        error: 'Invalid response structure from AI',
        fallback: false,
      };
    }

    // Validate and sanitize scores
    const validatedScores = parsedResponse.scores
      .filter((score: any) => {
        return (
          score.area_code &&
          typeof score.score === 'number' &&
          typeof score.confidence === 'number' &&
          score.reasoning
        );
      })
      .map((score: any) => ({
        area_code: score.area_code.toUpperCase(),
        score: Math.max(0, Math.min(5, score.score)), // Clamp to 0-5
        confidence: Math.max(0, Math.min(1, score.confidence)), // Clamp to 0-1
        reasoning: score.reasoning.trim(),
      }));

    // Return result
    return {
      scores: validatedScores,
      sentiment: typeof parsedResponse.sentiment === 'number'
        ? Math.max(-1, Math.min(1, parsedResponse.sentiment))
        : 0,
      summary: parsedResponse.summary || 'No summary provided',
      areas_mentioned: parsedResponse.areas_mentioned || [],
      token_usage: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
    };

  } catch (error: any) {
    console.error('Error analyzing journal entry:', error);

    // Check for specific error types
    if (error?.error?.code === 'insufficient_quota') {
      return {
        error: 'OpenAI API quota exceeded. Please check your billing.',
        fallback: true,
      };
    }

    if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return {
        error: 'Unable to connect to OpenAI API. Please check your internet connection.',
        fallback: true,
      };
    }

    return {
      error: error?.message || 'Unknown error occurred during analysis',
      fallback: true,
    };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get display name for area code
 */
export function getAreaName(areaCode: string): string {
  const area = LIFE_AREAS[areaCode as keyof typeof LIFE_AREAS];
  return area ? `${area.emoji} ${area.name}` : areaCode;
}

/**
 * Get score interpretation
 */
export function getScoreInterpretation(score: number): {
  status: 'critical' | 'friction' | 'healthy' | 'excellent';
  message: string;
  color: string;
} {
  if (score <= 1) {
    return {
      status: 'critical',
      message: 'Critical gap',
      color: 'red',
    };
  } else if (score <= 3) {
    return {
      status: 'friction',
      message: 'Friction',
      color: 'yellow',
    };
  } else if (score === 4) {
    return {
      status: 'healthy',
      message: 'Healthy',
      color: 'green',
    };
  } else {
    return {
      status: 'excellent',
      message: 'Excellent',
      color: 'emerald',
    };
  }
}

/**
 * Check if OpenAI API is available
 */
export function isOpenAIAvailable(): boolean {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  return Boolean(apiKey && apiKey.startsWith('sk-'));
}

/**
 * Estimate token usage for a journal entry (rough estimate)
 */
export function estimateTokenUsage(journalText: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  const inputTokens = Math.ceil(journalText.length / 4);
  const systemPromptTokens = Math.ceil(SYSTEM_PROMPT.length / 4);
  const estimatedOutputTokens = 500; // Average response size

  return inputTokens + systemPromptTokens + estimatedOutputTokens;
}

/**
 * Estimate cost for analysis (GPT-4 pricing as of 2024)
 */
export function estimateCost(tokenUsage: number): number {
  // GPT-4 pricing: ~$0.03 per 1K tokens (input) + ~$0.06 per 1K tokens (output)
  // Using average of $0.045 per 1K tokens
  return (tokenUsage / 1000) * 0.045;
}

// =====================================================
// FALLBACK ANALYSIS (When OpenAI unavailable)
// =====================================================

/**
 * Basic keyword-based analysis when OpenAI is unavailable
 */
export function fallbackAnalysis(journalText: string): JournalAnalysisResult {
  const text = journalText.toLowerCase();
  const scores: AnalyzedScore[] = [];

  // Simple keyword matching
  const keywords: Record<string, string[]> = {
    WRK: ['work', 'job', 'career', 'project', 'business', 'client', 'meeting', 'deadline'],
    HLT: ['health', 'exercise', 'gym', 'sleep', 'tired', 'energy', 'doctor', 'fitness'],
    FAM: ['family', 'mom', 'dad', 'parent', 'sibling', 'brother', 'sister', 'kids', 'children'],
    FRD: ['friend', 'friendship', 'hang out', 'social', 'catch up'],
    FIN: ['money', 'financial', 'budget', 'income', 'expense', 'savings', 'investment'],
    LRN: ['learn', 'study', 'course', 'book', 'reading', 'skill', 'knowledge'],
    SPF: ['spiritual', 'meditation', 'prayer', 'mindfulness', 'faith', 'soul'],
    PUR: ['purpose', 'meaning', 'calling', 'mission', 'passion', 'fulfillment'],
  };

  // Count keyword matches
  const matches: Record<string, number> = {};

  Object.entries(keywords).forEach(([areaCode, words]) => {
    matches[areaCode] = words.filter(word => text.includes(word)).length;
  });

  // Convert matches to scores
  Object.entries(matches).forEach(([areaCode, count]) => {
    if (count > 0) {
      scores.push({
        area_code: areaCode,
        score: 3, // Neutral score
        confidence: Math.min(0.6, count * 0.15), // Low confidence
        reasoning: `Detected ${count} keyword(s) related to this area. (Fallback analysis)`,
      });
    }
  });

  // Simple sentiment (positive/negative word counting)
  const positiveWords = ['good', 'great', 'happy', 'excited', 'love', 'wonderful', 'amazing', 'progress'];
  const negativeWords = ['bad', 'sad', 'angry', 'frustrated', 'difficult', 'struggle', 'worry', 'anxious'];

  const positiveCount = positiveWords.filter(w => text.includes(w)).length;
  const negativeCount = negativeWords.filter(w => text.includes(w)).length;

  const sentiment = (positiveCount - negativeCount) / Math.max(1, positiveCount + negativeCount);

  return {
    scores: scores.slice(0, 5), // Limit to top 5
    sentiment,
    summary: 'Basic keyword-based analysis (OpenAI unavailable)',
    areas_mentioned: scores.map(s => s.area_code),
  };
}
