/**
 * Comprehensive Emotion Library for WisdomOS
 *
 * 60+ emotions organized by categories with rich metadata
 * Supports customization, tracking, and analytics
 */

export interface Emotion {
  id: string
  emoji: string
  name: string
  category: EmotionCategory
  subcategory?: string
  intensity: 1 | 2 | 3 | 4 | 5 // 1=subtle, 5=intense
  valence: 'positive' | 'negative' | 'neutral' | 'mixed'
  energy: 'high' | 'medium' | 'low'
  related_emotions: string[] // IDs of related emotions
  description: string
  triggers?: string[] // Common triggers
  life_areas?: string[] // Related life area codes
  color: string // Hex color for visualization
  is_default: boolean // Show by default
}

export type EmotionCategory =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'love'
  | 'peace'
  | 'energy'
  | 'confusion'
  | 'social'
  | 'achievement'
  | 'spiritual'
  | 'creative'

export const EMOTION_CATEGORIES: Record<EmotionCategory, { name: string; description: string; color: string }> = {
  joy: {
    name: 'Joy & Happiness',
    description: 'Feelings of pleasure, contentment, and satisfaction',
    color: '#FFD700' // Gold
  },
  sadness: {
    name: 'Sadness & Grief',
    description: 'Feelings of loss, sorrow, and melancholy',
    color: '#4682B4' // Steel Blue
  },
  anger: {
    name: 'Anger & Frustration',
    description: 'Feelings of irritation, annoyance, and rage',
    color: '#DC143C' // Crimson
  },
  fear: {
    name: 'Fear & Anxiety',
    description: 'Feelings of worry, nervousness, and apprehension',
    color: '#8B008B' // Dark Magenta
  },
  surprise: {
    name: 'Surprise & Wonder',
    description: 'Feelings of astonishment, curiosity, and amazement',
    color: '#FF69B4' // Hot Pink
  },
  disgust: {
    name: 'Disgust & Aversion',
    description: 'Feelings of repulsion and strong dislike',
    color: '#556B2F' // Dark Olive Green
  },
  love: {
    name: 'Love & Connection',
    description: 'Feelings of affection, warmth, and intimacy',
    color: '#FF1493' // Deep Pink
  },
  peace: {
    name: 'Peace & Calm',
    description: 'Feelings of tranquility, serenity, and balance',
    color: '#87CEEB' // Sky Blue
  },
  energy: {
    name: 'Energy & Vitality',
    description: 'Feelings of vigor, enthusiasm, and liveliness',
    color: '#FF4500' // Orange Red
  },
  confusion: {
    name: 'Confusion & Doubt',
    description: 'Feelings of uncertainty, perplexity, and indecision',
    color: '#696969' // Dim Gray
  },
  social: {
    name: 'Social Emotions',
    description: 'Emotions arising from social interactions',
    color: '#32CD32' // Lime Green
  },
  achievement: {
    name: 'Achievement & Pride',
    description: 'Feelings related to accomplishment and success',
    color: '#FFD700' // Gold
  },
  spiritual: {
    name: 'Spiritual & Transcendent',
    description: 'Feelings of awe, reverence, and connection to something greater',
    color: '#9370DB' // Medium Purple
  },
  creative: {
    name: 'Creative & Inspired',
    description: 'Feelings of innovation, imagination, and flow',
    color: '#FF6347' // Tomato
  }
}

