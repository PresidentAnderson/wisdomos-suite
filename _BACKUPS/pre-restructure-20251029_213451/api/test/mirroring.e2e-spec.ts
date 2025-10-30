import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './test-setup';
import { TestDataFactory } from './test-factories';
import { PrismaService } from '../src/database/prisma.service';
import { FulfillmentMirrorService } from '../src/contributions/fulfillment-mirror.service';

describe('Contribution-Fulfillment Mirroring Integration E2E', () => {
  let app: INestApplication;
  let testSetup: TestSetup;
  let prisma: PrismaService;
  let mirrorService: FulfillmentMirrorService;

  beforeAll(async () => {
    testSetup = new TestSetup();
    await testSetup.beforeAll();
    app = testSetup.app;
    prisma = testSetup.prisma;
    mirrorService = app.get<FulfillmentMirrorService>(FulfillmentMirrorService);
  });

  afterAll(async () => {
    await testSetup.afterAll();
  });

  beforeEach(async () => {
    await testSetup.beforeEach();
  });

  describe('Mirroring Rules and Logic', () => {
    it('should follow category-based mirroring rules correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Test all three categories
      const categories = ['Doing', 'Being', 'Having'];
      const expectedMirrorCounts = {
        'Doing': 3,  // work-purpose, creativity-expression, community-contribution
        'Being': 2,  // work-purpose, creativity-expression
        'Having': 2, // work-purpose, creativity-expression
      };

      for (const category of categories) {
        const contributionDto = TestDataFactory.createContributionDto({
          category,
          title: `${category} Category Test`,
        });

        const response = await request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(contributionDto);

        const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
        expect(mirrors).toHaveLength(expectedMirrorCounts[category as keyof typeof expectedMirrorCounts]);
        
        // All categories should have work-purpose and creativity-expression
        const mirrorSlugs = mirrors.map(m => m.lifeArea.slug).sort();
        expect(mirrorSlugs).toContain('work-purpose');
        expect(mirrorSlugs).toContain('creativity-expression');
        
        // Only Doing should have community-contribution
        if (category === 'Doing') {
          expect(mirrorSlugs).toContain('community-contribution');
        } else {
          expect(mirrorSlugs).not.toContain('community-contribution');
        }
      }
    });

    it('should apply community tag trigger correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Test each category with community tag
      const categories = ['Doing', 'Being', 'Having'];
      
      for (const category of categories) {
        const contributionDto = TestDataFactory.createContributionDto({
          category,
          title: `${category} with Community Tag`,
          tags: ['community', 'collaboration'],
        });

        const response = await request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(contributionDto);

        const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
        
        // All categories with community tag should have 3 mirrors
        expect(mirrors).toHaveLength(3);
        
        const mirrorSlugs = mirrors.map(m => m.lifeArea.slug).sort();
        expect(mirrorSlugs).toEqual([
          'community-contribution',
          'creativity-expression',
          'work-purpose'
        ]);
      }
    });

    it('should enforce priority levels correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      
      // Check priority assignments
      mirrors.forEach(mirror => {
        const expectedPriority = TestDataFactory.getExpectedPriority(mirror.lifeArea.slug);
        expect(mirror.priority).toBe(expectedPriority);
      });
    });

    it('should handle mixed tag scenarios', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Test with community tag among other tags
      const contributionDto = TestDataFactory.createBeingContribution({
        tags: ['personal', 'community', 'growth', 'development'],
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(3); // Being + community = 3 mirrors
      
      // Check that all tags are preserved in metadata
      mirrors.forEach(mirror => {
        expect(mirror.meta.tags).toEqual(['personal', 'community', 'growth', 'development']);
      });
    });
  });

  describe('Audit Log Generation', () => {
    it('should generate audit logs for all mirroring operations', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      // Create
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      
      // Update
      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ title: 'Updated Title' });

      // Delete
      await request(app.getHttpServer())
        .delete(`/contributions/${contributionId}`)
        .set(authHeaders);

      // Check audit logs
      const auditLogs = await testSetup.getAuditLogs(contributionId);
      
      expect(auditLogs).toHaveLength(3);
      
      const eventTypes = auditLogs.map(log => log.eventType).sort();
      expect(eventTypes).toEqual([
        'contribution_deleted',
        'contribution_mirrored', 
        'contribution_updated'
      ]);
      
      // Check audit log structure
      auditLogs.forEach(log => {
        expect(log.userId).toBe('test-user-1');
        expect(log.entityType).toBe('contribution');
        expect(log.entityId).toBe(contributionId);
        expect(log.payload).toBeDefined();
        expect(log.createdAt).toBeDefined();
      });
    });

    it('should include relevant data in audit log payloads', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createContributionWithAllFields();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = response.body.id;
      const auditLogs = await testSetup.getAuditLogs(contributionId);
      
      const mirroredLog = auditLogs.find(log => log.eventType === 'contribution_mirrored');
      expect(mirroredLog?.payload).toMatchObject({
        title: contributionDto.title,
        mirrored_to: expect.arrayContaining(['work-purpose', 'creativity-expression']),
        timestamp: expect.any(String),
      });
    });
  });

  describe('Unique Constraint Enforcement', () => {
    it('should prevent duplicate mirrors using upsert', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      // Create contribution normally
      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = response.body.id;
      
      // Try to trigger mirroring again manually
      const contribution = await prisma.contribution.findUnique({
        where: { id: contributionId }
      });

      // This should not create duplicates due to upsert logic
      await mirrorService.handleContributionCreated({
        contribution: contribution!
      } as any);

      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(3); // Still only 3 mirrors, no duplicates
    });

    it('should handle database constraints properly', async () => {
      const contribution = await testSetup.createTestContribution();
      const lifeArea = await prisma.lifeAreaCanonical.findFirst({
        where: { slug: 'work-purpose' }
      });

      // Create first mirror
      const firstMirror = await prisma.fulfillmentEntry.create({
        data: {
          userId: 'test-user-1',
          lifeAreaId: lifeArea!.id,
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: 'First Mirror',
          description: 'First mirror description',
          priority: 4,
          meta: { source: 'test' },
        },
      });

      expect(firstMirror).toBeDefined();

      // Attempt to create duplicate should fail
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            userId: 'test-user-1',
            lifeAreaId: lifeArea!.id,
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Duplicate Mirror',
            description: 'Duplicate description',
            priority: 4,
            meta: { source: 'test' },
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Database vs Memory Mode Testing', () => {
    it('should work consistently in database mode', async () => {
      // This test assumes database mode is the default
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = response.body.id;
      
      // Verify data persists across requests
      const getResponse = await request(app.getHttpServer())
        .get(`/contributions/${contributionId}`)
        .set(authHeaders);

      expect(getResponse.body.id).toBe(contributionId);
      
      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(3);
    });

    // Note: Memory mode testing would require configuring the app differently
    // This would typically be done with a separate test configuration
  });

  describe('Backfill Functionality', () => {
    it('should backfill existing contributions', async () => {
      // Create contributions without triggering mirroring events
      const contribution1 = await prisma.contribution.create({
        data: {
          userId: 'test-user-1',
          category: 'Doing',
          title: 'Backfill Test 1',
          description: 'Test description',
          contributions: ['test'],
          tags: [],
          visibility: 'private',
        },
      });

      const contribution2 = await prisma.contribution.create({
        data: {
          userId: 'test-user-1',
          category: 'Being',
          title: 'Backfill Test 2',
          description: 'Test description',
          contributions: ['test'],
          tags: ['community'],
          visibility: 'private',
        },
      });

      // Verify no mirrors exist initially
      let mirrors1 = await testSetup.getFulfillmentMirrors(contribution1.id);
      let mirrors2 = await testSetup.getFulfillmentMirrors(contribution2.id);
      expect(mirrors1).toHaveLength(0);
      expect(mirrors2).toHaveLength(0);

      // Run backfill
      const result = await mirrorService.backfillContributions('test-user-1');
      expect(result.processed).toBe(2);

      // Verify mirrors were created
      mirrors1 = await testSetup.getFulfillmentMirrors(contribution1.id);
      mirrors2 = await testSetup.getFulfillmentMirrors(contribution2.id);
      
      expect(mirrors1).toHaveLength(3); // Doing category
      expect(mirrors2).toHaveLength(3); // Being + community tag
    });

    it('should handle backfill for all users when no userId specified', async () => {
      // Create another test user
      await prisma.user.create({
        data: {
          id: 'test-user-2',
          email: 'test2@example.com',
          name: 'Test User 2',
          passwordHash: 'test-hash',
        },
      });

      // Create contributions for both users
      await prisma.contribution.create({
        data: {
          userId: 'test-user-1',
          category: 'Doing',
          title: 'User 1 Contribution',
          description: 'Test',
          contributions: ['test'],
          tags: [],
          visibility: 'private',
        },
      });

      await prisma.contribution.create({
        data: {
          userId: 'test-user-2',
          category: 'Being',
          title: 'User 2 Contribution',
          description: 'Test',
          contributions: ['test'],
          tags: [],
          visibility: 'private',
        },
      });

      // Run backfill for all users
      const result = await mirrorService.backfillContributions();
      expect(result.processed).toBe(2);

      // Verify mirrors were created for both users
      const allMirrors = await prisma.fulfillmentEntry.findMany({
        where: { sourceType: 'contribution' }
      });
      
      expect(allMirrors.length).toBeGreaterThan(0);
      
      const user1Mirrors = allMirrors.filter(m => m.userId === 'test-user-1');
      const user2Mirrors = allMirrors.filter(m => m.userId === 'test-user-2');
      
      expect(user1Mirrors).toHaveLength(3); // Doing category
      expect(user2Mirrors).toHaveLength(2); // Being category
    });
  });

  describe('Complex Scenarios and Edge Cases', () => {
    it('should handle rapid successive operations', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      // Create contribution
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;

      // Perform rapid updates
      const updates = Array.from({ length: 10 }, (_, i) => 
        request(app.getHttpServer())
          .put(`/contributions/${contributionId}`)
          .set(authHeaders)
          .send({ title: `Rapid Update ${i}` })
      );

      await Promise.allSettled(updates);

      // Verify final state is consistent
      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      const titles = [...new Set(mirrors.map(m => m.title))];
      expect(titles).toHaveLength(1); // All mirrors should have same title
      expect(titles[0]).toMatch(/^Rapid Update \d+$/);
    });

    it('should handle contributions with very long content', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const longContent = 'A'.repeat(5000); // Very long content
      const contributionDto = TestDataFactory.createDoingContribution({
        title: longContent,
        description: longContent,
        impact: longContent,
        commitment: longContent,
        contributions: [longContent, longContent, longContent],
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(3);
      
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe(longContent);
        expect(mirror.description).toContain(longContent);
        expect(mirror.meta.impact).toBe(longContent);
      });
    });

    it('should handle special characters and unicode in content', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const specialContent = '🚀 Special chars: äöü ñ 中文 العربية 😀 <script>alert("test")</script>';
      const contributionDto = TestDataFactory.createDoingContribution({
        title: specialContent,
        description: specialContent,
        tags: [specialContent, 'community'],
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(3);
      
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe(specialContent);
        expect(mirror.description).toContain(specialContent);
        expect(mirror.meta.tags).toContain(specialContent);
      });
    });

    it('should maintain referential integrity during cascading operations', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create multiple contributions
      const contributions = await Promise.all([
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createDoingContribution({ title: 'Contrib 1' })),
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createBeingContribution({ title: 'Contrib 2' })),
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createHavingContribution({ title: 'Contrib 3' })),
      ]);

      const contributionIds = contributions.map(r => r.body.id);

      // Verify all mirrors exist
      let totalMirrors = 0;
      for (const id of contributionIds) {
        const mirrors = await testSetup.getFulfillmentMirrors(id);
        totalMirrors += mirrors.length;
      }
      expect(totalMirrors).toBe(7); // 3 + 2 + 2 = 7 total mirrors

      // Delete all contributions
      await Promise.all(
        contributionIds.map(id =>
          request(app.getHttpServer())
            .delete(`/contributions/${id}`)
            .set(authHeaders)
        )
      );

      // Verify all mirrors are cleaned up
      const remainingMirrors = await prisma.fulfillmentEntry.findMany({
        where: { sourceType: 'contribution' }
      });
      expect(remainingMirrors).toHaveLength(0);
    });
  });

  describe('Performance and Stress Testing', () => {
    it('should handle batch operations efficiently', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const startTime = Date.now();
      
      // Create 50 contributions concurrently
      const createPromises = Array.from({ length: 50 }, (_, i) =>
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createDoingContribution({ 
            title: `Batch Contribution ${i}`
          }))
      );

      const responses = await Promise.all(createPromises);
      const endTime = Date.now();
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds
      
      // Verify all contributions were created with mirrors
      expect(responses).toHaveLength(50);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify mirror count
      const totalMirrors = await prisma.fulfillmentEntry.count({
        where: { sourceType: 'contribution' }
      });
      expect(totalMirrors).toBe(150); // 50 contributions * 3 mirrors each
    });
  });
});