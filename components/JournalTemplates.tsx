'use client'

interface Template {
  id: string
  name: string
  icon: string
  description: string
  prompts: string[]
  category: string
}

const templates: Template[] = [
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    icon: '🌅',
    description: 'Reflect on your day and capture key moments',
    category: 'daily',
    prompts: [
      'What am I grateful for today?',
      'What was the highlight of my day?',
      'What challenged me today and how did I handle it?',
      'What did I learn today?',
      'How can I make tomorrow better?'
    ]
  },
  {
    id: 'morning-pages',
    name: 'Morning Pages',
    icon: '☀️',
    description: 'Clear your mind with stream-of-consciousness writing',
    category: 'daily',
    prompts: [
      'What&apos;s on my mind right now?',
      'What are my intentions for today?',
      'What am I looking forward to?',
      'What worries can I let go of?',
      'How do I want to show up today?'
    ]
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    icon: '📅',
    description: 'Review your week and plan ahead',
    category: 'weekly',
    prompts: [
      'What were my biggest wins this week?',
      'What didn&apos;t go as planned?',
      'What lessons did I learn?',
      'What am I most grateful for this week?',
      'What are my top 3 priorities for next week?'
    ]
  },
  {
    id: 'goal-progress',
    name: 'Goal Progress',
    icon: '🎯',
    description: 'Track progress on your goals',
    category: 'goals',
    prompts: [
      'What progress did I make toward my goals today?',
      'What obstacles am I facing?',
      'What resources or support do I need?',
      'How can I adjust my approach?',
      'What&apos;s my next actionable step?'
    ]
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    icon: '🙏',
    description: 'Focus on appreciation and positivity',
    category: 'mindfulness',
    prompts: [
      'Three things I&apos;m grateful for today',
      'Someone who made a positive impact on my day',
      'A simple pleasure I enjoyed',
      'Something beautiful I noticed',
      'A personal strength I&apos;m thankful for'
    ]
  },
  {
    id: 'emotional-check',
    name: 'Emotional Check-in',
    icon: '💭',
    description: 'Process and understand your emotions',
    category: 'wellness',
    prompts: [
      'How am I feeling right now?',
      'What triggered these emotions?',
      'What do these feelings need from me?',
      'How can I show myself compassion?',
      'What would help me feel better?'
    ]
  },
  {
    id: 'creative-spark',
    name: 'Creative Spark',
    icon: '✨',
    description: 'Unleash your creativity and imagination',
    category: 'creative',
    prompts: [
      'If I could do anything today, what would it be?',
      'What creative ideas are bubbling up?',
      'What inspires me right now?',
      'If I were to start a new project...',
      'What would I create if there were no limits?'
    ]
  },
  {
    id: 'relationship-reflection',
    name: 'Relationship Reflection',
    icon: '❤️',
    description: 'Nurture your connections with others',
    category: 'relationships',
    prompts: [
      'Who am I grateful for in my life?',
      'How did I show love today?',
      'What relationship needs attention?',
      'How can I be a better friend/partner/family member?',
      'What boundaries do I need to set or honor?'
    ]
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    icon: '🔧',
    description: 'Work through challenges systematically',
    category: 'productivity',
    prompts: [
      'What problem am I trying to solve?',
      'What are the possible solutions?',
      'What are the pros and cons of each?',
      'What&apos;s the first step I can take?',
      'Who could help me with this?'
    ]
  },
  {
    id: 'future-self',
    name: 'Letter to Future Self',
    icon: '📮',
    description: 'Write a message to your future self',
    category: 'reflection',
    prompts: [
      'Dear future me...',
      'What I hope you remember about today',
      'The dreams I&apos;m working toward',
      'The challenges I&apos;m overcoming',
      'What I want you to know'
    ]
  }
]

interface JournalTemplatesProps {
  onSelectTemplate: (template: Template) => void
  selectedCategory?: string
}

export default function JournalTemplates({ onSelectTemplate, selectedCategory = 'all' }: JournalTemplatesProps) {
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory)
  
  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            className={`
              px-3 py-1 rounded-full text-sm capitalize
              ${selectedCategory === category 
                ? 'bg-cyan-500 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'}
              transition-colors
            `}
            onClick={() => {/* Handle category change */}}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all hover:scale-105 border border-white/10"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{template.icon}</span>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{template.name}</h3>
                <p className="text-gray-400 text-sm">{template.description}</p>
              </div>
            </div>
            <div className="space-y-1">
              {template.prompts.slice(0, 2).map((prompt, index) => (
                <p key={index} className="text-gray-300 text-xs">
                  • {prompt}
                </p>
              ))}
              {template.prompts.length > 2 && (
                <p className="text-gray-500 text-xs">
                  +{template.prompts.length - 2} more prompts
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export { templates, type Template }