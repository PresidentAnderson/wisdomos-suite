import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBasicSchema() {
  console.log('🧪 Testing Basic Multi-Tenant Schema...\n');

  try {
    // Test 1: Create a tenant
    console.log('1️⃣ Creating test tenant...');
    
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test Company',
        slug: 'test-company',
        plan: 'FREE',
        status: 'ACTIVE',
        features: '["basic_journal", "life_areas"]',
        maxUsers: 1,
        maxStorage: 1073741824,
        billingEmail: 'test@company.com',
      },
    });
    console.log('✅ Created tenant:', tenant.slug);

    // Test 2: Create a user for this tenant
    console.log('\n2️⃣ Creating user for tenant...');
    
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'owner@company.com',
        name: 'Test Owner',
        role: 'OWNER',
        isOwner: true,
      },
    });
    console.log('✅ Created user:', user.email);

    // Test 3: Create tenant-specific data
    console.log('\n3️⃣ Creating tenant-specific data...');
    
    const lifeArea = await prisma.lifeArea.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        name: 'Career',
        phoenixName: 'Professional Phoenix',
        score: 85,
      },
    });
    console.log('✅ Created life area:', lifeArea.name);

    // Test 4: Create a journal entry
    const journal = await prisma.journal.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        lifeAreaId: lifeArea.id,
        content: 'Today I made great progress on the multi-tenant system!',
        tags: '["progress", "development"]',
      },
    });
    console.log('✅ Created journal entry');

    // Test 5: Verify data relationships
    console.log('\n4️⃣ Verifying data relationships...');
    
    const tenantWithData = await prisma.tenant.findUnique({
      where: { id: tenant.id },
      include: {
        users: {
          include: {
            lifeAreas: {
              include: {
                journals: true,
              },
            },
          },
        },
      },
    });

    if (tenantWithData) {
      console.log(`✅ Tenant ${tenantWithData.name} has:`);
      console.log(`   - ${tenantWithData.users.length} user(s)`);
      console.log(`   - ${tenantWithData.users[0]?.lifeAreas.length || 0} life area(s)`);
      console.log(`   - ${tenantWithData.users[0]?.lifeAreas[0]?.journals.length || 0} journal(s)`);
    }

    // Test 6: Create a tenant invitation
    console.log('\n5️⃣ Testing tenant invitations...');
    
    const invitation = await prisma.tenantInvitation.create({
      data: {
        tenantId: tenant.id,
        email: 'newuser@company.com',
        role: 'MEMBER',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        token: 'test-token-123',
      },
    });
    console.log('✅ Created invitation for:', invitation.email);

    // Test 7: Create audit log
    console.log('\n6️⃣ Testing audit logging...');
    
    const auditLog = await prisma.tenantAuditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        action: 'TENANT_CREATED',
        resource: 'tenant',
        resourceId: tenant.id,
        metadata: '{"plan": "FREE"}',
      },
    });
    console.log('✅ Created audit log entry');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    
    await prisma.tenantAuditLog.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenantInvitation.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.journal.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.lifeArea.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All basic schema tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBasicSchema();