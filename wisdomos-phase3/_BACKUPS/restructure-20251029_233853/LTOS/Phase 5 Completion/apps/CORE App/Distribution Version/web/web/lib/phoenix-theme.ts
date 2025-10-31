// Phoenix Brand System for WisdomOS
export const phoenixTheme = {
  colors: {
    phoenix: {
      gold: '#FFD700',      // Solar Gold - wisdom, vitality
      red: '#E63946',       // Phoenix Red - fire of transformation
      orange: '#FF914D',    // Ember Orange - energy, progress
      indigo: '#1D3557',    // Midnight Indigo - reflection, depth
      ash: '#2C3E50',       // Deep ash gray - the before state
      ember: '#F77F00',     // Bright ember - active transformation
      flame: '#FCBF49',     // Flame yellow - illumination
      smoke: '#1A1F2E',     // Dark smoke - mystery, potential
    },
    wisdom: {
      green: '#10B981',     // Thriving state
      yellow: '#F59E0B',    // Attention needed
      red: '#EF4444',       // Breakdown/boundary collapsed
    }
  },
  
  // Phoenix Cycle Stages
  cycles: {
    ashes: {
      name: 'Ashes (Reflection)',
      description: 'Journaling upsets, patterns, fulfillment gaps',
      color: '#2C3E50',
      icon: '🌑',
    },
    fire: {
      name: 'Fire (Breakthrough)',
      description: 'Conversations, reframing, commitments',
      color: '#E63946',
      icon: '🔥',
    },
    rebirth: {
      name: 'Rebirth (Fulfillment)',
      description: 'Dashboard lights up with thriving areas',
      color: '#FFD700',
      icon: '🌟',
    },
    flight: {
      name: 'Flight (Legacy)',
      description: 'Archiving, sharing, contribution',
      color: '#FCBF49',
      icon: '🦅',
    }
  },
  
  // Gamification Badges
  badges: {
    ashesMaster: {
      name: 'Ashes Master',
      description: 'Completed 30 days of reflection journaling',
      icon: '🌑',
      color: '#2C3E50',
    },
    flameWalker: {
      name: 'Flame Walker',
      description: 'Successfully navigated 10 breakthrough moments',
      icon: '🔥',
      color: '#E63946',
    },
    risingStar: {
      name: 'Rising Star',
      description: 'Achieved green status in 5+ life areas',
      icon: '⭐',
      color: '#FFD700',
    },
    fullFlight: {
      name: 'Full Flight',
      description: 'Maintained all areas in green for 30 days',
      icon: '🦅',
      color: '#FCBF49',
    },
    boundaryGuardian: {
      name: 'Boundary Guardian',
      description: 'Completed 20 boundary reset rituals',
      icon: '🛡️',
      color: '#1D3557',
    },
    transformationCatalyst: {
      name: 'Transformation Catalyst',
      description: 'Turned 5 red areas to green',
      icon: '✨',
      color: '#FF914D',
    }
  },
  
  // Voice & Tone Templates
  prompts: {
    reflection: [
      "What ashes are you ready to rise from today?",
      "Which patterns no longer serve your flight?",
      "What old story is ready to burn away?",
      "Where is transformation calling you?"
    ],
    empowerment: [
      "You're in the fire — transformation is here.",
      "Your phoenix is rising. Trust the process.",
      "Every ending births a new beginning.",
      "The flames are reshaping you into something greater."
    ],
    celebration: [
      "You've risen — a new cycle begins!",
      "Your transformation is complete. Soar!",
      "From ashes to glory — you did it!",
      "The phoenix has taken flight!"
    ]
  }
}

