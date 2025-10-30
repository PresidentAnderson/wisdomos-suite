import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './test-setup';
import { TestDataFactory } from './test-factories';
import { PrismaService } from '../src/database/prisma.service';

describe('API Integration E2E - Contribution Mirror Flow', () => {
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

  describe('Complete Workflow Integration', () => {
    it('should handle complete contribution lifecycle with mirroring', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // 1. Create contribution
      const contributionDto = TestDataFactory.createDoingContribution({
        title: 'Complete Workflow Test',
        description: 'Testing the complete integration flow',
        impact: 'Will improve our testing coverage',
        commitment: 'Committed to thorough testing',
        tags: ['testing', 'integration'],
      });

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contribution = createResponse.body;
      expect(contribution.title).toBe(contributionDto.title);

      // 2. Verify fulfillment mirrors were created
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const mirrors = fulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contribution.id
      );
      expect(mirrors).toHaveLength(3); // Doing category = 3 mirrors

      // 3. Verify mirror data integrity
      mirrors.forEach((mirror: any) => {
        expect(mirror).toMatchObject({
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: contributionDto.title,
          userId: 'test-user-1',
        });
        expect(mirror.description).toContain(contributionDto.description);
        expect(mirror.description).toContain(`🎯 Impact: ${contributionDto.impact}`);
        expect(mirror.description).toContain(`✅ Commitment: ${contributionDto.commitment}`);
        expect(mirror.meta.category).toBe(contributionDto.category);
        expect(mirror.meta.tags).toEqual(contributionDto.tags);
      });

      // 4. Update contribution
      const updateDto = {
        title: 'Updated Workflow Test',
        description: 'Updated integration flow description',
        tags: ['testing', 'integration', 'updated'],
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/contributions/${contribution.id}`)
        .set(authHeaders)
        .send(updateDto)
        .expect(200);

      expect(updateResponse.body.title).toBe(updateDto.title);

      // 5. Verify mirrors were updated
      const updatedFulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const updatedMirrors = updatedFulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contribution.id
      );

      updatedMirrors.forEach((mirror: any) => {
        expect(mirror.title).toBe(updateDto.title);
        expect(mirror.description).toContain(updateDto.description);
        expect(mirror.meta.tags).toEqual(updateDto.tags);
      });

      // 6. Get individual contribution
      const getResponse = await request(app.getHttpServer())
        .get(`/contributions/${contribution.id}`)
        .set(authHeaders)
        .expect(200);

      expect(getResponse.body.title).toBe(updateDto.title);

      // 7. Get statistics
      const statsResponse = await request(app.getHttpServer())
        .get('/contributions/statistics')
        .set(authHeaders)
        .expect(200);

      expect(statsResponse.body.total).toBe(1);
      expect(statsResponse.body.recent[0].title).toBe(updateDto.title);

      // 8. Delete contribution
      await request(app.getHttpServer())
        .delete(`/contributions/${contribution.id}`)
        .set(authHeaders)
        .expect(200);

      // 9. Verify mirrors were cleaned up
      const finalFulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const remainingMirrors = finalFulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contribution.id
      );
      expect(remainingMirrors).toHaveLength(0);

      // 10. Verify contribution is gone
      await request(app.getHttpServer())
        .get(`/contributions/${contribution.id}`)
        .set(authHeaders)
        .expect(404);
    });

    it('should handle multiple contributions with different categories', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contributions of different categories
      const contributions = await Promise.all([
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createDoingContribution({ title: 'Doing Test' })),
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createBeingContribution({ title: 'Being Test' })),
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createHavingContribution({ title: 'Having Test' })),
      ]);

      const contributionIds = contributions.map(r => r.body.id);

      // Get all fulfillment entries
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      // Verify total mirror count: Doing=3, Being=2, Having=2 = 7 total
      expect(fulfillmentResponse.body).toHaveLength(7);

      // Verify each contribution's mirrors
      for (let i = 0; i < contributionIds.length; i++) {
        const contributionMirrors = fulfillmentResponse.body.filter(
          (entry: any) => entry.sourceId === contributionIds[i]
        );
        
        const expectedCounts = [3, 2, 2]; // Doing, Being, Having
        expect(contributionMirrors).toHaveLength(expectedCounts[i]);
      }

      // Get contributions list
      const listResponse = await request(app.getHttpServer())
        .get('/contributions')
        .set(authHeaders)
        .expect(200);

      expect(listResponse.body).toHaveLength(3);
      
      // Verify order (most recent first)
      expect(listResponse.body[0].title).toBe('Having Test');
      expect(listResponse.body[1].title).toBe('Being Test');
      expect(listResponse.body[2].title).toBe('Doing Test');
    });

    it('should handle community tag workflow', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // 1. Create Being contribution without community tag (2 mirrors)
      const initialDto = TestDataFactory.createBeingContribution({
        title: 'Community Tag Workflow',
        tags: ['personal', 'growth'],
      });

      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(initialDto);

      const contributionId = createResponse.body.id;

      // Verify initial state (2 mirrors)
      let fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders);

      let mirrors = fulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contributionId
      );
      expect(mirrors).toHaveLength(2);

      let mirrorAreas = mirrors.map((m: any) => m.lifeArea.slug).sort();
      expect(mirrorAreas).toEqual(['creativity-expression', 'work-purpose']);

      // 2. Add community tag (should create 3rd mirror)
      const updateDto = {
        tags: ['personal', 'growth', 'community'],
      };

      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send(updateDto)
        .expect(200);

      // Verify community mirror was added
      fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders);

      mirrors = fulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contributionId
      );
      expect(mirrors).toHaveLength(3);

      mirrorAreas = mirrors.map((m: any) => m.lifeArea.slug).sort();
      expect(mirrorAreas).toEqual([
        'community-contribution',
        'creativity-expression',
        'work-purpose'
      ]);

      // 3. Remove community tag (should still have 3 mirrors for Being + community history)
      const removeTagDto = {
        tags: ['personal', 'growth'],
      };

      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send(removeTagDto)
        .expect(200);

      // Note: Current implementation keeps all mirrors and updates them
      // If business logic changes to remove mirrors when tags are removed,
      // this test would need to be updated
    });
  });

  describe('API Error Handling Integration', () => {
    it('should handle invalid contribution data gracefully', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Invalid category
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send({
          category: 'InvalidCategory',
          title: 'Test',
          contributions: ['test'],
        })
        .expect(400);

      // Missing required field
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send({
          category: 'Doing',
          // title missing
          contributions: ['test'],
        })
        .expect(400);

      // Empty title
      await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send({
          category: 'Doing',
          title: '',
          contributions: ['test'],
        })
        .expect(400);
    });

    it('should handle non-existent resource requests', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Non-existent contribution
      await request(app.getHttpServer())
        .get('/contributions/non-existent-id')
        .set(authHeaders)
        .expect(404);

      // Update non-existent contribution
      await request(app.getHttpServer())
        .put('/contributions/non-existent-id')
        .set(authHeaders)
        .send({ title: 'Updated' })
        .expect(404);

      // Delete non-existent contribution
      await request(app.getHttpServer())
        .delete('/contributions/non-existent-id')
        .set(authHeaders)
        .expect(404);
    });

    it('should handle authorization correctly', async () => {
      // No auth headers
      await request(app.getHttpServer())
        .get('/contributions')
        .expect(401);

      await request(app.getHttpServer())
        .post('/contributions')
        .send(TestDataFactory.createDoingContribution())
        .expect(401);

      // Invalid auth headers
      await request(app.getHttpServer())
        .get('/contributions')
        .set({ Authorization: 'Bearer invalid-token' })
        .expect(401);
    });

    it('should handle malformed JSON gracefully', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // This test would require sending malformed JSON
      // Most frameworks handle this at the parser level
      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Performance and Scalability Integration', () => {
    it('should handle bulk operations efficiently', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      const startTime = Date.now();
      
      // Create 20 contributions concurrently
      const contributionPromises = Array.from({ length: 20 }, (_, i) =>
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createDoingContribution({
            title: `Bulk Test Contribution ${i}`,
          }))
      );

      const responses = await Promise.all(contributionPromises);
      const createTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Check fulfillment mirrors were created
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      expect(fulfillmentResponse.body).toHaveLength(60); // 20 * 3 mirrors each

      // Performance check (adjust threshold as needed)
      expect(createTime).toBeLessThan(15000); // 15 seconds for 20 contributions

      console.log(`Created 20 contributions with mirrors in ${createTime}ms`);
    });

    it('should handle pagination for large datasets', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create multiple contributions
      await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          request(app.getHttpServer())
            .post('/contributions')
            .set(authHeaders)
            .send(TestDataFactory.createDoingContribution({
              title: `Pagination Test ${i}`,
            }))
        )
      );

      // Get all contributions
      const allResponse = await request(app.getHttpServer())
        .get('/contributions')
        .set(authHeaders)
        .expect(200);

      expect(allResponse.body).toHaveLength(10);

      // Test if pagination parameters are supported (if implemented)
      // This is a placeholder for when pagination is added
      const paginatedResponse = await request(app.getHttpServer())
        .get('/contributions?limit=5&offset=0')
        .set(authHeaders);

      // If pagination is not implemented, this will return all results
      // If implemented, it should return only 5
      expect(paginatedResponse.status).toBe(200);
    });
  });

  describe('Data Consistency Integration', () => {
    it('should maintain consistency across rapid updates', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contribution
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution());

      const contributionId = createResponse.body.id;

      // Perform rapid sequential updates
      const updates = [
        { title: 'Update 1', description: 'Description 1' },
        { title: 'Update 2', description: 'Description 2' },
        { title: 'Update 3', description: 'Description 3' },
        { title: 'Final Update', description: 'Final Description' },
      ];

      for (const update of updates) {
        await request(app.getHttpServer())
          .put(`/contributions/${contributionId}`)
          .set(authHeaders)
          .send(update)
          .expect(200);
      }

      // Verify final state is consistent
      const getResponse = await request(app.getHttpServer())
        .get(`/contributions/${contributionId}`)
        .set(authHeaders)
        .expect(200);

      expect(getResponse.body.title).toBe('Final Update');

      // Verify all mirrors have consistent state
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const mirrors = fulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contributionId
      );

      const titles = [...new Set(mirrors.map((m: any) => m.title))];
      expect(titles).toHaveLength(1);
      expect(titles[0]).toBe('Final Update');
    });

    it('should handle concurrent user operations', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contributions concurrently that might affect shared resources
      const concurrentCreates = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createDoingContribution({
            title: `Concurrent Test ${i}`,
          }))
      );

      const responses = await Promise.all(concurrentCreates);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify data integrity
      const contributionsResponse = await request(app.getHttpServer())
        .get('/contributions')
        .set(authHeaders)
        .expect(200);

      expect(contributionsResponse.body).toHaveLength(10);

      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      expect(fulfillmentResponse.body).toHaveLength(30); // 10 * 3 mirrors each
    });
  });

  describe('Cross-Module Integration', () => {
    it('should integrate with fulfillment module correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contribution
      const contribution = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution())
        .expect(201);

      // Get fulfillment entries via fulfillment endpoint
      const fulfillmentResponse = await request(app.getHttpServer())
        .get('/fulfillment')
        .set(authHeaders)
        .expect(200);

      const contributionMirrors = fulfillmentResponse.body.filter(
        (entry: any) => entry.sourceId === contribution.body.id
      );

      // Should be able to filter by life area if supported
      const workPurposeArea = await prisma.lifeAreaCanonical.findFirst({
        where: { slug: 'work-purpose' }
      });

      if (workPurposeArea) {
        const filteredResponse = await request(app.getHttpServer())
          .get(`/fulfillment?lifeAreaId=${workPurposeArea.id}`)
          .set(authHeaders);

        if (filteredResponse.status === 200) {
          const filteredEntries = filteredResponse.body.filter(
            (entry: any) => entry.sourceId === contribution.body.id
          );
          expect(filteredEntries).toHaveLength(1);
          expect(filteredEntries[0].lifeArea.slug).toBe('work-purpose');
        }
      }
    });

    it('should integrate with audit logging', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create, update, and delete contribution
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution())
        .expect(201);

      const contributionId = createResponse.body.id;

      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ title: 'Updated for Audit' })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/contributions/${contributionId}`)
        .set(authHeaders)
        .expect(200);

      // Verify audit logs were created
      const auditLogs = await testSetup.getAuditLogs(contributionId);
      expect(auditLogs.length).toBeGreaterThanOrEqual(3);

      const eventTypes = auditLogs.map(log => log.eventType);
      expect(eventTypes).toContain('contribution_mirrored');
      expect(eventTypes).toContain('contribution_updated');
      expect(eventTypes).toContain('contribution_deleted');
    });
  });
});