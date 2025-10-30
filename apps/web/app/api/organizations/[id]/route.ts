/**
 * Organization Details API Route
 *
 * GET /api/organizations/[id] - Get organization details
 * PATCH /api/organizations/[id] - Update organization
 * DELETE /api/organizations/[id] - Delete organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { UpdateOrganizationRequest } from '@/packages/types/organization-auth';

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

    // Get organization details
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get members
    const { data: members } = await supabase
      .from('user_roles')
      .select(
        `
        user_id,
        role,
        created_at
      `
      )
      .eq('organization_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      organization: org,
      members: members || [],
      total_members: members?.length || 0,
      user_role: userRole.role,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/organizations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Check if user is owner or admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', id)
      .single();

    if (!userRole || !['owner', 'admin'].includes(userRole.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: UpdateOrganizationRequest = await request.json();

    // Update organization
    const { data: org, error: updateError } = await supabase
      .from('organizations')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating organization:', updateError);
      return NextResponse.json(
        { error: 'Failed to update organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      organization: org,
      message: 'Organization updated successfully',
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/organizations/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if user is owner
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', id)
      .single();

    if (!userRole || userRole.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only owners can delete organizations' },
        { status: 403 }
      );
    }

    // Delete organization (cascade will handle user_roles and events)
    const { error: deleteError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting organization:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete organization' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Organization deleted successfully',
    });
  } catch (error) {
    console.error(
      'Unexpected error in DELETE /api/organizations/[id]:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
