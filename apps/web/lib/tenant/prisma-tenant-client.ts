import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage to maintain tenant context across async operations
export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

/**
 * Extended Prisma Client with automatic tenant filtering
 */
export function createTenantPrismaClient() {
  const prisma = new PrismaClient();

  return prisma.$extends({
    query: {
      // Automatically add tenantId to all queries for tenant-scoped models
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          const context = tenantContext.getStore();
          
          // Skip if no tenant context
          if (!context?.tenantId) {
            return query(args);
          }

          // List of models that should be tenant-scoped
          const tenantScopedModels = [
            'User',
            'LifeArea',
            'Journal',
            'Event',
            'Relationship',
            'Reset',
            'Badge',
            'Vault',
            'Audit',
          ];

          // Skip if model is not tenant-scoped
          if (!tenantScopedModels.includes(model)) {
            return query(args);
          }

          // Add tenant filtering based on operation
          if (operation === 'findMany' || operation === 'findFirst' || operation === 'findUnique') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'findUniqueOrThrow' || operation === 'findFirstOrThrow') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'create') {
            args.data = {
              ...args.data,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                tenantId: context.tenantId,
              }));
            } else {
              args.data = {
                ...args.data,
                tenantId: context.tenantId,
              };
            }
          }

          if (operation === 'update' || operation === 'updateMany') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'upsert') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
            args.create = {
              ...args.create,
              tenantId: context.tenantId,
            };
            args.update = {
              ...args.update,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'delete' || operation === 'deleteMany') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'count') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'aggregate') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          if (operation === 'groupBy') {
            args.where = {
              ...args.where,
              tenantId: context.tenantId,
            };
          }

          return query(args);
        },
      },
    },
  });
}

// Singleton instance
let tenantPrismaClient: ReturnType<typeof createTenantPrismaClient> | null = null;

/**
 * Get the tenant-aware Prisma client
 */
export function getTenantPrismaClient() {
  if (!tenantPrismaClient) {
    tenantPrismaClient = createTenantPrismaClient();
  }
  return tenantPrismaClient;
}

/**
 * Run a function with tenant context
 */
export async function withTenant<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  return tenantContext.run({ tenantId }, fn);
}

/**
 * Get current tenant ID from context
 */
export function getCurrentTenantId(): string | undefined {
  return tenantContext.getStore()?.tenantId;
}