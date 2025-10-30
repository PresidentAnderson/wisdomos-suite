import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { db } from './db';
import { hashPassword as passwordHash, verifyPassword as passwordVerify } from './password-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string; // YYYY-MM-DD format for Life Calendar initialization
  avatar?: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  createdAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'free' | 'premium' | 'enterprise';
  settings: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
  members: TenantMember[];
}

export interface TenantMember {
  userId: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: Permission[];
  invitedAt: Date;
  joinedAt?: Date;
  invitedBy: string;
}

export interface Permission {
  resource: 'journal' | 'autobiography' | 'upset_inquiry' | 'contribution' | 'priority_matrix' | 'dashboard' | 'analytics';
  actions: ('read' | 'write' | 'delete' | 'share')[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'fr' | 'es';
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    categories: string[];
  };
  privacy: {
    shareData: boolean;
    publicProfile: boolean;
    allowAnalytics: boolean;
  };
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primaryColor: string;
    name: string;
  };
  features: {
    journalSharing: boolean;
    crossTenantAnalytics: boolean;
    publicDashboards: boolean;
    exportData: boolean;
  };
  security: {
    requireMFA: boolean;
    sessionTimeout: number;
    allowedDomains: string[];
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
}

export async function hashPassword(password: string): Promise<string> {
  return passwordHash(password);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return passwordVerify(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any) as string;
}

// Multi-tenant helpers
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substr(2, 6);
}

export function getDefaultPreferences(): UserPreferences {
  return {
    theme: 'system',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: true,
      push: true,
      categories: ['system', 'patterns', 'achievements']
    },
    privacy: {
      shareData: false,
      publicProfile: false,
      allowAnalytics: true
    }
  };
}

export function getAllPermissions(): Permission[] {
  const resources: Permission['resource'][] = [
    'journal', 'autobiography', 'upset_inquiry', 'contribution', 
    'priority_matrix', 'dashboard', 'analytics'
  ];
  
  return resources.map(resource => ({
    resource,
    actions: ['read', 'write', 'delete', 'share']
  }));
}

export function getDefaultTenantSettings(name: string): TenantSettings {
  return {
    branding: {
      primaryColor: '#FFD700',
      name
    },
    features: {
      journalSharing: true,
      crossTenantAnalytics: false,
      publicDashboards: false,
      exportData: true
    },
    security: {
      requireMFA: false,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      allowedDomains: [],
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      }
    }
  };
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<{ user: any; tenant?: any } | { error: string }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No authorization header' };
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return { error: 'Invalid token' };
    }

    // For now, use localStorage-based auth (in production, this would be database)
    if (typeof window !== 'undefined') {
      const user = getUserFromLocalStorage(payload.userId);
      const tenant = getTenantFromLocalStorage(payload.tenantId);
      
      if (!user) {
        return { error: 'User not found' };
      }

      return { user, tenant };
    }

    // Fallback to database if available
    // In frontend-only mode, we don't have real database
    return { error: 'Database not available in frontend-only mode' };
  } catch (error) {
    console.error('Auth error:', error);
    return { error: 'Authentication failed' };
  }
}

// Database-based user management with Supabase integration
import { userService, organizationService } from './database';

export async function getUserFromDatabase(userId: string): Promise<User | null> {
  const { data, error } = await userService.getUserById(userId);
  if (error || !data) return null;
  
  // Convert database format to User interface
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar || undefined,
    tenantId: data.organization_id, // Map organization_id back to tenantId
    role: data.role,
    createdAt: new Date(data.created_at),
    lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
    preferences: data.preferences as any // Cast from Json
  };
}

export async function getTenantFromDatabase(tenantId: string): Promise<Tenant | null> {
  const { data, error } = await organizationService.getOrganizationById(tenantId);
  if (error || !data) return null;
  
  // Convert database format to Tenant interface
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    ownerId: data.owner_id, // Map owner_id back to ownerId
    plan: data.plan,
    settings: data.settings as any, // Cast from Json
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    members: [] // This field doesn't exist in database, provide empty array
  };
}

export async function storeUserInDatabase(user: User): Promise<User | null> {
  // Check if user exists
  const existing = await getUserFromDatabase(user.id);
  
  // Convert to database format
  const userForDatabase = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || null,
    organization_id: user.tenantId, // Map tenantId to organization_id
    role: user.role,
    preferences: user.preferences as any, // Cast to Json compatible type
    created_at: user.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: user.lastLoginAt?.toISOString() || null
  };
  
  if (existing) {
    const { data, error } = await userService.updateUser(user.id, userForDatabase);
    if (error || !data) return null;
    
    // Convert database format back to User interface
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar || undefined,
      tenantId: data.organization_id,
      role: data.role,
      createdAt: new Date(data.created_at),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
      preferences: data.preferences as any
    };
  } else {
    const { data, error } = await userService.createUser(userForDatabase);
    if (error || !data) return null;
    
    // Convert database format back to User interface
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar || undefined,
      tenantId: data.organization_id,
      role: data.role,
      createdAt: new Date(data.created_at),
      lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
      preferences: data.preferences as any
    };
  }
}