export const COMPREHENSIVE_EMOTIONS: Emotion[] = [
  // JOY & HAPPINESS
  {
    id: 'joy-ecstatic',
    emoji: '🤩',
    name: 'Ecstatic',
    category: 'joy',
    intensity: 5,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['joy-excited', 'joy-euphoric'],
    description: 'Intense overwhelming joy and enthusiasm',
    color: '#FFD700',
    is_default: true
  },
  {
    id: 'joy-happy',
    emoji: '😊',
    name: 'Happy',
    category: 'joy',
    intensity: 3,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['joy-content', 'joy-cheerful'],
    description: 'General feeling of wellbeing and pleasure',
    color: '#FFD700',
    is_default: true
  },
  {
    id: 'joy-content',
    emoji: '😌',
    name: 'Content',
    category: 'joy',
    intensity: 2,
    valence: 'positive',
    energy: 'low',
    related_emotions: ['peace-serene', 'joy-satisfied'],
    description: 'Peaceful satisfaction with current state',
    color: '#FFD700',
    is_default: true
  },
  {
    id: 'joy-cheerful',
    emoji: '😄',
    name: 'Cheerful',
    category: 'joy',
    intensity: 3,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['joy-happy', 'joy-playful'],
    description: 'Light-hearted and optimistic',
    color: '#FFD700',
    is_default: false
  },
  {
    id: 'joy-playful',
    emoji: '😜',
    name: 'Playful',
    category: 'joy',
    intensity: 3,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['joy-cheerful', 'creative-inspired'],
    description: 'Fun-loving and mischievous',
    color: '#FFD700',
    is_default: false
  },
  {
    id: 'joy-euphoric',
    emoji: '🥳',
    name: 'Euphoric',
    category: 'joy',
    intensity: 5,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['joy-ecstatic', 'joy-elated'],
    description: 'Intense happiness and excitement',
    color: '#FFD700',
    is_default: false
  },
  {
    id: 'joy-amused',
    emoji: '😆',
    name: 'Amused',
    category: 'joy',
    intensity: 2,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['joy-cheerful', 'joy-entertained'],
    description: 'Finding something funny or entertaining',
    color: '#FFD700',
    is_default: false
  },

  // PEACE & CALM
  {
    id: 'peace-peaceful',
    emoji: '😇',
    name: 'Peaceful',
    category: 'peace',
    intensity: 3,
    valence: 'positive',
    energy: 'low',
    related_emotions: ['peace-calm', 'peace-serene'],
    description: 'Deep inner tranquility',
    color: '#87CEEB',
    is_default: true
  },
  {
    id: 'peace-calm',
    emoji: '😌',
    name: 'Calm',
    category: 'peace',
    intensity: 2,
    valence: 'neutral',
    energy: 'low',
    related_emotions: ['peace-peaceful', 'peace-relaxed'],
    description: 'Free from agitation or strong emotion',
    color: '#87CEEB',
    is_default: true
  },
  {
    id: 'peace-serene',
    emoji: '🧘',
    name: 'Serene',
    category: 'peace',
    intensity: 3,
    valence: 'positive',
    energy: 'low',
    related_emotions: ['peace-peaceful', 'spiritual-meditative'],
    description: 'Perfectly calm and untroubled',
    color: '#87CEEB',
    is_default: false
  },
  {
    id: 'peace-relaxed',
    emoji: '😎',
    name: 'Relaxed',
    category: 'peace',
    intensity: 2,
    valence: 'positive',
    energy: 'low',
    related_emotions: ['peace-calm', 'joy-content'],
    description: 'Free from tension and anxiety',
    color: '#87CEEB',
    is_default: false
  },

  // SADNESS & GRIEF
  {
    id: 'sad-sad',
    emoji: '😢',
    name: 'Sad',
    category: 'sadness',
    intensity: 3,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['sad-melancholy', 'sad-down'],
    description: 'Feeling sorrowful or unhappy',
    color: '#4682B4',
    is_default: true
  },
  {
    id: 'sad-depressed',
    emoji: '😞',
    name: 'Depressed',
    category: 'sadness',
    intensity: 4,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['sad-sad', 'sad-hopeless'],
    description: 'Deep sadness and lack of energy',
    color: '#4682B4',
    is_default: false
  },
  {
    id: 'sad-lonely',
    emoji: '🥺',
    name: 'Lonely',
    category: 'sadness',
    intensity: 3,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['sad-sad', 'social-isolated'],
    description: 'Feeling isolated and disconnected',
    color: '#4682B4',
    is_default: false
  },
  {
    id: 'sad-melancholy',
    emoji: '😔',
    name: 'Melancholy',
    category: 'sadness',
    intensity: 3,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['sad-sad', 'sad-nostalgic'],
    description: 'Pensive sadness with no obvious cause',
    color: '#4682B4',
    is_default: false
  },
  {
    id: 'sad-grieving',
    emoji: '😭',
    name: 'Grieving',
    category: 'sadness',
    intensity: 5,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['sad-sad', 'sad-heartbroken'],
    description: 'Deep sorrow from loss',
    color: '#4682B4',
    is_default: false
  },
  {
    id: 'sad-disappointed',
    emoji: '😕',
    name: 'Disappointed',
    category: 'sadness',
    intensity: 2,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['sad-sad', 'anger-frustrated'],
    description: 'Sadness from unmet expectations',
    color: '#4682B4',
    is_default: false
  },

  // ANGER & FRUSTRATION
  {
    id: 'anger-angry',
    emoji: '😠',
    name: 'Angry',
    category: 'anger',
    intensity: 4,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['anger-furious', 'anger-irritated'],
    description: 'Strong feeling of displeasure',
    color: '#DC143C',
    is_default: true
  },
  {
    id: 'anger-frustrated',
    emoji: '😤',
    name: 'Frustrated',
    category: 'anger',
    intensity: 3,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['anger-irritated', 'confusion-stuck'],
    description: 'Feeling blocked or prevented from progress',
    color: '#DC143C',
    is_default: true
  },
  {
    id: 'anger-irritated',
    emoji: '😒',
    name: 'Irritated',
    category: 'anger',
    intensity: 2,
    valence: 'negative',
    energy: 'medium',
    related_emotions: ['anger-annoyed', 'anger-frustrated'],
    description: 'Mildly annoyed or bothered',
    color: '#DC143C',
    is_default: false
  },
  {
    id: 'anger-furious',
    emoji: '🤬',
    name: 'Furious',
    category: 'anger',
    intensity: 5,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['anger-angry', 'anger-enraged'],
    description: 'Extremely angry and out of control',
    color: '#DC143C',
    is_default: false
  },
  {
    id: 'anger-resentful',
    emoji: '😾',
    name: 'Resentful',
    category: 'anger',
    intensity: 3,
    valence: 'negative',
    energy: 'medium',
    related_emotions: ['anger-bitter', 'social-envious'],
    description: 'Holding onto anger from past wrongs',
    color: '#DC143C',
    is_default: false
  },

  // FEAR & ANXIETY
  {
    id: 'fear-anxious',
    emoji: '😰',
    name: 'Anxious',
    category: 'fear',
    intensity: 3,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['fear-worried', 'fear-nervous'],
    description: 'Feeling worried and uneasy',
    color: '#8B008B',
    is_default: true
  },
  {
    id: 'fear-overwhelmed',
    emoji: '😵',
    name: 'Overwhelmed',
    category: 'fear',
    intensity: 4,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['fear-anxious', 'confusion-confused'],
    description: 'Feeling unable to cope with demands',
    color: '#8B008B',
    is_default: true
  },
  {
    id: 'fear-scared',
    emoji: '😨',
    name: 'Scared',
    category: 'fear',
    intensity: 4,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['fear-afraid', 'fear-terrified'],
    description: 'Feeling frightened or afraid',
    color: '#8B008B',
    is_default: false
  },
  {
    id: 'fear-nervous',
    emoji: '😬',
    name: 'Nervous',
    category: 'fear',
    intensity: 2,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['fear-anxious', 'fear-tense'],
    description: 'Feeling uneasy about something',
    color: '#8B008B',
    is_default: false
  },
  {
    id: 'fear-panicked',
    emoji: '😱',
    name: 'Panicked',
    category: 'fear',
    intensity: 5,
    valence: 'negative',
    energy: 'high',
    related_emotions: ['fear-overwhelmed', 'fear-terrified'],
    description: 'Sudden uncontrollable fear',
    color: '#8B008B',
    is_default: false
  },
  {
    id: 'fear-vulnerable',
    emoji: '🥺',
    name: 'Vulnerable',
    category: 'fear',
    intensity: 3,
    valence: 'mixed',
    energy: 'low',
    related_emotions: ['fear-insecure', 'sad-exposed'],
    description: 'Feeling emotionally exposed and unprotected',
    color: '#8B008B',
    is_default: false
  },

  // NEUTRAL & TIRED
  {
    id: 'neutral-neutral',
    emoji: '😐',
    name: 'Neutral',
    category: 'peace',
    intensity: 1,
    valence: 'neutral',
    energy: 'medium',
    related_emotions: ['peace-calm', 'confusion-indifferent'],
    description: 'Neither positive nor negative',
    color: '#808080',
    is_default: true
  },
  {
    id: 'energy-tired',
    emoji: '😴',
    name: 'Tired',
    category: 'energy',
    intensity: 2,
    valence: 'neutral',
    energy: 'low',
    related_emotions: ['energy-exhausted', 'energy-drained'],
    description: 'Lacking energy and needing rest',
    color: '#808080',
    is_default: true
  },
  {
    id: 'energy-exhausted',
    emoji: '🥱',
    name: 'Exhausted',
    category: 'energy',
    intensity: 4,
    valence: 'negative',
    energy: 'low',
    related_emotions: ['energy-tired', 'energy-burnout'],
    description: 'Completely drained of energy',
    color: '#696969',
    is_default: false
  },
  {
    id: 'energy-energized',
    emoji: '⚡',
    name: 'Energized',
    category: 'energy',
    intensity: 4,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['energy-motivated', 'joy-excited'],
    description: 'Full of energy and vitality',
    color: '#FF4500',
    is_default: true
  },
  {
    id: 'energy-motivated',
    emoji: '💪',
    name: 'Motivated',
    category: 'energy',
    intensity: 4,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['energy-energized', 'achievement-determined'],
    description: 'Driven to take action and achieve goals',
    color: '#FF4500',
    is_default: false
  },

  // CONFUSION & DOUBT
  {
    id: 'confusion-confused',
    emoji: '😕',
    name: 'Confused',
    category: 'confusion',
    intensity: 2,
    valence: 'neutral',
    energy: 'medium',
    related_emotions: ['confusion-uncertain', 'confusion-perplexed'],
    description: 'Unable to understand or think clearly',
    color: '#696969',
    is_default: true
  },
  {
    id: 'confusion-uncertain',
    emoji: '🤔',
    name: 'Uncertain',
    category: 'confusion',
    intensity: 2,
    valence: 'neutral',
    energy: 'medium',
    related_emotions: ['confusion-confused', 'confusion-doubtful'],
    description: 'Not sure or confident about something',
    color: '#696969',
    is_default: false
  },
  {
    id: 'confusion-conflicted',
    emoji: '😖',
    name: 'Conflicted',
    category: 'confusion',
    intensity: 3,
    valence: 'mixed',
    energy: 'medium',
    related_emotions: ['confusion-torn', 'confusion-uncertain'],
    description: 'Experiencing opposing feelings or desires',
    color: '#696969',
    is_default: false
  },

  // SOCIAL EMOTIONS
  {
    id: 'social-grateful',
    emoji: '🙏',
    name: 'Grateful',
    category: 'social',
    intensity: 3,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['spiritual-blessed', 'love-appreciative'],
    description: 'Feeling thankful and appreciative',
    color: '#32CD32',
    is_default: true
  },
  {
    id: 'social-loved',
    emoji: '🥰',
    name: 'Loved',
    category: 'love',
    intensity: 4,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['love-adored', 'social-connected'],
    description: 'Feeling cherished and cared for',
    color: '#FF1493',
    is_default: false
  },
  {
    id: 'social-embarrassed',
    emoji: '😳',
    name: 'Embarrassed',
    category: 'social',
    intensity: 3,
    valence: 'negative',
    energy: 'medium',
    related_emotions: ['social-ashamed', 'social-awkward'],
    description: 'Feeling self-conscious and awkward',
    color: '#CD853F',
    is_default: false
  },
  {
    id: 'social-proud',
    emoji: '😌',
    name: 'Proud',
    category: 'achievement',
    intensity: 3,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['achievement-accomplished', 'joy-satisfied'],
    description: 'Feeling satisfaction in achievements',
    color: '#FFD700',
    is_default: false
  },

  // CREATIVE & INSPIRED
  {
    id: 'creative-creative',
    emoji: '🎨',
    name: 'Creative',
    category: 'creative',
    intensity: 3,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['creative-inspired', 'creative-imaginative'],
    description: 'Feeling inventive and artistic',
    color: '#FF6347',
    is_default: true
  },
  {
    id: 'creative-inspired',
    emoji: '💡',
    name: 'Inspired',
    category: 'creative',
    intensity: 4,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['creative-creative', 'energy-motivated'],
    description: 'Filled with the urge to create or do something',
    color: '#FF6347',
    is_default: false
  },
  {
    id: 'creative-flow',
    emoji: '🌊',
    name: 'In Flow',
    category: 'creative',
    intensity: 4,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['creative-focused', 'peace-absorbed'],
    description: 'Completely immersed in an activity',
    color: '#FF6347',
    is_default: false
  },

  // SPIRITUAL & TRANSCENDENT
  {
    id: 'spiritual-awe',
    emoji: '😲',
    name: 'Awe',
    category: 'spiritual',
    intensity: 4,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['spiritual-wonder', 'surprise-amazed'],
    description: 'Feeling of wonder and reverence',
    color: '#9370DB',
    is_default: false
  },
  {
    id: 'spiritual-transcendent',
    emoji: '✨',
    name: 'Transcendent',
    category: 'spiritual',
    intensity: 5,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['spiritual-connected', 'spiritual-elevated'],
    description: 'Feeling beyond ordinary experience',
    color: '#9370DB',
    is_default: false
  },

  // ACHIEVEMENT
  {
    id: 'achievement-accomplished',
    emoji: '🏆',
    name: 'Accomplished',
    category: 'achievement',
    intensity: 4,
    valence: 'positive',
    energy: 'medium',
    related_emotions: ['achievement-successful', 'social-proud'],
    description: 'Feeling of having achieved something significant',
    color: '#FFD700',
    is_default: false
  },
  {
    id: 'achievement-confident',
    emoji: '😎',
    name: 'Confident',
    category: 'achievement',
    intensity: 3,
    valence: 'positive',
    energy: 'high',
    related_emotions: ['achievement-empowered', 'energy-motivated'],
    description: 'Feeling self-assured and capable',
    color: '#FFD700',
    is_default: false
  }
]

