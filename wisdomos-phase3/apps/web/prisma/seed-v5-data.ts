import { PrismaClient } from '@prisma/client';
import { SAMPLE_DATA } from '../data/fulfillment-v5-sample';

const prisma = new PrismaClient();

/**
 * Seed the database with v5 sample data
 *
 * This script:
 * 1. Creates or finds a demo tenant
 * 2. Creates or finds a demo user within that tenant
 * 3. Maps v5 sample data (LifeArea → Subdomain → Dimension) to database records
 * 4. Creates LifeArea records with associated metadata
 * 5. Creates Vault items for storing dimension data
 * 6. Includes proper error handling and transaction support
 */

async function seedV5Data() {
  console.log('Starting seed-v5-data script...');

  try {
    // Create or find demo tenant
    const demoTenant = await prisma.tenant.upsert({
      where: { slug: 'demo' },
      update: {},
      create: {
        name: 'Demo Tenant',
        slug: 'demo',
        status: 'ACTIVE',
        plan: 'FREE',
        maxUsers: 10,
        features: ['fulfillment-v5', 'journaling', 'audits'],
      },
    });

    console.log('Demo tenant ready:', demoTenant.id);

    // Create or find demo user
    const demoUser = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: demoTenant.id, email: 'demo@wisdomos.local' } },
      update: {},
      create: {
        tenantId: demoTenant.id,
        email: 'demo@wisdomos.local',
        name: 'Demo User',
        role: 'OWNER',
        isOwner: true,
      },
    });

    console.log('Demo user ready:', demoUser.id);

    // Seed life areas and related data
    for (const lifeAreaData of SAMPLE_DATA) {
      // Create or update life area
      const lifeArea = await prisma.lifeArea.upsert({
        where: { userId_name: { userId: demoUser.id, name: lifeAreaData.name } },
        update: {
          phoenixName: lifeAreaData.phoenixName,
          score: lifeAreaData.score,
          status: mapLifeStatus(lifeAreaData.status),
        },
        create: {
          userId: demoUser.id,
          tenantId: demoTenant.id,
          name: lifeAreaData.name,
          phoenixName: lifeAreaData.phoenixName,
          score: lifeAreaData.score,
          status: mapLifeStatus(lifeAreaData.status),
          sortOrder: SAMPLE_DATA.indexOf(lifeAreaData),
        },
      });

      console.log(`Created/Updated LifeArea: ${lifeArea.name} (${lifeArea.id})`);

      // Create vault items for subdomains and dimensions
      for (const subdomain of lifeAreaData.subdomains) {
        // Create subdomain as a vault item with dimension details
        const subdomainVaultKey = `${lifeArea.id}-${subdomain.id}`;

        // Serialize dimension data as structured JSON
        const dimensionData = subdomain.dimensions.map((dim) => ({
          name: dim.name,
          focus: dim.focus,
          inquiry: dim.inquiry,
          practices: dim.practices,
          metric: dim.metric || 0,
          notes: dim.notes || '',
          lastUpdated: dim.lastUpdated || new Date().toISOString(),
        }));

        await prisma.vault.upsert({
          where: { userId_tenantId: { userId: demoUser.id, tenantId: demoTenant.id } },
          update: {},
          create: {
            userId: demoUser.id,
            tenantId: demoTenant.id,
            title: `${lifeArea.name} - ${subdomain.name}`,
            content: JSON.stringify({
              lifeAreaId: lifeArea.id,
              lifeAreaName: lifeAreaData.name,
              subdomainId: subdomain.id,
              subdomainName: subdomain.name,
              description: subdomain.description || '',
              dimensions: dimensionData,
              createdFromSampleData: true,
              version: 'v5',
            }),
            category: 'fulfillment-v5',
            accessLevel: 'PRIVATE',
            tags: ['sample-data', 'fulfillment-v5', lifeArea.name.toLowerCase().replace(/\s+/g, '-')],
          },
        });

        console.log(
          `  └─ Created Subdomain Vault: ${subdomain.name} with ${subdomain.dimensions.length} dimensions`
        );
      }

      // Create vault item for acceptable/noLongerTolerated metadata
      if (lifeAreaData.acceptable || lifeAreaData.noLongerTolerated) {
        await prisma.vault.create({
          data: {
            userId: demoUser.id,
            tenantId: demoTenant.id,
            title: `${lifeArea.name} - Boundaries & Standards`,
            content: JSON.stringify({
              lifeAreaId: lifeArea.id,
              acceptable: lifeAreaData.acceptable || [],
              noLongerTolerated: lifeAreaData.noLongerTolerated || [],
              version: 'v5',
            }),
            category: 'fulfillment-v5-boundaries',
            accessLevel: 'PRIVATE',
            tags: ['sample-data', 'boundaries', lifeArea.name.toLowerCase().replace(/\s+/g, '-')],
          },
        });

        console.log(`  └─ Created Boundaries Vault: ${lifeArea.name}`);
      }

      // Create sample events for each life area
      const eventTypes = ['WIN', 'COMMITMENT_KEPT'];
      const sampleEvent = await prisma.event.create({
        data: {
          userId: demoUser.id,
          tenantId: demoTenant.id,
          lifeAreaId: lifeArea.id,
          type: 'WIN',
          impact: 1,
          title: `Sample win in ${lifeArea.name}`,
          notes: `Loaded from v5 sample data for ${lifeAreaData.name}`,
          occurredAt: new Date(),
        },
      });

      console.log(`  └─ Created Sample Event for tracking`);
    }

    // Create sample audit record for current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstLifeArea = await prisma.lifeArea.findFirst({
      where: { userId: demoUser.id },
    });

    if (firstLifeArea) {
      await prisma.audit.upsert({
        where: {
          userId_lifeAreaId_month: {
            userId: demoUser.id,
            lifeAreaId: firstLifeArea.id,
            month: firstDayOfMonth,
          },
        },
        update: {},
        create: {
          userId: demoUser.id,
          tenantId: demoTenant.id,
          lifeAreaId: firstLifeArea.id,
          month: firstDayOfMonth,
          drift: 0.5,
          colorSymbol: '#3B82F6',
          notes: 'Sample audit from v5 seed data',
        },
      });

      console.log('Created sample Audit record');
    }

    console.log('\n✅ Seed-v5-data script completed successfully!');
    console.log(`\nCreated:
  - 1 Demo Tenant (slug: 'demo')
  - 1 Demo User (email: demo@wisdomos.local)
  - ${SAMPLE_DATA.length} Life Area(s)
  - ${SAMPLE_DATA.reduce((sum, la) => sum + la.subdomains.length, 0)} Subdomain(s) stored as Vault items
  - ${SAMPLE_DATA.length} Sample Event(s) for tracking
  - 1 Audit record for current month`);

    console.log('\nTo verify the data:');
    console.log('  npx prisma studio');
  } catch (error) {
    console.error('Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Map v5 LifeAreaStatus to Prisma LifeStatus enum
 */
function mapLifeStatus(v5Status: string): 'GREEN' | 'YELLOW' | 'RED' {
  switch (v5Status.toLowerCase()) {
    case 'thriving':
      return 'GREEN';
    case 'needs attention':
      return 'YELLOW';
    case 'breakdown/reset needed':
      return 'RED';
    default:
      return 'YELLOW';
  }
}

// Execute the seed function
seedV5Data().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
