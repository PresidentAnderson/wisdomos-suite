import { LifeArea, Subdomain, Dimension } from '@/types/fulfillment-v5';

export const SAMPLE_LIFE_AREA: LifeArea = {
  id: 'work-purpose',
  name: 'Work & Purpose',
  phoenixName: 'Phoenix of Achievement',
  icon: '💼',
  color: 'bg-blue-500',
  status: 'Needs Attention',
  score: 65,
  commitments: 3,
  subdomains: [
    {
      id: 'creative-work',
      name: 'Creative',
      description: 'Innovation and creative problem-solving',
      dimensions: [
        {
          name: 'Being',
          focus: 'Embodying curiosity and openness',
          inquiry: 'What state of mind supports my best creative work?',
          practices: [
            'Morning pages journaling',
            '15 min daily ideation',
            'Weekly creative walks'
          ],
          metric: 4,
          notes: 'Strong creative energy this week'
        },
        {
          name: 'Doing',
          focus: 'Creating tangible outputs',
          inquiry: 'What projects express my unique voice?',
          practices: [
            'Prototype new features',
            'Write technical blog posts',
            'Design system components'
          ],
          metric: 3,
          notes: 'Need more dedicated creation time'
        },
        {
          name: 'Having',
          focus: 'Tools and resources for creativity',
          inquiry: 'What do I need to create my best work?',
          practices: [
            'Maintain inspiration library',
            'Invest in quality tools',
            'Create dedicated workspace'
          ],
          metric: 4
        },
        {
          name: 'Relating',
          focus: 'Collaborative creation',
          inquiry: 'Who amplifies my creative output?',
          practices: [
            'Weekly pair programming',
            'Join design critiques',
            'Mentor junior developers'
          ],
          metric: 3
        },
        {
          name: 'Becoming',
          focus: 'Evolution as a creator',
          inquiry: 'How am I growing as an innovator?',
          practices: [
            'Learn new frameworks quarterly',
            'Attend conferences',
            'Build side projects'
          ],
          metric: 4,
          notes: 'Started learning WebGL'
        }
      ]
    },
    {
      id: 'operational-work',
      name: 'Operational',
      description: 'Systems, processes, and daily execution',
      dimensions: [
        {
          name: 'Being',
          focus: 'Discipline and consistency',
          inquiry: 'What mindset keeps operations smooth?',
          practices: [
            'Daily standup attendance',
            'Process documentation',
            'Incident response protocols'
          ],
          metric: 5,
          notes: 'Operations running smoothly'
        },
        {
          name: 'Doing',
          focus: 'Executing core responsibilities',
          inquiry: 'What must I deliver consistently?',
          practices: [
            'Code reviews within 24h',
            'Weekly sprint planning',
            'Monthly metrics review'
          ],
          metric: 4
        },
        {
          name: 'Having',
          focus: 'Infrastructure and systems',
          inquiry: 'What systems support reliability?',
          practices: [
            'Maintain CI/CD pipeline',
            'Monitor performance metrics',
            'Update documentation'
          ],
          metric: 5
        },
        {
          name: 'Relating',
          focus: 'Team coordination',
          inquiry: 'How do I support team execution?',
          practices: [
            'Clear communication',
            'Remove blockers',
            'Share knowledge'
          ],
          metric: 4
        },
        {
          name: 'Becoming',
          focus: 'Process improvement',
          inquiry: 'How are our systems evolving?',
          practices: [
            'Quarterly retrospectives',
            'A/B test workflows',
            'Automate repetitive tasks'
          ],
          metric: 3,
          notes: 'Need to automate deployment process'
        }
      ]
    },
    {
      id: 'strategic-work',
      name: 'Strategic',
      description: 'Long-term vision and planning',
      dimensions: [
        {
          name: 'Being',
          focus: 'Visionary thinking',
          inquiry: 'What perspective serves the long-term?',
          practices: [
            'Quarterly planning sessions',
            'Industry trend analysis',
            'Competitive research'
          ],
          metric: 3,
          notes: 'Need more time for strategic thinking'
        },
        {
          name: 'Doing',
          focus: 'Strategic initiatives',
          inquiry: 'What actions shape our future?',
          practices: [
            'Roadmap planning',
            'Stakeholder alignment',
            'Resource allocation'
          ],
          metric: 3
        },
        {
          name: 'Having',
          focus: 'Strategic assets',
          inquiry: 'What gives us competitive advantage?',
          practices: [
            'Build proprietary tech',
            'Develop unique IP',
            'Cultivate partnerships'
          ],
          metric: 4
        },
        {
          name: 'Relating',
          focus: 'Strategic relationships',
          inquiry: 'Who influences our direction?',
          practices: [
            'Executive check-ins',
            'Board presentations',
            'Customer advisory board'
          ],
          metric: 3
        },
        {
          name: 'Becoming',
          focus: 'Organizational evolution',
          inquiry: 'How is the company transforming?',
          practices: [
            'Culture initiatives',
            'Market positioning',
            'Scaling strategies'
          ],
          metric: 2,
          notes: 'Scaling challenges ahead'
        }
      ]
    }
  ],
  acceptable: [
    'Strong operational discipline',
    'Healthy creative output',
    'Good team collaboration'
  ],
  noLongerTolerated: [
    'Reactive firefighting',
    'Lack of strategic planning time',
    'Unclear priorities'
  ]
};

export const SAMPLE_DATA: LifeArea[] = [
  SAMPLE_LIFE_AREA,
  // Add more life areas following the same pattern
];
