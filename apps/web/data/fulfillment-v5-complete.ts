import { LifeArea } from '@/types/fulfillment-v5';

/**
 * Complete WisdomOS Life Areas Seed Data
 * All 10 life areas with comprehensive subdomain and dimension data
 */

export const COMPLETE_LIFE_AREAS: LifeArea[] = [
  // 1. Work & Purpose (Phoenix of Achievement)
  {
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
  },

  // 2. Health & Vitality (Phoenix of Renewal)
  {
    id: 'health-vitality',
    name: 'Health & Vitality',
    phoenixName: 'Phoenix of Renewal',
    icon: '🌱',
    color: 'bg-green-500',
    status: 'Thriving',
    score: 82,
    commitments: 5,
    subdomains: [
      {
        id: 'creative-health',
        name: 'Creative',
        description: 'Exploration and experimentation with wellness',
        dimensions: [
          {
            name: 'Being',
            focus: 'Embodying vitality and energy',
            inquiry: 'What does optimal health feel like in my body?',
            practices: [
              'Body scan meditation',
              'Energy level tracking',
              'Intuitive movement'
            ],
            metric: 4,
            notes: 'Feeling energized and alive'
          },
          {
            name: 'Doing',
            focus: 'Experimenting with wellness practices',
            inquiry: 'What new approaches to health intrigue me?',
            practices: [
              'Try new workout styles',
              'Experiment with nutrition',
              'Explore healing modalities'
            ],
            metric: 5,
            notes: 'Started cold plunge therapy'
          },
          {
            name: 'Having',
            focus: 'Resources for health innovation',
            inquiry: 'What tools support my wellness journey?',
            practices: [
              'Quality fitness equipment',
              'Health tracking devices',
              'Wellness app subscriptions'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Community and accountability',
            inquiry: 'Who supports my health goals?',
            practices: [
              'Join fitness classes',
              'Find workout partners',
              'Share health journey'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Evolution of health identity',
            inquiry: 'Who am I becoming through wellness?',
            practices: [
              'Set progressive fitness goals',
              'Learn about biohacking',
              'Document transformation'
            ],
            metric: 5,
            notes: 'Significant progress in strength training'
          }
        ]
      },
      {
        id: 'operational-health',
        name: 'Operational',
        description: 'Daily health routines and habits',
        dimensions: [
          {
            name: 'Being',
            focus: 'Consistent healthy presence',
            inquiry: 'What daily rhythms support my health?',
            practices: [
              'Regular sleep schedule',
              'Consistent meal times',
              'Daily movement practice'
            ],
            metric: 5,
            notes: '8 hours sleep consistently'
          },
          {
            name: 'Doing',
            focus: 'Core health activities',
            inquiry: 'What must I do daily for vitality?',
            practices: [
              '30 min daily exercise',
              'Balanced nutrition',
              'Hydration tracking'
            ],
            metric: 5
          },
          {
            name: 'Having',
            focus: 'Health infrastructure',
            inquiry: 'What systems keep me healthy?',
            practices: [
              'Meal prep routine',
              'Gym membership',
              'Regular health checkups'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Health partnerships',
            inquiry: 'Who supports my daily wellness?',
            practices: [
              'Work with personal trainer',
              'Consult nutritionist',
              'Join accountability group'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Habit optimization',
            inquiry: 'How are my routines improving?',
            practices: [
              'Track habit streaks',
              'Refine morning routine',
              'Optimize recovery protocols'
            ],
            metric: 4,
            notes: 'Added stretching to routine'
          }
        ]
      },
      {
        id: 'strategic-health',
        name: 'Strategic',
        description: 'Long-term health planning and prevention',
        dimensions: [
          {
            name: 'Being',
            focus: 'Long-term health mindset',
            inquiry: 'What perspective ensures lifelong vitality?',
            practices: [
              'Preventive health focus',
              'Longevity research',
              'Health vision creation'
            ],
            metric: 4,
            notes: 'Focused on longevity'
          },
          {
            name: 'Doing',
            focus: 'Strategic health actions',
            inquiry: 'What investments pay health dividends?',
            practices: [
              'Annual health screenings',
              'Long-term fitness planning',
              'Stress management systems'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Health assets',
            inquiry: 'What resources ensure future health?',
            practices: [
              'Health insurance optimization',
              'Emergency health fund',
              'Quality healthcare access'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Healthcare team',
            inquiry: 'Who guides my health strategy?',
            practices: [
              'Primary care physician',
              'Specialist relationships',
              'Health coach partnership'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Health trajectory',
            inquiry: 'Where is my health headed?',
            practices: [
              'Set 5-year health goals',
              'Monitor biomarkers',
              'Plan for aging well'
            ],
            metric: 4,
            notes: 'Clear health vision for next decade'
          }
        ]
      }
    ],
    acceptable: [
      'Consistent exercise routine',
      'Good sleep quality',
      'Balanced nutrition'
    ],
    noLongerTolerated: [
      'Skipping workouts',
      'Poor sleep habits',
      'Stress eating'
    ]
  },

  // 3. Relationships & Love (Phoenix of Connection)
  {
    id: 'relationships-love',
    name: 'Relationships & Love',
    phoenixName: 'Phoenix of Connection',
    icon: '❤️',
    color: 'bg-pink-500',
    status: 'Thriving',
    score: 78,
    commitments: 4,
    subdomains: [
      {
        id: 'creative-relationships',
        name: 'Creative',
        description: 'Innovation in connection and intimacy',
        dimensions: [
          {
            name: 'Being',
            focus: 'Open and present in love',
            inquiry: 'What qualities make me a great partner?',
            practices: [
              'Practice vulnerability',
              'Cultivate empathy',
              'Embrace authenticity'
            ],
            metric: 4,
            notes: 'Growing in emotional openness'
          },
          {
            name: 'Doing',
            focus: 'Creative expressions of love',
            inquiry: 'How do I uniquely show love?',
            practices: [
              'Plan surprise dates',
              'Create shared experiences',
              'Write love letters'
            ],
            metric: 5,
            notes: 'Monthly adventure dates going well'
          },
          {
            name: 'Having',
            focus: 'Relationship resources',
            inquiry: 'What supports deep connection?',
            practices: [
              'Relationship books/courses',
              'Couples retreat fund',
              'Quality time budget'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Depth of intimacy',
            inquiry: 'How deep does our connection go?',
            practices: [
              'Weekly connection rituals',
              'Deep conversation prompts',
              'Emotional check-ins'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Evolution together',
            inquiry: 'How are we growing as partners?',
            practices: [
              'Share growth goals',
              'Learn together',
              'Support each other\'s dreams'
            ],
            metric: 5,
            notes: 'Aligned on life vision'
          }
        ]
      },
      {
        id: 'operational-relationships',
        name: 'Operational',
        description: 'Daily practices and relationship maintenance',
        dimensions: [
          {
            name: 'Being',
            focus: 'Consistent loving presence',
            inquiry: 'How do I show up daily?',
            practices: [
              'Morning kiss ritual',
              'Active listening',
              'Appreciation practice'
            ],
            metric: 5,
            notes: 'Daily gratitude practice strong'
          },
          {
            name: 'Doing',
            focus: 'Daily acts of love',
            inquiry: 'What small actions matter most?',
            practices: [
              'Daily "I love you"',
              'Help with chores',
              'Leave thoughtful notes'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Relationship systems',
            inquiry: 'What structures support us?',
            practices: [
              'Weekly date nights',
              'Shared calendar',
              'Conflict resolution process'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Communication quality',
            inquiry: 'How well do we communicate?',
            practices: [
              'Daily check-ins',
              'Non-violent communication',
              'Clear boundaries'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Relationship habits',
            inquiry: 'What patterns are we building?',
            practices: [
              'Improve conflict habits',
              'Deepen appreciation',
              'Build trust daily'
            ],
            metric: 4,
            notes: 'Communication improving'
          }
        ]
      },
      {
        id: 'strategic-relationships',
        name: 'Strategic',
        description: 'Long-term relationship vision and planning',
        dimensions: [
          {
            name: 'Being',
            focus: 'Committed partnership',
            inquiry: 'What kind of partnership am I building?',
            practices: [
              'Clarify relationship values',
              'Define shared vision',
              'Commit to growth'
            ],
            metric: 5,
            notes: 'Strong shared vision'
          },
          {
            name: 'Doing',
            focus: 'Long-term investments',
            inquiry: 'What actions build lasting love?',
            practices: [
              'Annual relationship review',
              'Plan life milestones',
              'Address big topics'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Partnership assets',
            inquiry: 'What foundation supports our future?',
            practices: [
              'Financial planning together',
              'Build shared home',
              'Create family legacy'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Extended network',
            inquiry: 'How do our communities connect?',
            practices: [
              'Integrate friend groups',
              'Family relationships',
              'Couple friendships'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Relationship trajectory',
            inquiry: 'Where is our relationship headed?',
            practices: [
              'Marriage/commitment planning',
              'Family planning discussions',
              'Long-term dream building'
            ],
            metric: 4,
            notes: 'Clear about future together'
          }
        ]
      }
    ],
    acceptable: [
      'Daily quality time',
      'Good communication',
      'Mutual support'
    ],
    noLongerTolerated: [
      'Taking each other for granted',
      'Avoiding difficult conversations',
      'Neglecting date nights'
    ]
  },

  // 4. Personal Growth (Phoenix of Transformation)
  {
    id: 'personal-growth',
    name: 'Personal Growth',
    phoenixName: 'Phoenix of Transformation',
    icon: '🦋',
    color: 'bg-purple-500',
    status: 'Thriving',
    score: 85,
    commitments: 6,
    subdomains: [
      {
        id: 'creative-growth',
        name: 'Creative',
        description: 'Exploration and self-discovery',
        dimensions: [
          {
            name: 'Being',
            focus: 'Self-awareness and presence',
            inquiry: 'Who am I becoming?',
            practices: [
              'Daily meditation',
              'Self-reflection journaling',
              'Mindfulness practice'
            ],
            metric: 5,
            notes: 'Deepening self-awareness'
          },
          {
            name: 'Doing',
            focus: 'New experiences and learning',
            inquiry: 'What am I exploring?',
            practices: [
              'Try new hobbies',
              'Take courses',
              'Travel to new places'
            ],
            metric: 4,
            notes: 'Started pottery classes'
          },
          {
            name: 'Having',
            focus: 'Growth resources',
            inquiry: 'What supports my development?',
            practices: [
              'Personal development library',
              'Coaching/therapy access',
              'Learning budget'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Growth through connection',
            inquiry: 'Who challenges me to grow?',
            practices: [
              'Mastermind group',
              'Mentorship relationships',
              'Accountability partners'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Identity evolution',
            inquiry: 'How am I transforming?',
            practices: [
              'Shadow work',
              'Pattern recognition',
              'Belief updating'
            ],
            metric: 5,
            notes: 'Major breakthrough in therapy'
          }
        ]
      },
      {
        id: 'operational-growth',
        name: 'Operational',
        description: 'Daily practices and discipline',
        dimensions: [
          {
            name: 'Being',
            focus: 'Consistent growth mindset',
            inquiry: 'What daily mindset serves growth?',
            practices: [
              'Morning affirmations',
              'Growth-oriented self-talk',
              'Reframe challenges'
            ],
            metric: 5,
            notes: 'Strong growth mindset'
          },
          {
            name: 'Doing',
            focus: 'Daily growth actions',
            inquiry: 'What do I practice daily?',
            practices: [
              '30 min reading',
              'Journal 3 gratitudes',
              'Learn something new'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Growth infrastructure',
            inquiry: 'What systems support development?',
            practices: [
              'Morning routine',
              'Habit tracking',
              'Learning management system'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Daily connections',
            inquiry: 'How do I grow through relationships?',
            practices: [
              'Seek feedback',
              'Practice active listening',
              'Share learnings'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Habit formation',
            inquiry: 'What new patterns am I building?',
            practices: [
              'Track streaks',
              'Celebrate wins',
              'Adjust habits monthly'
            ],
            metric: 5,
            notes: '90-day meditation streak'
          }
        ]
      },
      {
        id: 'strategic-growth',
        name: 'Strategic',
        description: 'Long-term development planning',
        dimensions: [
          {
            name: 'Being',
            focus: 'Vision for self',
            inquiry: 'Who do I aspire to become?',
            practices: [
              'Create personal vision',
              'Define core values',
              'Life purpose work'
            ],
            metric: 5,
            notes: 'Clear personal mission'
          },
          {
            name: 'Doing',
            focus: 'Strategic development',
            inquiry: 'What skills transform my future?',
            practices: [
              'Multi-year learning plan',
              'Career development',
              'Leadership training'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Development assets',
            inquiry: 'What investments compound?',
            practices: [
              'Education fund',
              'Professional certifications',
              'Personal brand'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Strategic relationships',
            inquiry: 'Who shapes my trajectory?',
            practices: [
              'Find ideal mentors',
              'Build peer network',
              'Thought leader connections'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Transformation path',
            inquiry: 'What is my growth trajectory?',
            practices: [
              'Annual life review',
              'Set 5-year goals',
              'Track transformation'
            ],
            metric: 5,
            notes: 'On track with 5-year plan'
          }
        ]
      }
    ],
    acceptable: [
      'Consistent learning',
      'Active self-reflection',
      'Growth mindset'
    ],
    noLongerTolerated: [
      'Staying in comfort zone',
      'Resisting change',
      'Ignoring feedback'
    ]
  },

  // 5. Finance & Security (Phoenix of Abundance)
  {
    id: 'finance-security',
    name: 'Finance & Security',
    phoenixName: 'Phoenix of Abundance',
    icon: '💰',
    color: 'bg-yellow-500',
    status: 'Needs Attention',
    score: 68,
    commitments: 3,
    subdomains: [
      {
        id: 'creative-finance',
        name: 'Creative',
        description: 'Wealth creation and financial innovation',
        dimensions: [
          {
            name: 'Being',
            focus: 'Abundance mindset',
            inquiry: 'What beliefs support wealth?',
            practices: [
              'Money mindset work',
              'Abundance affirmations',
              'Value-based spending'
            ],
            metric: 4,
            notes: 'Shifting scarcity beliefs'
          },
          {
            name: 'Doing',
            focus: 'Income generation',
            inquiry: 'How do I create value?',
            practices: [
              'Develop new income streams',
              'Invest in skills',
              'Build assets'
            ],
            metric: 3,
            notes: 'Exploring side business'
          },
          {
            name: 'Having',
            focus: 'Financial tools',
            inquiry: 'What resources grow wealth?',
            practices: [
              'Investment accounts',
              'Financial education',
              'Wealth-building tools'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Financial network',
            inquiry: 'Who supports financial growth?',
            practices: [
              'Find financial mentor',
              'Investment clubs',
              'Mastermind groups'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Wealth identity',
            inquiry: 'Who am I becoming financially?',
            practices: [
              'Study wealthy mindsets',
              'Develop investor identity',
              'Practice generosity'
            ],
            metric: 3,
            notes: 'Building investor mindset'
          }
        ]
      },
      {
        id: 'operational-finance',
        name: 'Operational',
        description: 'Money management and budgeting',
        dimensions: [
          {
            name: 'Being',
            focus: 'Financial discipline',
            inquiry: 'What habits create security?',
            practices: [
              'Mindful spending',
              'Regular budget reviews',
              'Delayed gratification'
            ],
            metric: 4,
            notes: 'Good spending awareness'
          },
          {
            name: 'Doing',
            focus: 'Daily money management',
            inquiry: 'What must I do consistently?',
            practices: [
              'Track expenses daily',
              'Pay bills on time',
              'Review transactions'
            ],
            metric: 5
          },
          {
            name: 'Having',
            focus: 'Financial systems',
            inquiry: 'What systems ensure stability?',
            practices: [
              'Automated savings',
              'Budget software',
              'Emergency fund'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Money communication',
            inquiry: 'How do I discuss finances?',
            practices: [
              'Partner money talks',
              'Financial transparency',
              'Money coaching'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Financial habits',
            inquiry: 'How are my money habits evolving?',
            practices: [
              'Reduce unnecessary expenses',
              'Increase savings rate',
              'Optimize spending'
            ],
            metric: 4,
            notes: 'Savings rate improving'
          }
        ]
      },
      {
        id: 'strategic-finance',
        name: 'Strategic',
        description: 'Long-term financial planning and wealth building',
        dimensions: [
          {
            name: 'Being',
            focus: 'Financial vision',
            inquiry: 'What does financial freedom mean?',
            practices: [
              'Define financial goals',
              'Create wealth vision',
              'Plan for legacy'
            ],
            metric: 4,
            notes: 'Clear retirement vision'
          },
          {
            name: 'Doing',
            focus: 'Strategic investments',
            inquiry: 'What builds long-term wealth?',
            practices: [
              'Retirement contributions',
              'Portfolio diversification',
              'Real estate investing'
            ],
            metric: 3
          },
          {
            name: 'Having',
            focus: 'Wealth assets',
            inquiry: 'What creates lasting security?',
            practices: [
              'Investment portfolio',
              'Insurance coverage',
              'Estate planning'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Financial advisors',
            inquiry: 'Who guides my financial strategy?',
            practices: [
              'Work with financial planner',
              'Tax advisor relationship',
              'Attorney for estate'
            ],
            metric: 2,
            notes: 'Need to find financial advisor'
          },
          {
            name: 'Becoming',
            focus: 'Financial trajectory',
            inquiry: 'Where is my wealth headed?',
            practices: [
              'Track net worth monthly',
              'Project retirement readiness',
              'Plan generational wealth'
            ],
            metric: 3,
            notes: 'Behind on retirement goals'
          }
        ]
      }
    ],
    acceptable: [
      'Emergency fund established',
      'Consistent saving',
      'Low debt levels'
    ],
    noLongerTolerated: [
      'Impulse spending',
      'Ignoring investments',
      'Financial avoidance'
    ]
  },

  // 6. Home & Environment (Phoenix of Sanctuary)
  {
    id: 'home-environment',
    name: 'Home & Environment',
    phoenixName: 'Phoenix of Sanctuary',
    icon: '🏡',
    color: 'bg-amber-500',
    status: 'Thriving',
    score: 80,
    commitments: 4,
    subdomains: [
      {
        id: 'creative-home',
        name: 'Creative',
        description: 'Design and personalization of space',
        dimensions: [
          {
            name: 'Being',
            focus: 'Sense of home',
            inquiry: 'What makes a space feel like mine?',
            practices: [
              'Curate meaningful decor',
              'Create ambiance',
              'Honor personal aesthetics'
            ],
            metric: 5,
            notes: 'Home feels like sanctuary'
          },
          {
            name: 'Doing',
            focus: 'Space creation',
            inquiry: 'How do I shape my environment?',
            practices: [
              'DIY home projects',
              'Seasonal decorating',
              'Garden design'
            ],
            metric: 4,
            notes: 'Finished bedroom redesign'
          },
          {
            name: 'Having',
            focus: 'Home resources',
            inquiry: 'What makes my space functional?',
            practices: [
              'Quality furniture',
              'Art and beauty',
              'Home improvement budget'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Hospitality',
            inquiry: 'How do I welcome others?',
            practices: [
              'Host gatherings',
              'Create guest comfort',
              'Share home warmly'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Space evolution',
            inquiry: 'How is my home growing with me?',
            practices: [
              'Update as life changes',
              'Refine style',
              'Improve functionality'
            ],
            metric: 4,
            notes: 'Home office upgrade next'
          }
        ]
      },
      {
        id: 'operational-home',
        name: 'Operational',
        description: 'Maintenance and daily home management',
        dimensions: [
          {
            name: 'Being',
            focus: 'Homeowner mindset',
            inquiry: 'What attitude keeps my home well?',
            practices: [
              'Pride in space',
              'Proactive maintenance',
              'Organization habits'
            ],
            metric: 5,
            notes: 'Taking good care of home'
          },
          {
            name: 'Doing',
            focus: 'Daily home care',
            inquiry: 'What keeps my space functional?',
            practices: [
              'Daily tidying routine',
              'Weekly cleaning',
              'Seasonal maintenance'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Home systems',
            inquiry: 'What infrastructure supports order?',
            practices: [
              'Organization systems',
              'Cleaning supplies',
              'Maintenance schedule'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Household coordination',
            inquiry: 'How do we manage home together?',
            practices: [
              'Shared chore system',
              'Family cleaning days',
              'Clear responsibilities'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Home habit improvement',
            inquiry: 'How are home routines evolving?',
            practices: [
              'Optimize cleaning flow',
              'Reduce clutter',
              'Improve organization'
            ],
            metric: 4,
            notes: 'Decluttering making progress'
          }
        ]
      },
      {
        id: 'strategic-home',
        name: 'Strategic',
        description: 'Long-term home and real estate planning',
        dimensions: [
          {
            name: 'Being',
            focus: 'Home vision',
            inquiry: 'What is my ideal living situation?',
            practices: [
              'Define dream home',
              'Clarify location preferences',
              'Lifestyle alignment'
            ],
            metric: 4,
            notes: 'Clear vision for next home'
          },
          {
            name: 'Doing',
            focus: 'Real estate strategy',
            inquiry: 'What moves build equity?',
            practices: [
              'Plan home purchases',
              'Property value growth',
              'Renovation investments'
            ],
            metric: 3
          },
          {
            name: 'Having',
            focus: 'Property assets',
            inquiry: 'What real estate serves my future?',
            practices: [
              'Home equity building',
              'Investment properties',
              'Land ownership'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Community',
            inquiry: 'What neighborhood supports my life?',
            practices: [
              'Know neighbors',
              'Community involvement',
              'Local connections'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Housing trajectory',
            inquiry: 'Where is my living situation headed?',
            practices: [
              '5-year housing plan',
              'Location scouting',
              'Upgrade timeline'
            ],
            metric: 4,
            notes: 'Planning move in 2 years'
          }
        ]
      }
    ],
    acceptable: [
      'Clean and organized',
      'Feels like sanctuary',
      'Good functionality'
    ],
    noLongerTolerated: [
      'Chronic clutter',
      'Deferred maintenance',
      'Uncomfortable spaces'
    ]
  },

  // 7. Recreation & Joy (Phoenix of Play)
  {
    id: 'recreation-joy',
    name: 'Recreation & Joy',
    phoenixName: 'Phoenix of Play',
    icon: '🎨',
    color: 'bg-orange-500',
    status: 'Needs Attention',
    score: 62,
    commitments: 2,
    subdomains: [
      {
        id: 'creative-recreation',
        name: 'Creative',
        description: 'Exploration and artistic expression',
        dimensions: [
          {
            name: 'Being',
            focus: 'Playful presence',
            inquiry: 'What does joy feel like?',
            practices: [
              'Cultivate wonder',
              'Embrace spontaneity',
              'Practice playfulness'
            ],
            metric: 3,
            notes: 'Need more playful time'
          },
          {
            name: 'Doing',
            focus: 'Creative hobbies',
            inquiry: 'What brings me alive creatively?',
            practices: [
              'Paint or draw',
              'Play music',
              'Photography walks'
            ],
            metric: 2,
            notes: 'Haven\'t painted in months'
          },
          {
            name: 'Having',
            focus: 'Play resources',
            inquiry: 'What enables creative play?',
            practices: [
              'Art supplies',
              'Musical instruments',
              'Creative workspace'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Shared joy',
            inquiry: 'Who do I play with?',
            practices: [
              'Game nights',
              'Creative collaborations',
              'Adventure buddies'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Joy expansion',
            inquiry: 'How is my capacity for joy growing?',
            practices: [
              'Try new activities',
              'Deepen hobbies',
              'Expand fun repertoire'
            ],
            metric: 3,
            notes: 'Want to learn guitar'
          }
        ]
      },
      {
        id: 'operational-recreation',
        name: 'Operational',
        description: 'Regular leisure and relaxation',
        dimensions: [
          {
            name: 'Being',
            focus: 'Relaxed presence',
            inquiry: 'How do I truly rest?',
            practices: [
              'Weekly sabbath',
              'Daily downtime',
              'Guilt-free leisure'
            ],
            metric: 3,
            notes: 'Struggle to relax'
          },
          {
            name: 'Doing',
            focus: 'Consistent recreation',
            inquiry: 'What do I do for fun regularly?',
            practices: [
              'Movie nights',
              'Reading for pleasure',
              'Nature walks'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Recreation infrastructure',
            inquiry: 'What supports regular fun?',
            practices: [
              'Streaming subscriptions',
              'Game collection',
              'Recreation budget'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Social fun',
            inquiry: 'How do I play with others?',
            practices: [
              'Regular friend hangouts',
              'Join sports leagues',
              'Social hobbies'
            ],
            metric: 2,
            notes: 'Need more social activities'
          },
          {
            name: 'Becoming',
            focus: 'Leisure habits',
            inquiry: 'How am I improving at rest?',
            practices: [
              'Schedule fun time',
              'Protect leisure',
              'Quality over quantity'
            ],
            metric: 3,
            notes: 'Getting better at scheduling breaks'
          }
        ]
      },
      {
        id: 'strategic-recreation',
        name: 'Strategic',
        description: 'Long-term adventure and lifestyle design',
        dimensions: [
          {
            name: 'Being',
            focus: 'Adventurous spirit',
            inquiry: 'What kind of life do I want to live?',
            practices: [
              'Define adventure values',
              'Embrace curiosity',
              'Stay open to experiences'
            ],
            metric: 4,
            notes: 'Strong adventure values'
          },
          {
            name: 'Doing',
            focus: 'Major adventures',
            inquiry: 'What experiences do I crave?',
            practices: [
              'Plan annual trips',
              'Bucket list experiences',
              'Learning adventures'
            ],
            metric: 3
          },
          {
            name: 'Having',
            focus: 'Adventure resources',
            inquiry: 'What enables big experiences?',
            practices: [
              'Travel fund',
              'Adventure gear',
              'Time freedom'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Adventure community',
            inquiry: 'Who joins me in exploration?',
            practices: [
              'Travel companions',
              'Adventure clubs',
              'Experience sharing'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Lifestyle evolution',
            inquiry: 'How is my life becoming more joyful?',
            practices: [
              'Design lifestyle for joy',
              'Balance work and play',
              'Prioritize experiences'
            ],
            metric: 3,
            notes: 'Working toward more work-life balance'
          }
        ]
      }
    ],
    acceptable: [
      'Regular downtime',
      'Some creative hobbies',
      'Occasional adventures'
    ],
    noLongerTolerated: [
      'All work, no play',
      'Guilt about fun',
      'Postponing joy'
    ]
  },

  // 8. Contribution & Service (Phoenix of Impact)
  {
    id: 'contribution-service',
    name: 'Contribution & Service',
    phoenixName: 'Phoenix of Impact',
    icon: '🌍',
    color: 'bg-teal-500',
    status: 'Needs Attention',
    score: 58,
    commitments: 2,
    subdomains: [
      {
        id: 'creative-contribution',
        name: 'Creative',
        description: 'Unique gifts and innovative service',
        dimensions: [
          {
            name: 'Being',
            focus: 'Service mindset',
            inquiry: 'What is my unique gift to give?',
            practices: [
              'Identify unique talents',
              'Cultivate generosity',
              'Practice compassion'
            ],
            metric: 4,
            notes: 'Clear on gifts to share'
          },
          {
            name: 'Doing',
            focus: 'Creative contribution',
            inquiry: 'How do I serve uniquely?',
            practices: [
              'Mentor others',
              'Create free resources',
              'Share knowledge'
            ],
            metric: 3,
            notes: 'Started mentoring program'
          },
          {
            name: 'Having',
            focus: 'Service resources',
            inquiry: 'What enables my contribution?',
            practices: [
              'Time to give',
              'Skills to share',
              'Platform to serve'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Service connections',
            inquiry: 'Who do I serve?',
            practices: [
              'Build mentee relationships',
              'Join service groups',
              'Community partnerships'
            ],
            metric: 2
          },
          {
            name: 'Becoming',
            focus: 'Impact growth',
            inquiry: 'How is my service expanding?',
            practices: [
              'Increase reach',
              'Deepen impact',
              'Develop service skills'
            ],
            metric: 3,
            notes: 'Want to scale mentoring'
          }
        ]
      },
      {
        id: 'operational-contribution',
        name: 'Operational',
        description: 'Consistent volunteering and giving',
        dimensions: [
          {
            name: 'Being',
            focus: 'Generous presence',
            inquiry: 'How do I show up to serve?',
            practices: [
              'Weekly volunteer time',
              'Daily small kindnesses',
              'Consistent giving'
            ],
            metric: 2,
            notes: 'Inconsistent volunteering'
          },
          {
            name: 'Doing',
            focus: 'Regular service',
            inquiry: 'What do I do to help?',
            practices: [
              'Monthly volunteering',
              'Regular donations',
              'Community service'
            ],
            metric: 2
          },
          {
            name: 'Having',
            focus: 'Giving systems',
            inquiry: 'What structures support service?',
            practices: [
              'Automated donations',
              'Volunteer schedule',
              'Service commitments'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Service community',
            inquiry: 'Who do I serve with?',
            practices: [
              'Volunteer teams',
              'Giving circles',
              'Service partnerships'
            ],
            metric: 2
          },
          {
            name: 'Becoming',
            focus: 'Service habits',
            inquiry: 'How is giving becoming natural?',
            practices: [
              'Build service routines',
              'Increase giving percentage',
              'Deepen commitment'
            ],
            metric: 2,
            notes: 'Need to establish routine'
          }
        ]
      },
      {
        id: 'strategic-contribution',
        name: 'Strategic',
        description: 'Legacy building and systemic impact',
        dimensions: [
          {
            name: 'Being',
            focus: 'Legacy mindset',
            inquiry: 'What impact will outlive me?',
            practices: [
              'Define legacy vision',
              'Think generationally',
              'Plan for lasting impact'
            ],
            metric: 3,
            notes: 'Thinking about legacy'
          },
          {
            name: 'Doing',
            focus: 'Strategic giving',
            inquiry: 'What creates systemic change?',
            practices: [
              'Major gift planning',
              'Foundation setup',
              'Impact investing'
            ],
            metric: 2
          },
          {
            name: 'Having',
            focus: 'Impact assets',
            inquiry: 'What resources create change?',
            practices: [
              'Charitable fund',
              'Impact investments',
              'Time endowment'
            ],
            metric: 2
          },
          {
            name: 'Relating',
            focus: 'Impact network',
            inquiry: 'Who amplifies my contribution?',
            practices: [
              'Philanthropic advisors',
              'Cause partnerships',
              'Movement building'
            ],
            metric: 2
          },
          {
            name: 'Becoming',
            focus: 'Impact trajectory',
            inquiry: 'How is my contribution growing?',
            practices: [
              'Track impact metrics',
              'Scale service',
              'Build legacy systems'
            ],
            metric: 2,
            notes: 'Just beginning legacy work'
          }
        ]
      }
    ],
    acceptable: [
      'Some mentoring',
      'Occasional donations',
      'Good intentions'
    ],
    noLongerTolerated: [
      'Pure self-focus',
      'Ignoring community needs',
      'Hoarding resources'
    ]
  },

  // 9. Spirituality & Meaning (Phoenix of Wisdom)
  {
    id: 'spirituality-meaning',
    name: 'Spirituality & Meaning',
    phoenixName: 'Phoenix of Wisdom',
    icon: '🕉️',
    color: 'bg-indigo-500',
    status: 'Thriving',
    score: 88,
    commitments: 5,
    subdomains: [
      {
        id: 'creative-spirituality',
        name: 'Creative',
        description: 'Spiritual exploration and practices',
        dimensions: [
          {
            name: 'Being',
            focus: 'Spiritual presence',
            inquiry: 'What is my relationship to the sacred?',
            practices: [
              'Daily meditation',
              'Contemplative prayer',
              'Mindful awareness'
            ],
            metric: 5,
            notes: 'Deep spiritual connection'
          },
          {
            name: 'Doing',
            focus: 'Spiritual practices',
            inquiry: 'How do I connect with the divine?',
            practices: [
              'Sacred rituals',
              'Nature connection',
              'Creative worship'
            ],
            metric: 5,
            notes: 'Rich practice life'
          },
          {
            name: 'Having',
            focus: 'Spiritual resources',
            inquiry: 'What supports my spiritual life?',
            practices: [
              'Sacred texts',
              'Meditation space',
              'Spiritual teachers'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Spiritual community',
            inquiry: 'Who walks this path with me?',
            practices: [
              'Sangha/community',
              'Spiritual friendships',
              'Teacher relationships'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Spiritual evolution',
            inquiry: 'How is my consciousness expanding?',
            practices: [
              'Study wisdom traditions',
              'Deepen practice',
              'Integrate insights'
            ],
            metric: 5,
            notes: 'Significant deepening'
          }
        ]
      },
      {
        id: 'operational-spirituality',
        name: 'Operational',
        description: 'Daily spiritual discipline and practice',
        dimensions: [
          {
            name: 'Being',
            focus: 'Present awareness',
            inquiry: 'How do I stay present?',
            practices: [
              'Morning meditation',
              'Mindful breathing',
              'Gratitude practice'
            ],
            metric: 5,
            notes: 'Consistent daily practice'
          },
          {
            name: 'Doing',
            focus: 'Daily devotion',
            inquiry: 'What are my daily practices?',
            practices: [
              '30 min sitting meditation',
              'Evening reflection',
              'Sacred reading'
            ],
            metric: 5
          },
          {
            name: 'Having',
            focus: 'Practice infrastructure',
            inquiry: 'What supports daily practice?',
            practices: [
              'Meditation cushion',
              'Prayer beads',
              'Sacred space'
            ],
            metric: 5
          },
          {
            name: 'Relating',
            focus: 'Spiritual accountability',
            inquiry: 'Who supports my practice?',
            practices: [
              'Practice partner',
              'Spiritual director',
              'Weekly group'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Practice deepening',
            inquiry: 'How is my practice evolving?',
            practices: [
              'Extend meditation time',
              'Add new practices',
              'Track insights'
            ],
            metric: 5,
            notes: 'Practice naturally deepening'
          }
        ]
      },
      {
        id: 'strategic-spirituality',
        name: 'Strategic',
        description: 'Life purpose and meaning-making',
        dimensions: [
          {
            name: 'Being',
            focus: 'Purpose alignment',
            inquiry: 'What is my deepest purpose?',
            practices: [
              'Purpose meditation',
              'Vision questing',
              'Life review'
            ],
            metric: 5,
            notes: 'Clear sense of purpose'
          },
          {
            name: 'Doing',
            focus: 'Purpose in action',
            inquiry: 'How do I live my purpose?',
            practices: [
              'Align work with purpose',
              'Service as practice',
              'Dharma expression'
            ],
            metric: 4
          },
          {
            name: 'Having',
            focus: 'Wisdom assets',
            inquiry: 'What wisdom am I gathering?',
            practices: [
              'Wisdom journal',
              'Teaching materials',
              'Life lessons library'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Wisdom transmission',
            inquiry: 'How do I pass on wisdom?',
            practices: [
              'Teach/mentor',
              'Write insights',
              'Wisdom circles'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Spiritual maturity',
            inquiry: 'What is my spiritual trajectory?',
            practices: [
              'Track consciousness shifts',
              'Study developmental stages',
              'Map awakening journey'
            ],
            metric: 5,
            notes: 'Clear spiritual development'
          }
        ]
      }
    ],
    acceptable: [
      'Daily meditation practice',
      'Strong spiritual community',
      'Clear sense of purpose'
    ],
    noLongerTolerated: [
      'Skipping practice',
      'Spiritual bypassing',
      'Disconnection from meaning'
    ]
  },

  // 10. Family & Heritage (Phoenix of Legacy)
  {
    id: 'family-heritage',
    name: 'Family & Heritage',
    phoenixName: 'Phoenix of Legacy',
    icon: '👨‍👩‍👧‍👦',
    color: 'bg-rose-500',
    status: 'Needs Attention',
    score: 70,
    commitments: 3,
    subdomains: [
      {
        id: 'creative-family',
        name: 'Creative',
        description: 'Family traditions and memories',
        dimensions: [
          {
            name: 'Being',
            focus: 'Family presence',
            inquiry: 'How do I show up for family?',
            practices: [
              'Present when together',
              'Unconditional love',
              'Patient presence'
            ],
            metric: 4,
            notes: 'Working on patience'
          },
          {
            name: 'Doing',
            focus: 'Creating memories',
            inquiry: 'What experiences bond us?',
            practices: [
              'Family adventures',
              'Create traditions',
              'Capture memories'
            ],
            metric: 3,
            notes: 'Need more family time'
          },
          {
            name: 'Having',
            focus: 'Family resources',
            inquiry: 'What supports family connection?',
            practices: [
              'Family photo albums',
              'Shared spaces',
              'Memory-making budget'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Family bonds',
            inquiry: 'How deep are our connections?',
            practices: [
              'One-on-one time',
              'Family meetings',
              'Deep conversations'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Family evolution',
            inquiry: 'How is our family growing?',
            practices: [
              'Adapt to life stages',
              'Evolve traditions',
              'Build resilience'
            ],
            metric: 4,
            notes: 'Navigating changes well'
          }
        ]
      },
      {
        id: 'operational-family',
        name: 'Operational',
        description: 'Daily family life and routines',
        dimensions: [
          {
            name: 'Being',
            focus: 'Family mindset',
            inquiry: 'What attitude serves family?',
            practices: [
              'Patience practice',
              'Family-first mindset',
              'Team orientation'
            ],
            metric: 4,
            notes: 'Good family mindset'
          },
          {
            name: 'Doing',
            focus: 'Daily family care',
            inquiry: 'What must I do for family daily?',
            practices: [
              'Family meals',
              'Bedtime routines',
              'Quality time'
            ],
            metric: 3
          },
          {
            name: 'Having',
            focus: 'Family systems',
            inquiry: 'What structures support us?',
            practices: [
              'Shared calendar',
              'Chore systems',
              'Family communication'
            ],
            metric: 4
          },
          {
            name: 'Relating',
            focus: 'Daily connection',
            inquiry: 'How do we stay connected?',
            practices: [
              'Morning check-ins',
              'Evening debriefs',
              'Affection rituals'
            ],
            metric: 4
          },
          {
            name: 'Becoming',
            focus: 'Family habits',
            inquiry: 'What patterns strengthen us?',
            practices: [
              'Build healthy habits',
              'Improve communication',
              'Reduce conflict'
            ],
            metric: 3,
            notes: 'Communication improving'
          }
        ]
      },
      {
        id: 'strategic-family',
        name: 'Strategic',
        description: 'Generational planning and legacy',
        dimensions: [
          {
            name: 'Being',
            focus: 'Legacy consciousness',
            inquiry: 'What do I want to pass on?',
            practices: [
              'Define family values',
              'Honor ancestors',
              'Build for future'
            ],
            metric: 4,
            notes: 'Clear family values'
          },
          {
            name: 'Doing',
            focus: 'Legacy building',
            inquiry: 'What creates lasting family bonds?',
            practices: [
              'Document family history',
              'Create heirlooms',
              'Build traditions'
            ],
            metric: 3
          },
          {
            name: 'Having',
            focus: 'Family assets',
            inquiry: 'What do I build for family?',
            practices: [
              'Financial legacy',
              'Property ownership',
              'Education funds'
            ],
            metric: 3
          },
          {
            name: 'Relating',
            focus: 'Extended family',
            inquiry: 'How do we stay connected across generations?',
            practices: [
              'Regular reunions',
              'Elder relationships',
              'Cousin connections'
            ],
            metric: 3
          },
          {
            name: 'Becoming',
            focus: 'Generational impact',
            inquiry: 'What ripples forward?',
            practices: [
              'Heal family patterns',
              'Pass on wisdom',
              'Build family wealth'
            ],
            metric: 4,
            notes: 'Conscious of generational healing'
          }
        ]
      }
    ],
    acceptable: [
      'Regular family time',
      'Good communication',
      'Strong values'
    ],
    noLongerTolerated: [
      'Taking family for granted',
      'Unresolved conflicts',
      'Neglecting connections'
    ]
  }
];
