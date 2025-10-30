/**
 * Organization Members API Route
 *
 * GET /api/organizations/[id]/members - Get organization members
 * POST /api/organizations/[id]/members - Add member (assign role)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { AssignRoleRequest } from '@/packages/types/organization-auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access to this organization
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', id)
      .single();

    if (!userRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all members with their details
    const { data: members, error } = await supabase
      .from('user_roles')
      .select(
        `
        user_id,
        role,
        created_at,
        updated_at
      `
      )
      .eq('organization_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return NextResponse.json(
        { error: 'Failed to fetch members' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      members: members || [],
      total: members?.length || 0,
    });
  } catch (error) {
    console.error(
      'Unexpected error in GET /api/organizations/[id]/members:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { id } = params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user can invite members (owner or admin)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', id)
      .single();

    if (!userRole || !['owner', 'admin'].includes(userRole.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to add members' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: Partial<AssignRoleRequest> = await request.json();

    if (!body.user_id || !body.role) {
      return NextResponse.json(
        { error: 'user_id and role are required' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', body.user_id)
      .eq('organization_id', id)
      .single();

    if (existingRole) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 409 }
      );
    }

    // Add member with role
    const { data: newRole, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: body.user_id,
        organization_id: id,
        role: body.role,
      })
      .select()
      .single();

    if (roleError) {
      console.error('Error adding member:', roleError);
      return NextResponse.json(
        { error: 'Failed to add member' },
        { status: 500 }
      );
    }

    // Log the event
    await supabase.from('onboarding_events').insert({
      user_id: body.user_id,
      organization_id: id,
      event_type: 'role_assigned',
      event_data: {
        role: body.role,
        assigned_by: user.id,
      },
    });

    return NextResponse.json(
      {
        member: newRole,
        message: 'Member added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Unexpected error in POST /api/organizations/[id]/members:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