/**
 * Get emotions by category
 */
export function getEmotionsByCategory(category: EmotionCategory): Emotion[] {
  return COMPREHENSIVE_EMOTIONS.filter(e => e.category === category)
}

/**
 * Get default emotions (shown by default)
 */
export function getDefaultEmotions(): Emotion[] {
  return COMPREHENSIVE_EMOTIONS.filter(e => e.is_default)
}

/**
 * Get emotion by ID
 */
export function getEmotionById(id: string): Emotion | undefined {
  return COMPREHENSIVE_EMOTIONS.find(e => e.id === id)
}

/**
 * Search emotions by name or description
 */
export function searchEmotions(query: string): Emotion[] {
  const lowerQuery = query.toLowerCase()
  return COMPREHENSIVE_EMOTIONS.filter(e =>
    e.name.toLowerCase().includes(lowerQuery) ||
    e.description.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get emotions by valence
 */
export function getEmotionsByValence(valence: Emotion['valence']): Emotion[] {
  return COMPREHENSIVE_EMOTIONS.filter(e => e.valence === valence)
}

/**
 * Get emotions by intensity
 */
export function getEmotionsByIntensity(minIntensity: number, maxIntensity: number): Emotion[] {
  return COMPREHENSIVE_EMOTIONS.filter(e =>
    e.intensity >= minIntensity && e.intensity <= maxIntensity
  )
}
