/**
 * Organization-based Authentication Types
 *
 * Types for the organization-based multi-tenant authentication system
 * with automatic user onboarding based on email domains.
 */

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'free' | 'standard' | 'enterprise' | 'premium';
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface OnboardingEvent {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type:
    | 'user_assigned_to_org'
    | 'no_org_found_for_domain'
    | 'org_created'
    | 'role_assigned'
    | 'role_updated'
    | 'user_invited'
    | 'user_removed';
  event_data: Record<string, any>;
  created_at: string;
}

export interface UserWithOrganization {
  id: string;
  email: string;
  organizations: Array<{
    organization: Organization;
    role: UserRole['role'];
  }>;
}

export interface OrganizationWithMembers {
  organization: Organization;
  members: Array<{
    user_id: string;
    email: string;
    role: UserRole['role'];
    joined_at: string;
  }>;
  total_members: number;
}

// Request/Response types for API endpoints

export interface CreateOrganizationRequest {
  name: string;
  domain: string;
  plan?: Organization['plan'];
}

export interface UpdateOrganizationRequest {
  name?: string;
  plan?: Organization['plan'];
  status?: Organization['status'];
}

export interface AssignRoleRequest {
  user_id: string;
  organization_id: string;
  role: UserRole['role'];
}

export interface UpdateRoleRequest {
  role: UserRole['role'];
}

// Utility types

export type OrganizationRole = UserRole['role'];
export type OrganizationPlan = Organization['plan'];
export type OrganizationStatus = Organization['status'];
export type OnboardingEventType = OnboardingEvent['event_type'];

// Permission helper types

export interface OrganizationPermissions {
  canManageOrganization: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canViewAnalytics: boolean;
  canManageBilling: boolean;
}

export const rolePermissions: Record<OrganizationRole, OrganizationPermissions> = {
  owner: {
    canManageOrganization: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canViewAnalytics: true,
    canManageBilling: true,
  },
  admin: {
    canManageOrganization: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canViewAnalytics: true,
    canManageBilling: false,
  },
  member: {
    canManageOrganization: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canViewAnalytics: false,
    canManageBilling: false,
  },
  viewer: {
    canManageOrganization: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canViewAnalytics: false,
    canManageBilling: false,
  },
};

export function hasPermission(
  role: OrganizationRole,
  permission: keyof OrganizationPermissions
): boolean {
  return rolePermissions[role][permission];
}

// Database query result types

export interface OrganizationQueryResult {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserRoleQueryResult {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface OnboardingEventQueryResult {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  event_type: string;
  event_data: any;
  created_at: Date;
}
