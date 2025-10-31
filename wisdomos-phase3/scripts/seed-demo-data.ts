#!/usr/bin/env tsx
/**
 * Dedicated Demo Data Seeding Script for WisdomOS
 * 
 * This script creates comprehensive demo data to showcase the contribution-fulfillment
 * mirror feature and all aspects of the WisdomOS platform.
 * 
 * Usage:
 *   npm run seed:demo
 *   DATABASE_SEED_DEMO=true tsx scripts/seed-demo-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DemoUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoenixName: string;
  currentStage: 'ASHES' | 'FIRE' | 'REBIRTH' | 'FLIGHT';
  cycleCount: number;
  profile: string;
}

async function seedAdvancedContributions(users: DemoUser[]) {
  console.log('🎯 Creating advanced contributions showcasing all categories...');

  const advancedContributions = [
    // More "Doing" contributions showing 3-area mirroring
    {
      userId: users[0].id, // Alex
      category: 'Doing',
      title: 'Product Management',
      description: 'Leading cross-functional teams to deliver user-centered products',
      contributions: [
        'Define product roadmaps based on user research and market analysis',
        'Facilitate sprint planning and retrospectives',
        'Coordinate between engineering, design, and business stakeholders',
        'Analyze product metrics and iterate on features'
      ],
      impact: 'Successfully launched 3 products serving 50k+ active users with 4.8+ star ratings',
      commitment: 'Advocating for user needs while balancing business objectives and technical constraints',
      tags: ['product', 'leadership', 'user-research', 'agile'],
      visibility: 'public'
    },
    
    // More "Being" contributions showing 2-area mirroring  
    {
      userId: users[1].id, // Sarah
      category: 'Being',
      title: 'Mindful Presence',
      description: 'Cultivating present-moment awareness in all interactions',
      contributions: [
        'Practice 20 minutes of meditation daily',
        'Bring full attention to conversations and meetings',
        'Notice and release judgment when it arises',
        'Respond rather than react in challenging situations'
      ],
      impact: 'Create calm, centered energy that helps others feel heard and understood',
      commitment: 'Continuously developing mindfulness practice and sharing benefits with others',
      tags: ['mindfulness', 'presence', 'meditation', 'awareness'],
      visibility: 'shared'
    },
    
    // "Transforming" contributions 
    {
      userId: users[2].id, // Marcus
      category: 'Transforming',
      title: 'Organizational Culture Change',
      description: 'Transforming workplace cultures to be more inclusive and psychologically safe',
      contributions: [
        'Design and facilitate unconscious bias workshops',
        'Implement restorative justice practices in conflict resolution',
        'Create employee resource groups for underrepresented communities',
        'Train managers in trauma-informed leadership practices'
      ],
      impact: 'Reduced employee turnover by 40% and increased engagement scores by 60%',
      commitment: 'Dismantling oppressive systems and creating workplaces where all people can thrive',
      tags: ['dei', 'culture', 'leadership', 'transformation', 'justice'],
      visibility: 'public'
    },

    // "Creating" contributions
    {
      userId: users[1].id, // Sarah
      category: 'Creating',
      title: 'Accessible Design System',
      description: 'Building a comprehensive design system prioritizing accessibility',
      contributions: [
        'Design 200+ accessible components with WCAG AA compliance',
        'Create design tokens for consistent theming across platforms',
        'Develop automated accessibility testing workflows',
        'Write comprehensive documentation with real-world examples'
      ],
      impact: 'Enable teams to build inclusive products faster while ensuring accessibility standards',
      commitment: 'Making digital experiences usable for people of all abilities and backgrounds',
      tags: ['accessibility', 'design-system', 'documentation', 'inclusion'],
      visibility: 'public'
    },

    // "Having" contributions showing resource sharing
    {
      userId: users[2].id, // Marcus
      category: 'Having',
      title: 'Community Healing Resources',
      description: 'Sharing resources and knowledge for community healing and resilience',
      contributions: [
        'Maintain a library of 500+ trauma-informed resources',
        'Provide scholarships for healing workshops to low-income participants',
        'Share facilitation frameworks and tools with other healers',
        'Offer pro bono coaching to social justice activists'
      ],
      impact: 'Supported 200+ individuals in their healing journeys and trained 50+ facilitators',
      commitment: 'Ensuring healing resources are accessible regardless of financial circumstances',
      tags: ['resources', 'healing', 'community', 'accessibility', 'training'],
      visibility: 'shared'
    },

    // Additional specialized contributions
    {
      userId: users[0].id, // Alex
      category: 'Creating',
      title: 'Developer Education Platform',
      description: 'Creating an online platform to democratize coding education',
      contributions: [
        'Build interactive coding tutorials with real-time feedback',
        'Create project-based learning paths for different skill levels',
        'Develop AI-powered code review and mentoring system',
        'Design gamification features to increase engagement'
      ],
      impact: 'Helped 10,000+ aspiring developers transition into tech careers',
      commitment: 'Breaking down barriers to tech education and creating pathways for underrepresented groups',
      tags: ['education', 'technology', 'accessibility', 'ai', 'gamification'],
      visibility: 'public'
    },

    {
      userId: users[1].id, // Sarah
      category: 'Transforming',
      title: 'Art Therapy Integration',
      description: 'Integrating art therapy into digital wellness platforms',
      contributions: [
        'Design therapeutic art exercises for anxiety and depression',
        'Create digital tools for art-based emotional processing',
        'Train therapists in digital art therapy techniques',
        'Research the effectiveness of virtual art therapy sessions'
      ],
      impact: 'Made art therapy accessible to 5,000+ people who couldn\'t access in-person services',
      commitment: 'Bridging the gap between technology and healing through creative expression',
      tags: ['art-therapy', 'mental-health', 'technology', 'healing', 'research'],
      visibility: 'shared'
    },

    {
      userId: users[2].id, // Marcus
      category: 'Being',
      title: 'Elder Wisdom Keeper',
      description: 'Honoring and sharing wisdom from elders and ancestors',
      contributions: [
        'Listen deeply to stories and wisdom from community elders',
        'Practice ancestral healing and connection rituals',
        'Share elder wisdom in culturally appropriate ways',
        'Bridge generational gaps through storytelling and dialogue'
      ],
      impact: 'Preserved 100+ elder stories and facilitated 50+ intergenerational healing circles',
      commitment: 'Honoring the wisdom of those who came before while creating bridges to the future',
      tags: ['elders', 'wisdom', 'storytelling', 'culture', 'healing'],
      visibility: 'shared'
    }
  ];

  let createdCount = 0;
  for (const contrib of advancedContributions) {
    const existing = await prisma.contribution.findFirst({
      where: {
        userId: contrib.userId,
        title: contrib.title
      }
    });

    if (!existing) {
      await prisma.contribution.create({ data: contrib });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} advanced contributions`);
  return createdCount;
}

async function seedAuditLogEntries(users: DemoUser[]) {
  console.log('📋 Creating realistic audit log entries...');

  const auditEntries = [
    // Contribution creation events
    {
      userId: users[0].id,
      eventType: 'contribution_created',
      entityType: 'contribution',
      entityId: null, // Would be filled with actual contribution ID in real scenario
      payload: {
        title: 'Full-Stack Development',
        category: 'Doing',
        visibility: 'public',
        timestamp: new Date(Date.now() - 86400000 * 7), // 7 days ago
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        ip_address: '192.168.1.100'
      }
    },
    {
      userId: users[1].id,
      eventType: 'contribution_updated',
      entityType: 'contribution',
      entityId: null,
      payload: {
        title: 'Digital Art & NFTs',
        changes: {
          old_impact: 'Create meaningful digital art',
          new_impact: 'Bridge the gap between technology and human expression while making art accessible'
        },
        timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        ip_address: '192.168.1.101'
      }
    },
    {
      userId: users[2].id,
      eventType: 'contribution_mirrored',
      entityType: 'contribution',
      entityId: null,
      payload: {
        title: 'Community Healing Facilitator',
        mirrored_to: ['work-purpose', 'creativity-expression', 'community-contribution'],
        mirror_count: 3,
        timestamp: new Date(Date.now() - 86400000 * 5), // 5 days ago
      }
    },
    
    // Phoenix cycle events
    {
      userId: users[0].id,
      eventType: 'phoenix_stage_transition',
      entityType: 'phoenix_cycle',
      entityId: null,
      payload: {
        from_stage: 'ASHES',
        to_stage: 'FIRE',
        cycle_number: 2,
        transition_trigger: 'Completed breakthrough reflection exercise',
        timestamp: new Date(Date.now() - 86400000 * 14), // 2 weeks ago
      }
    },
    {
      userId: users[1].id,
      eventType: 'journal_entry_created',
      entityType: 'journal_entry',
      entityId: null,
      payload: {
        title: 'Art as Healing',
        type: 'REFLECTION',
        mood: 9,
        energy: 6,
        word_count: 247,
        timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
      }
    },
    {
      userId: users[2].id,
      eventType: 'fulfillment_priority_changed',
      entityType: 'fulfillment_entry',
      entityId: null,
      payload: {
        life_area: 'community-contribution',
        old_priority: 3,
        new_priority: 5,
        reason: 'User manually increased priority',
        timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
      }
    },

    // System events
    {
      userId: null,
      eventType: 'system_maintenance',
      entityType: 'system',
      entityId: null,
      payload: {
        maintenance_type: 'database_optimization',
        duration_minutes: 15,
        affected_tables: ['contributions', 'fulfillment_entries'],
        timestamp: new Date(Date.now() - 86400000 * 10), // 10 days ago
      }
    },
    {
      userId: users[1].id,
      eventType: 'data_export_requested',
      entityType: 'user_data',
      entityId: null,
      payload: {
        export_type: 'complete_profile',
        file_format: 'json',
        file_size_mb: 2.3,
        timestamp: new Date(Date.now() - 86400000 * 6), // 6 days ago
      }
    }
  ];

  let createdCount = 0;
  for (const entry of auditEntries) {
    await prisma.auditLog.create({ data: entry });
    createdCount++;
  }

  console.log(`✅ Created ${createdCount} audit log entries`);
  return createdCount;
}

async function seedFulfillmentDemonstrations(users: DemoUser[]) {
  console.log('🎯 Creating manual fulfillment entries to demonstrate the ecosystem...');

  // Get life areas
  const lifeAreas = await prisma.lifeAreaCanonical.findMany();
  const workArea = lifeAreas.find(area => area.slug === 'work-purpose');
  const healthArea = lifeAreas.find(area => area.slug === 'health-recovery');
  const educationArea = lifeAreas.find(area => area.slug === 'education-growth');
  const financeArea = lifeAreas.find(area => area.slug === 'finance');

  if (!workArea || !healthArea || !educationArea || !financeArea) {
    console.log('⚠️ Required life areas not found');
    return 0;
  }

  const manualFulfillmentEntries = [
    // Manual entries showing different source types
    {
      userId: users[0].id, // Alex
      lifeAreaId: healthArea.id,
      sourceType: 'manual',
      sourceId: null,
      title: 'Daily Exercise Routine',
      description: 'Maintaining consistent physical fitness to support demanding work schedule',
      meta: {
        routine: ['30min morning run', 'Strength training 3x/week', 'Weekend hiking'],
        goal: 'Maintain energy and focus for technical leadership',
        tracking: 'Apple Watch and fitness app',
        source: 'manual_entry'
      },
      status: 'active',
      priority: 4 // High priority because health supports work performance
    },
    {
      userId: users[1].id, // Sarah
      lifeAreaId: educationArea.id,
      sourceType: 'manual',
      sourceId: null,
      title: 'UX Research Certification',
      description: 'Advancing skills in user research methodologies and accessibility design',
      meta: {
        program: 'Nielsen Norman Group UX Certification',
        progress: '60%',
        skills: ['User interviews', 'Usability testing', 'Accessibility audits'],
        timeline: '3 months remaining',
        source: 'manual_entry'
      },
      status: 'active',
      priority: 4 // High priority for career development
    },
    {
      userId: users[2].id, // Marcus
      lifeAreaId: financeArea.id,
      sourceType: 'manual',
      sourceId: null,
      title: 'Sustainable Coaching Business',
      description: 'Building a financially sustainable practice while maintaining accessibility',
      meta: {
        model: 'Sliding scale with pro bono slots',
        goal: '$5000/month with 30% community service',
        current_revenue: '$3200/month',
        community_impact: '15 pro bono clients this quarter',
        source: 'manual_entry'
      },
      status: 'active',
      priority: 3 // Balanced approach to finance
    },

    // Assessment-sourced entries
    {
      userId: users[0].id, // Alex
      lifeAreaId: workArea.id,
      sourceType: 'assessment',
      sourceId: null,
      title: 'Leadership Skills Development',
      description: 'Developing emotional intelligence and inclusive leadership practices',
      meta: {
        assessment_type: 'EQ Leadership Assessment',
        score: 7.2,
        growth_areas: ['Active listening', 'Difficult conversations', 'Team motivation'],
        action_plan: 'Monthly 360 feedback sessions and leadership coaching',
        source: 'assessment_integration'
      },
      status: 'active',
      priority: 5 // Critical for role transition
    }
  ];

  let createdCount = 0;
  for (const entry of manualFulfillmentEntries) {
    const existing = await prisma.fulfillmentEntry.findFirst({
      where: {
        userId: entry.userId,
        title: entry.title,
        sourceType: entry.sourceType
      }
    });

    if (!existing) {
      await prisma.fulfillmentEntry.create({ data: entry });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} manual fulfillment entries`);
  return createdCount;
}

async function seedCompletePhoenixJourneys(users: DemoUser[]) {
  console.log('🔥 Creating complete Phoenix journey examples...');

  // Create past cycles for Marcus (most experienced user)
  const pastCycles = [
    {
      userId: users[2].id,
      cycleNumber: 3,
      stage: 'FLIGHT' as const,
      startedAt: new Date(Date.now() - 86400000 * 365 * 2), // 2 years ago
      completedAt: new Date(Date.now() - 86400000 * 365 * 1.5), // 1.5 years ago
      ashesReflection: 'Letting go of the need to fix everyone and save the world single-handedly',
      fireBreakthrough: 'Realized that my own healing is the greatest gift I can give to others',
      rebirthVision: 'Build sustainable practices that support both personal and collective healing',
      flightLegacy: 'Established 3 community healing circles that continue to thrive independently',
      completionScore: 100
    },
    {
      userId: users[2].id,
      cycleNumber: 4,
      stage: 'FLIGHT' as const,
      startedAt: new Date(Date.now() - 86400000 * 365 * 1.5), // 1.5 years ago
      completedAt: new Date(Date.now() - 86400000 * 365), // 1 year ago
      ashesReflection: 'Releasing the burden of carrying others\' trauma as my own',
      fireBreakthrough: 'Discovered the power of teaching others to facilitate their own healing',
      rebirthVision: 'Create training programs that multiply healing capacity in communities',
      flightLegacy: 'Trained 25 new facilitators who are now leading their own healing groups',
      completionScore: 100
    }
  ];

  let cycleCount = 0;
  for (const cycle of pastCycles) {
    const existing = await prisma.phoenixCycle.findFirst({
      where: {
        userId: cycle.userId,
        cycleNumber: cycle.cycleNumber
      }
    });

    if (!existing) {
      await prisma.phoenixCycle.create({ data: cycle });
      cycleCount++;
    }
  }

  // Create achievement records
  const achievements = [
    {
      userId: users[0].id,
      type: 'FIRST_JOURNAL' as const,
      title: 'First Steps',
      description: 'Created your first journal entry',
      icon: '📝',
      points: 10,
      condition: 'Posted first reflection about code review mentoring'
    },
    {
      userId: users[0].id,
      type: 'CYCLE_COMPLETE' as const,
      title: 'Phoenix Rising',
      description: 'Completed your first full phoenix cycle',
      icon: '🔥',
      points: 100,
      condition: 'Completed first leadership development cycle'
    },
    {
      userId: users[1].id,
      type: 'BREAKTHROUGH' as const,
      title: 'Creative Breakthrough',
      description: 'Documented a major creative breakthrough',
      icon: '💡',
      points: 50,
      condition: 'Art as healing realization journal entry'
    },
    {
      userId: users[2].id,
      type: 'PHOENIX_RISEN' as const,
      title: 'Master Phoenix',
      description: 'Completed 5 full phoenix cycles',
      icon: '👑',
      points: 500,
      condition: 'Reached mastery level with 5 completed transformation cycles'
    },
    {
      userId: users[2].id,
      type: 'GRATITUDE_MASTER' as const,
      title: 'Gratitude Master',
      description: 'Created 100 gratitude entries',
      icon: '🙏',
      points: 200,
      condition: 'Consistent daily gratitude practice over 6 months'
    }
  ];

  let achievementCount = 0;
  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: {
        userId: achievement.userId,
        type: achievement.type
      }
    });

    if (!existing) {
      await prisma.achievement.create({ data: achievement });
      achievementCount++;
    }
  }

  console.log(`✅ Created ${cycleCount} past cycles and ${achievementCount} achievements`);
  return cycleCount + achievementCount;
}

async function main() {
  console.log('🚀 Starting comprehensive demo data seeding...');

  try {
    // Get existing users (created by main seed script)
    const users = await prisma.user.findMany({
      where: {
        email: {
          endsWith: '@wisdomos.com'
        }
      }
    });

    if (users.length === 0) {
      console.log('⚠️ No demo users found. Please run the main seed script first with DATABASE_SEED_DEMO=true');
      return;
    }

    console.log(`📊 Found ${users.length} demo users to enhance`);

    // Create advanced contributions
    await seedAdvancedContributions(users as DemoUser[]);

    // Create audit log entries
    await seedAuditLogEntries(users as DemoUser[]);

    // Create manual fulfillment entries
    await seedFulfillmentDemonstrations(users as DemoUser[]);

    // Create complete Phoenix journeys
    await seedCompletePhoenixJourneys(users as DemoUser[]);

    console.log('🎉 Advanced demo data seeding completed successfully!');
    console.log('\n📈 Demo Data Summary:');
    console.log('   • 3 realistic demo users with different profiles');
    console.log('   • 15+ contributions across all 5 categories');
    console.log('   • Automatic mirroring to 3 life areas for "Doing" contributions');
    console.log('   • Automatic mirroring to 2 life areas for "Being" contributions');
    console.log('   • Priority system demonstration (Work & Purpose = 4, others = 3)');
    console.log('   • Multiple visibility levels (private, shared, public)');
    console.log('   • Complete Phoenix cycle journeys');
    console.log('   • Achievement system examples');
    console.log('   • Audit log tracking');
    console.log('   • Manual fulfillment entries');
    console.log('\n🔍 Use these credentials to explore:');
    console.log('   • alex.developer@wisdomos.com (Tech Leader)');
    console.log('   • sarah.creative@wisdomos.com (UX Designer/Artist)');
    console.log('   • marcus.coach@wisdomos.com (Life Coach/Healer)');

  } catch (error) {
    console.error('❌ Demo data seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as seedDemoData };