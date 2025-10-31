#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LIFE_AREAS = [
  'Work & Purpose',
  'Health & Wellness',
  'Financial Abundance',
  'Relationships & Love',
  'Personal Growth & Wisdom',
  'Creativity & Expression',
  'Community & Contribution',
  'Environment & Spaces',
  'Material Comfort',
  'Adventure & Experiences',
  'Music Production', // New area!
  'Spiritual Alignment',
  'Time & Energy Management',
  'Legacy & Archives'
];

async function seedTrackerData() {
  console.log('🎨 Seeding Color-Coded Visual Tracker data...');

  try {
    // Get or create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@wisdomos.local' },
      update: {},
      create: {
        id: 'demo-user-tracker',
        email: 'demo@wisdomos.local',
        name: 'Demo User',
        password: 'demo123', // This should be hashed in production
        tenantId: 'demo-tenant',
        role: 'user'
      }
    });

    console.log('✅ Demo user ready:', demoUser.email);

    // Create life areas with tracker entries
    for (let i = 0; i < LIFE_AREAS.length; i++) {
      const areaName = LIFE_AREAS[i];
      
      // Create or get life area
      const lifeArea = await prisma.lifeArea.upsert({
        where: {
          userId_name: {
            userId: demoUser.id,
            name: areaName
          }
        },
        update: {},
        create: {
          id: `${demoUser.id}-area-${i}`,
          userId: demoUser.id,
          name: areaName,
          orderIndex: i + 1,
          phoenixName: `Phoenix of ${areaName.split(' ')[0]}`,
          status: i % 3 === 0 ? 'THRIVING' : i % 3 === 1 ? 'ATTENTION' : 'BREAKDOWN',
          score: Math.floor(Math.random() * 40) + 60
        }
      });

      console.log(`📍 Created life area: ${areaName}`);

      // Create tracker entry
      const tracker = await prisma.$executeRaw`
        INSERT INTO life_area_tracker (user_id, life_area_id, life_area_name, order_index)
        VALUES (${demoUser.id}, ${lifeArea.id}, ${areaName}, ${i + 1})
        ON CONFLICT (user_id, life_area_id) DO UPDATE
        SET updated_at = NOW()
        RETURNING id
      `;

      // Generate some random statuses for the current year
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      for (let month = 1; month <= currentMonth; month++) {
        // Music Production gets special treatment - mostly green!
        let status: 'green' | 'yellow' | 'red';
        
        if (areaName === 'Music Production') {
          // Music Production is thriving!
          const rand = Math.random();
          status = rand < 0.7 ? 'green' : rand < 0.9 ? 'yellow' : 'red';
        } else {
          // Other areas get random distribution
          const rand = Math.random();
          status = rand < 0.33 ? 'green' : rand < 0.66 ? 'yellow' : 'red';
        }

        await prisma.$executeRaw`
          INSERT INTO life_area_status (
            user_id, 
            tracker_id,
            year,
            month,
            status,
            note
          )
          SELECT 
            ${demoUser.id},
            id,
            ${currentYear},
            ${month},
            ${status}::tracker_status,
            ${areaName === 'Music Production' && status === 'green' ? '🎵 Great session today!' : null}
          FROM life_area_tracker
          WHERE user_id = ${demoUser.id} 
          AND life_area_name = ${areaName}
          ON CONFLICT (user_id, tracker_id, year, month) DO UPDATE
          SET status = EXCLUDED.status, updated_at = NOW()
        `;
      }

      console.log(`  📊 Added ${currentMonth} months of status data`);
    }

    // Add some sample contributions that will trigger tracker updates
    const contributions = [
      {
        title: 'Produced new electronic track',
        category: 'Doing' as const,
        lifeAreaName: 'Music Production',
        impactScore: 9
      },
      {
        title: 'Meditation practice',
        category: 'Being' as const,
        lifeAreaName: 'Personal Growth & Wisdom',
        impactScore: 7
      },
      {
        title: 'Completed client project',
        category: 'Having' as const,
        lifeAreaName: 'Financial Abundance',
        impactScore: 8
      },
      {
        title: 'Organized music studio',
        category: 'Doing' as const,
        lifeAreaName: 'Music Production',
        impactScore: 6
      }
    ];

    for (const contrib of contributions) {
      await prisma.contribution.create({
        data: {
          id: `contrib-${Date.now()}-${Math.random()}`,
          userId: demoUser.id,
          category: contrib.category,
          title: contrib.title,
          description: `${contrib.title} - auto-generated for tracker demo`,
          contributions: [contrib.title],
          impact: `High impact on ${contrib.lifeAreaName}`,
          commitment: 'Continue daily practice',
          lifeAreaName: contrib.lifeAreaName,
          impactScore: contrib.impactScore,
          tags: ['demo', 'tracker'],
          visibility: 'private'
        }
      });
      console.log(`  ✨ Created contribution: ${contrib.title}`);
    }

    console.log('\n🎉 Tracker seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`  - ${LIFE_AREAS.length} life areas created (including Music Production 🎵)`);
    console.log(`  - ${currentMonth} months of tracker data`);
    console.log(`  - ${contributions.length} sample contributions`);
    console.log('\n🚀 Visual tracker is ready to use!');

  } catch (error) {
    console.error('❌ Error seeding tracker data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedTrackerData().catch(console.error);