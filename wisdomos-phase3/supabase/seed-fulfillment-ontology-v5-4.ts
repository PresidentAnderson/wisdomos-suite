/**
 * Seed script for Fulfillment Display Ontology v5.4
 *
 * This script populates:
 * - 12 universal dimensions (with icons)
 * - 6 area clusters
 * - 30 life areas with subdimensions
 * - Area-dimension mappings (primary/secondary)
 *
 * Run with: npx tsx supabase/seed-fulfillment-ontology-v5-4.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Universal Dimensions with icons
const DIMENSIONS = [
  { key: 'profitability', nameEn: 'Profitability', nameFr: 'Rentabilité', icon: '💰' },
  { key: 'alignment', nameEn: 'Alignment', nameFr: 'Alignement', icon: '🎯' },
  { key: 'stability', nameEn: 'Stability', nameFr: 'Stabilité', icon: '⚖️' },
  { key: 'creativity', nameEn: 'Creativity', nameFr: 'Créativité', icon: '🎨' },
  { key: 'connection', nameEn: 'Connection', nameFr: 'Connexion', icon: '🤝' },
  { key: 'freedom', nameEn: 'Freedom', nameFr: 'Liberté', icon: '🕊️' },
  { key: 'growth', nameEn: 'Growth', nameFr: 'Croissance', icon: '🌱' },
  { key: 'service', nameEn: 'Service', nameFr: 'Service', icon: '🤲' },
  { key: 'integration', nameEn: 'Integration', nameFr: 'Intégration', icon: '🧩' },
  { key: 'legacy', nameEn: 'Legacy', nameFr: 'Héritage', icon: '🏛️' },
  { key: 'vitality', nameEn: 'Vitality', nameFr: 'Vitalité', icon: '⚡' },
  { key: 'presence', nameEn: 'Presence', nameFr: 'Présence', icon: '🧘' }
]

// Area Clusters
const CLUSTERS = [
  {
    key: 'systemic_structural',
    nameEn: 'Systemic / Structural',
    nameFr: 'Systémique / Structurel',
    color: '#3B82F6' // blue
  },
  {
    key: 'relational_human',
    nameEn: 'Relational / Human',
    nameFr: 'Relationnel / Humain',
    color: '#EC4899' // pink
  },
  {
    key: 'inner_personal',
    nameEn: 'Inner / Personal',
    nameFr: 'Intérieur / Personnel',
    color: '#8B5CF6' // purple
  },
  {
    key: 'creative_expressive',
    nameEn: 'Creative / Expressive',
    nameFr: 'Créatif / Expressif',
    color: '#F59E0B' // amber
  },
  {
    key: 'exploratory_expansive',
    nameEn: 'Exploratory / Expansive',
    nameFr: 'Exploratoire / Expansif',
    color: '#10B981' // green
  },
  {
    key: 'integrative_legacy',
    nameEn: 'Integrative / Legacy',
    nameFr: 'Intégratif / Héritage',
    color: '#6366F1' // indigo
  }
]

// 30 Life Areas with metadata
const AREAS = [
  // SYSTEMIC / STRUCTURAL (5 areas)
  {
    key: 'work',
    nameEn: 'Work',
    nameFr: 'Travail',
    cluster: 'systemic_structural',
    subdimensions: [
      { name: 'Performance', description: 'Throughput, focus, consistency of output.' },
      { name: 'Creativity-at-Work', description: 'Innovating solutions within constraints.' },
      { name: 'Team Cohesion', description: 'Trust and collaboration among colleagues.' },
      { name: 'Career Trajectory', description: 'Clear pathway to next role or skill set.' },
      { name: 'Work-Life Balance', description: 'Sustainable hours, mental space for rest.' }
    ],
    primaryDimensions: ['profitability', 'alignment', 'growth'],
    secondaryDimensions: ['stability', 'service']
  },
  {
    key: 'finance',
    nameEn: 'Finance',
    nameFr: 'Finances',
    cluster: 'systemic_structural',
    subdimensions: [
      { name: 'Cash Flow', description: 'Inflows vs. outflows, liquidity reserves.' },
      { name: 'Debt Management', description: 'Leverage, repayment schedules, interest rates.' },
      { name: 'Investment Portfolio', description: 'Diversification, risk tolerance, returns.' },
      { name: 'Financial Literacy', description: 'Understanding of financial instruments and planning.' },
      { name: 'Generosity', description: 'Charitable giving, supporting causes you care about.' }
    ],
    primaryDimensions: ['profitability', 'stability', 'freedom'],
    secondaryDimensions: ['alignment', 'service']
  },
  {
    key: 'living_environment',
    nameEn: 'Living Environment',
    nameFr: 'Environnement de Vie',
    cluster: 'systemic_structural',
    subdimensions: [
      { name: 'Safety & Security', description: 'Physical safety, locks, insurance, neighborhood.' },
      { name: 'Aesthetics', description: 'Design, decor, alignment with personal taste.' },
      { name: 'Functionality', description: 'Space for work, rest, storage, movement.' },
      { name: 'Sustainability', description: 'Energy efficiency, eco-friendly materials, waste reduction.' },
      { name: 'Community Ties', description: 'Neighbors, local shops, sense of belonging in the area.' }
    ],
    primaryDimensions: ['stability', 'alignment', 'freedom'],
    secondaryDimensions: ['creativity', 'connection']
  },
  {
    key: 'legal_civic',
    nameEn: 'Legal & Civic',
    nameFr: 'Juridique et Civique',
    cluster: 'systemic_structural',
    subdimensions: [
      { name: 'Legal Compliance', description: 'Taxes, contracts, intellectual property protection.' },
      { name: 'Civic Engagement', description: 'Voting, community boards, advocacy.' },
      { name: 'Identity Documents', description: 'Passport, licenses, certifications up-to-date.' },
      { name: 'Risk Management', description: 'Insurance policies, wills, power of attorney.' },
      { name: 'Advocacy', description: 'Supporting causes, policy change, social justice work.' }
    ],
    primaryDimensions: ['stability', 'service', 'alignment'],
    secondaryDimensions: ['freedom', 'legacy']
  },
  {
    key: 'time_energy',
    nameEn: 'Time & Energy Management',
    nameFr: 'Gestion du Temps et de l\'Énergie',
    cluster: 'systemic_structural',
    subdimensions: [
      { name: 'Daily Routines', description: 'Morning/evening rituals, meal planning, sleep hygiene.' },
      { name: 'Calendar Hygiene', description: 'Buffer time, realistic scheduling, saying no.' },
      { name: 'Energy Mapping', description: 'Knowing peak hours, aligning tasks to energy levels.' },
      { name: 'Delegation', description: 'Outsourcing tasks that drain you or aren\'t your zone of genius.' },
      { name: 'Recovery Practices', description: 'Naps, breaks, sabbaticals, digital detox.' }
    ],
    primaryDimensions: ['alignment', 'freedom', 'vitality'],
    secondaryDimensions: ['stability', 'presence']
  },

  // RELATIONAL / HUMAN (5 areas)
  {
    key: 'romantic_intimacy',
    nameEn: 'Romantic & Intimacy',
    nameFr: 'Romance et Intimité',
    cluster: 'relational_human',
    subdimensions: [
      { name: 'Emotional Safety', description: 'Trust, vulnerability, mutual respect.' },
      { name: 'Physical Connection', description: 'Touch, sex, affection frequency and quality.' },
      { name: 'Shared Vision', description: 'Life goals alignment, future planning together.' },
      { name: 'Conflict Resolution', description: 'Communication skills, repair after fights.' },
      { name: 'Romance & Play', description: 'Date nights, surprises, keeping spark alive.' }
    ],
    primaryDimensions: ['connection', 'alignment', 'freedom'],
    secondaryDimensions: ['creativity', 'vitality']
  },
  {
    key: 'family',
    nameEn: 'Family',
    nameFr: 'Famille',
    cluster: 'relational_human',
    subdimensions: [
      { name: 'Parenting', description: 'Quality time, discipline balance, modeling values.' },
      { name: 'Extended Family', description: 'Visits, phone calls, family traditions.' },
      { name: 'Family Conflicts', description: 'Boundary setting, forgiveness, healing old wounds.' },
      { name: 'Legacy Planning', description: 'Values transmission, estate planning, family stories.' },
      { name: 'Caregiving', description: 'Supporting aging parents, children with special needs.' }
    ],
    primaryDimensions: ['connection', 'service', 'legacy'],
    secondaryDimensions: ['alignment', 'stability']
  },
  {
    key: 'friendships',
    nameEn: 'Friendships',
    nameFr: 'Amitiés',
    cluster: 'relational_human',
    subdimensions: [
      { name: 'Depth of Connection', description: 'Meaningful conversations, mutual support.' },
      { name: 'Frequency of Contact', description: 'Regular hangouts, calls, check-ins.' },
      { name: 'Shared Activities', description: 'Hobbies, trips, rituals together.' },
      { name: 'Reciprocity', description: 'Balanced give-and-take, emotional labor.' },
      { name: 'New Friendships', description: 'Meeting new people, expanding social circle.' }
    ],
    primaryDimensions: ['connection', 'freedom', 'vitality'],
    secondaryDimensions: ['creativity', 'growth']
  },
  {
    key: 'professional_network',
    nameEn: 'Professional Network',
    nameFr: 'Réseau Professionnel',
    cluster: 'relational_human',
    subdimensions: [
      { name: 'Industry Connections', description: 'Conferences, LinkedIn, professional groups.' },
      { name: 'Mentorship', description: 'Being mentored and mentoring others.' },
      { name: 'Collaboration Opportunities', description: 'Partnerships, referrals, joint ventures.' },
      { name: 'Reputation Management', description: 'Public speaking, publishing, thought leadership.' },
      { name: 'Skill Exchange', description: 'Learning from peers, teaching what you know.' }
    ],
    primaryDimensions: ['profitability', 'growth', 'service'],
    secondaryDimensions: ['connection', 'legacy']
  },
  {
    key: 'community',
    nameEn: 'Community & Belonging',
    nameFr: 'Communauté et Appartenance',
    cluster: 'relational_human',
    subdimensions: [
      { name: 'Local Involvement', description: 'Neighborhood groups, volunteer work.' },
      { name: 'Cultural Identity', description: 'Heritage, language, traditions.' },
      { name: 'Spiritual Community', description: 'Church, temple, meditation groups, sangha.' },
      { name: 'Online Communities', description: 'Forums, Discord, Facebook groups aligned with values.' },
      { name: 'Advocacy Work', description: 'Social justice, environmental groups, activism.' }
    ],
    primaryDimensions: ['connection', 'service', 'alignment'],
    secondaryDimensions: ['legacy', 'freedom']
  },

  // INNER / PERSONAL (5 areas)
  {
    key: 'physical_health',
    nameEn: 'Physical Health',
    nameFr: 'Santé Physique',
    cluster: 'inner_personal',
    subdimensions: [
      { name: 'Exercise', description: 'Cardio, strength, flexibility, consistency.' },
      { name: 'Nutrition', description: 'Balanced diet, hydration, relationship with food.' },
      { name: 'Sleep', description: 'Quality, duration, sleep hygiene.' },
      { name: 'Medical Care', description: 'Regular checkups, preventive care, chronic condition management.' },
      { name: 'Body Awareness', description: 'Listening to signals, pain management, ergonomics.' }
    ],
    primaryDimensions: ['vitality', 'stability', 'alignment'],
    secondaryDimensions: ['freedom', 'presence']
  },
  {
    key: 'mental_health',
    nameEn: 'Mental Health',
    nameFr: 'Santé Mentale',
    cluster: 'inner_personal',
    subdimensions: [
      { name: 'Emotional Regulation', description: 'Managing stress, anxiety, depression.' },
      { name: 'Therapy/Counseling', description: 'Professional support when needed.' },
      { name: 'Mindfulness Practices', description: 'Meditation, breathwork, journaling.' },
      { name: 'Cognitive Patterns', description: 'Recognizing and reframing limiting beliefs.' },
      { name: 'Mental Resilience', description: 'Bouncing back from setbacks, growth mindset.' }
    ],
    primaryDimensions: ['vitality', 'presence', 'alignment'],
    secondaryDimensions: ['stability', 'growth']
  },
  {
    key: 'emotional_wellbeing',
    nameEn: 'Emotional Wellbeing',
    nameFr: 'Bien-être Émotionnel',
    cluster: 'inner_personal',
    subdimensions: [
      { name: 'Self-Compassion', description: 'Treating yourself with kindness, not harsh self-criticism.' },
      { name: 'Emotional Expression', description: 'Healthy outlets for feelings—crying, laughing, talking.' },
      { name: 'Boundaries', description: 'Saying no, protecting your energy, setting limits.' },
      { name: 'Joy & Pleasure', description: 'Actively seeking what lights you up.' },
      { name: 'Processing Grief', description: 'Allowing space for loss, change, endings.' }
    ],
    primaryDimensions: ['vitality', 'freedom', 'presence'],
    secondaryDimensions: ['connection', 'alignment']
  },
  {
    key: 'personal_growth',
    nameEn: 'Personal Growth',
    nameFr: 'Croissance Personnelle',
    cluster: 'inner_personal',
    subdimensions: [
      { name: 'Learning', description: 'Courses, books, workshops, skill-building.' },
      { name: 'Self-Reflection', description: 'Journaling, therapy, retreats, asking "Who am I becoming?"' },
      { name: 'Challenges', description: 'Stepping outside comfort zone, trying new things.' },
      { name: 'Feedback', description: 'Seeking and integrating constructive criticism.' },
      { name: 'Identity Evolution', description: 'Letting go of old selves, embracing change.' }
    ],
    primaryDimensions: ['growth', 'alignment', 'freedom'],
    secondaryDimensions: ['creativity', 'vitality']
  },
  {
    key: 'spirituality',
    nameEn: 'Spirituality & Meaning',
    nameFr: 'Spiritualité et Sens',
    cluster: 'inner_personal',
    subdimensions: [
      { name: 'Practices', description: 'Prayer, meditation, rituals, ceremonies.' },
      { name: 'Belief System', description: 'Alignment with religion, philosophy, or personal spirituality.' },
      { name: 'Connection to Something Greater', description: 'Nature, cosmos, divine, collective consciousness.' },
      { name: 'Purpose', description: 'Why you\'re here, what you\'re called to do.' },
      { name: 'Transcendence', description: 'Moments of awe, flow, oneness.' }
    ],
    primaryDimensions: ['presence', 'alignment', 'integration'],
    secondaryDimensions: ['legacy', 'freedom']
  },

  // CREATIVE / EXPRESSIVE (5 areas)
  {
    key: 'creative_expression',
    nameEn: 'Creative Expression',
    nameFr: 'Expression Créative',
    cluster: 'creative_expressive',
    subdimensions: [
      { name: 'Artistic Practice', description: 'Painting, music, writing, dance—whatever medium you use.' },
      { name: 'Frequency', description: 'How often you create, consistency of practice.' },
      { name: 'Skill Development', description: 'Classes, tutorials, mentorship, deliberate practice.' },
      { name: 'Sharing Work', description: 'Exhibiting, performing, publishing, getting feedback.' },
      { name: 'Creative Play', description: 'Experimentation without judgment, just for joy.' }
    ],
    primaryDimensions: ['creativity', 'freedom', 'vitality'],
    secondaryDimensions: ['alignment', 'growth']
  },
  {
    key: 'hobbies_play',
    nameEn: 'Hobbies & Play',
    nameFr: 'Loisirs et Jeu',
    cluster: 'creative_expressive',
    subdimensions: [
      { name: 'Leisure Time', description: 'Carving out time for non-productive fun.' },
      { name: 'Variety', description: 'Trying new hobbies, not just repeating the same ones.' },
      { name: 'Social vs. Solo', description: 'Balance of group activities and alone time.' },
      { name: 'Flow States', description: 'Activities that absorb you completely, lose track of time.' },
      { name: 'Childlike Wonder', description: 'Curiosity, silliness, playfulness.' }
    ],
    primaryDimensions: ['freedom', 'vitality', 'creativity'],
    secondaryDimensions: ['connection', 'presence']
  },
  {
    key: 'style_aesthetics',
    nameEn: 'Style & Aesthetics',
    nameFr: 'Style et Esthétique',
    cluster: 'creative_expressive',
    subdimensions: [
      { name: 'Personal Style', description: 'Clothing, grooming, how you present yourself.' },
      { name: 'Home Decor', description: 'Living space reflecting your taste and values.' },
      { name: 'Digital Presence', description: 'Social media aesthetic, website design, branding.' },
      { name: 'Artistic Curation', description: 'What you surround yourself with—art, music, books.' },
      { name: 'Sensory Environment', description: 'Scents, sounds, textures that bring joy.' }
    ],
    primaryDimensions: ['creativity', 'alignment', 'freedom'],
    secondaryDimensions: ['vitality', 'presence']
  },
  {
    key: 'humor_levity',
    nameEn: 'Humor & Levity',
    nameFr: 'Humour et Légèreté',
    cluster: 'creative_expressive',
    subdimensions: [
      { name: 'Laughter Frequency', description: 'How often you laugh, find joy in absurdity.' },
      { name: 'Not Taking Yourself Too Seriously', description: 'Ability to laugh at own mistakes.' },
      { name: 'Playful Banter', description: 'Wit, teasing, inside jokes with loved ones.' },
      { name: 'Comedy & Entertainment', description: 'Stand-up, sitcoms, memes, satire.' },
      { name: 'Lightness in Hard Times', description: 'Finding humor even in struggle.' }
    ],
    primaryDimensions: ['vitality', 'freedom', 'presence'],
    secondaryDimensions: ['connection', 'creativity']
  },
  {
    key: 'sensuality_pleasure',
    nameEn: 'Sensuality & Pleasure',
    nameFr: 'Sensualité et Plaisir',
    cluster: 'creative_expressive',
    subdimensions: [
      { name: 'Embodiment', description: 'Being in your body, feeling sensations fully.' },
      { name: 'Sexual Expression', description: 'Solo or partnered, exploring desires, consent.' },
      { name: 'Pleasure Practices', description: 'Massage, dance, luxurious baths, fine meals.' },
      { name: 'Eroticism', description: 'Not just sex, but aliveness, attraction, magnetism.' },
      { name: 'Body Positivity', description: 'Accepting and celebrating your body as it is.' }
    ],
    primaryDimensions: ['vitality', 'presence', 'freedom'],
    secondaryDimensions: ['connection', 'creativity']
  },

  // EXPLORATORY / EXPANSIVE (5 areas)
  {
    key: 'travel_adventure',
    nameEn: 'Travel & Adventure',
    nameFr: 'Voyage et Aventure',
    cluster: 'exploratory_expansive',
    subdimensions: [
      { name: 'Frequency of Travel', description: 'How often you take trips, big or small.' },
      { name: 'Variety of Destinations', description: 'Exploring new places vs. returning to favorites.' },
      { name: 'Cultural Immersion', description: 'Learning languages, customs, local experiences.' },
      { name: 'Adventure Level', description: 'Risk-taking, outdoor activities, pushing limits.' },
      { name: 'Solo vs. Group', description: 'Balance of traveling alone and with others.' }
    ],
    primaryDimensions: ['freedom', 'growth', 'vitality'],
    secondaryDimensions: ['creativity', 'presence']
  },
  {
    key: 'learning_education',
    nameEn: 'Learning & Education',
    nameFr: 'Apprentissage et Éducation',
    cluster: 'exploratory_expansive',
    subdimensions: [
      { name: 'Formal Education', description: 'Degrees, certifications, structured programs.' },
      { name: 'Self-Directed Learning', description: 'Books, podcasts, online courses, curiosity-driven.' },
      { name: 'Skill Mastery', description: 'Deep practice in one area vs. breadth across many.' },
      { name: 'Teaching Others', description: 'Solidifying knowledge by sharing it.' },
      { name: 'Intellectual Curiosity', description: 'Asking questions, exploring ideas for their own sake.' }
    ],
    primaryDimensions: ['growth', 'alignment', 'freedom'],
    secondaryDimensions: ['service', 'creativity']
  },
  {
    key: 'innovation_experimentation',
    nameEn: 'Innovation & Experimentation',
    nameFr: 'Innovation et Expérimentation',
    cluster: 'exploratory_expansive',
    subdimensions: [
      { name: 'Side Projects', description: 'Tinkering, prototypes, trying new business ideas.' },
      { name: 'Risk Tolerance', description: 'Willingness to fail, iterate, pivot.' },
      { name: 'Creative Problem-Solving', description: 'Finding novel solutions, thinking outside the box.' },
      { name: 'Technology Adoption', description: 'Trying new tools, platforms, systems early.' },
      { name: 'Feedback Loops', description: 'Testing assumptions, gathering data, adjusting quickly.' }
    ],
    primaryDimensions: ['creativity', 'growth', 'freedom'],
    secondaryDimensions: ['profitability', 'alignment']
  },
  {
    key: 'nature_environment',
    nameEn: 'Nature & Environment',
    nameFr: 'Nature et Environnement',
    cluster: 'exploratory_expansive',
    subdimensions: [
      { name: 'Time Outdoors', description: 'Hiking, gardening, beach walks, forest bathing.' },
      { name: 'Environmental Stewardship', description: 'Recycling, conservation, activism.' },
      { name: 'Connection to Natural Rhythms', description: 'Seasons, moon cycles, circadian alignment.' },
      { name: 'Wildlife Interaction', description: 'Birdwatching, pets, animal sanctuaries.' },
      { name: 'Ecological Awareness', description: 'Understanding local ecosystems, biodiversity.' }
    ],
    primaryDimensions: ['presence', 'vitality', 'alignment'],
    secondaryDimensions: ['freedom', 'service']
  },
  {
    key: 'curiosity_wonder',
    nameEn: 'Curiosity & Wonder',
    nameFr: 'Curiosité et Émerveillement',
    cluster: 'exploratory_expansive',
    subdimensions: [
      { name: 'Asking Questions', description: 'Childlike "why?" attitude, not assuming you know.' },
      { name: 'Exploring the Unknown', description: 'Seeking out mystery, the edges of understanding.' },
      { name: 'Awe Experiences', description: 'Concerts, stargazing, moments that take your breath away.' },
      { name: 'Interdisciplinary Thinking', description: 'Connecting dots across fields—science, art, philosophy.' },
      { name: 'Beginner\'s Mind', description: 'Approaching familiar things with fresh eyes.' }
    ],
    primaryDimensions: ['growth', 'presence', 'freedom'],
    secondaryDimensions: ['creativity', 'vitality']
  },

  // INTEGRATIVE / LEGACY (5 areas)
  {
    key: 'purpose_mission',
    nameEn: 'Purpose & Mission',
    nameFr: 'Objectif et Mission',
    cluster: 'integrative_legacy',
    subdimensions: [
      { name: 'Clarity of Purpose', description: 'Knowing your "why," what you\'re here to do.' },
      { name: 'Alignment of Actions', description: 'Daily choices reflecting deeper mission.' },
      { name: 'Impact Measurement', description: 'Tracking whether you\'re moving the needle on what matters.' },
      { name: 'Evolution Over Time', description: 'Allowing purpose to shift as you grow.' },
      { name: 'Contribution to Others', description: 'How your purpose serves beyond yourself.' }
    ],
    primaryDimensions: ['alignment', 'legacy', 'service'],
    secondaryDimensions: ['growth', 'integration']
  },
  {
    key: 'values_integrity',
    nameEn: 'Values & Integrity',
    nameFr: 'Valeurs et Intégrité',
    cluster: 'integrative_legacy',
    subdimensions: [
      { name: 'Defining Core Values', description: 'Clarity on what you stand for—honesty, compassion, justice, etc.' },
      { name: 'Consistency', description: 'Living by those values even when it\'s hard.' },
      { name: 'Accountability', description: 'Owning mistakes, making amends, repairing trust.' },
      { name: 'Moral Courage', description: 'Speaking up, taking stands, risking disapproval.' },
      { name: 'Ethical Decision-Making', description: 'Frameworks for navigating gray areas.' }
    ],
    primaryDimensions: ['alignment', 'integrity', 'stability'],
    secondaryDimensions: ['legacy', 'service']
  },
  {
    key: 'legacy_impact',
    nameEn: 'Legacy & Impact',
    nameFr: 'Héritage et Impact',
    cluster: 'integrative_legacy',
    subdimensions: [
      { name: 'What You\'ll Leave Behind', description: 'Ideas, institutions, memories, values passed on.' },
      { name: 'Mentorship', description: 'Guiding next generation, sharing wisdom.' },
      { name: 'Creative Works', description: 'Books, art, inventions that outlive you.' },
      { name: 'Philanthropy', description: 'Endowments, foundations, charitable structures.' },
      { name: 'Family Heritage', description: 'Stories, traditions, values passed to children/grandchildren.' }
    ],
    primaryDimensions: ['legacy', 'service', 'integration'],
    secondaryDimensions: ['alignment', 'connection']
  },
  {
    key: 'contribution_service',
    nameEn: 'Contribution & Service',
    nameFr: 'Contribution et Service',
    cluster: 'integrative_legacy',
    subdimensions: [
      { name: 'Volunteer Work', description: 'Food banks, mentoring, crisis hotlines, community service.' },
      { name: 'Professional Service', description: 'Pro bono work, board service, expertise sharing.' },
      { name: 'Activism', description: 'Fighting for causes, policy change, social movements.' },
      { name: 'Random Acts of Kindness', description: 'Small gestures, helping strangers, generosity.' },
      { name: 'Systemic Change', description: 'Not just helping individuals, but changing structures.' }
    ],
    primaryDimensions: ['service', 'alignment', 'connection'],
    secondaryDimensions: ['legacy', 'integration']
  },
  {
    key: 'wisdom_integration',
    nameEn: 'Wisdom & Integration',
    nameFr: 'Sagesse et Intégration',
    cluster: 'integrative_legacy',
    subdimensions: [
      { name: 'Life Lessons', description: 'What you\'ve learned from failures, successes, relationships.' },
      { name: 'Synthesis', description: 'Connecting dots across life areas, seeing patterns.' },
      { name: 'Mentorship Received', description: 'Elders, teachers, guides who\'ve shaped you.' },
      { name: 'Storytelling', description: 'Sharing your journey, making meaning of experiences.' },
      { name: 'Elder Wisdom', description: 'If older, stepping into sage role; if younger, seeking it.' }
    ],
    primaryDimensions: ['integration', 'legacy', 'presence'],
    secondaryDimensions: ['growth', 'alignment']
  }
]

async function seedDimensions() {
  console.log('🌱 Seeding universal dimensions...')

  for (const dim of DIMENSIONS) {
    const { error } = await supabase
      .from('fd_dimension')
      .upsert({
        dimension_key: dim.key,
        name_en: dim.nameEn,
        name_fr: dim.nameFr,
        icon: dim.icon
      }, {
        onConflict: 'dimension_key'
      })

    if (error) {
      console.error(`❌ Error seeding dimension ${dim.key}:`, error)
    } else {
      console.log(`✅ Seeded dimension: ${dim.nameEn} ${dim.icon}`)
    }
  }
}

async function seedClusters() {
  console.log('\n🎨 Seeding area clusters...')

  for (const cluster of CLUSTERS) {
    const { error } = await supabase
      .from('fd_area_cluster')
      .upsert({
        cluster_key: cluster.key,
        name_en: cluster.nameEn,
        name_fr: cluster.nameFr,
        color: cluster.color
      }, {
        onConflict: 'cluster_key'
      })

    if (error) {
      console.error(`❌ Error seeding cluster ${cluster.key}:`, error)
    } else {
      console.log(`✅ Seeded cluster: ${cluster.nameEn} (${cluster.color})`)
    }
  }
}

async function seedAreas() {
  console.log('\n🏗️ Seeding 30 life areas...')

  for (const area of AREAS) {
    // Insert area
    const { data: areaData, error: areaError } = await supabase
      .from('fd_area')
      .upsert({
        area_key: area.key,
        name_en: area.nameEn,
        name_fr: area.nameFr,
        cluster_key: area.cluster,
        subdimensions: area.subdimensions
      }, {
        onConflict: 'area_key'
      })
      .select('id')
      .single()

    if (areaError) {
      console.error(`❌ Error seeding area ${area.key}:`, areaError)
      continue
    }

    console.log(`✅ Seeded area: ${area.nameEn}`)

    // Insert primary dimension mappings
    for (const dimKey of area.primaryDimensions) {
      const { error: mappingError } = await supabase
        .from('fd_area_dimension')
        .upsert({
          area_key: area.key,
          dimension_key: dimKey,
          priority: 'primary'
        }, {
          onConflict: 'area_key,dimension_key'
        })

      if (mappingError) {
        console.error(`  ❌ Error mapping primary dimension ${dimKey}:`, mappingError)
      } else {
        console.log(`  ↳ Primary: ${dimKey}`)
      }
    }

    // Insert secondary dimension mappings
    for (const dimKey of area.secondaryDimensions) {
      const { error: mappingError } = await supabase
        .from('fd_area_dimension')
        .upsert({
          area_key: area.key,
          dimension_key: dimKey,
          priority: 'secondary'
        }, {
          onConflict: 'area_key,dimension_key'
        })

      if (mappingError) {
        console.error(`  ❌ Error mapping secondary dimension ${dimKey}:`, mappingError)
      } else {
        console.log(`  ↳ Secondary: ${dimKey}`)
      }
    }
  }
}

async function main() {
  console.log('🔥 Starting Fulfillment Ontology v5.4 seed...\n')

  try {
    await seedDimensions()
    await seedClusters()
    await seedAreas()

    console.log('\n✨ Seed complete! Summary:')
    console.log(`   - ${DIMENSIONS.length} universal dimensions`)
    console.log(`   - ${CLUSTERS.length} area clusters`)
    console.log(`   - ${AREAS.length} life areas`)
    console.log(`   - ${AREAS.reduce((sum, a) => sum + a.primaryDimensions.length + a.secondaryDimensions.length, 0)} area-dimension mappings`)

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
