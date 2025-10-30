import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './test-setup';
import { TestDataFactory } from './test-factories';
import { PrismaService } from '../src/database/prisma.service';

describe('Fulfillment E2E', () => {
  let app: INestApplication;
  let testSetup: TestSetup;
  let prisma: PrismaService;

  beforeAll(async () => {
    testSetup = new TestSetup();
    await testSetup.beforeAll();
    app = testSetup.app;
    prisma = testSetup.prisma;
  });

  afterAll(async () => {
    await testSetup.afterAll();
  });

  beforeEach(async () => {
    await testSetup.beforeEach();
  });

  describe('Fulfillment Entry Creation from Contributions', () => {
    it('should create fulfillment entries when contribution is created', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contributionId = response.body.id;
      
      // Get fulfillment entries
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const fulfillmentEntries = fulfillmentResponse.body;
      
      // Should have entries for all expected life areas
      const contributionEntries = fulfillmentEntries.filter(
        (entry: any) => entry.sourceId === contributionId
      );
      
      expect(contributionEntries).toHaveLength(3); // Doing = 3 areas
      
      // Check each entry has correct structure
      contributionEntries.forEach((entry: any) => {
        expect(entry).toMatchObject({
          sourceType: 'contribution',
          sourceId: contributionId,
          title: contributionDto.title,
          userId: 'test-user-1',
          priority: expect.any(Number),
        });
        
        expect(entry.description).toContain(contributionDto.description);
        expect(entry.meta.source).toBe('contribution_mirror');
        expect(entry.meta.category).toBe(contributionDto.category);
      });
    });

    it('should have correct priority levels for different life areas', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = response.body.id;
      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      
      // Work & Purpose should have priority 4, others should have priority 3
      const workPurposeMirror = mirrors.find(m => m.lifeArea.slug === 'work-purpose');
      const creativityMirror = mirrors.find(m => m.lifeArea.slug === 'creativity-expression');
      const communityMirror = mirrors.find(m => m.lifeArea.slug === 'community-contribution');
      
      expect(workPurposeMirror?.priority).toBe(4);
      expect(creativityMirror?.priority).toBe(3);
      expect(communityMirror?.priority).toBe(3);
    });

    it('should create different number of mirrors based on category', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Test Doing category (3 mirrors)
      const doingResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution({ title: 'Doing Test' }));
      
      const doingMirrors = await testSetup.getFulfillmentMirrors(doingResponse.body.id);
      expect(doingMirrors).toHaveLength(3);
      
      // Test Being category (2 mirrors)
      const beingResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createBeingContribution({ title: 'Being Test' }));
      
      const beingMirrors = await testSetup.getFulfillmentMirrors(beingResponse.body.id);
      expect(beingMirrors).toHaveLength(2);
      
      // Test Having category (2 mirrors)
      const havingResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createHavingContribution({ title: 'Having Test' }));
      
      const havingMirrors = await testSetup.getFulfillmentMirrors(havingResponse.body.id);
      expect(havingMirrors).toHaveLength(2);
    });

    it('should create community mirror when community tag is present', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Being contribution with community tag should get community mirror
      const contributionDto = TestDataFactory.createBeingContribution({
        tags: ['community', 'collaboration'],
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(3); // Being + community tag = 3 mirrors
      
      const lifeAreaSlugs = mirrors.map(m => m.lifeArea.slug).sort();
      expect(lifeAreaSlugs).toEqual([
        'community-contribution',
        'creativity-expression',
        'work-purpose'
      ]);
    });
  });

  describe('Fulfillment Entry Updates', () => {
    it('should update all mirrors when contribution is updated', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      
      // Update the contribution
      const updateDto = {
        title: 'Updated Mirror Title',
        description: 'Updated mirror description',
        impact: 'Updated impact statement',
        commitment: 'Updated commitment',
      };

      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send(updateDto)
        .expect(200);

      // Check that all mirrors were updated
      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe('Updated Mirror Title');
        expect(mirror.description).toContain('Updated mirror description');
        expect(mirror.description).toContain('🎯 Impact: Updated impact statement');
        expect(mirror.description).toContain('✅ Commitment: Updated commitment');
        expect(mirror.meta.impact).toBe('Updated impact statement');
        expect(mirror.meta.commitment).toBe('Updated commitment');
      });
    });

    it('should handle partial updates correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createContributionWithAllFields();

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      
      // Update only the title
      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ title: 'Only Title Updated' })
        .expect(200);

      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe('Only Title Updated');
        // Other fields should remain unchanged
        expect(mirror.description).toContain(contributionDto.description);
        expect(mirror.meta.impact).toBe(contributionDto.impact);
        expect(mirror.meta.commitment).toBe(contributionDto.commitment);
      });
    });

    it('should update tags and metadata correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createBeingContribution({
        tags: ['initial', 'tags'],
      });

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      
      // Add community tag
      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ tags: ['community', 'updated', 'tags'] })
        .expect(200);

      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      
      // Should now have 3 mirrors (Being + community tag)
      expect(mirrors).toHaveLength(3);
      
      mirrors.forEach(mirror => {
        expect(mirror.meta.tags).toEqual(['community', 'updated', 'tags']);
      });
    });
  });

  describe('Fulfillment Entry Deletion', () => {
    it('should delete all mirrors when contribution is deleted', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      
      // Verify mirrors exist
      let mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors.length).toBeGreaterThan(0);

      // Delete the contribution
      await request(app.getHttpServer())
        .delete(`/contributions/${contributionId}`)
        .set(authHeaders)
        .expect(200);

      // Verify all mirrors are deleted
      mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(0);

      // Verify fulfillment endpoint doesn't return deleted entries
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const deletedEntries = fulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contributionId
      );
      expect(deletedEntries).toHaveLength(0);
    });
  });

  describe('Unique Constraint Enforcement', () => {
    it('should prevent duplicate mirrors for same contribution and life area', async () => {
      const contribution = await testSetup.createTestContribution({
        category: 'Doing',
        title: 'Test Duplicate Prevention',
      });

      // Try to create duplicate mirror manually
      const lifeArea = await prisma.lifeAreaCanonical.findFirst({
        where: { slug: 'work-purpose' }
      });

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

      // Attempt to create duplicate should fail or upsert
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            userId: 'test-user-1',
            lifeAreaId: lifeArea!.id,
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Duplicate Mirror',
            description: 'Duplicate mirror description',
            priority: 4,
            meta: { source: 'test' },
          },
        })
      ).rejects.toThrow();

      // Should still only have one mirror for this combination
      const mirrors = await prisma.fulfillmentEntry.findMany({
        where: {
          userId: 'test-user-1',
          lifeAreaId: lifeArea!.id,
          sourceType: 'contribution',
          sourceId: contribution.id,
        },
      });

      expect(mirrors).toHaveLength(1);
      expect(mirrors[0].title).toBe('First Mirror');
    });
  });

  describe('GET /fulfillment integration', () => {
    it('should return contribution-sourced fulfillment entries', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create multiple contributions
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution({ title: 'First' }));
        
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createBeingContribution({ title: 'Second' }));

      const response = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const fulfillmentEntries = response.body;
      
      // Should have 5 total entries (3 from Doing + 2 from Being)
      expect(fulfillmentEntries).toHaveLength(5);
      
      // All should be contribution-sourced
      fulfillmentEntries.forEach((entry: any) => {
        expect(entry.sourceType).toBe('contribution');
        expect(entry.meta.source).toBe('contribution_mirror');
      });
      
      // Check life area distribution
      const lifeAreaCounts = fulfillmentEntries.reduce((acc: any, entry: any) => {
        acc[entry.lifeArea.slug] = (acc[entry.lifeArea.slug] || 0) + 1;
        return acc;
      }, {});
      
      expect(lifeAreaCounts['work-purpose']).toBe(2); // Both contributions
      expect(lifeAreaCounts['creativity-expression']).toBe(2); // Both contributions
      expect(lifeAreaCounts['community-contribution']).toBe(1); // Only Doing
    });

    it('should filter fulfillment entries by life area', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution());

      // Get work-purpose life area ID
      const workPurposeArea = await prisma.lifeAreaCanonical.findFirst({
        where: { slug: 'work-purpose' }
      });

      const response = await request(app.getHttpServer())
        .get(`/fulfillment?lifeAreaId=${workPurposeArea!.id}`)
        .set(authHeaders)
        .expect(200);

      const entries = response.body;
      expect(entries).toHaveLength(1);
      expect(entries[0].lifeArea.slug).toBe('work-purpose');
      expect(entries[0].priority).toBe(4);
    });

    it('should include contribution metadata in fulfillment entries', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createContributionWithAllFields();
      
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const response = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const entry = response.body[0];
      
      expect(entry.meta).toMatchObject({
        category: contributionDto.category,
        bullets: contributionDto.contributions,
        commitment: contributionDto.commitment,
        impact: contributionDto.impact,
        tags: contributionDto.tags,
        source: 'contribution_mirror',
      });
      
      expect(entry.meta.mirrored_at).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing life areas gracefully', async () => {
      // Create contribution when some life areas are missing
      await prisma.lifeAreaCanonical.deleteMany({
        where: { slug: 'community-contribution' }
      });

      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      // Should still create mirrors for available life areas
      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(2); // work-purpose and creativity-expression only
    });

    it('should handle empty or null fields in contribution', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createMinimalContribution({
        description: null,
        impact: null,
        commitment: null,
        tags: null,
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe(contributionDto.title);
        expect(mirror.description).toBeDefined();
        expect(mirror.meta.source).toBe('contribution_mirror');
        expect(mirror.meta.tags).toEqual([]);
      });
    });

    it('should handle concurrent mirror operations', async () => {
      const contribution = await testSetup.createTestContribution();
      
      // Simulate concurrent updates to the same contribution
      const updates = Array.from({ length: 5 }, (_, i) => 
        prisma.contribution.update({
          where: { id: contribution.id },
          data: { title: `Concurrent Update ${i}` },
        })
      );

      await Promise.allSettled(updates);

      // All mirrors should have consistent state
      const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
      const titles = [...new Set(mirrors.map(m => m.title))];
      expect(titles).toHaveLength(1); // All mirrors should have same title
    });
  });
});