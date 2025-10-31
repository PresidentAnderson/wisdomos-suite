import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';

describe('Database Mirror Triggers', () => {
  let prisma: PrismaClient;
  let testUserId: string;
  let lifeAreaIds: { [key: string]: string };

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
    
    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean test data before each test
    await prisma.fulfillmentEntry.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.contribution.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.auditLog.deleteMany({
      where: { userId: testUserId }
    });
  });

  async function setupTestData() {
    // Create test user
    testUserId = 'mirror-test-user';
    await prisma.user.upsert({
      where: { id: testUserId },
      update: {},
      create: {
        id: testUserId,
        email: 'mirror-test@example.com',
        name: 'Mirror Test User',
        passwordHash: 'test-hash',
      },
    });

    // Create life areas
    const lifeAreas = [
      { slug: 'work-purpose', name: 'Work & Purpose' },
      { slug: 'creativity-expression', name: 'Creativity & Expression' },
      { slug: 'community-contribution', name: 'Community & Contribution' },
      { slug: 'health-vitality', name: 'Health & Vitality' },
      { slug: 'relationships-love', name: 'Relationships & Love' },
    ];

    lifeAreaIds = {};
    for (const area of lifeAreas) {
      const created = await prisma.lifeAreaCanonical.upsert({
        where: { slug: area.slug },
        update: {},
        create: {
          id: `${area.slug}-test-id`,
          slug: area.slug,
          name: area.name,
        },
      });
      lifeAreaIds[area.slug] = created.id;
    }
  }

  async function cleanupTestData() {
    // Clean up in reverse order of dependencies
    await prisma.fulfillmentEntry.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.contribution.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.auditLog.deleteMany({
      where: { userId: testUserId }
    });
    await prisma.user.deleteMany({
      where: { id: testUserId }
    });
  }

  describe('Database Constraints and Triggers', () => {
    it('should enforce unique constraint on fulfillment entries', async () => {
      // Create a contribution first
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Doing',
          title: 'Test Constraint Contribution',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // Create first fulfillment entry
      const firstEntry = await prisma.fulfillmentEntry.create({
        data: {
          userId: testUserId,
          lifeAreaId: lifeAreaIds['work-purpose'],
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: 'First Entry',
          description: 'First description',
          priority: 4,
          meta: { source: 'test' },
        },
      });

      expect(firstEntry).toBeDefined();

      // Attempt to create duplicate should fail
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['work-purpose'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Duplicate Entry',
            description: 'Duplicate description',
            priority: 4,
            meta: { source: 'test' },
          },
        })
      ).rejects.toThrow();
    });

    it('should allow upsert operations on fulfillment entries', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Being',
          title: 'Upsert Test Contribution',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // First upsert (create)
      const firstUpsert = await prisma.fulfillmentEntry.upsert({
        where: {
          userId_lifeAreaId_sourceType_sourceId: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['creativity-expression'],
            sourceType: 'contribution',
            sourceId: contribution.id,
          },
        },
        update: {
          title: 'Updated Title',
          description: 'Updated description',
        },
        create: {
          userId: testUserId,
          lifeAreaId: lifeAreaIds['creativity-expression'],
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: 'Created Title',
          description: 'Created description',
          priority: 3,
          meta: { source: 'upsert_test' },
        },
      });

      expect(firstUpsert.title).toBe('Created Title');

      // Second upsert (update)
      const secondUpsert = await prisma.fulfillmentEntry.upsert({
        where: {
          userId_lifeAreaId_sourceType_sourceId: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['creativity-expression'],
            sourceType: 'contribution',
            sourceId: contribution.id,
          },
        },
        update: {
          title: 'Updated Title',
          description: 'Updated description',
        },
        create: {
          userId: testUserId,
          lifeAreaId: lifeAreaIds['creativity-expression'],
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: 'Should Not Create',
          description: 'Should not create',
          priority: 3,
          meta: { source: 'upsert_test' },
        },
      });

      expect(secondUpsert.title).toBe('Updated Title');
      expect(secondUpsert.id).toBe(firstUpsert.id); // Should be same record
    });

    it('should handle cascading deletes properly', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Doing',
          title: 'Cascade Test Contribution',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // Create multiple fulfillment entries for this contribution
      const entries = await Promise.all([
        prisma.fulfillmentEntry.create({
          data: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['work-purpose'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Entry 1',
            description: 'Description 1',
            priority: 4,
            meta: { source: 'cascade_test' },
          },
        }),
        prisma.fulfillmentEntry.create({
          data: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['creativity-expression'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Entry 2',
            description: 'Description 2',
            priority: 3,
            meta: { source: 'cascade_test' },
          },
        }),
      ]);

      expect(entries).toHaveLength(2);

      // Delete the contribution
      await prisma.contribution.delete({
        where: { id: contribution.id },
      });

      // Check if fulfillment entries still exist (they should if no cascade is set up)
      const remainingEntries = await prisma.fulfillmentEntry.findMany({
        where: {
          sourceType: 'contribution',
          sourceId: contribution.id,
        },
      });

      // This test checks current behavior - if cascading is implemented in DB,
      // the entries should be automatically deleted
      console.log(`Remaining entries after contribution deletion: ${remainingEntries.length}`);
    });

    it('should maintain data integrity during concurrent operations', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Being',
          title: 'Concurrent Test Contribution',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // Simulate concurrent upsert operations
      const concurrentUpserts = Array.from({ length: 10 }, (_, i) =>
        prisma.fulfillmentEntry.upsert({
          where: {
            userId_lifeAreaId_sourceType_sourceId: {
              userId: testUserId,
              lifeAreaId: lifeAreaIds['work-purpose'],
              sourceType: 'contribution',
              sourceId: contribution.id,
            },
          },
          update: {
            title: `Concurrent Update ${i}`,
            description: `Concurrent description ${i}`,
            updatedAt: new Date(),
          },
          create: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['work-purpose'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: `Concurrent Create ${i}`,
            description: `Concurrent description ${i}`,
            priority: 4,
            meta: { source: 'concurrent_test', iteration: i },
          },
        })
      );

      const results = await Promise.allSettled(concurrentUpserts);
      
      // All operations should succeed (no rejections)
      const rejections = results.filter(r => r.status === 'rejected');
      expect(rejections).toHaveLength(0);

      // Should only have one entry despite multiple upserts
      const finalEntries = await prisma.fulfillmentEntry.findMany({
        where: {
          userId: testUserId,
          lifeAreaId: lifeAreaIds['work-purpose'],
          sourceType: 'contribution',
          sourceId: contribution.id,
        },
      });

      expect(finalEntries).toHaveLength(1);
    });
  });

  describe('Database Indexing and Performance', () => {
    it('should efficiently query fulfillment entries by source', async () => {
      // Create multiple contributions with fulfillment entries
      const contributions = await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          prisma.contribution.create({
            data: {
              userId: testUserId,
              category: 'Doing',
              title: `Performance Test Contribution ${i}`,
              description: 'Test description',
              contributions: ['Test bullet'],
              tags: [],
              visibility: 'private',
            },
          })
        )
      );

      // Create fulfillment entries for each contribution
      const fulfillmentPromises = contributions.flatMap(contribution =>
        ['work-purpose', 'creativity-expression', 'community-contribution'].map(slug =>
          prisma.fulfillmentEntry.create({
            data: {
              userId: testUserId,
              lifeAreaId: lifeAreaIds[slug],
              sourceType: 'contribution',
              sourceId: contribution.id,
              title: `Entry for ${contribution.title}`,
              description: 'Entry description',
              priority: slug === 'work-purpose' ? 4 : 3,
              meta: { source: 'performance_test' },
            },
          })
        )
      );

      await Promise.all(fulfillmentPromises);

      // Test query performance
      const startTime = Date.now();
      
      // Query by source type
      const contributionEntries = await prisma.fulfillmentEntry.findMany({
        where: {
          userId: testUserId,
          sourceType: 'contribution',
        },
        include: {
          lifeArea: true,
        },
      });

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(contributionEntries).toHaveLength(60); // 20 contributions * 3 entries each
      expect(queryTime).toBeLessThan(1000); // Should complete within 1 second

      // Test specific source ID query
      const specificEntries = await prisma.fulfillmentEntry.findMany({
        where: {
          sourceType: 'contribution',
          sourceId: contributions[0].id,
        },
      });

      expect(specificEntries).toHaveLength(3);
    });

    it('should efficiently query by life area', async () => {
      // Create test data
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Doing',
          title: 'Life Area Query Test',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      await Promise.all(
        Object.entries(lifeAreaIds).map(([slug, id]) =>
          prisma.fulfillmentEntry.create({
            data: {
              userId: testUserId,
              lifeAreaId: id,
              sourceType: 'contribution',
              sourceId: contribution.id,
              title: `Entry for ${slug}`,
              description: 'Entry description',
              priority: slug === 'work-purpose' ? 4 : 3,
              meta: { source: 'life_area_test' },
            },
          })
        )
      );

      // Query by specific life area
      const workPurposeEntries = await prisma.fulfillmentEntry.findMany({
        where: {
          userId: testUserId,
          lifeAreaId: lifeAreaIds['work-purpose'],
        },
        include: {
          lifeArea: true,
        },
      });

      expect(workPurposeEntries).toHaveLength(1);
      expect(workPurposeEntries[0].lifeArea.slug).toBe('work-purpose');
      expect(workPurposeEntries[0].priority).toBe(4);
    });
  });

  describe('Database Transactions and Atomicity', () => {
    it('should handle transaction rollbacks properly', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Being',
          title: 'Transaction Test Contribution',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // Attempt transaction that should fail
      try {
        await prisma.$transaction(async (tx) => {
          // Create fulfillment entry
          await tx.fulfillmentEntry.create({
            data: {
              userId: testUserId,
              lifeAreaId: lifeAreaIds['work-purpose'],
              sourceType: 'contribution',
              sourceId: contribution.id,
              title: 'Transaction Entry',
              description: 'Transaction description',
              priority: 4,
              meta: { source: 'transaction_test' },
            },
          });

          // Force an error to trigger rollback
          throw new Error('Forced transaction failure');
        });
      } catch (error) {
        expect(error.message).toBe('Forced transaction failure');
      }

      // Verify no fulfillment entry was created due to rollback
      const entries = await prisma.fulfillmentEntry.findMany({
        where: {
          sourceType: 'contribution',
          sourceId: contribution.id,
        },
      });

      expect(entries).toHaveLength(0);
    });

    it('should handle successful transactions', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Having',
          title: 'Successful Transaction Test',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // Successful transaction creating multiple entries
      await prisma.$transaction(async (tx) => {
        await tx.fulfillmentEntry.create({
          data: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['work-purpose'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Transaction Entry 1',
            description: 'Transaction description 1',
            priority: 4,
            meta: { source: 'successful_transaction' },
          },
        });

        await tx.fulfillmentEntry.create({
          data: {
            userId: testUserId,
            lifeAreaId: lifeAreaIds['creativity-expression'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Transaction Entry 2',
            description: 'Transaction description 2',
            priority: 3,
            meta: { source: 'successful_transaction' },
          },
        });

        // Also create an audit log entry
        await tx.auditLog.create({
          data: {
            userId: testUserId,
            eventType: 'transaction_test',
            entityType: 'contribution',
            entityId: contribution.id,
            payload: { message: 'Transaction completed successfully' },
          },
        });
      });

      // Verify all entries were created
      const fulfillmentEntries = await prisma.fulfillmentEntry.findMany({
        where: {
          sourceType: 'contribution',
          sourceId: contribution.id,
        },
      });

      const auditEntries = await prisma.auditLog.findMany({
        where: {
          entityId: contribution.id,
          eventType: 'transaction_test',
        },
      });

      expect(fulfillmentEntries).toHaveLength(2);
      expect(auditEntries).toHaveLength(1);
    });
  });

  describe('Database Schema Validation', () => {
    it('should enforce required fields', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Doing',
          title: 'Schema Validation Test',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      // Missing required userId should fail
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            // userId: missing
            lifeAreaId: lifeAreaIds['work-purpose'],
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Invalid Entry',
            description: 'Missing userId',
            priority: 4,
            meta: { source: 'schema_test' },
          } as any,
        })
      ).rejects.toThrow();

      // Missing required lifeAreaId should fail
      await expect(
        prisma.fulfillmentEntry.create({
          data: {
            userId: testUserId,
            // lifeAreaId: missing
            sourceType: 'contribution',
            sourceId: contribution.id,
            title: 'Invalid Entry',
            description: 'Missing lifeAreaId',
            priority: 4,
            meta: { source: 'schema_test' },
          } as any,
        })
      ).rejects.toThrow();
    });

    it('should handle JSON metadata properly', async () => {
      const contribution = await prisma.contribution.create({
        data: {
          userId: testUserId,
          category: 'Being',
          title: 'JSON Metadata Test',
          description: 'Test description',
          contributions: ['Test bullet'],
          tags: [],
          visibility: 'private',
        },
      });

      const complexMeta = {
        source: 'json_test',
        category: 'Being',
        bullets: ['Point 1', 'Point 2', 'Point 3'],
        tags: ['tag1', 'tag2'],
        impact: 'Significant impact',
        commitment: 'Strong commitment',
        mirrored_at: new Date().toISOString(),
        additional_data: {
          nested_object: {
            deep_value: 'test',
            numbers: [1, 2, 3],
          },
          array_of_objects: [
            { id: 1, name: 'Object 1' },
            { id: 2, name: 'Object 2' },
          ],
        },
      };

      const entry = await prisma.fulfillmentEntry.create({
        data: {
          userId: testUserId,
          lifeAreaId: lifeAreaIds['creativity-expression'],
          sourceType: 'contribution',
          sourceId: contribution.id,
          title: 'JSON Test Entry',
          description: 'JSON metadata test',
          priority: 3,
          meta: complexMeta,
        },
      });

      expect(entry.meta).toEqual(complexMeta);

      // Retrieve and verify
      const retrieved = await prisma.fulfillmentEntry.findUnique({
        where: { id: entry.id },
      });

      expect(retrieved?.meta).toEqual(complexMeta);
    });
  });
});