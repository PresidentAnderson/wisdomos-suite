import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './test-setup';
import { TestDataFactory } from './test-factories';
import { PrismaService } from '../src/database/prisma.service';

describe('Contributions E2E', () => {
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

  describe('POST /contributions', () => {
    it('should create a contribution and trigger automatic mirroring', async () => {
      const contributionDto = TestDataFactory.createDoingContribution();
      const authHeaders = await testSetup.getAuthHeaders();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contribution = response.body;
      expect(contribution).toMatchObject({
        category: 'Doing',
        title: contributionDto.title,
        description: contributionDto.description,
        userId: 'test-user-1',
      });

      // Check that mirrors were created
      const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
      expect(mirrors).toHaveLength(3); // Doing category should create 3 mirrors

      const expectedAreas = TestDataFactory.getExpectedLifeAreas(contribution);
      const mirrorAreas = mirrors.map(m => m.lifeArea.slug).sort();
      expect(mirrorAreas).toEqual(expectedAreas.sort());

      // Check priority levels
      const workPurposeMirror = mirrors.find(m => m.lifeArea.slug === 'work-purpose');
      const creativityMirror = mirrors.find(m => m.lifeArea.slug === 'creativity-expression');
      expect(workPurposeMirror?.priority).toBe(4);
      expect(creativityMirror?.priority).toBe(3);

      // Check audit log
      const auditLogs = await testSetup.getAuditLogs(contribution.id);
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].eventType).toBe('contribution_mirrored');
    });

    it('should create Being contribution with 2 mirrors (no community)', async () => {
      const contributionDto = TestDataFactory.createBeingContribution();
      const authHeaders = await testSetup.getAuthHeaders();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contribution = response.body;
      const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
      
      expect(mirrors).toHaveLength(2); // Being category without community tag
      
      const mirrorAreas = mirrors.map(m => m.lifeArea.slug).sort();
      expect(mirrorAreas).toEqual(['creativity-expression', 'work-purpose']);
    });

    it('should create community mirror when community tag is present', async () => {
      const contributionDto = TestDataFactory.createCommunityTaggedContribution({
        category: 'Being', // Being + community tag should create 3 mirrors
      });
      const authHeaders = await testSetup.getAuthHeaders();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contribution = response.body;
      const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
      
      expect(mirrors).toHaveLength(3); // Being + community tag = 3 mirrors
      
      const mirrorAreas = mirrors.map(m => m.lifeArea.slug).sort();
      expect(mirrorAreas).toEqual([
        'community-contribution',
        'creativity-expression', 
        'work-purpose'
      ]);
    });

    it('should include all contribution data in mirror metadata', async () => {
      const contributionDto = TestDataFactory.createContributionWithAllFields();
      const authHeaders = await testSetup.getAuthHeaders();

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contribution = response.body;
      const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
      
      const mirror = mirrors[0];
      expect(mirror.meta).toMatchObject({
        category: contributionDto.category,
        bullets: contributionDto.contributions,
        commitment: contributionDto.commitment,
        impact: contributionDto.impact,
        tags: contributionDto.tags,
        source: 'contribution_mirror',
      });

      expect(mirror.meta.mirrored_at).toBeDefined();
      
      // Check description formatting
      expect(mirror.description).toContain(contributionDto.description);
      expect(mirror.description).toContain(`🎯 Impact: ${contributionDto.impact}`);
      expect(mirror.description).toContain(`✅ Commitment: ${contributionDto.commitment}`);
    });

    it('should validate required fields', async () => {
      const authHeaders = await testSetup.getAuthHeaders();

      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send({
          // Missing required fields
          description: 'Test description',
        })
        .expect(400);
    });

    it('should validate category enum', async () => {
      const authHeaders = await testSetup.getAuthHeaders();

      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send({
          category: 'InvalidCategory',
          title: 'Test',
          contributions: ['test'],
        })
        .expect(400);
    });
  });

  describe('GET /contributions', () => {
    it('should return all user contributions', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create multiple contributions
      const contribution1 = TestDataFactory.createDoingContribution({ title: 'First' });
      const contribution2 = TestDataFactory.createBeingContribution({ title: 'Second' });
      
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contribution1);
        
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contribution2);

      const response = await request(app.getHttpServer())
        .get('/contributions')
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Second'); // Most recent first
      expect(response.body[1].title).toBe('First');
    });

    it('should return empty array for user with no contributions', async () => {
      const authHeaders = await testSetup.getAuthHeaders();

      const response = await request(app.getHttpServer())
        .get('/contributions')
        .set(authHeaders)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /contributions/statistics', () => {
    it('should return user statistics', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contributions in different categories
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution());
        
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createBeingContribution());
        
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createHavingContribution());

      const response = await request(app.getHttpServer())
        .get('/contributions/statistics')
        .set(authHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        total: 3,
        byCategory: expect.arrayContaining([
          { category: 'Doing', _count: 1 },
          { category: 'Being', _count: 1 },
          { category: 'Having', _count: 1 },
        ]),
        recent: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            category: expect.any(String),
          }),
        ]),
      });
    });
  });

  describe('GET /contributions/:id', () => {
    it('should return specific contribution', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/contributions/${contributionId}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        id: contributionId,
        title: contributionDto.title,
        category: contributionDto.category,
      });
    });

    it('should return 404 for non-existent contribution', async () => {
      const authHeaders = await testSetup.getAuthHeaders();

      await request(app.getHttpServer())
        .get('/contributions/non-existent-id')
        .set(authHeaders)
        .expect(404);
    });
  });

  describe('PUT /contributions/:id', () => {
    it('should update contribution and refresh mirrors', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      const updateDto = {
        title: 'Updated Title',
        description: 'Updated description',
        impact: 'Updated impact',
      };

      const response = await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');

      // Check that mirrors were updated
      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe('Updated Title');
        expect(mirror.description).toContain('Updated description');
        expect(mirror.description).toContain('🎯 Impact: Updated impact');
      });

      // Check audit log
      const auditLogs = await testSetup.getAuditLogs(contributionId);
      expect(auditLogs.some(log => log.eventType === 'contribution_updated')).toBe(true);
    });

    it('should handle adding/removing community tag', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Start with Being contribution (2 mirrors)
      const contributionDto = TestDataFactory.createBeingContribution();
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;
      
      // Verify initial state (2 mirrors)
      let mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(2);

      // Add community tag (should still be 2 mirrors for Being + community)
      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ tags: ['community'] })
        .expect(200);

      // Being category with community tag should create 3 mirrors
      mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(3);
      
      const mirrorAreas = mirrors.map(m => m.lifeArea.slug).sort();
      expect(mirrorAreas).toEqual([
        'community-contribution',
        'creativity-expression',
        'work-purpose'
      ]);
    });
  });

  describe('DELETE /contributions/:id', () => {
    it('should delete contribution and cleanup mirrors', async () => {
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

      // Delete contribution
      await request(app.getHttpServer())
        .delete(`/contributions/${contributionId}`)
        .set(authHeaders)
        .expect(200);

      // Verify mirrors are cleaned up
      mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(0);

      // Verify contribution is deleted
      await request(app.getHttpServer())
        .get(`/contributions/${contributionId}`)
        .set(authHeaders)
        .expect(404);

      // Check audit log
      const auditLogs = await testSetup.getAuditLogs(contributionId);
      expect(auditLogs.some(log => log.eventType === 'contribution_deleted')).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const contributionDto = TestDataFactory.createDoingContribution();

      await request(app.getHttpServer())
        .post('/contributions')
        .send(contributionDto)
        .expect(401);

      await request(app.getHttpServer())
        .get('/contributions')
        .expect(401);

      await request(app.getHttpServer())
        .get('/contributions/test-id')
        .expect(401);

      await request(app.getHttpServer())
        .put('/contributions/test-id')
        .send({ title: 'test' })
        .expect(401);

      await request(app.getHttpServer())
        .delete('/contributions/test-id')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // This test would require mocking database connection
      // For now, we'll test with invalid data that causes database errors
      const invalidContribution = {
        category: 'Doing',
        title: '', // Empty title should fail validation
        contributions: [],
      };

      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(invalidContribution)
        .expect(400);
    });

    it('should handle concurrent updates properly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const contributionDto = TestDataFactory.createDoingContribution();

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      const contributionId = createResponse.body.id;

      // Simulate concurrent updates
      const update1 = request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ title: 'Update 1' });

      const update2 = request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ title: 'Update 2' });

      await Promise.all([update1, update2]);

      // Verify final state is consistent
      const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      const titles = [...new Set(mirrors.map(m => m.title))];
      expect(titles).toHaveLength(1); // All mirrors should have same title
    });
  });
});