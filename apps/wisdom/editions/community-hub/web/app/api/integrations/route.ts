import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Available integration types
const INTEGRATION_TYPES = {
  HABIT_TRACKER: 'habit_tracker',
  MEDITATION_APP: 'meditation_app',
  JOURNAL_APP: 'journal_app',
  FITNESS_TRACKER: 'fitness_tracker',
  MOOD_TRACKER: 'mood_tracker',
  CALENDAR: 'calendar',
  NOTE_TAKING: 'note_taking',
  GOAL_TRACKING: 'goal_tracking'
};

// GET /api/integrations - List available integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's current integrations
    const { data: userIntegrations, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Available integrations with their capabilities
    const availableIntegrations = [
      {
        id: 'apple_health',
        name: 'Apple Health',
        type: INTEGRATION_TYPES.FITNESS_TRACKER,
        description: 'Sync mindfulness minutes, sleep data, and wellness metrics',
        icon: '/integrations/apple-health.png',
        capabilities: ['mindfulness_minutes', 'sleep_data', 'steps', 'heart_rate'],
        status: userIntegrations?.find(i => i.integration_id === 'apple_health')?.status || 'not_connected',
        authUrl: '/api/integrations/apple_health/auth',
        webhookSupported: false
      },
      {
        id: 'google_calendar',
        name: 'Google Calendar',
        type: INTEGRATION_TYPES.CALENDAR,
        description: 'Schedule wisdom sessions and track consistency',
        icon: '/integrations/google-calendar.png',
        capabilities: ['event_creation', 'reminder_scheduling', 'time_blocking'],
        status: userIntegrations?.find(i => i.integration_id === 'google_calendar')?.status || 'not_connected',
        authUrl: '/api/integrations/google_calendar/auth',
        webhookSupported: true
      },
      {
        id: 'notion',
        name: 'Notion',
        type: INTEGRATION_TYPES.NOTE_TAKING,
        description: 'Export your wisdom entries to Notion databases',
        icon: '/integrations/notion.png',
        capabilities: ['data_export', 'template_creation', 'database_sync'],
        status: userIntegrations?.find(i => i.integration_id === 'notion')?.status || 'not_connected',
        authUrl: '/api/integrations/notion/auth',
        webhookSupported: true
      },
      {
        id: 'headspace',
        name: 'Headspace',
        type: INTEGRATION_TYPES.MEDITATION_APP,
        description: 'Import meditation sessions and mindfulness data',
        icon: '/integrations/headspace.png',
        capabilities: ['meditation_import', 'progress_sync', 'streak_sync'],
        status: userIntegrations?.find(i => i.integration_id === 'headspace')?.status || 'not_connected',
        authUrl: '/api/integrations/headspace/auth',
        webhookSupported: false
      },
      {
        id: 'todoist',
        name: 'Todoist',
        type: INTEGRATION_TYPES.GOAL_TRACKING,
        description: 'Convert action steps into tasks and track completion',
        icon: '/integrations/todoist.png',
        capabilities: ['task_creation', 'completion_sync', 'project_organization'],
        status: userIntegrations?.find(i => i.integration_id === 'todoist')?.status || 'not_connected',
        authUrl: '/api/integrations/todoist/auth',
        webhookSupported: true
      },
      {
        id: 'strava',
        name: 'Strava',
        type: INTEGRATION_TYPES.FITNESS_TRACKER,
        description: 'Track physical activities that support your wisdom practice',
        icon: '/integrations/strava.png',
        capabilities: ['activity_import', 'wellness_correlation', 'achievement_sync'],
        status: userIntegrations?.find(i => i.integration_id === 'strava')?.status || 'not_connected',
        authUrl: '/api/integrations/strava/auth',
        webhookSupported: true
      },
      {
        id: 'rescuetime',
        name: 'RescueTime',
        type: INTEGRATION_TYPES.HABIT_TRACKER,
        description: 'Monitor digital wellness and screen time balance',
        icon: '/integrations/rescuetime.png',
        capabilities: ['time_tracking', 'productivity_analysis', 'digital_wellness'],
        status: userIntegrations?.find(i => i.integration_id === 'rescuetime')?.status || 'not_connected',
        authUrl: '/api/integrations/rescuetime/auth',
        webhookSupported: false
      },
      {
        id: 'webhooks',
        name: 'Custom Webhooks',
        type: 'webhook',
        description: 'Send your wisdom data to any external system',
        icon: '/integrations/webhook.png',
        capabilities: ['real_time_sync', 'custom_payloads', 'event_filtering'],
        status: 'available',
        authUrl: null,
        webhookSupported: true
      }
    ];

    return NextResponse.json({
      integrations: availableIntegrations,
      userIntegrations: userIntegrations || [],
      totalAvailable: availableIntegrations.length,
      connectedCount: userIntegrations?.filter(i => i.status === 'connected').length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/integrations - Connect a new integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, integrationId, authCode, webhookUrl, settings } = body;

    if (!userId || !integrationId) {
      return NextResponse.json({ error: 'User ID and integration ID required' }, { status: 400 });
    }

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_id', integrationId)
      .single();

    if (existingIntegration) {
      return NextResponse.json({ error: 'Integration already connected' }, { status: 409 });
    }

    // Create new integration record
    const integrationData = {
      user_id: userId,
      integration_id: integrationId,
      status: 'connecting',
      settings: settings || {},
      webhook_url: webhookUrl,
      auth_data: authCode ? { auth_code: authCode } : null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_integrations')
      .insert([integrationData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 });
    }

    // Handle specific integration setup
    let authUrl = null;
    let setupRequired = false;

    switch (integrationId) {
      case 'google_calendar':
        authUrl = generateGoogleAuthUrl(userId);
        setupRequired = true;
        break;
      case 'notion':
        authUrl = generateNotionAuthUrl(userId);
        setupRequired = true;
        break;
      case 'todoist':
        authUrl = generateTodoistAuthUrl(userId);
        setupRequired = true;
        break;
      case 'webhooks':
        // Webhook integration is immediately active
        await supabase
          .from('user_integrations')
          .update({ status: 'connected' })
          .eq('id', data.id);
        break;
    }

    return NextResponse.json({
      integration: data,
      authUrl,
      setupRequired,
      message: setupRequired 
        ? 'Integration created. Complete authentication to activate.' 
        : 'Integration connected successfully.'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/integrations - Update integration settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, integrationId, settings, status, webhookUrl } = body;

    if (!userId || !integrationId) {
      return NextResponse.json({ error: 'User ID and integration ID required' }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (settings) updateData.settings = settings;
    if (status) updateData.status = status;
    if (webhookUrl !== undefined) updateData.webhook_url = webhookUrl;

    const { data, error } = await supabase
      .from('user_integrations')
      .update(updateData)
      .eq('user_id', userId)
      .eq('integration_id', integrationId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
    }

    return NextResponse.json({
      integration: data,
      message: 'Integration updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/integrations - Disconnect integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const integrationId = searchParams.get('integrationId');

    if (!userId || !integrationId) {
      return NextResponse.json({ error: 'User ID and integration ID required' }, { status: 400 });
    }

    // Get integration details before deletion
    const { data: integration, error: fetchError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_id', integrationId)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Revoke external permissions if needed
    await revokeIntegrationAccess(integrationId, integration.auth_data);

    // Delete integration record
    const { error } = await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('integration_id', integrationId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Integration disconnected successfully',
      integrationId
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions for OAuth URLs
function generateGoogleAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/google_calendar/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar',
    state: userId,
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function generateNotionAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.NOTION_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/notion/callback`,
    response_type: 'code',
    state: userId
  });
  
  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

function generateTodoistAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.TODOIST_CLIENT_ID!,
    scope: 'data:read_write',
    state: userId
  });
  
  return `https://todoist.com/oauth/authorize?${params.toString()}`;
}

// Helper function to revoke access
async function revokeIntegrationAccess(integrationId: string, authData: any) {
  try {
    switch (integrationId) {
      case 'google_calendar':
        if (authData?.access_token) {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${authData.access_token}`, {
            method: 'POST'
          });
        }
        break;
      // Add other revocation handlers as needed
    }
  } catch (error) {
    console.error(`Failed to revoke ${integrationId} access:`, error);
  }
}