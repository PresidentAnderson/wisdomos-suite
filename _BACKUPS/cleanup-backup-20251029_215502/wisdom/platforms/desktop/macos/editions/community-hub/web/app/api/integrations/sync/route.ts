import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/integrations/sync - Sync data from external sources
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, integrationId, data, syncType } = body;

    if (!userId || !integrationId || !data) {
      return NextResponse.json({ 
        error: 'User ID, integration ID, and data required' 
      }, { status: 400 });
    }

    // Verify integration exists and is active
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_id', integrationId)
      .eq('status', 'connected')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({ 
        error: 'Integration not found or not connected' 
      }, { status: 404 });
    }

    let syncResult;

    switch (integrationId) {
      case 'apple_health':
        syncResult = await syncAppleHealthData(userId, data);
        break;
      case 'headspace':
        syncResult = await syncMeditationData(userId, data);
        break;
      case 'strava':
        syncResult = await syncActivityData(userId, data);
        break;
      case 'rescuetime':
        syncResult = await syncProductivityData(userId, data);
        break;
      default:
        syncResult = await syncGenericData(userId, integrationId, data, syncType);
    }

    // Update integration last sync time
    await supabase
      .from('user_integrations')
      .update({ 
        last_sync_at: new Date().toISOString(),
        sync_count: integration.sync_count + 1
      })
      .eq('id', integration.id);

    // Create sync log entry
    await supabase
      .from('integration_sync_logs')
      .insert([{
        user_id: userId,
        integration_id: integrationId,
        sync_type: syncType || 'manual',
        records_processed: syncResult.processed,
        records_imported: syncResult.imported,
        errors: syncResult.errors,
        status: syncResult.errors.length > 0 ? 'partial_success' : 'success',
        created_at: new Date().toISOString()
      }]);

    return NextResponse.json({
      message: 'Sync completed',
      result: syncResult,
      integration: integration.integration_id
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ 
      error: 'Sync failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET /api/integrations/sync - Get sync status and history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const integrationId = searchParams.get('integrationId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let query = supabase
      .from('integration_sync_logs')
      .select(`
        *,
        user_integrations!inner(
          integration_id,
          status,
          last_sync_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    const { data: syncLogs, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      syncHistory: syncLogs,
      summary: {
        totalSyncs: syncLogs.length,
        successfulSyncs: syncLogs.filter(log => log.status === 'success').length,
        failedSyncs: syncLogs.filter(log => log.status === 'failed').length,
        lastSync: syncLogs[0]?.created_at || null
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Sync functions for specific integrations
async function syncAppleHealthData(userId: string, data: any) {
  const result = { processed: 0, imported: 0, errors: [] };

  try {
    // Process mindfulness minutes
    if (data.mindfulness) {
      for (const entry of data.mindfulness) {
        try {
          // Convert to WisdomOS meditation entry
          const meditationEntry = {
            user_id: userId,
            type: 'mindfulness',
            duration_minutes: entry.duration,
            date: entry.date,
            source: 'apple_health',
            metadata: {
              heart_rate: entry.heartRate,
              location: entry.location
            }
          };

          await supabase
            .from('external_data_entries')
            .upsert(meditationEntry, { onConflict: 'user_id,date,source,type' });

          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import mindfulness entry: ${error}`);
        }
        result.processed++;
      }
    }

    // Process sleep data
    if (data.sleep) {
      for (const entry of data.sleep) {
        try {
          const sleepEntry = {
            user_id: userId,
            type: 'sleep',
            duration_hours: entry.duration / 60,
            quality_score: entry.quality,
            date: entry.date,
            source: 'apple_health',
            metadata: {
              bedtime: entry.bedtime,
              wake_time: entry.wakeTime,
              deep_sleep_minutes: entry.deepSleep
            }
          };

          await supabase
            .from('external_data_entries')
            .upsert(sleepEntry, { onConflict: 'user_id,date,source,type' });

          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import sleep entry: ${error}`);
        }
        result.processed++;
      }
    }

  } catch (error) {
    result.errors.push(`Apple Health sync error: ${error}`);
  }

  return result;
}

async function syncMeditationData(userId: string, data: any) {
  const result = { processed: 0, imported: 0, errors: [] };

  try {
    for (const session of data.sessions) {
      try {
        const meditationEntry = {
          user_id: userId,
          type: 'meditation',
          duration_minutes: session.duration,
          category: session.type,
          date: session.date,
          source: 'headspace',
          metadata: {
            program: session.program,
            completed: session.completed,
            rating: session.rating
          }
        };

        await supabase
          .from('external_data_entries')
          .upsert(meditationEntry, { onConflict: 'user_id,date,source,type' });

        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import meditation session: ${error}`);
      }
      result.processed++;
    }
  } catch (error) {
    result.errors.push(`Meditation sync error: ${error}`);
  }

  return result;
}

async function syncActivityData(userId: string, data: any) {
  const result = { processed: 0, imported: 0, errors: [] };

  try {
    for (const activity of data.activities) {
      try {
        const activityEntry = {
          user_id: userId,
          type: 'physical_activity',
          duration_minutes: activity.duration,
          category: activity.type,
          date: activity.date,
          source: 'strava',
          metadata: {
            distance: activity.distance,
            elevation_gain: activity.elevation,
            average_heart_rate: activity.heartRate,
            calories: activity.calories
          }
        };

        await supabase
          .from('external_data_entries')
          .upsert(activityEntry, { onConflict: 'user_id,date,source,type' });

        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import activity: ${error}`);
      }
      result.processed++;
    }
  } catch (error) {
    result.errors.push(`Activity sync error: ${error}`);
  }

  return result;
}

async function syncProductivityData(userId: string, data: any) {
  const result = { processed: 0, imported: 0, errors: [] };

  try {
    for (const dayData of data.daily_summaries) {
      try {
        const productivityEntry = {
          user_id: userId,
          type: 'productivity',
          productivity_score: dayData.productivity_score,
          total_time_minutes: dayData.total_time,
          date: dayData.date,
          source: 'rescuetime',
          metadata: {
            categories: dayData.categories,
            top_applications: dayData.applications,
            focus_time: dayData.focus_time
          }
        };

        await supabase
          .from('external_data_entries')
          .upsert(productivityEntry, { onConflict: 'user_id,date,source,type' });

        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import productivity data: ${error}`);
      }
      result.processed++;
    }
  } catch (error) {
    result.errors.push(`Productivity sync error: ${error}`);
  }

  return result;
}

async function syncGenericData(userId: string, integrationId: string, data: any, syncType?: string) {
  const result = { processed: 0, imported: 0, errors: [] };

  try {
    // Handle generic data structure
    const entries = Array.isArray(data) ? data : data.entries || [];

    for (const entry of entries) {
      try {
        const genericEntry = {
          user_id: userId,
          type: syncType || 'generic',
          data: entry,
          date: entry.date || new Date().toISOString().split('T')[0],
          source: integrationId,
          metadata: entry.metadata || {}
        };

        await supabase
          .from('external_data_entries')
          .upsert(genericEntry, { onConflict: 'user_id,date,source,type' });

        result.imported++;
      } catch (error) {
        result.errors.push(`Failed to import generic entry: ${error}`);
      }
      result.processed++;
    }
  } catch (error) {
    result.errors.push(`Generic sync error: ${error}`);
  }

  return result;
}