// Life Areas with Phoenix metaphors
export const lifeAreas = [
  { id: 'work', name: 'Work & Purpose', phoenix: 'Your Sacred Fire', defaultColor: 'yellow' },
  { id: 'health', name: 'Health & Recovery', phoenix: 'Your Inner Flame', defaultColor: 'green' },
  { id: 'finance', name: 'Finance', phoenix: 'Your Golden Wings', defaultColor: 'yellow' },
  { id: 'intimacy', name: 'Intimacy & Love', phoenix: 'Your Heart\'s Ember', defaultColor: 'green' },
  { id: 'time', name: 'Time & Energy', phoenix: 'Your Life Force', defaultColor: 'yellow' },
  { id: 'spiritual', name: 'Spiritual Alignment', phoenix: 'Your Divine Spark', defaultColor: 'green' },
  { id: 'creativity', name: 'Creativity & Expression', phoenix: 'Your Creative Flame', defaultColor: 'green' },
  { id: 'friendship', name: 'Friendship & Community', phoenix: 'Your Circle of Fire', defaultColor: 'yellow' },
  { id: 'learning', name: 'Learning & Growth', phoenix: 'Your Rising Wisdom', defaultColor: 'green' },
  { id: 'home', name: 'Home & Environment', phoenix: 'Your Nest of Renewal', defaultColor: 'green' },
  { id: 'sexuality', name: 'Sexuality', phoenix: 'Your Passionate Fire', defaultColor: 'yellow' },
  { id: 'emotional', name: 'Emotional Regulation', phoenix: 'Your Inner Phoenix', defaultColor: 'yellow' },
  { id: 'legacy', name: 'Legacy & Archives', phoenix: 'Your Eternal Flame', defaultColor: 'green' }
]

// Upset Catcher by Life Area
export const upsetCatchers = {
  work: {
    commonUpset: "Feeling others create chaos, unreliability, or disrespecting your urgency",
    catchMantra: "I stand for clarity and systems that liberate, not chaos. This upset means my purpose matters.",
    resetAction: "Write down one clear next action that restores order"
  },
  health: {
    commonUpset: "Ignoring signals of fatigue, feeling sidelined, or setbacks in recovery",
    catchMantra: "This upset means my body is asking for care.",
    resetAction: "Stop and schedule a micro-care act (water, stretch, nap, call pharmacist)"
  },
  finance: {
    commonUpset: "Disputes, messy accounts, fear of unfairness",
    catchMantra: "This upset shows me I care about clean records and sustainability.",
    resetAction: "Make one money-related communication (to bank, accountant, self in ledger)"
  },
  intimacy: {
    commonUpset: "Feeling misunderstood, passive-aggression, guilt manipulation",
    catchMantra: "This upset is proof my heart is alive here.",
    resetAction: "Name the feeling out loud (without blame), then re-center with presence"
  },
  time: {
    commonUpset: "Overbooking, interruptions, collapse from no rest",
    catchMantra: "This upset means I value renewal and pacing.",
    resetAction: "Cancel one thing or block 30 mins of true rest"
  },
  spiritual: {
    commonUpset: "Forcing clarity, dismissing your own intuition",
    catchMantra: "This upset reminds me I live inside divine orchestration.",
    resetAction: "5 minutes of silence or journaling—no fixing"
  },
  creativity: {
    commonUpset: "Creating only on demand, joy drained",
    catchMantra: "This upset shows I long to express freely, not for productivity.",
    resetAction: "Create something playful, with zero outcome pressure"
  },
  friendship: {
    commonUpset: "Feeling used or one-sided venting",
    catchMantra: "This upset means I crave mutuality and love without proving.",
    resetAction: "Ask directly for reciprocity, or pause the interaction with grace"
  },
  learning: {
    commonUpset: "Feeling stuck, not curious, or overwhelmed",
    catchMantra: "This upset points to my desire to stay teachable.",
    resetAction: "Take one micro-learning action (read, listen, ask, note)"
  },
  home: {
    commonUpset: "Disorder, uncleanliness, landlord issues",
    catchMantra: "This upset means I need sanctuary.",
    resetAction: "Do one regulating act: tidy a corner, light a candle, or make the bed"
  },
  sexuality: {
    commonUpset: "Shame, disconnection, avoidance",
    catchMantra: "This upset reminds me my erotic self deserves honoring.",
    resetAction: "Ground in body—breath, touch, movement"
  },
  emotional: {
    commonUpset: "Collapsing into old scripts, self-blame",
    catchMantra: "This upset is my inner child asking for validation.",
    resetAction: "Say out loud: 'I see you. I've got you.'"
  },
  legacy: {
    commonUpset: "Avoidance, fear of loss of impact",
    catchMantra: "This upset means I want my life's work to endure.",
    resetAction: "Archive one small item (a file, a note, a thought)"
  }
}