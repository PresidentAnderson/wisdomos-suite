import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoData(prisma: PrismaClient, lifeAreas: any[]) {
  console.log('🚀 Creating comprehensive demo data...');

  // Create 3 demo users with different profiles
  const demoUsers = [
    {
      email: 'alex.developer@wisdomos.com',
      username: 'alex_dev',
      firstName: 'Alex',
      lastName: 'Rivera',
      phoenixName: 'Phoenix of Innovation',
      currentStage: 'FIRE' as const,
      cycleCount: 2,
      profile: 'Senior Software Engineer transitioning to Tech Lead'
    },
    {
      email: 'sarah.creative@wisdomos.com',
      username: 'sarah_artist',
      firstName: 'Sarah',
      lastName: 'Chen',
      phoenixName: 'Phoenix of Expression',
      currentStage: 'REBIRTH' as const,
      cycleCount: 1,
      profile: 'UX Designer and Digital Artist'
    },
    {
      email: 'marcus.coach@wisdomos.com',
      username: 'marcus_guide',
      firstName: 'Marcus',
      lastName: 'Thompson',
      phoenixName: 'Phoenix of Wisdom',
      currentStage: 'FLIGHT' as const,
      cycleCount: 5,
      profile: 'Life Coach and Community Builder'
    }
  ];

  const createdUsers = [];
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoenixName: userData.phoenixName,
        currentStage: userData.currentStage,
        cycleCount: userData.cycleCount,
      },
    });
    createdUsers.push({ ...user, profile: userData.profile });
  }

  console.log(`✅ Created ${createdUsers.length} demo users`);

  // Create diverse contributions across all categories
  const contributions = [
    // Alex (Developer) - Doing contributions that mirror to 3 areas
    {
      userId: createdUsers[0].id,
      category: 'Doing',
      title: 'Full-Stack Development',
      description: 'Building end-to-end web applications with modern technologies',
      contributions: [
        'Architect scalable React and Node.js applications',
        'Implement CI/CD pipelines for automated deployment',
        'Mentor junior developers on coding best practices',
        'Lead technical discussions and architecture decisions'
      ],
      impact: 'Deliver high-quality software that serves thousands of users daily while building team capabilities',
      commitment: 'Continuously learning new technologies and sharing knowledge through tech talks and mentoring',
      tags: ['technology', 'mentoring', 'leadership', 'community'],
      visibility: 'public'
    },
    {
      userId: createdUsers[0].id,
      category: 'Creating',
      title: 'Open Source Projects',
      description: 'Contributing to and maintaining open source software projects',
      contributions: [
        'Maintain 3 popular npm packages with 10k+ downloads',
        'Contribute bug fixes and features to major frameworks',
        'Write comprehensive documentation and tutorials',
        'Organize virtual meetups for developer community'
      ],
      impact: 'Enable other developers worldwide to build better applications faster',
      commitment: 'Dedicating 5 hours per week to open source contributions and community building',
      tags: ['opensource', 'community', 'documentation', 'sharing'],
      visibility: 'public'
    },
    
    // Sarah (Designer) - Being contributions that mirror to 2 areas
    {
      userId: createdUsers[1].id,
      category: 'Being',
      title: 'Empathetic Designer',
      description: 'Cultivating deep empathy and user-centered thinking in design work',
      contributions: [
        'Practice active listening in user research sessions',
        'Approach design challenges with curiosity and openness',
        'Maintain beginner\'s mind when learning new design tools',
        'Foster inclusive and accessible design practices'
      ],
      impact: 'Create digital experiences that truly serve user needs and promote inclusivity',
      commitment: 'Daily meditation and reflection on user feedback to deepen empathy',
      tags: ['empathy', 'mindfulness', 'inclusivity', 'growth'],
      visibility: 'shared'
    },
    {
      userId: createdUsers[1].id,
      category: 'Creating',
      title: 'Digital Art & NFTs',
      description: 'Creating meaningful digital art that explores human connection',
      contributions: [
        'Design and mint 50 NFTs exploring themes of belonging',
        'Create interactive web experiences using p5.js',
        'Collaborate with musicians on audio-visual performances',
        'Teach digital art workshops to underserved communities'
      ],
      impact: 'Bridge the gap between technology and human expression while making art accessible',
      commitment: 'Creating one meaningful piece per week and teaching monthly workshops',
      tags: ['art', 'nft', 'community', 'education', 'creativity'],
      visibility: 'public'
    },

    // Marcus (Coach) - Transforming contributions
    {
      userId: createdUsers[2].id,
      category: 'Transforming',
      title: 'Community Healing Facilitator',
      description: 'Facilitating healing circles and transformational workshops in the community',
      contributions: [
        'Lead weekly men\'s circle for emotional wellness',
        'Facilitate grief recovery workshops for loss survivors',
        'Train other facilitators in trauma-informed practices',
        'Create safe spaces for vulnerable conversations'
      ],
      impact: 'Help individuals and communities process trauma and build resilience together',
      commitment: 'Showing up authentically and holding space for others\' healing journeys',
      tags: ['healing', 'community', 'trauma', 'facilitation', 'growth'],
      visibility: 'shared'
    },
    {
      userId: createdUsers[2].id,
      category: 'Being',
      title: 'Wisdom Keeper',
      description: 'Embodying and sharing wisdom gained through life experiences',
      contributions: [
        'Practice daily meditation and contemplation',
        'Share life lessons through storytelling and mentoring',
        'Hold space for others\' growth and transformation',
        'Model authenticity and vulnerability in relationships'
      ],
      impact: 'Inspire others to embrace their own wisdom and live more authentically',
      commitment: 'Committed to lifelong learning and service to others\' growth',
      tags: ['wisdom', 'authenticity', 'mentoring', 'spirituality'],
      visibility: 'public'
    },

    // Additional Having contributions
    {
      userId: createdUsers[0].id,
      category: 'Having',
      title: 'Technical Resources & Tools',
      description: 'Curating and sharing valuable development resources',
      contributions: [
        'Maintain a curated list of 200+ development tools',
        'Share access to premium courses with the community',
        'Provide free consulting to nonprofit organizations',
        'Host free coding workshops and bootcamps'
      ],
      impact: 'Lower barriers to entry for aspiring developers and support nonprofit missions',
      commitment: 'Monthly workshops and quarterly nonprofit consulting projects',
      tags: ['resources', 'sharing', 'nonprofit', 'education'],
      visibility: 'public'
    }
  ];

  const createdContributions = [];
  for (const contribData of contributions) {
    // Check if contribution already exists
    const existing = await prisma.contribution.findFirst({
      where: {
        userId: contribData.userId,
        title: contribData.title
      }
    });

    if (!existing) {
      const contribution = await prisma.contribution.create({
        data: contribData,
      });
      createdContributions.push(contribution);
    }
  }

  console.log(`✅ Created ${createdContributions.length} demo contributions`);

  // Create sample Phoenix cycles
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    
    // Check if cycle already exists
    const existingCycle = await prisma.phoenixCycle.findFirst({
      where: {
        userId: user.id,
        cycleNumber: user.cycleCount
      }
    });

    if (!existingCycle) {
      await prisma.phoenixCycle.create({
        data: {
          userId: user.id,
          cycleNumber: user.cycleCount,
          stage: user.currentStage,
          ashesReflection: i === 0 ? 'Ready to let go of imposter syndrome and step into leadership' 
                          : i === 1 ? 'Releasing perfectionism to embrace authentic creative expression'
                          : 'Moving beyond personal healing to serve the collective',
          fireBreakthrough: i === 0 ? 'Realized that teaching others strengthens my own understanding'
                           : i === 1 ? 'Discovered that vulnerability in art creates deeper connection'
                           : 'Understanding that my wounds have become my greatest gifts',
          rebirthVision: i === 0 ? 'Lead with confidence while maintaining humility and continuous learning'
                         : i === 1 ? 'Create art that heals and connects people across digital divides'
                         : 'Build communities where healing and wisdom are shared freely',
          flightLegacy: i === 2 ? 'A network of thriving communities practicing authentic connection' : null,
          completionScore: user.currentStage === 'FLIGHT' ? 100 : Math.random() * 80 + 20,
        },
      });
    }
  }

  console.log(`✅ Created Phoenix cycles for ${createdUsers.length} users`);

  // Create sample journal entries
  const journalEntries = [
    {
      userId: createdUsers[0].id,
      title: 'Breakthrough in Code Review',
      content: 'Today I had a moment of clarity during a code review. Instead of just pointing out issues, I took time to explain the "why" behind better practices. Saw the junior dev\'s eyes light up with understanding. This is what mentoring really means.',
      mood: 8,
      energy: 7,
      stage: 'FIRE' as const,
      type: 'BREAKTHROUGH' as const,
      tags: ['mentoring', 'growth', 'leadership'],
      isPrivate: false
    },
    {
      userId: createdUsers[1].id,
      title: 'Art as Healing',
      content: 'Created a piece today about finding home within yourself. The process was deeply emotional - using colors and shapes to express the feeling of belonging. Realized that my art isn\'t just self-expression, it\'s a way to help others feel less alone.',
      mood: 9,
      energy: 6,
      stage: 'REBIRTH' as const,
      type: 'REFLECTION' as const,
      tags: ['art', 'healing', 'belonging'],
      isPrivate: false
    },
    {
      userId: createdUsers[2].id,
      title: 'Grateful for the Circle',
      content: 'The men\'s circle tonight reminded me why this work matters. Three different men, different ages and backgrounds, all finding the courage to share their struggles. When we create safe space, magic happens. Grateful to witness and hold space for transformation.',
      mood: 10,
      energy: 8,
      stage: 'FLIGHT' as const,
      type: 'GRATITUDE' as const,
      tags: ['community', 'gratitude', 'service'],
      isPrivate: false
    }
  ];

  for (const entryData of journalEntries) {
    // Check if entry already exists
    const existingEntry = await prisma.journalEntry.findFirst({
      where: {
        userId: entryData.userId,
        title: entryData.title
      }
    });

    if (!existingEntry) {
      await prisma.journalEntry.create({
        data: entryData,
      });
    }
  }

  console.log(`✅ Created ${journalEntries.length} demo journal entries`);

  // Create mirror rules for customization
  const mirrorRules = [
    {
      userId: createdUsers[0].id,
      sourceType: 'Doing',
      targetAreas: ['work-purpose', 'creativity-expression', 'community-contribution'],
      isActive: true
    },
    {
      userId: createdUsers[1].id,
      sourceType: 'Being',
      targetAreas: ['creativity-expression', 'spirituality-practice'],
      isActive: true
    },
    {
      userId: createdUsers[2].id,
      sourceType: 'Transforming',
      targetAreas: ['community-contribution', 'spirituality-practice', 'work-purpose'],
      isActive: true
    }
  ];

  for (const ruleData of mirrorRules) {
    await prisma.mirrorRule.upsert({
      where: {
        userId_sourceType: {
          userId: ruleData.userId,
          sourceType: ruleData.sourceType
        }
      },
      update: ruleData,
      create: ruleData,
    });
  }

  console.log(`✅ Created ${mirrorRules.length} demo mirror rules`);

  console.log('🎉 Comprehensive demo data creation completed!');
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed canonical life areas
  const canonicalAreas = [
    {
      slug: 'work-purpose',
      name: 'Work & Purpose',
      description: 'Your professional life and sense of meaning',
      icon: '💼',
      color: '#3B82F6',
    },
    {
      slug: 'creativity-expression',
      name: 'Creativity & Expression',
      description: 'Your creative outlets and self-expression',
      icon: '🎨',
      color: '#8B5CF6',
    },
    {
      slug: 'health-recovery',
      name: 'Health & Recovery',
      description: 'Physical and mental wellbeing',
      icon: '🏃',
      color: '#10B981',
    },
    {
      slug: 'finance',
      name: 'Finance',
      description: 'Financial health and resource management',
      icon: '💰',
      color: '#F59E0B',
    },
    {
      slug: 'intimacy',
      name: 'Intimacy',
      description: 'Close personal relationships and connection',
      icon: '❤️',
      color: '#EF4444',
    },
    {
      slug: 'friendship',
      name: 'Friendship',
      description: 'Social connections and community',
      icon: '🤝',
      color: '#06B6D4',
    },
    {
      slug: 'family',
      name: 'Family',
      description: 'Family relationships and responsibilities',
      icon: '👨‍👩‍👧‍👦',
      color: '#EC4899',
    },
    {
      slug: 'spirituality-practice',
      name: 'Spirituality & Practice',
      description: 'Spiritual growth and practices',
      icon: '🧘',
      color: '#9333EA',
    },
    {
      slug: 'education-growth',
      name: 'Education & Growth',
      description: 'Learning and personal development',
      icon: '📚',
      color: '#6366F1',
    },
    {
      slug: 'adventure-travel',
      name: 'Adventure & Travel',
      description: 'Exploration and new experiences',
      icon: '✈️',
      color: '#0EA5E9',
    },
    {
      slug: 'home-environment',
      name: 'Home & Environment',
      description: 'Living space and surroundings',
      icon: '🏡',
      color: '#84CC16',
    },
    {
      slug: 'community-contribution',
      name: 'Community & Contribution',
      description: 'Service and community involvement',
      icon: '🌍',
      color: '#14B8A6',
    },
    {
      slug: 'fun-recreation',
      name: 'Fun & Recreation',
      description: 'Leisure and enjoyment',
      icon: '🎮',
      color: '#F97316',
    },
  ];

  // Upsert canonical life areas
  const lifeAreas = await Promise.all(
    canonicalAreas.map((area) =>
      prisma.lifeAreaCanonical.upsert({
        where: { slug: area.slug },
        update: {
          name: area.name,
          description: area.description,
          icon: area.icon,
          color: area.color,
        },
        create: area,
      })
    )
  );

  console.log(`✅ Created/updated ${lifeAreas.length} canonical life areas`);

  // Create comprehensive demo data if DATABASE_SEED_DEMO=true
  if (process.env.DATABASE_SEED_DEMO === 'true') {
    await seedDemoData(prisma, lifeAreas);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });