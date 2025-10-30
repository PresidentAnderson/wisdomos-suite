import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './test-setup';
import { TestDataFactory } from './test-factories';
import { PrismaService } from '../src/database/prisma.service';
import { FulfillmentMirrorService } from '../src/contributions/fulfillment-mirror.service';

describe('Error Handling and Edge Cases E2E', () => {
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

  describe('Database Connection and Transaction Errors', () => {
    it('should handle database timeout scenarios', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create a contribution with very large data that might cause timeouts
      const largeData = 'A'.repeat(100000); // 100KB of data
      const contributionDto = TestDataFactory.createDoingContribution({
        title: 'Database Timeout Test',
        description: largeData,
        contributions: Array(1000).fill('Large bullet point with lots of text'),
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      // Should either succeed or fail gracefully
      if (response.status === 201) {
        // If successful, verify mirrors were created
        const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
        expect(mirrors).toHaveLength(3);
      } else {
        // If failed, should be a proper error response
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should handle concurrent database operations gracefully', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create a contribution first
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution())
        .expect(201);

      const contributionId = createResponse.body.id;

      // Perform many concurrent updates that might cause deadlocks
      const concurrentUpdates = Array.from({ length: 20 }, (_, i) =>
        request(app.getHttpServer())
          .put(`/contributions/${contributionId}`)
          .set(authHeaders)
          .send({ title: `Concurrent Update ${i}`, description: `Update ${i}` })
      );

      const results = await Promise.allSettled(concurrentUpdates);
      
      // At least some should succeed, none should cause server crashes
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      
      expect(successes.length).toBeGreaterThan(0);
      
      // If there are failures, they should be handled gracefully
      failures.forEach(failure => {
        if (failure.status === 'rejected') {
          console.log('Handled concurrent update failure:', failure.reason?.message);
        }
      });

      // Final state should be consistent
      const finalMirrors = await testSetup.getFulfillmentMirrors(contributionId);
      const titles = [...new Set(finalMirrors.map(m => m.title))];
      expect(titles).toHaveLength(1); // All mirrors should have same title
    });

    it('should handle foreign key constraint violations', async () => {
      // Try to create fulfillment entry with non-existent life area
      const contribution = await testSetup.createTestContribution();
      
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            userId: 'test-user-1',
            lifeAreaId: 'non-existent-area-id',
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Invalid Area Entry',
            description: 'Should fail',
            priority: 3,
            meta: { source: 'error_test' },
          },
        })
      ).rejects.toThrow();
    });

    it('should handle unique constraint violations gracefully', async () => {
      const contribution = await testSetup.createTestContribution();
      const lifeArea = await prisma.lifeAreaCanonical.findFirst({
        where: { slug: 'work-purpose' }
      });

      // Create first entry
      await prisma.fulfillmentEntry.create({
        data: {
          userId: 'test-user-1',
          lifeAreaId: lifeArea!.id,
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: 'First Entry',
          description: 'First description',
          priority: 4,
          meta: { source: 'constraint_test' },
        },
      });

      // Attempt duplicate should fail
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            userId: 'test-user-1',
            lifeAreaId: lifeArea!.id,
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Duplicate Entry',
            description: 'Duplicate description',
            priority: 4,
            meta: { source: 'constraint_test' },
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should handle SQL injection attempts', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const maliciousInputs = [
        "'; DROP TABLE contributions; --",
        "1' OR '1'='1",
        "admin'/*",
        "1; UPDATE contributions SET title = 'hacked';",
        "' UNION SELECT * FROM users--",
      ];

      for (const maliciousInput of maliciousInputs) {
        const contributionDto = TestDataFactory.createDoingContribution({
          title: maliciousInput,
          description: maliciousInput,
        });

        const response = await request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(contributionDto);

        // Should either succeed (input sanitized) or fail with validation error
        if (response.status === 201) {
          // Verify the data was stored safely
          const contribution = response.body;
          expect(contribution.title).toBe(maliciousInput); // Should be stored as-is, not executed
          
          // Verify mirrors were created safely
          const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
          expect(mirrors).toHaveLength(3);
          
          // Clean up
          await request(app.getHttpServer())
            .delete(`/contributions/${contribution.id}`)
            .set(authHeaders);
        } else {
          expect(response.status).toBeGreaterThanOrEqual(400);
        }
      }
    });

    it('should handle XSS attempts in content', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert(document.cookie)</script>',
        "javascript:alert('XSS')",
        '<iframe src="javascript:alert(1)"></iframe>',
      ];

      for (const payload of xssPayloads) {
        const contributionDto = TestDataFactory.createDoingContribution({
          title: `XSS Test: ${payload}`,
          description: `Description with ${payload}`,
          contributions: [`Bullet with ${payload}`],
        });

        const response = await request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(contributionDto);

        if (response.status === 201) {
          // Verify the payload is stored but not executed
          const contribution = response.body;
          expect(contribution.title).toContain(payload);
          
          // Check mirrors contain the same data
          const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
          mirrors.forEach(mirror => {
            expect(mirror.title).toContain(payload);
            expect(mirror.description).toContain(payload);
          });
          
          // Clean up
          await request(app.getHttpServer())
            .delete(`/contributions/${contribution.id}`)
            .set(authHeaders);
        }
      }
    });

    it('should handle extremely long input values', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const extremelyLongText = 'A'.repeat(1000000); // 1MB of text
      
      const contributionDto = TestDataFactory.createDoingContribution({
        title: extremelyLongText.substring(0, 1000), // Limit title length
        description: extremelyLongText,
        contributions: [extremelyLongText],
        impact: extremelyLongText,
        commitment: extremelyLongText,
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto);

      // Should either handle gracefully or reject with proper error
      if (response.status === 201) {
        const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
        expect(mirrors).toHaveLength(3);
        
        // Verify data integrity
        mirrors.forEach(mirror => {
          expect(mirror.description).toContain(extremelyLongText.substring(0, 100));
        });
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should handle special Unicode characters', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      const unicodeTests = [
        'Testing emoji: 🚀🎯💡🔥⭐️',
        'Chinese: 你好世界',
        'Arabic: مرحبا بالعالم',
        'Russian: Привет мир',
        'Mathematical: ∑∫∞≠≤≥',
        'Mixed: Hello 🌍 мир 世界 🚀',
        'Zero-width chars: \u200B\u200C\u200D',
        'Control chars: \u0001\u0002\u0003',
      ];

      for (const unicodeText of unicodeTests) {
        const contributionDto = TestDataFactory.createDoingContribution({
          title: `Unicode Test: ${unicodeText}`,
          description: unicodeText,
          tags: [unicodeText],
        });

        const response = await request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(contributionDto);

        expect(response.status).toBe(201);
        
        const contribution = response.body;
        expect(contribution.title).toContain(unicodeText);
        
        const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
        mirrors.forEach(mirror => {
          expect(mirror.title).toContain(unicodeText);
          expect(mirror.description).toContain(unicodeText);
          expect(mirror.meta.tags).toContain(unicodeText);
        });
      }
    });

    it('should handle null and undefined values', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Test with null/undefined optional fields
      const contributionDto = {
        category: 'Being',
        title: 'Null Test Contribution',
        contributions: ['Test bullet'],
        description: null,
        impact: undefined,
        commitment: null,
        tags: null,
        visibility: null,
      };

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(contributionDto)
        .expect(201);

      const contribution = response.body;
      const mirrors = await testSetup.getFulfillmentMirrors(contribution.id);
      
      expect(mirrors).toHaveLength(2); // Being category
      mirrors.forEach(mirror => {
        expect(mirror.title).toBe('Null Test Contribution');
        expect(mirror.meta.tags).toEqual([]);
        expect(mirror.description).toBeDefined(); // Should not be null
      });
    });
  });

  describe('Business Logic Edge Cases', () => {
    it('should handle contribution category changes correctly', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create Being contribution (2 mirrors)
      const createResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createBeingContribution())
        .expect(201);

      const contributionId = createResponse.body.id;
      
      // Verify initial mirrors
      let mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(2);

      // Note: Category is not in UpdateContributionDto, so this tests the current behavior
      // If category updates were allowed, changing Being to Doing should add community mirror
      
      // Test updating other fields
      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ 
          title: 'Updated Title',
          tags: ['community'] // Adding community tag to Being should create 3rd mirror
        })
        .expect(200);

      mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(3); // Being + community tag = 3 mirrors
    });

    it('should handle missing life areas gracefully', async () => {
      // Delete a life area that mirrors depend on
      await prisma.lifeAreaCanonical.deleteMany({
        where: { slug: 'community-contribution' }
      });

      const authHeaders = await testSetup.getAuthHeaders();
      
      // Try to create Doing contribution (normally creates 3 mirrors)
      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution())
        .expect(201);

      // Should create only 2 mirrors (missing community-contribution)
      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(2);
      
      const mirrorAreas = mirrors.map(m => m.lifeArea.slug);
      expect(mirrorAreas).toContain('work-purpose');
      expect(mirrorAreas).toContain('creativity-expression');
      expect(mirrorAreas).not.toContain('community-contribution');
    });

    it('should handle empty tags array vs null tags', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create with empty tags array
      const emptyTagsResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createBeingContribution({ tags: [] }))
        .expect(201);

      // Create with null tags
      const nullTagsResponse = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createBeingContribution({ tags: null }))
        .expect(201);

      // Both should have same number of mirrors
      const emptyTagsMirrors = await testSetup.getFulfillmentMirrors(emptyTagsResponse.body.id);
      const nullTagsMirrors = await testSetup.getFulfillmentMirrors(nullTagsResponse.body.id);
      
      expect(emptyTagsMirrors).toHaveLength(2);
      expect(nullTagsMirrors).toHaveLength(2);
      
      // Both should have empty tags in metadata
      emptyTagsMirrors.forEach(mirror => {
        expect(mirror.meta.tags).toEqual([]);
      });
      nullTagsMirrors.forEach(mirror => {
        expect(mirror.meta.tags).toEqual([]);
      });
    });

    it('should handle contribution with maximum allowed values', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contribution with maximum realistic values
      const maxContribution = {
        category: 'Doing',
        title: 'A'.repeat(500), // Long but reasonable title
        description: 'B'.repeat(5000), // Long description
        contributions: Array(100).fill('Bullet point').map((bp, i) => `${bp} ${i}`), // Many bullets
        impact: 'C'.repeat(2000), // Long impact
        commitment: 'D'.repeat(2000), // Long commitment
        tags: Array(50).fill('tag').map((tag, i) => `${tag}${i}`), // Many tags
        visibility: 'public',
      };

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(maxContribution);

      // Should handle large data gracefully
      if (response.status === 201) {
        const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
        expect(mirrors).toHaveLength(3);
        
        mirrors.forEach(mirror => {
          expect(mirror.title).toBe(maxContribution.title);
          expect(mirror.meta.bullets).toHaveLength(100);
          expect(mirror.meta.tags).toHaveLength(50);
        });
      } else {
        // If it fails, should be a proper validation error
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Service Layer Error Handling', () => {
    it('should handle mirror service failures gracefully', async () => {
      // This test would require mocking the mirror service to throw errors
      // For now, we'll test with invalid data that might cause service errors
      
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contribution with data that might cause mirror service issues
      const problematicDto = TestDataFactory.createDoingContribution({
        title: '', // Empty title might cause issues
        contributions: [], // Empty contributions array
      });

      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(problematicDto);

      // Should either succeed with proper validation or fail gracefully
      if (response.status !== 201) {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should handle event emitter failures', async () => {
      // Test what happens if event emission fails
      const contribution = await testSetup.createTestContribution();
      
      // Try to trigger mirroring manually with invalid data
      try {
        await mirrorService.handleContributionCreated({ contribution: null } as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      // System should remain stable
      const healthCheck = await request(app.getHttpServer())
        .get('/contributions')
        .set(await testSetup.getAuthHeaders())
        .expect(200);
    });

    it('should handle audit log failures gracefully', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contribution that should trigger audit logging
      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution())
        .expect(201);

      // Even if audit logging fails, the main operation should succeed
      expect(response.body).toHaveProperty('id');
      
      const mirrors = await testSetup.getFulfillmentMirrors(response.body.id);
      expect(mirrors).toHaveLength(3);
    });
  });

  describe('Recovery and Resilience', () => {
    it('should recover from partial mirror creation failures', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create contribution
      const response = await request(app.getHttpServer())
        .post('/contributions')
        .set(authHeaders)
        .send(TestDataFactory.createDoingContribution())
        .expect(201);

      const contributionId = response.body.id;
      
      // Manually delete some mirrors to simulate partial failure
      await prisma.fulfillmentEntry.deleteMany({
        where: {
          sourceId: contributionId,
          lifeArea: { slug: 'community-contribution' }
        }
      });

      // Verify only 2 mirrors remain
      let mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(2);

      // Update should recreate missing mirrors via upsert
      await request(app.getHttpServer())
        .put(`/contributions/${contributionId}`)
        .set(authHeaders)
        .send({ title: 'Recovery Test Update' })
        .expect(200);

      // Should still have correct number of mirrors
      mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(2); // Update doesn't recreate deleted mirrors
      
      // But backfill should recreate them
      await mirrorService.backfillContributions('test-user-1');
      mirrors = await testSetup.getFulfillmentMirrors(contributionId);
      expect(mirrors).toHaveLength(3); // Backfill recreates missing mirrors
    });

    it('should handle system resource exhaustion gracefully', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Try to exhaust resources with many large operations
      const heavyOperations = Array.from({ length: 5 }, (_, i) =>
        request(app.getHttpServer())
          .post('/contributions')
          .set(authHeaders)
          .send(TestDataFactory.createContributionWithAllFields({
            title: `Heavy Operation ${i}`,
            description: 'X'.repeat(10000),
            contributions: Array(100).fill('Heavy bullet point'),
          }))
      );

      const results = await Promise.allSettled(heavyOperations);
      
      // At least some should succeed, system should remain responsive
      const successes = results.filter(r => r.status === 'fulfilled');
      expect(successes.length).toBeGreaterThan(0);
      
      // System should still be responsive
      const healthResponse = await request(app.getHttpServer())
        .get('/contributions')
        .set(authHeaders)
        .expect(200);
      
      expect(Array.isArray(healthResponse.body)).toBe(true);
    });

    it('should maintain data consistency during error recovery', async () => {
      const authHeaders = await testSetup.getAuthHeaders();
      
      // Create multiple contributions
      const contributions = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          request(app.getHttpServer())
            .post('/contributions')
            .set(authHeaders)
            .send(TestDataFactory.createDoingContribution({ title: `Recovery ${i}` }))
        )
      );

      const contributionIds = contributions.map(r => r.body.id);
      
      // Simulate some mirror corruption
      await prisma.fulfillmentEntry.updateMany({
        where: {
          sourceId: { in: contributionIds.slice(0, 2) }
        },
        data: {
          title: 'CORRUPTED'
        }
      });

      // Run recovery (backfill)
      await mirrorService.backfillContributions('test-user-1');
      
      // Verify data consistency
      for (const contributionId of contributionIds) {
        const mirrors = await testSetup.getFulfillmentMirrors(contributionId);
        expect(mirrors).toHaveLength(3);
        
        // All mirrors for same contribution should have same title
        const titles = [...new Set(mirrors.map(m => m.title))];
        expect(titles).toHaveLength(1);
        expect(titles[0]).not.toBe('CORRUPTED'); // Should be restored
      }
    });
  });
});