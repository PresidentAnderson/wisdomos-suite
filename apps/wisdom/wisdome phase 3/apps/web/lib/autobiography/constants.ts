import type { Chapter } from './types';

// Autobiography chapters with curated prompts
export const AUTOBIOGRAPHY_CHAPTERS: Chapter[] = [
  {
    id: 'early-life',
    title: 'Early Life & Origins',
    description: 'Your childhood, family, and formative years',
    icon: 'Baby',
    order: 1,
    prompts: [
      {
        id: 'el-1',
        question: 'Where and when were you born? What do you know about the circumstances of your birth?',
        description: 'Your origin story and first moments',
        coachingTip: 'Include details about the place, time, and any stories your family has shared about your arrival.',
        examples: [
          'I was born on a snowy December morning in 1985...',
          'My parents often told me the story of how...',
        ],
      },
      {
        id: 'el-2',
        question: 'Describe your earliest memory. How old were you, and why do you think this memory stuck with you?',
        description: 'Your first conscious recollection',
        coachingTip: 'Focus on sensory details - what did you see, hear, smell, or feel?',
      },
      {
        id: 'el-3',
        question: 'Who were the most important people in your early childhood? How did they shape who you became?',
        description: 'Your early influences and relationships',
        coachingTip: 'Consider parents, siblings, grandparents, neighbors, or other significant figures.',
      },
      {
        id: 'el-4',
        question: 'What was your childhood home like? Describe the rooms, sounds, and feelings you associate with it.',
        description: 'Your physical and emotional home environment',
        coachingTip: 'Paint a vivid picture - help readers step into your childhood home.',
      },
      {
        id: 'el-5',
        question: 'What were your favorite activities or games as a child? What did you love to imagine or pretend?',
        description: 'Your early passions and play',
        coachingTip: 'These early interests often reveal lifelong patterns and values.',
      },
    ],
  },
  {
    id: 'family-heritage',
    title: 'Family & Heritage',
    description: 'Your family history, traditions, and cultural background',
    icon: 'Users',
    order: 2,
    prompts: [
      {
        id: 'fh-1',
        question: 'What stories have been passed down about your family history? Which ancestors or relatives do you feel most connected to?',
        description: 'Your family lineage and stories',
        coachingTip: 'Include both well-documented facts and family legends.',
      },
      {
        id: 'fh-2',
        question: 'What cultural, ethnic, or religious traditions shaped your upbringing? Which ones do you still practice today?',
        description: 'Your cultural roots and practices',
        coachingTip: 'Describe specific rituals, celebrations, or customs that were meaningful.',
      },
      {
        id: 'fh-3',
        question: 'Describe your relationship with your parents or guardians. What did they teach you, both intentionally and unintentionally?',
        description: 'Your primary caregivers and their influence',
        coachingTip: 'Be honest about both positive and challenging aspects of these relationships.',
      },
      {
        id: 'fh-4',
        question: 'If you have siblings, how did your relationships with them shape your personality? What role did you play in the family?',
        description: 'Your sibling dynamics and family position',
        coachingTip: 'Consider birth order, rivalries, alliances, and what you learned from each other.',
      },
      {
        id: 'fh-5',
        question: 'What values or beliefs did your family hold most dear? Which of these have you kept, and which have you chosen to change?',
        description: 'Your inherited and chosen values',
        coachingTip: 'Reflect on both continuity and evolution in your value system.',
      },
    ],
  },
  {
    id: 'education-growth',
    title: 'Education & Growth',
    description: 'Your learning journey and intellectual development',
    icon: 'GraduationCap',
    order: 3,
    prompts: [
      {
        id: 'eg-1',
        question: 'What are your earliest memories of school? What did you love or hate about learning?',
        description: 'Your first educational experiences',
        coachingTip: 'Include specific teachers, subjects, or moments that stand out.',
      },
      {
        id: 'eg-2',
        question: 'Who was a teacher or mentor who significantly impacted your life? What did they teach you beyond academics?',
        description: 'Your most influential educators',
        coachingTip: 'Focus on the lasting impact and lessons that extended beyond the classroom.',
      },
      {
        id: 'eg-3',
        question: 'What subjects or areas of knowledge captivated you? What made you curious and eager to learn more?',
        description: 'Your intellectual passions',
        coachingTip: 'Connect these early interests to your later pursuits and career.',
      },
      {
        id: 'eg-4',
        question: 'Describe a major challenge or failure in your education. How did you overcome it, or what did you learn from it?',
        description: 'Your educational struggles and resilience',
        coachingTip: 'Show vulnerability and growth - these struggles often teach the most.',
      },
      {
        id: 'eg-5',
        question: 'How has your relationship with learning evolved over time? What does education mean to you now?',
        description: 'Your evolving perspective on learning',
        coachingTip: 'Consider both formal and informal education, and lifelong learning.',
      },
    ],
  },
  {
    id: 'relationships-love',
    title: 'Relationships & Love',
    description: 'Your romantic relationships and important connections',
    icon: 'Heart',
    order: 4,
    prompts: [
      {
        id: 'rl-1',
        question: 'Tell the story of your first crush or romantic feelings. What did you learn about yourself and love?',
        description: 'Your first experiences with romance',
        coachingTip: 'Include the emotions, awkwardness, and self-discovery of early attraction.',
      },
      {
        id: 'rl-2',
        question: 'Describe the most important romantic relationship of your life. What made it significant?',
        description: 'Your defining romantic relationship',
        coachingTip: 'Be honest about both the beautiful and difficult aspects.',
      },
      {
        id: 'rl-3',
        question: 'What heartbreak or loss taught you the most about love and yourself?',
        description: 'Your painful lessons in love',
        coachingTip: 'Show vulnerability and the growth that came from pain.',
      },
      {
        id: 'rl-4',
        question: 'Who are your closest friends, and what makes these friendships special? How have they shaped you?',
        description: 'Your chosen family and deep friendships',
        coachingTip: 'Celebrate the people who have stood by you through different life chapters.',
      },
      {
        id: 'rl-5',
        question: 'What have you learned about love, intimacy, and connection over your lifetime?',
        description: 'Your philosophy on relationships',
        coachingTip: 'Synthesize your experiences into wisdom you could share with others.',
      },
    ],
  },
  {
    id: 'career-purpose',
    title: 'Career & Purpose',
    description: 'Your work life and sense of calling',
    icon: 'Briefcase',
    order: 5,
    prompts: [
      {
        id: 'cp-1',
        question: 'What did you want to be when you grew up? How did your career aspirations evolve over time?',
        description: 'Your career dreams and evolution',
        coachingTip: 'Trace the journey from childhood dreams to current reality.',
      },
      {
        id: 'cp-2',
        question: 'Describe your first job or significant work experience. What did it teach you?',
        description: 'Your entry into the working world',
        coachingTip: 'Include both practical skills and life lessons learned.',
      },
      {
        id: 'cp-3',
        question: 'What has been your most meaningful work or contribution? Why did it matter to you?',
        description: 'Your most fulfilling professional experiences',
        coachingTip: 'Focus on impact and personal significance beyond compensation or recognition.',
      },
      {
        id: 'cp-4',
        question: 'Tell the story of a major career challenge, failure, or setback. How did you navigate it?',
        description: 'Your professional struggles and resilience',
        coachingTip: 'Show the complexity of career paths and the value of persistence.',
      },
      {
        id: 'cp-5',
        question: 'How do you define your purpose or calling in life? Has this changed over time?',
        description: 'Your sense of meaning and direction',
        coachingTip: 'Be honest if you are still searching - that is part of the journey.',
      },
    ],
  },
  {
    id: 'challenges-triumphs',
    title: 'Challenges & Triumphs',
    description: 'Your major obstacles and victories',
    icon: 'Trophy',
    order: 6,
    prompts: [
      {
        id: 'ct-1',
        question: 'What is the biggest challenge or adversity you have faced? How did you find the strength to overcome it?',
        description: 'Your greatest test and resilience',
        coachingTip: 'Be specific about both the struggle and the strategies that helped you survive.',
      },
      {
        id: 'ct-2',
        question: 'Describe a time when you faced significant loss, grief, or disappointment. How did you heal?',
        description: 'Your experience with loss and recovery',
        coachingTip: 'Share the messy reality of grief and the gradual path to healing.',
      },
      {
        id: 'ct-3',
        question: 'What is your proudest accomplishment? What made it meaningful beyond the achievement itself?',
        description: 'Your defining success',
        coachingTip: 'Focus on the personal significance and what it represented in your journey.',
      },
      {
        id: 'ct-4',
        question: 'Tell the story of a time you had to show courage or stand up for something you believed in.',
        description: 'Your moments of bravery',
        coachingTip: 'Include your fears and doubts alongside your courage.',
      },
      {
        id: 'ct-5',
        question: 'What unexpected obstacles or plot twists shaped your life in ways you did not anticipate?',
        description: 'Life surprises and pivotal moments',
        coachingTip: 'Reflect on how these unexpected turns influenced your path.',
      },
    ],
  },
  {
    id: 'beliefs-spirituality',
    title: 'Beliefs & Spirituality',
    description: 'Your faith, philosophy, and spiritual journey',
    icon: 'Sparkles',
    order: 7,
    prompts: [
      {
        id: 'bs-1',
        question: 'What religious or spiritual beliefs were you raised with? How have they evolved over your lifetime?',
        description: 'Your spiritual upbringing and evolution',
        coachingTip: 'Be honest about continuity, change, or rejection of early beliefs.',
      },
      {
        id: 'bs-2',
        question: 'Describe a spiritual or transcendent experience that changed your perspective on life.',
        description: 'Your moments of awakening or connection',
        coachingTip: 'This could be religious, nature-based, artistic, or any profound experience.',
      },
      {
        id: 'bs-3',
        question: 'What do you believe about the meaning or purpose of life? How did you come to this belief?',
        description: 'Your philosophy of existence',
        coachingTip: 'Share the experiences and influences that shaped your worldview.',
      },
      {
        id: 'bs-4',
        question: 'How do you make sense of suffering, injustice, or the difficult realities of life?',
        description: 'Your framework for understanding hardship',
        coachingTip: 'This is often where our deepest wisdom emerges.',
      },
      {
        id: 'bs-5',
        question: 'What practices or rituals help you feel connected to something larger than yourself?',
        description: 'Your spiritual or contemplative practices',
        coachingTip: 'These could be traditional religious practices or personal rituals.',
      },
    ],
  },
  {
    id: 'creative-expression',
    title: 'Creative Expression',
    description: 'Your artistic pursuits and self-expression',
    icon: 'Palette',
    order: 8,
    prompts: [
      {
        id: 'ce-1',
        question: 'What forms of creative expression have been important to you throughout your life?',
        description: 'Your creative outlets and pursuits',
        coachingTip: 'Include everything from professional pursuits to hobbies and experiments.',
      },
      {
        id: 'ce-2',
        question: 'Tell the story of creating something you are proud of - a piece of art, music, writing, or any creative work.',
        description: 'Your creative achievements',
        coachingTip: 'Focus on the process and what you learned, not just the final product.',
      },
      {
        id: 'ce-3',
        question: 'What artists, writers, musicians, or creators have most influenced you? How have they shaped your own expression?',
        description: 'Your creative inspirations',
        coachingTip: 'Explain what specifically resonated and why.',
      },
      {
        id: 'ce-4',
        question: 'Describe a time when creative expression helped you process emotions or difficult experiences.',
        description: 'Creativity as healing and processing',
        coachingTip: 'Show the therapeutic power of artistic expression.',
      },
      {
        id: 'ce-5',
        question: 'What role does creativity play in your life today? What do you still want to create or express?',
        description: 'Your ongoing creative journey',
        coachingTip: 'Include both satisfaction with past creativity and future aspirations.',
      },
    ],
  },
  {
    id: 'transformations',
    title: 'Transformations',
    description: 'Your major life changes and pivotal moments',
    icon: 'RefreshCw',
    order: 9,
    prompts: [
      {
        id: 'tr-1',
        question: 'Describe a time when you fundamentally changed who you were. What catalyzed this transformation?',
        description: 'Your personal metamorphosis',
        coachingTip: 'Be specific about both the old self and the new self that emerged.',
      },
      {
        id: 'tr-2',
        question: 'What belief or assumption about yourself or the world did you have to let go of? What replaced it?',
        description: 'Your paradigm shifts',
        coachingTip: 'Show the before and after of your understanding.',
      },
      {
        id: 'tr-3',
        question: 'Tell the story of a major life transition - a move, career change, relationship shift, or other significant change.',
        description: 'Your major life transitions',
        coachingTip: 'Include both the fear of change and the growth that resulted.',
      },
      {
        id: 'tr-4',
        question: 'Who were you ten years ago? How have you changed, and what has stayed the same?',
        description: 'Your personal evolution',
        coachingTip: 'Reflect on both continuity and transformation in your identity.',
      },
      {
        id: 'tr-5',
        question: 'What is a transformation or change you are currently undergoing or hope to undergo?',
        description: 'Your ongoing and future growth',
        coachingTip: 'Be honest about the discomfort and excitement of present and future change.',
      },
    ],
  },
  {
    id: 'legacy-wisdom',
    title: 'Legacy & Wisdom',
    description: 'Your life lessons and what you wish to pass on',
    icon: 'BookOpen',
    order: 10,
    prompts: [
      {
        id: 'lw-1',
        question: 'What are the most important lessons life has taught you? How did you learn them?',
        description: 'Your hard-earned wisdom',
        coachingTip: 'Share both the lesson and the experience that taught it.',
      },
      {
        id: 'lw-2',
        question: 'What advice would you give to your younger self? What do you wish you had known earlier?',
        description: 'Your hindsight and guidance',
        coachingTip: 'Be compassionate and specific in your counsel to your younger self.',
      },
      {
        id: 'lw-3',
        question: 'What do you hope people will remember about you? What impact do you want to have on the world?',
        description: 'Your desired legacy',
        coachingTip: 'Think beyond accomplishments to the values and influence you want to leave.',
      },
      {
        id: 'lw-4',
        question: 'What wisdom or stories do you want to pass down to future generations of your family?',
        description: 'Your family legacy',
        coachingTip: 'Include both practical wisdom and meaningful family stories.',
      },
      {
        id: 'lw-5',
        question: 'Looking at your life as a whole, what are you most grateful for? What gives your life meaning?',
        description: 'Your gratitude and meaning',
        coachingTip: 'This is your chance to reflect on what truly matters.',
      },
    ],
  },
];

// Voice settings defaults
export const DEFAULT_VOICE_SETTINGS = {
  enabled: true,
  voice: 'default',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoPlay: false,
};

// Sentiment options
export const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive', color: '#10b981' },
  { value: 'neutral', label: 'Neutral', color: '#6b7280' },
  { value: 'reflective', label: 'Reflective', color: '#8b5cf6' },
  { value: 'challenging', label: 'Challenging', color: '#f59e0b' },
  { value: 'difficult', label: 'Difficult', color: '#ef4444' },
];

// API endpoints
export const API_ENDPOINTS = {
  entries: '/api/autobiography',
  analyze: '/api/ai/analyze-entry',
  progress: '/api/autobiography/progress',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  entries: 'wisdomos_autobiography_entries',
  draft: 'wisdomos_autobiography_draft',
  voiceSettings: 'wisdomos_voice_settings',
} as const;

// Validation constants
export const VALIDATION = {
  minResponseLength: 50,
  maxResponseLength: 50000,
  maxTags: 10,
  maxTagLength: 30,
} as const;
