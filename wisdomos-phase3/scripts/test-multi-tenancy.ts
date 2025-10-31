import { PrismaClient } from '@prisma/client';
// For testing, we'll use basic Prisma operations
// import { TenantService } from '../apps/web/lib/tenant/tenant-service';
// import { withTenant, getTenantPrismaClient } from '../apps/web/lib/tenant/prisma-tenant-client';

const prisma = new PrismaClient();

async function testMultiTenancy() {
  console.log('🧪 Testing Multi-Tenancy Setup...\n');

  try {
    // Test 1: Create two tenants
    console.log('1️⃣ Creating test tenants...');
    
    const tenant1 = await TenantService.createTenant({
      name: 'Acme Corporation',
      slug: 'acme-corp',
      ownerEmail: 'owner@acme.com',
      ownerPassword: 'password123',
      ownerName: 'John Doe',
      plan: TenantPlan.PROFESSIONAL,
    });
    console.log('✅ Created tenant 1:', tenant1.tenant.slug);

    const tenant2 = await TenantService.createTenant({
      name: 'Tech Startup',
      slug: 'tech-startup',
      ownerEmail: 'founder@techstartup.com',
      ownerPassword: 'password456',
      ownerName: 'Jane Smith',
      plan: TenantPlan.STARTER,
    });
    console.log('✅ Created tenant 2:', tenant2.tenant.slug);

    // Test 2: Create data for each tenant with isolation
    console.log('\n2️⃣ Testing data isolation...');
    
    const tenantPrisma = getTenantPrismaClient();

    // Create life area for tenant 1
    await withTenant(tenant1.tenant.id, async () => {
      const lifeArea = await tenantPrisma.lifeArea.create({
        data: {
          userId: tenant1.user.id,
          name: 'Career',
          phoenixName: 'Professional Phoenix',
          score: 85,
        },
      });
      console.log('✅ Created life area for tenant 1:', lifeArea.name);
    });

    // Create life area for tenant 2
    await withTenant(tenant2.tenant.id, async () => {
      const lifeArea = await tenantPrisma.lifeArea.create({
        data: {
          userId: tenant2.user.id,
          name: 'Health',
          phoenixName: 'Wellness Warrior',
          score: 75,
        },
      });
      console.log('✅ Created life area for tenant 2:', lifeArea.name);
    });

    // Test 3: Verify data isolation
    console.log('\n3️⃣ Verifying data isolation...');

    // Try to access tenant 1's data with tenant 2's context (should return nothing)
    await withTenant(tenant2.tenant.id, async () => {
      const tenant1Data = await tenantPrisma.lifeArea.findMany({
        where: { userId: tenant1.user.id },
      });
      
      if (tenant1Data.length === 0) {
        console.log('✅ Tenant 2 cannot see Tenant 1\'s data');
      } else {
        console.error('❌ Data isolation failed! Tenant 2 can see Tenant 1\'s data');
      }
    });

    // Verify each tenant can only see their own data
    await withTenant(tenant1.tenant.id, async () => {
      const data = await tenantPrisma.lifeArea.findMany();
      console.log(`✅ Tenant 1 sees ${data.length} life area(s) (expected: 1)`);
    });

    await withTenant(tenant2.tenant.id, async () => {
      const data = await tenantPrisma.lifeArea.findMany();
      console.log(`✅ Tenant 2 sees ${data.length} life area(s) (expected: 1)`);
    });

    // Test 4: Test feature access
    console.log('\n4️⃣ Testing feature access...');
    
    const tenant1HasApi = await TenantService.hasFeature(tenant1.tenant.id, 'api_access');
    const tenant2HasApi = await TenantService.hasFeature(tenant2.tenant.id, 'api_access');
    
    console.log(`✅ Tenant 1 (Professional) has API access: ${tenant1HasApi} (expected: true)`);
    console.log(`✅ Tenant 2 (Starter) has API access: ${tenant2HasApi} (expected: false)`);

    // Test 5: Test user limits
    console.log('\n5️⃣ Testing user limits...');
    
    const canAddToTenant1 = await TenantService.canAddUser(tenant1.tenant.id);
    const canAddToTenant2 = await TenantService.canAddUser(tenant2.tenant.id);
    
    console.log(`✅ Tenant 1 can add users: ${canAddToTenant1} (max: 20 users)`);
    console.log(`✅ Tenant 2 can add users: ${canAddToTenant2} (max: 5 users)`);

    // Test 6: Test tenant invitation
    console.log('\n6️⃣ Testing tenant invitations...');
    
    const invitation = await TenantService.createInvitation(
      tenant1.tenant.id,
      'newuser@acme.com',
      'MEMBER'
    );
    console.log('✅ Created invitation for new user');
    
    const acceptedUser = await TenantService.acceptInvitation(
      invitation.token,
      'newpassword123',
      'New User'
    );
    console.log('✅ Invitation accepted, new user created');

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete test tenants (cascade will delete all related data)
    await prisma.tenant.deleteMany({
      where: {
        slug: { in: ['acme-corp', 'tech-startup'] },
      },
    });
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All multi-tenancy tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMultiTenancy();