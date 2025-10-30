/**
 * Organization Client
 *
 * Client-side utilities for working with the organization-based auth system
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type {
  Organization,
  UserRole,
  OnboardingEvent,
  UserWithOrganization,
  OrganizationWithMembers,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  AssignRoleRequest,
  UpdateRoleRequest,
  OrganizationRole,
} from '@/packages/types/organization-auth';

export class OrganizationClient {
  private supabase = createClientComponentClient();

  /**
   * Get current user's organizations with their roles
   */
  async getUserOrganizations(): Promise<UserWithOrganization | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) return null;

      const { data: userRoles, error } = await this.supabase
        .from('user_roles')
        .select(
          `
          role,
          organization_id,
          organizations (
            id,
            name,
            domain,
            plan,
            status,
            created_at,
            updated_at
          )
        `
        )
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        id: user.id,
        email: user.email || '',
        organizations:
          userRoles?.map((ur: any) => ({
            organization: ur.organizations,
            role: ur.role as OrganizationRole,
          })) || [],
      };
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      return null;
    }
  }

  /**
   * Get organization details with members
   */
  async getOrganizationWithMembers(
    organizationId: string
  ): Promise<OrganizationWithMembers | null> {
    try {
      // Get organization details
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;

      // Get members with their roles
      const { data: members, error: membersError } = await this.supabase
        .from('user_roles')
        .select(
          `
          user_id,
          role,
          created_at,
          auth.users!inner (
            email
          )
        `
        )
        .eq('organization_id', organizationId);

      if (membersError) throw membersError;

      return {
        organization: org as Organization,
        members:
          members?.map((m: any) => ({
            user_id: m.user_id,
            email: m.users?.email || '',
            role: m.role as OrganizationRole,
            joined_at: m.created_at,
          })) || [],
        total_members: members?.length || 0,
      };
    } catch (error) {
      console.error('Error fetching organization with members:', error);
      return null;
    }
  }

  /**
   * Create a new organization
   */
  async createOrganization(
    request: CreateOrganizationRequest
  ): Promise<Organization | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create organization
      const { data: org, error: orgError } = await this.supabase
        .from('organizations')
        .insert({
          name: request.name,
          domain: request.domain,
          plan: request.plan || 'standard',
          status: 'active',
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Assign creator as owner
      const { error: roleError } = await this.supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: 'owner',
        });

      if (roleError) throw roleError;

      // Log the event
      await this.supabase.from('onboarding_events').insert({
        user_id: user.id,
        organization_id: org.id,
        event_type: 'org_created',
        event_data: {
          name: request.name,
          domain: request.domain,
          plan: request.plan || 'standard',
        },
      });

      return org as Organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      return null;
    }
  }

  /**
   * Update organization details
   */
  async updateOrganization(
    organizationId: string,
    request: UpdateOrganizationRequest
  ): Promise<Organization | null> {
    try {
      const { data, error } = await this.supabase
        .from('organizations')
        .update(request)
        .eq('id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return data as Organization;
    } catch (error) {
      console.error('Error updating organization:', error);
      return null;
    }
  }

  /**
   * Assign role to a user in an organization
   */
  async assignRole(request: AssignRoleRequest): Promise<UserRole | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('user_roles')
        .insert({
          user_id: request.user_id,
          organization_id: request.organization_id,
          role: request.role,
        })
        .select()
        .single();

      if (error) throw error;

      // Log the event
      await this.supabase.from('onboarding_events').insert({
        user_id: request.user_id,
        organization_id: request.organization_id,
        event_type: 'role_assigned',
        event_data: {
          role: request.role,
          assigned_by: user.id,
        },
      });

      return data as UserRole;
    } catch (error) {
      console.error('Error assigning role:', error);
      return null;
    }
  }

  /**
   * Update user's role in an organization
   */
  async updateRole(
    userId: string,
    organizationId: string,
    request: UpdateRoleRequest
  ): Promise<UserRole | null> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await this.supabase
        .from('user_roles')
        .update({ role: request.role })
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      // Log the event
      await this.supabase.from('onboarding_events').insert({
        user_id: userId,
        organization_id: organizationId,
        event_type: 'role_updated',
        event_data: {
          new_role: request.role,
          updated_by: user.id,
        },
      });

      return data as UserRole;
    } catch (error) {
      console.error('Error updating role:', error);
      return null;
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await this.supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      // Log the event
      await this.supabase.from('onboarding_events').insert({
        user_id: userId,
        organization_id: organizationId,
        event_type: 'user_removed',
        event_data: {
          removed_by: user.id,
        },
      });

      return true;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      return false;
    }
  }

  /**
   * Get organization onboarding events (for analytics)
   */
  async getOnboardingEvents(
    organizationId: string
  ): Promise<OnboardingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('onboarding_events')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as OnboardingEvent[]) || [];
    } catch (error) {
      console.error('Error fetching onboarding events:', error);
      return [];
    }
  }

  /**
   * Check if user has a specific role in an organization
   */
  async hasRole(
    userId: string,
    organizationId: string,
    role: OrganizationRole
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;

      return data?.role === role;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is at least a certain role level in an organization
   */
  async hasMinimumRole(
    userId: string,
    organizationId: string,
    minimumRole: OrganizationRole
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;

      const roleHierarchy: Record<OrganizationRole, number> = {
        viewer: 1,
        member: 2,
        admin: 3,
        owner: 4,
      };

      return (
        roleHierarchy[data?.role as OrganizationRole] >=
        roleHierarchy[minimumRole]
      );
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const organizationClient = new OrganizationClient();

// Export convenience functions
export const getUserOrganizations = () =>
  organizationClient.getUserOrganizations();
export const getOrganizationWithMembers = (organizationId: string) =>
  organizationClient.getOrganizationWithMembers(organizationId);
export const createOrganization = (request: CreateOrganizationRequest) =>
  organizationClient.createOrganization(request);
export const updateOrganization = (
  organizationId: string,
  request: UpdateOrganizationRequest
) => organizationClient.updateOrganization(organizationId, request);
export const assignRole = (request: AssignRoleRequest) =>
  organizationClient.assignRole(request);
export const updateRole = (
  userId: string,
  organizationId: string,
  request: UpdateRoleRequest
) => organizationClient.updateRole(userId, organizationId, request);
export const removeUserFromOrganization = (
  userId: string,
  organizationId: string
) => organizationClient.removeUserFromOrganization(userId, organizationId);
export const getOnboardingEvents = (organizationId: string) =>
  organizationClient.getOnboardingEvents(organizationId);
export const hasRole = (
  userId: string,
  organizationId: string,
  role: OrganizationRole
) => organizationClient.hasRole(userId, organizationId, role);
export const hasMinimumRole = (
  userId: string,
  organizationId: string,
  minimumRole: OrganizationRole
) => organizationClient.hasMinimumRole(userId, organizationId, minimumRole);
