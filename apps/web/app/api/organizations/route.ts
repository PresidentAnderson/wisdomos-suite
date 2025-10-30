/**
 * Organizations API Route
 *
 * GET /api/organizations - Get user's organizations
 * POST /api/organizations - Create new organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type {
  Organization,
  CreateOrganizationRequest,
} from '@/packages/types/organization-auth';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organizations with roles
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(
        `
        role,
        created_at,
        organizations!inner (
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching organizations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch organizations' },
        { status: 500 }
      );
    }

    // Transform the response
    const organizations = userRoles.map((ur: any) => ({
      ...ur.organizations,
      role: ur.role,
      joined_at: ur.created_at,
    }));

    return NextResponse.json({
      organizations,
      total: organizations.length,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: CreateOrganizationRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }

    // Check if domain already exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('domain', body.domain)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this domain already exists' },
        { status: 409 }
      );
    }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: body.name,
        domain: body.domain,
        plan: body.plan || 'standard',
        status: 'active',
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      );
    }

    // Assign creator as owner
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: user.id,
      organization_id: org.id,
      role: 'owner',
    });

    if (roleError) {
      console.error('Error assigning owner role:', roleError);
      // Try to clean up the organization
      await supabase.from('organizations').delete().eq('id', org.id);
      return NextResponse.json(
        { error: 'Failed to assign owner role' },
        { status: 500 }
      );
    }

    // Log the event
    await supabase.from('onboarding_events').insert({
      user_id: user.id,
      organization_id: org.id,
      event_type: 'org_created',
      event_data: {
        name: body.name,
        domain: body.domain,
        plan: body.plan || 'standard',
      },
    });

    return NextResponse.json(
      {
        organization: org as Organization,
        message: 'Organization created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/organizations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
