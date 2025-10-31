import { NextResponse } from 'next/server'

export interface ConversationScript {
  opener: string
  flow: string[]
  closer: string
}

export interface DifficultConversationToolkit {
  id: string
  area: string
  category: 'work' | 'relationships' | 'finance' | 'family' | 'personal' | 'spiritual' | 'legacy'
  title: string
  description: string
  color: string
  icon: string // Emoji
  phoenixPhase: 'ashes' | 'fire' | 'rebirth' | 'flight'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps?: string[]
  tips?: string[]
  script?: ConversationScript
}

/**
 * GET /api/toolkits/difficult-conversations
 *
 * Returns all available difficult conversation toolkits
 * Organized by life area and Phoenix transformation phase
 */
export async function GET() {
  const toolkits: DifficultConversationToolkit[] = [
    {
      id: 'work-support',
      area: 'Work & Operations',
      category: 'work',
      title: 'Clarifying Support Role with Michael',
      description: 'Reset expectations about operational support vs friendship. Navigate the boundary between professional assistance and personal relationship.',
      color: 'amber',
      icon: '💼',
      phoenixPhase: 'fire',
      difficulty: 'intermediate',
      estimatedTime: '15-20 minutes',
      steps: [
        'Acknowledge the value of past support',
        'Clarify the nature of the relationship (professional vs personal)',
        'Define boundaries for future interactions',
        'Set clear expectations moving forward',
        'Confirm mutual understanding'
      ],
      tips: [
        'Start with appreciation for their past help',
        'Be direct but kind about boundaries',
        'Use "I" statements to express your needs',
        'Avoid blaming or accusatory language'
      ],
      script: {
        opener: "Hey Michael, I wanted to revisit how we're working together — I've realized I may have blurred friendship and operations boundaries.",
        flow: [
          "I value our collaboration, but I need to get clearer on where I can support versus where you need to lead.",
          "Can we talk about what support looks like for you so expectations are clear on both sides?",
          "My intention isn't to pull back — it's to make sure we're effective and balanced."
        ],
        closer: "Thanks for taking the time to clarify this. I appreciate being able to reset things openly."
      }
    },
    {
      id: 'relationship-clarity',
      area: 'Intimacy & Love',
      category: 'relationships',
      title: 'Relationship Clarity with Djamel',
      description: 'Address alignment and presence in your intimate partnership. Navigate expectations, commitment, and emotional availability.',
      color: 'rose',
      icon: '❤️',
      phoenixPhase: 'rebirth',
      difficulty: 'advanced',
      estimatedTime: '30-45 minutes',
      steps: [
        'Create a safe, private space for conversation',
        'Express your feelings without blame',
        'Listen actively to their perspective',
        'Identify areas of alignment and misalignment',
        'Co-create a path forward together',
        'Set check-in points for progress'
      ],
      tips: [
        'Choose a calm moment, not during conflict',
        'Focus on feelings rather than accusations',
        'Be prepared to hear difficult truths',
        'Remember you are on the same team',
        'Seek professional help if needed'
      ],
      script: {
        opener: "I've been feeling some distance between us, and I want to talk about how we can be more present and aligned.",
        flow: [
          "What does feeling connected look like to you right now?",
          "Are there ways I've been unavailable or distracted that you've noticed?",
          "I want us both to feel seen, not just in our love but in how we show up day-to-day."
        ],
        closer: "I love that we can have these talks honestly — it means a lot that we keep choosing to grow together."
      }
    },
    {
      id: 'finance-dispute',
      area: 'Finance',
      category: 'finance',
      title: 'Disputing Unauthorized Charges',
      description: 'Firmly but professionally dispute financial predation. Protect your resources while maintaining composure.',
      color: 'yellow',
      icon: '💰',
      phoenixPhase: 'fire',
      difficulty: 'beginner',
      estimatedTime: '10-15 minutes',
      steps: [
        'Gather all documentation (receipts, statements, emails)',
        'State the issue clearly and factually',
        'Cite relevant policies or agreements',
        'Request specific resolution with deadline',
        'Document the conversation',
        'Escalate if needed'
      ],
      tips: [
        'Stay calm and professional',
        'Use facts, not emotions',
        'Know your rights and policies',
        'Keep written records of everything',
        'Be persistent but respectful'
      ]
    },
    {
      id: 'family-boundaries',
      area: 'Family Boundaries',
      category: 'family',
      title: 'Setting Boundaries with Toxic Family',
      description: 'Protect yourself from harmful family dynamics. Establish healthy boundaries while managing guilt and obligation.',
      color: 'violet',
      icon: '👨‍👩‍👧‍👦',
      phoenixPhase: 'ashes',
      difficulty: 'advanced',
      estimatedTime: 'Ongoing process',
      steps: [
        'Identify specific behaviors that harm you',
        'Decide what boundaries you need',
        'Communicate boundaries clearly',
        'Prepare for pushback or guilt-tripping',
        'Enforce consequences consistently',
        'Seek support from trusted friends/therapist'
      ],
      tips: [
        'You have the right to protect your peace',
        'Boundaries are not punishment, they\'re self-care',
        'Expect resistance - that\'s normal',
        'Don\'t justify or over-explain',
        'It\'s okay to limit or cut contact if needed'
      ]
    },
    {
      id: 'focus-protection',
      area: 'Time & Energy',
      category: 'personal',
      title: 'Protecting Focus Time',
      description: 'Handle repeated interruptions to your deep work. Establish boundaries around your creative and productive time.',
      color: 'purple',
      icon: '⏰',
      phoenixPhase: 'fire',
      difficulty: 'beginner',
      estimatedTime: '5-10 minutes',
      steps: [
        'Identify your peak focus hours',
        'Communicate your focus schedule to others',
        'Use visible "do not disturb" signals',
        'Offer alternative times for discussion',
        'Set up systems for urgent vs non-urgent',
        'Review and adjust as needed'
      ],
      tips: [
        'Be proactive, not reactive',
        'Provide alternatives, not just "no"',
        'Use tools (calendar blocks, status indicators)',
        'Be consistent with your boundaries',
        'Model respect for others\' focus time too'
      ]
    },
    {
      id: 'learning-growth',
      area: 'Learning',
      category: 'personal',
      title: 'Learning Boundaries & Growth Conversations',
      description: 'Align your learning goals and seek accountability. Navigate expectations around skill development and professional growth.',
      color: 'indigo',
      icon: '📚',
      phoenixPhase: 'rebirth',
      difficulty: 'intermediate',
      estimatedTime: '20-30 minutes',
      steps: [
        'Clarify your learning objectives',
        'Identify gaps between current and desired state',
        'Request specific support you need',
        'Propose accountability structures',
        'Set milestones and check-in points',
        'Celebrate progress along the way'
      ],
      tips: [
        'Be specific about what you want to learn',
        'Ask for what you need, don\'t assume',
        'Balance ambition with realistic timelines',
        'Share your "why" to build buy-in',
        'Track and share your progress'
      ]
    },
    {
      id: 'spiritual-grounding',
      area: 'Spiritual',
      category: 'spiritual',
      title: 'Grounding & Faith Conversations',
      description: 'Reconnect with your spiritual center when misaligned. Navigate faith, meaning, and purpose in challenging times.',
      color: 'emerald',
      icon: '🕊️',
      phoenixPhase: 'ashes',
      difficulty: 'intermediate',
      estimatedTime: '30-60 minutes',
      steps: [
        'Create sacred space for reflection',
        'Acknowledge your spiritual disconnection',
        'Explore what\'s blocking your connection',
        'Revisit your core values and beliefs',
        'Identify practices that ground you',
        'Commit to regular spiritual practice'
      ],
      tips: [
        'This conversation can be with yourself, a mentor, or divine',
        'Judgment-free zone - honor your journey',
        'Small, consistent practices beat grand gestures',
        'Return to what has worked before',
        'Community can amplify spiritual growth'
      ]
    },
    {
      id: 'legacy-vision',
      area: 'Legacy',
      category: 'legacy',
      title: 'Defining Your Legacy',
      description: 'Discuss your long-term impact and values with clarity. Articulate what you want to be remembered for.',
      color: 'slate',
      icon: '🌟',
      phoenixPhase: 'flight',
      difficulty: 'advanced',
      estimatedTime: '45-60 minutes',
      steps: [
        'Reflect on what truly matters to you',
        'Identify your unique gifts and contributions',
        'Envision your ideal long-term impact',
        'Define success beyond material metrics',
        'Align current actions with legacy goals',
        'Share your vision with trusted allies'
      ],
      tips: [
        'Think beyond your lifetime',
        'Legacy is about impact, not ego',
        'Your values shape your legacy',
        'Start building legacy now, not "someday"',
        'Involve others in your legacy work'
      ]
    },
    // Additional toolkits for comprehensive coverage
    {
      id: 'career-transition',
      area: 'Career',
      category: 'work',
      title: 'Navigating Career Transition',
      description: 'Discuss career changes with stakeholders. Balance loyalty, opportunity, and personal growth.',
      color: 'blue',
      icon: '🚀',
      phoenixPhase: 'rebirth',
      difficulty: 'intermediate',
      estimatedTime: '20-30 minutes',
      steps: [
        'Clarify your career transition goals',
        'Identify stakeholders who need to know',
        'Prepare your rationale and next steps',
        'Choose the right timing',
        'Communicate with respect and gratitude',
        'Maintain relationships during transition'
      ],
      tips: [
        'Give adequate notice when possible',
        'Don\'t burn bridges',
        'Be honest but diplomatic',
        'Offer to help with transition',
        'Keep long-term relationships in mind'
      ]
    },
    {
      id: 'health-boundaries',
      area: 'Health & Wellness',
      category: 'personal',
      title: 'Health Boundaries & Self-Care',
      description: 'Prioritize your health without guilt. Communicate wellness needs to others.',
      color: 'green',
      icon: '🌱',
      phoenixPhase: 'rebirth',
      difficulty: 'beginner',
      estimatedTime: '10-15 minutes',
      steps: [
        'Identify your non-negotiable health needs',
        'Recognize patterns of self-neglect',
        'Communicate health priorities clearly',
        'Schedule self-care like appointments',
        'Decline requests that compromise health',
        'Model healthy boundaries for others'
      ],
      tips: [
        'Your health enables everything else',
        'Self-care isn\'t selfish, it\'s necessary',
        'Be specific about what you need',
        'Don\'t apologize for prioritizing health',
        'Build support systems'
      ]
    }
  ]

  // Return sorted by category and difficulty
  const sorted = toolkits.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category)
    }
    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  })

  return NextResponse.json(sorted)
}