export async function storeTenantInDatabase(tenant: Tenant): Promise<Tenant | null> {
  // Check if organization exists
  const existing = await getTenantFromDatabase(tenant.id);
  
  // Convert to database format
  const tenantForDatabase = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    owner_id: tenant.ownerId, // Map ownerId to owner_id
    plan: tenant.plan,
    settings: tenant.settings as any, // Cast to Json compatible type
    created_at: tenant.createdAt?.toISOString() || new Date().toISOString(),
    updated_at: tenant.updatedAt?.toISOString() || new Date().toISOString()
  };
  
  if (existing) {
    const { data, error } = await organizationService.updateOrganization(tenant.id, tenantForDatabase);
    if (error || !data) return null;
    
    // Convert database format back to Tenant interface
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      ownerId: data.owner_id,
      plan: data.plan,
      settings: data.settings as any,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      members: []
    };
  } else {
    const { data, error } = await organizationService.createOrganization(tenantForDatabase);
    if (error || !data) return null;
    
    // Convert database format back to Tenant interface
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      ownerId: data.owner_id,
      plan: data.plan,
      settings: data.settings as any,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      members: []
    };
  }
}

export async function getAllUsersFromDatabase(organizationId?: string): Promise<User[]> {
  if (organizationId) {
    const { data, error } = await userService.getUsersByOrganization(organizationId);
    if (error || !data) return [];
    
    // Convert database format to User interface array
    return data.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      tenantId: user.organization_id, // Map organization_id back to tenantId
      role: user.role,
      createdAt: new Date(user.created_at),
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined,
      preferences: user.preferences as any // Cast from Json
    }));
  }
  return [];
}

export async function getUserByEmailFromDatabase(email: string): Promise<User | null> {
  const { data, error } = await userService.getUserByEmail(email);
  if (error || !data) return null;
  
  // Convert database format to User interface
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar || undefined,
    tenantId: data.organization_id, // Map organization_id back to tenantId
    role: data.role,
    createdAt: new Date(data.created_at),
    lastLoginAt: data.last_login_at ? new Date(data.last_login_at) : undefined,
    preferences: data.preferences as any // Cast from Json
  };
}

export async function getTenantBySlugFromDatabase(slug: string): Promise<Tenant | null> {
  const { data, error } = await organizationService.getOrganizationBySlug(slug);
  if (error || !data) return null;
  
  // Convert database format to Tenant interface
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    ownerId: data.owner_id, // Map owner_id back to ownerId
    plan: data.plan,
    settings: data.settings as any, // Cast from Json
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    members: [] // This field doesn't exist in database, provide empty array
  };
}

// Backward compatibility functions (fallback to localStorage for migration period)
export function getUserFromLocalStorage(userId: string): User | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(`wisdomos_user_${userId}`);
  return stored ? JSON.parse(stored) : null;
}

export function getTenantFromLocalStorage(tenantId: string): Tenant | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(`wisdomos_tenant_${tenantId}`);
  return stored ? JSON.parse(stored) : null;
}

export function storeUserInLocalStorage(user: User): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(`wisdomos_user_${user.id}`, JSON.stringify(user));
  
  // Update user index
  const users = getAllUsersFromLocalStorage();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('wisdomos_users', JSON.stringify(users));
}

export function storeTenantInLocalStorage(tenant: Tenant): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(`wisdomos_tenant_${tenant.id}`, JSON.stringify(tenant));
  
  // Update tenant index
  const tenants = getAllTenantsFromLocalStorage();
  const existingIndex = tenants.findIndex(t => t.id === tenant.id);
  if (existingIndex >= 0) {
    tenants[existingIndex] = tenant;
  } else {
    tenants.push(tenant);
  }
  localStorage.setItem('wisdomos_tenants', JSON.stringify(tenants));
}

export function getAllUsersFromLocalStorage(): User[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('wisdomos_users');
  return stored ? JSON.parse(stored) : [];
}

export function getAllTenantsFromLocalStorage(): Tenant[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('wisdomos_tenants');
  return stored ? JSON.parse(stored) : [];
}

export function getUserByEmailFromLocalStorage(email: string): User | null {
  const users = getAllUsersFromLocalStorage();
  // Case-insensitive email comparison
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getTenantBySlugFromLocalStorage(slug: string): Tenant | null {
  const tenants = getAllTenantsFromLocalStorage();
  return tenants.find(t => t.slug === slug) || null;
}

// Middleware helper for API routes
export function withAuth(handler: (req: NextRequest, context: { user: any; tenant?: any }) => Promise<Response>) {
  return async (req: NextRequest) => {
    const authResult = await getUserFromRequest(req);
    
    if ('error' in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(req, { user: authResult.user, tenant: authResult.tenant });
  };
}

// Tenant-aware middleware helper
export function withTenantAuth(
  handler: (req: NextRequest, context: { user: any; tenant: any }) => Promise<Response>,
  requiredPermissions?: Permission[]
) {
  return async (req: NextRequest) => {
    const authResult = await getUserFromRequest(req);
    
    if ('error' in authResult) {
      return new Response(JSON.stringify({ error: authResult.error }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!authResult.tenant) {
      return new Response(JSON.stringify({ error: 'Tenant not found' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check permissions if required
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userMembership = authResult.tenant.members.find(
        (m: TenantMember) => m.userId === authResult.user.id
      );

      if (!userMembership) {
        return new Response(JSON.stringify({ error: 'User not a member of this tenant' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const hasPermission = requiredPermissions.every(required =>
        userMembership.role === 'owner' || 
        userMembership.permissions.some(p => 
          p.resource === required.resource && 
          required.actions.every(action => p.actions.includes(action))
        )
      );

      if (!hasPermission) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return handler(req, { user: authResult.user, tenant: authResult.tenant });
  };
}