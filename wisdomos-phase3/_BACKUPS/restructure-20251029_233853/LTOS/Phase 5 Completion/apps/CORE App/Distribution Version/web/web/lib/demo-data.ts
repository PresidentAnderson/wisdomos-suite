/**
 * Demo Data Setup for WisdomOS Multi-Tenant Showcase
 * Creates sample users, tenants, and data to demonstrate functionality
 */

import {
  User,
  Tenant,
  generateId,
  getDefaultPreferences,
  getAllPermissions,
  getDefaultTenantSettings,
  storeUserInLocalStorage,
  storeTenantInLocalStorage
} from './auth'
import { hashPassword } from './password-utils'

export async function setupDemoData() {
  // Only setup if demo data doesn't exist
  const existingDemo = localStorage.getItem('wisdomos_demo_setup')
  if (existingDemo) return

  try {
    // Create demo tenant
    const demoTenant: Tenant = {
      id: 'demo-tenant-001',
      name: 'WisdomOS Demo Workspace',
      slug: 'demo-workspace',
      ownerId: 'demo-user-001',
      plan: 'premium',
      settings: {
        ...getDefaultTenantSettings('WisdomOS Demo Workspace'),
        branding: {
          logo: '/phoenix-logo.svg',
          primaryColor: '#FFD700',
          name: 'WisdomOS Demo'
        },
        features: {
          journalSharing: true,
          crossTenantAnalytics: true,
          publicDashboards: true,
          exportData: true
        }
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date(),
      members: []
    }

    // Create demo user (owner)
    const demoUser: User = {
      id: 'demo-user-001',
      email: 'demo@wisdomos.com',
      name: 'Phoenix Demo User',
      tenantId: demoTenant.id,
      role: 'owner',
      createdAt: new Date('2025-01-01'),
      lastLoginAt: new Date(),
      preferences: {
        ...getDefaultPreferences(),
        theme: 'light',
        language: 'en'
      }
    }

    // Add demo user to tenant members
    demoTenant.members = [{
      userId: demoUser.id,
      tenantId: demoTenant.id,
      role: 'owner',
      permissions: getAllPermissions(),
      invitedAt: new Date('2025-01-01'),
      joinedAt: new Date('2025-01-01'),
      invitedBy: demoUser.id
    }]

    // Create additional demo users
    const collaboratorUser: User = {
      id: 'demo-user-002',
      email: 'collaborator@wisdomos.com',
      name: 'Alex Collaborator',
      tenantId: demoTenant.id,
      role: 'member',
      createdAt: new Date('2025-01-15'),
      preferences: getDefaultPreferences()
    }

    const viewerUser: User = {
      id: 'demo-user-003',
      email: 'viewer@wisdomos.com',
      name: 'Sam Viewer',
      tenantId: demoTenant.id,
      role: 'viewer',
      createdAt: new Date('2025-02-01'),
      preferences: getDefaultPreferences()
    }

    // Add additional members to tenant
    demoTenant.members.push(
      {
        userId: collaboratorUser.id,
        tenantId: demoTenant.id,
        role: 'member',
        permissions: [
          { resource: 'journal', actions: ['read', 'write'] },
          { resource: 'dashboard', actions: ['read'] },
          { resource: 'analytics', actions: ['read'] }
        ],
        invitedAt: new Date('2025-01-15'),
        joinedAt: new Date('2025-01-15'),
        invitedBy: demoUser.id
      },
      {
        userId: viewerUser.id,
        tenantId: demoTenant.id,
        role: 'viewer',
        permissions: [
          { resource: 'dashboard', actions: ['read'] }
        ],
        invitedAt: new Date('2025-02-01'),
        joinedAt: new Date('2025-02-01'),
        invitedBy: demoUser.id
      }
    )

    // Store demo data
    storeUserInLocalStorage(demoUser)
    storeUserInLocalStorage(collaboratorUser)
    storeUserInLocalStorage(viewerUser)
    storeTenantInLocalStorage(demoTenant)

    // Store demo passwords (properly hashed)
    const demoPassword = await hashPassword('password123')
    const collabPassword = await hashPassword('password123')
    const viewerPassword = await hashPassword('password123')

    localStorage.setItem('wisdomos_password_demo-user-001', demoPassword)
    localStorage.setItem('wisdomos_password_demo-user-002', collabPassword)
    localStorage.setItem('wisdomos_password_demo-user-003', viewerPassword)

    // Create sample journal entries
    const sampleJournalEntries = [
      {
        id: '1',
        lifeArea: 'Work & Purpose',
        content: 'Had a breakthrough moment today while working on the new project. Realized that my fear of imperfection was holding me back from making progress. Sometimes done is better than perfect.',
        aiReframe: 'This awareness of perfectionism is a gift. Consider how this pattern might be showing up in other areas of your life. What would it look like to embrace "good enough" as a stepping stone to greatness?',
        tags: ['breakthrough', 'perfectionism', 'work'],
        createdAt: new Date('2025-08-15T09:30:00'),
        sentiment: 0.8
      },
      {
        id: '2',
        lifeArea: 'Health & Recovery',
        content: 'Struggled with motivation to exercise today. Ended up just going for a 10-minute walk, but it felt good to move my body even a little.',
        aiReframe: 'Every step counts! Notice how your body responded to that 10-minute walk. How might you build on this small win tomorrow?',
        tags: ['exercise', 'motivation', 'small-wins'],
        createdAt: new Date('2025-08-14T18:45:00'),
        sentiment: 0.3
      },
      {
        id: '3',
        lifeArea: 'Intimacy & Love',
        content: 'Had a deep conversation with my partner about our future goals. We discovered we both want to travel more together. Planning a weekend getaway for next month.',
        aiReframe: 'Beautiful alignment! How does it feel to discover shared dreams? This planning energy could be channeled into other areas of growth together.',
        tags: ['partnership', 'goals', 'travel', 'alignment'],
        createdAt: new Date('2025-08-13T20:15:00'),
        sentiment: 0.9
      }
    ]

    localStorage.setItem('wisdomos_journal_entries_v2', JSON.stringify(sampleJournalEntries))

    // Create sample priority matrix items
    const samplePriorityItems = [
      {
        id: '1',
        title: 'Complete Phoenix Module Implementation',
        description: 'Finish building the multi-tenant architecture for WisdomOS',
        priority: 'P0' as const,
        lifeArea: 'Work & Purpose',
        resourcesRequired: 8,
        estimatedCompletion: '2025-08-20',
        status: 'in_progress' as const,
        createdAt: new Date('2025-08-10').toISOString()
      },
      {
        id: '2',
        title: 'Plan Weekend Getaway',
        description: 'Research and book a romantic weekend trip',
        priority: 'P1' as const,
        lifeArea: 'Intimacy & Love',
        resourcesRequired: 3,
        estimatedCompletion: '2025-08-25',
        status: 'pending' as const,
        createdAt: new Date('2025-08-13').toISOString()
      },
      {
        id: '3',
        title: 'Establish Daily Exercise Routine',
        description: 'Create a sustainable 20-minute daily movement practice',
        priority: 'P1' as const,
        lifeArea: 'Health & Recovery',
        resourcesRequired: 5,
        estimatedCompletion: '2025-09-01',
        status: 'pending' as const,
        createdAt: new Date('2025-08-14').toISOString()
      }
    ]

    localStorage.setItem('wisdomos_priority_matrix', JSON.stringify(samplePriorityItems))

    // Create sample autobiography data
    const sampleAutobiographyData = {
      25: {
        year: 25,
        pictureMemory: 'First day at my dream job - feeling nervous but excited',
        importantPeople: ['Sarah (mentor)', 'Mom & Dad', 'College friends'],
        lifeEvents: ['Started career', 'Moved to new city', 'Adopted rescue dog'],
        worldEvents: ['Social media boom', 'Economic recovery'],
        patterns: ['Seeking approval from authority figures', 'Excitement about new beginnings'],
        learnings: ['Independence is both scary and liberating', 'Building community takes time'],
        currentPerspective: 'That nervous energy was actually excitement in disguise. The foundations I built that year still serve me today.'
      },
      30: {
        year: 30,
        pictureMemory: 'Celebrating 30th birthday with chosen family - feeling grateful',
        importantPeople: ['Life partner', 'Close friend group', 'Therapist'],
        lifeEvents: ['Committed relationship', 'Therapy breakthrough', 'Career pivot'],
        worldEvents: ['Pandemic changes everything', 'Remote work revolution'],
        patterns: ['Learning to prioritize relationships', 'Investing in mental health'],
        learnings: ['Vulnerability is strength', 'It\'s okay to change direction'],
        currentPerspective: 'This was the year I learned that growth isn\'t linear. The pandemic forced me to reevaluate what really matters.'
      }
    }

    localStorage.setItem('wisdomos_autobiography', JSON.stringify(sampleAutobiographyData))

    // Create sample upset inquiry data
    const sampleUpsets = [
      {
        id: '1',
        date: '2025-08-10',
        lifeArea: 'Work & Purpose',
        trigger: 'Team member didn\'t follow through on commitment',
        emotionalResponse: 'Frustration, disappointment, feeling unsupported',
        physicalSensation: 'Chest tightness, jaw clenching',
        pattern: 'Others not keeping commitments',
        frequency: 'recurring' as const,
        intensity: 3,
        resolved: true,
        resolution: 'Had a direct conversation about expectations and communication',
        commitment: 'I commit to addressing issues immediately rather than letting them build up',
        relatedUpsets: []
      },
      {
        id: '2',
        date: '2025-08-12',
        lifeArea: 'Health & Recovery',
        trigger: 'Skipped workout for third day in a row',
        emotionalResponse: 'Guilt, self-criticism, disappointment',
        physicalSensation: 'Heavy feeling in stomach, low energy',
        pattern: 'Self-sabotage with healthy habits',
        frequency: 'chronic' as const,
        intensity: 2,
        resolved: false,
        relatedUpsets: []
      }
    ]

    localStorage.setItem('wisdomos_upsets', JSON.stringify(sampleUpsets))

    // Create sample contribution data
    const sampleContribution = {
      statement: 'I am a catalyst for transformation, helping others discover their inner wisdom and create meaningful change in their lives.',
      areas: {
        being: {
          contributions: [
            'Compassionate listener who creates safe spaces',
            'Authentic presence that encourages vulnerability',
            'Calm energy that grounds others in chaos'
          ],
          impact: 'People feel seen, heard, and valued in my presence'
        },
        doing: {
          contributions: [
            'Building tools that simplify complex personal development',
            'Mentoring others in their growth journey',
            'Creating systems that support sustainable change'
          ],
          impact: 'Practical solutions that make transformation accessible'
        },
        creating: {
          contributions: [
            'WisdomOS platform for personal transformation',
            'Content that bridges ancient wisdom and modern psychology',
            'Communities where people can grow together'
          ],
          impact: 'Innovative approaches to age-old human challenges'
        },
        transforming: {
          contributions: [
            'Helping people break through limiting patterns',
            'Facilitating breakthrough conversations',
            'Supporting others in major life transitions'
          ],
          impact: 'Lasting change that ripples through all life areas'
        }
      },
      commitments: [
        'I commit to being fully present in every interaction',
        'I commit to continuous learning and growth',
        'I commit to creating with integrity and purpose'
      ]
    }

    localStorage.setItem('wisdomos_contribution', JSON.stringify(sampleContribution))

    // Initialize feedback loop with sample data
    const sampleFeedbackState = {
      lifeAreas: [
        {
          id: 'area-1',
          name: 'Work & Purpose',
          color: 'green' as const,
          score: 3,
          recentEvents: [],
          patterns: [],
          lastUpdated: new Date(),
          trend: 'improving' as const
        },
        {
          id: 'area-2',
          name: 'Health & Recovery',
          color: 'yellow' as const,
          score: 0,
          recentEvents: [],
          patterns: [],
          lastUpdated: new Date(),
          trend: 'stable' as const
        },
        {
          id: 'area-3',
          name: 'Finance',
          color: 'yellow' as const,
          score: 1,
          recentEvents: [],
          patterns: [],
          lastUpdated: new Date(),
          trend: 'stable' as const
        },
        {
          id: 'area-4',
          name: 'Intimacy & Love',
          color: 'green' as const,
          score: 4,
          recentEvents: [],
          patterns: [],
          lastUpdated: new Date(),
          trend: 'improving' as const
        }
      ],
      overallHealth: 75,
      activePatterns: [],
      notifications: [
        {
          id: 'notif-1',
          type: 'success' as const,
          title: 'Great Progress!',
          message: 'Intimacy & Love is showing consistent improvement',
          actionRequired: false,
          timestamp: new Date(),
          read: false
        },
        {
          id: 'notif-2',
          type: 'info' as const,
          title: 'Pattern Detected',
          message: 'Exercise motivation seems to be a recurring theme',
          actionRequired: true,
          timestamp: new Date(),
          read: false
        }
      ],
      lastSync: new Date()
    }

    localStorage.setItem('wisdomos_dashboard_state', JSON.stringify(sampleFeedbackState))

    // Mark demo setup as complete
    localStorage.setItem('wisdomos_demo_setup', 'completed')
    localStorage.setItem('wisdomos_demo_setup_date', new Date().toISOString())

    console.log('✅ Demo data setup completed successfully')
    
  } catch (error) {
    console.error('Failed to setup demo data:', error)
  }
}

export async function resetDemoData() {
  // Clear all demo-related localStorage
  const keys = Object.keys(localStorage).filter(key => key.startsWith('wisdomos_'))
  keys.forEach(key => localStorage.removeItem(key))
  
  // Recreate demo data
  await setupDemoData()
  
  console.log('✅ Demo data has been reset')
}

export function isDemoDataSetup(): boolean {
  return localStorage.getItem('wisdomos_demo_setup') === 'completed'
}

export function getDemoCredentials() {
  return {
    email: 'demo@wisdomos.com',
    password: 'password123',
    tenantSlug: 'demo-workspace'
  }
}