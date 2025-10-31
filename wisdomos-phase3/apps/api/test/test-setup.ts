import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/database/prisma.service';
import { AppModule } from '../src/app.module';

export class TestSetup {
  public app: INestApplication;
  public prisma: PrismaService;
  private module: TestingModule;

  async beforeAll() {
    this.module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = this.module.createNestApplication();
    this.prisma = this.module.get<PrismaService>(PrismaService);
    
    await this.app.init();
    await this.cleanDatabase();
    await this.seedTestData();
  }

  async afterAll() {
    await this.cleanDatabase();
    await this.app.close();
  }

  async beforeEach() {
    // Clean contribution and fulfillment data between tests
    await this.prisma.fulfillmentEntry.deleteMany({});
    await this.prisma.contribution.deleteMany({});
    await this.prisma.auditLog.deleteMany({});
  }

  private async cleanDatabase() {
    const tablenames = await this.prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  }

  private async seedTestData() {
    // Create test user
    await this.prisma.user.create({
      data: {
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'test-hash',
      },
    });

    // Create life areas
    const lifeAreas = [
      { id: 'area-1', slug: 'work-purpose', name: 'Work & Purpose' },
      { id: 'area-2', slug: 'creativity-expression', name: 'Creativity & Expression' },
      { id: 'area-3', slug: 'community-contribution', name: 'Community & Contribution' },
      { id: 'area-4', slug: 'health-vitality', name: 'Health & Vitality' },
      { id: 'area-5', slug: 'relationships-love', name: 'Relationships & Love' },
    ];

    for (const area of lifeAreas) {
      await this.prisma.lifeAreaCanonical.create({
        data: area,
      });
    }
  }

  // Test user authentication helper
  async getAuthHeaders(): Promise<{ Authorization: string }> {
    // Mock JWT token for test user
    const token = 'Bearer test-token';
    return { Authorization: token };
  }

  // Create test contribution helper
  async createTestContribution(overrides: any = {}) {
    return this.prisma.contribution.create({
      data: {
        userId: 'test-user-1',
        category: 'Doing',
        title: 'Test Contribution',
        description: 'Test description',
        contributions: ['Test bullet 1', 'Test bullet 2'],
        impact: 'Test impact',
        commitment: 'Test commitment',
        tags: [],
        visibility: 'private',
        ...overrides,
      },
    });
  }

  // Check fulfillment mirrors helper
  async getFulfillmentMirrors(contributionId: string) {
    return this.prisma.fulfillmentEntry.findMany({
      where: {
        sourceType: 'contribution',
        sourceId: contributionId,
      },
      include: {
        lifeArea: true,
      },
    });
  }

  // Check audit logs helper
  async getAuditLogs(entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}