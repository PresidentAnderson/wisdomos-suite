import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/integrations/webhook - Handle incoming webhooks from external services
export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integration');
    const userId = searchParams.get('user');

    if (!integrationId) {
      return NextResponse.json({ 
        error: 'Integration ID required in query params' 
      }, { status: 400 });
    }

    // Verify webhook signature based on integration type
    const isValidWebhook = await verifyWebhookSignature(
      integrationId, 
      body, 
      headersList
    );

    if (!isValidWebhook) {
      return NextResponse.json({ 
        error: 'Invalid webhook signature' 
      }, { status: 401 });
    }

    let processResult;

    switch (integrationId) {
      case 'todoist':
        processResult = await processTodoistWebhook(body, userId);
        break;
      case 'google_calendar':
        processResult = await processGoogleCalendarWebhook(body, userId);
        break;
      case 'strava':
        processResult = await processStravaWebhook(body, userId);
        break;
      case 'notion':
        processResult = await processNotionWebhook(body, userId);
        break;
      default:
        processResult = await processGenericWebhook(integrationId, body, userId);
    }

    // Log the webhook event
    await supabase
      .from('webhook_events')
      .insert([{
        integration_id: integrationId,
        user_id: userId,
        event_type: body.type || body.event_type || 'unknown',
        payload: body,
        processed: processResult.success,
        error_message: processResult.error,
        created_at: new Date().toISOString()
      }]);

    if (!processResult.success) {
      return NextResponse.json({ 
        error: 'Webhook processing failed',
        details: processResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      processed: processResult.processed || 1,
      message: processResult.message || 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/integrations/webhook - Webhook verification for some services
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Handle verification requests
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');
  const mode = searchParams.get('hub.mode');

  if (mode === 'subscribe' && verifyToken === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Webhook signature verification functions
async function verifyWebhookSignature(
  integrationId: string, 
  body: any, 
  headers: Headers
): Promise<boolean> {
  try {
    switch (integrationId) {
      case 'todoist':
        return verifyTodoistSignature(body, headers);
      case 'strava':
        return verifyStravaSignature(body, headers);
      case 'notion':
        return verifyNotionSignature(body, headers);
      default:
        // For development/testing, allow unverified webhooks
        return process.env.NODE_ENV === 'development' || 
               headers.get('x-webhook-token') === process.env.WEBHOOK_SECRET;
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

function verifyTodoistSignature(body: any, headers: Headers): boolean {
  const signature = headers.get('x-todoist-hmac-sha256');
  if (!signature) return false;

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', process.env.TODOIST_WEBHOOK_SECRET!);
  hmac.update(JSON.stringify(body));
  const expectedSignature = hmac.digest('base64');

  return signature === expectedSignature;
}

function verifyStravaSignature(body: any, headers: Headers): boolean {
  const signature = headers.get('x-hub-signature');
  if (!signature) return false;

  // Strava uses verify token in query params, check during subscription
  return true; // Simplified for demo
}

function verifyNotionSignature(body: any, headers: Headers): boolean {
  const signature = headers.get('notion-signature');
  if (!signature) return false;

  // Implement Notion signature verification
  return true; // Simplified for demo
}

// Webhook processors for specific integrations
async function processTodoistWebhook(body: any, userId?: string | null) {
  try {
    const eventType = body.event_name;
    const eventData = body.event_data;

    switch (eventType) {
      case 'item:completed':
        return await handleTodoistTaskCompleted(eventData, userId);
      case 'item:added':
        return await handleTodoistTaskAdded(eventData, userId);
      case 'item:updated':
        return await handleTodoistTaskUpdated(eventData, userId);
      default:
        return { success: true, message: `Unhandled Todoist event: ${eventType}` };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function handleTodoistTaskCompleted(eventData: any, userId?: string | null) {
  if (!userId) {
    // Try to find user by Todoist integration
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('user_id')
      .eq('integration_id', 'todoist')
      .eq('status', 'connected')
      .single();

    userId = integration?.user_id;
  }

  if (!userId) {
    return { success: false, error: 'User not found for Todoist integration' };
  }

  // Check if this task was created from a WisdomOS action step
  const taskLabel = eventData.labels?.find((label: string) => 
    label.startsWith('wisdomos-')
  );

  if (taskLabel) {
    // Update the corresponding action step as completed
    const actionStepId = taskLabel.replace('wisdomos-', '');
    
    await supabase
      .from('boundary_audits')
      .update({ 
        action_steps: supabase.rpc('update_action_step_status', {
          action_step_id: actionStepId,
          completed: true
        })
      })
      .eq('user_id', userId);
  }

  // Record the completion as an achievement
  await supabase
    .from('external_data_entries')
    .insert([{
      user_id: userId,
      type: 'task_completion',
      data: {
        task_name: eventData.content,
        project: eventData.project_id,
        completed_at: new Date().toISOString()
      },
      source: 'todoist',
      date: new Date().toISOString().split('T')[0],
      metadata: eventData
    }]);

  return { 
    success: true, 
    message: 'Task completion processed',
    processed: 1
  };
}

async function handleTodoistTaskAdded(eventData: any, userId?: string | null) {
  // Log new task creation for analytics
  if (userId) {
    await supabase
      .from('external_data_entries')
      .insert([{
        user_id: userId,
        type: 'task_created',
        data: {
          task_name: eventData.content,
          project: eventData.project_id,
          created_at: new Date().toISOString()
        },
        source: 'todoist',
        date: new Date().toISOString().split('T')[0],
        metadata: eventData
      }]);
  }

  return { success: true, message: 'Task creation logged' };
}

async function handleTodoistTaskUpdated(eventData: any, userId?: string | null) {
  // Log task updates for productivity analysis
  if (userId) {
    await supabase
      .from('external_data_entries')
      .insert([{
        user_id: userId,
        type: 'task_updated',
        data: {
          task_name: eventData.content,
          changes: eventData.changes || {},
          updated_at: new Date().toISOString()
        },
        source: 'todoist',
        date: new Date().toISOString().split('T')[0],
        metadata: eventData
      }]);
  }

  return { success: true, message: 'Task update logged' };
}

async function processGoogleCalendarWebhook(body: any, userId?: string | null) {
  try {
    // Handle Google Calendar push notifications
    const eventType = body.resourceState; // sync, exists, not_exists
    const resourceId = body.resourceId;
    const resourceUri = body.resourceUri;

    if (eventType === 'sync') {
      // Initial sync notification, no action needed
      return { success: true, message: 'Sync notification acknowledged' };
    }

    if (!userId) {
      // Find user by calendar resource ID
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('user_id')
        .eq('integration_id', 'google_calendar')
        .eq('status', 'connected')
        .single();

      userId = integration?.user_id;
    }

    if (!userId) {
      return { success: false, error: 'User not found for Google Calendar integration' };
    }

    // Fetch the actual calendar events that changed
    // This would require implementing Google Calendar API calls
    // For now, we'll just log the notification
    await supabase
      .from('external_data_entries')
      .insert([{
        user_id: userId,
        type: 'calendar_change',
        data: {
          resource_state: eventType,
          resource_id: resourceId,
          resource_uri: resourceUri,
          notification_time: new Date().toISOString()
        },
        source: 'google_calendar',
        date: new Date().toISOString().split('T')[0],
        metadata: body
      }]);

    return { 
      success: true, 
      message: 'Calendar change notification processed' 
    };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function processStravaWebhook(body: any, userId?: string | null) {
  try {
    const eventType = body.aspect_type; // create, update, delete
    const objectType = body.object_type; // activity, athlete
    const objectId = body.object_id;

    if (objectType !== 'activity') {
      return { success: true, message: 'Non-activity event ignored' };
    }

    if (!userId) {
      // Find user by Strava athlete ID
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('user_id')
        .eq('integration_id', 'strava')
        .eq('status', 'connected')
        .single();

      userId = integration?.user_id;
    }

    if (!userId) {
      return { success: false, error: 'User not found for Strava integration' };
    }

    // Log the activity event
    await supabase
      .from('external_data_entries')
      .insert([{
        user_id: userId,
        type: 'activity_event',
        data: {
          event_type: eventType,
          activity_id: objectId,
          athlete_id: body.owner_id,
          event_time: new Date().toISOString()
        },
        source: 'strava',
        date: new Date().toISOString().split('T')[0],
        metadata: body
      }]);

    // If it's a new activity, we could trigger a sync to get details
    if (eventType === 'create') {
      // Queue a sync job to fetch activity details
      // This would be handled by a background job processor
    }

    return { 
      success: true, 
      message: `Strava ${eventType} event processed for activity ${objectId}` 
    };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function processNotionWebhook(body: any, userId?: string | null) {
  try {
    // Notion webhooks are not yet available in their public API
    // This is a placeholder for when they become available
    
    return { success: true, message: 'Notion webhook placeholder' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function processGenericWebhook(integrationId: string, body: any, userId?: string | null) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID required for generic webhooks' };
    }

    // Store generic webhook data
    await supabase
      .from('external_data_entries')
      .insert([{
        user_id: userId,
        type: 'webhook_event',
        data: body,
        source: integrationId,
        date: new Date().toISOString().split('T')[0],
        metadata: {
          webhook_received_at: new Date().toISOString(),
          content_type: 'application/json'
        }
      }]);

    return { 
      success: true, 
      message: `Generic webhook processed for ${integrationId}`,
      processed: 1
    };

  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}