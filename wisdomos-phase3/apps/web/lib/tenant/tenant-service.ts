import { PrismaClient, Tenant, TenantPlan, TenantStatus, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface CreateTenantInput {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerName?: string;
  plan?: TenantPlan;
}

export interface TenantWithUsage extends Tenant {
  userCount: number;
  storageUsed: number;
  storageLimit: number;
}

export class TenantService {
  /**
   * Create a new tenant with an owner user
   */
  static async createTenant(input: CreateTenantInput): Promise<{
    tenant: Tenant;
    user: any;
  }> {
    const { name, slug, ownerEmail, ownerPassword, ownerName, plan = TenantPlan.FREE } = input;

    // Check if slug is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new Error('Tenant slug already exists');
    }

    // Hash the password
    const passwordHash = await hash(ownerPassword, 12);

    // Create tenant and owner user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          plan,
          status: TenantStatus.ACTIVE,
          billingEmail: ownerEmail,
          trialEndsAt: plan === TenantPlan.FREE ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
          features: this.getFeaturesForPlan(plan),
          maxUsers: this.getMaxUsersForPlan(plan),
          maxStorage: this.getMaxStorageForPlan(plan),
        },
      });

      // Create the owner user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: ownerEmail,
          name: ownerName,
          passwordHash,
          role: UserRole.OWNER,
          isOwner: true,
        },
      });

      // Log the tenant creation
      await tx.tenantAuditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: 'TENANT_CREATED',
          resource: 'tenant',
          resourceId: tenant.id,
          metadata: { plan, ownerEmail },
        },
      });

      return { tenant, user };
    });

    return result;
  }

  /**
   * Get tenant by slug (for subdomain routing)
   */
  static async getTenantBySlug(slug: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { slug },
    });
  }

  /**
   * Get tenant by ID
   */
  static async getTenantById(id: string): Promise<Tenant | null> {
    return prisma.tenant.findUnique({
      where: { id },
    });
  }

  /**
   * Get tenant with usage statistics
   */
  static async getTenantWithUsage(tenantId: string): Promise<TenantWithUsage | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tenant) return null;

    return {
      ...tenant,
      userCount: tenant._count.users,
      storageUsed: Number(tenant.currentStorage),
      storageLimit: Number(tenant.maxStorage),
    };
  }

  /**
   * Update tenant plan
   */
  static async updateTenantPlan(
    tenantId: string,
    plan: TenantPlan,
    stripeSubscriptionId?: string
  ): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id: tenantId },
      data: {
        plan,
        stripeSubscriptionId,
        features: this.getFeaturesForPlan(plan),
        maxUsers: this.getMaxUsersForPlan(plan),
        maxStorage: this.getMaxStorageForPlan(plan),
      },
    });
  }

  /**
   * Suspend a tenant
   */
  static async suspendTenant(tenantId: string, reason?: string): Promise<Tenant> {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: TenantStatus.SUSPENDED,
      },
    });

    // Log the suspension
    await prisma.tenantAuditLog.create({
      data: {
        tenantId,
        action: 'TENANT_SUSPENDED',
        resource: 'tenant',
        resourceId: tenantId,
        metadata: { reason },
      },
    });

    return tenant;
  }

  /**
   * Reactivate a suspended tenant
   */
  static async reactivateTenant(tenantId: string): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: TenantStatus.ACTIVE,
      },
    });
  }

  /**
   * Delete a tenant (soft delete)
   */
  static async deleteTenant(tenantId: string): Promise<Tenant> {
    return prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: TenantStatus.CANCELLED,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Check if a tenant has access to a feature
   */
  static async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { features: true },
    });

    return tenant?.features.includes(feature) || false;
  }

  /**
   * Update tenant storage usage
   */
  static async updateStorageUsage(tenantId: string, bytesUsed: bigint): Promise<void> {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        currentStorage: bytesUsed,
      },
    });
  }

  /**
   * Check if tenant can add more users
   */
  static async canAddUser(tenantId: string): Promise<boolean> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!tenant) return false;

    return tenant._count.users < tenant.maxUsers;
  }

  /**
   * Get features for a plan
   */
  private static getFeaturesForPlan(plan: TenantPlan): string[] {
    const features: Record<TenantPlan, string[]> = {
      [TenantPlan.FREE]: ['basic_journal', 'life_areas', 'basic_badges'],
      [TenantPlan.STARTER]: [
        'basic_journal',
        'life_areas',
        'basic_badges',
        'ai_reframing',
        'advanced_analytics',
        'email_support',
      ],
      [TenantPlan.PROFESSIONAL]: [
        'basic_journal',
        'life_areas',
        'basic_badges',
        'ai_reframing',
        'advanced_analytics',
        'email_support',
        'api_access',
        'custom_branding',
        'priority_support',
        'team_collaboration',
      ],
      [TenantPlan.ENTERPRISE]: [
        'basic_journal',
        'life_areas',
        'basic_badges',
        'ai_reframing',
        'advanced_analytics',
        'email_support',
        'api_access',
        'custom_branding',
        'priority_support',
        'team_collaboration',
        'sso',
        'audit_logs',
        'custom_domain',
        'dedicated_support',
        'sla',
      ],
    };

    return features[plan];
  }

  /**
   * Get max users for a plan
   */
  private static getMaxUsersForPlan(plan: TenantPlan): number {
    const limits: Record<TenantPlan, number> = {
      [TenantPlan.FREE]: 1,
      [TenantPlan.STARTER]: 5,
      [TenantPlan.PROFESSIONAL]: 20,
      [TenantPlan.ENTERPRISE]: 999999,
    };

    return limits[plan];
  }

  /**
   * Get max storage for a plan (in bytes)
   */
  private static getMaxStorageForPlan(plan: TenantPlan): bigint {
    const limits: Record<TenantPlan, bigint> = {
      [TenantPlan.FREE]: BigInt(1 * 1024 * 1024 * 1024), // 1GB
      [TenantPlan.STARTER]: BigInt(10 * 1024 * 1024 * 1024), // 10GB
      [TenantPlan.PROFESSIONAL]: BigInt(100 * 1024 * 1024 * 1024), // 100GB
      [TenantPlan.ENTERPRISE]: BigInt(1024 * 1024 * 1024 * 1024), // 1TB
    };

    return limits[plan];
  }

  /**
   * Create tenant invitation
   */
  static async createInvitation(
    tenantId: string,
    email: string,
    role: UserRole = UserRole.MEMBER
  ): Promise<any> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    return prisma.tenantInvitation.create({
      data: {
        tenantId,
        email,
        role,
        expiresAt,
        token: uuidv4(),
      },
    });
  }

  /**
   * Accept tenant invitation
   */
  static async acceptInvitation(
    token: string,
    password: string,
    name?: string
  ): Promise<{ tenant: Tenant; user: any }> {
    const invitation = await prisma.tenantInvitation.findUnique({
      where: { token },
      include: { tenant: true },
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.acceptedAt) {
      throw new Error('Invitation already accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation expired');
    }

    const passwordHash = await hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          tenantId: invitation.tenantId,
          email: invitation.email,
          name,
          passwordHash,
          role: invitation.role,
          isOwner: false,
        },
      });

      // Mark invitation as accepted
      await tx.tenantInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
      });

      // Log the user creation
      await tx.tenantAuditLog.create({
        data: {
          tenantId: invitation.tenantId,
          userId: user.id,
          action: 'USER_INVITED',
          resource: 'user',
          resourceId: user.id,
        },
      });

      return { tenant: invitation.tenant, user };
    });

    return result;
  }
}