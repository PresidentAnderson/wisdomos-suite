import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface PatternData {
  date: string;
  energy: number;
  focus: number;
  fulfillment: number;
  journalCount: number;
  commitmentProgress: number;
  dayOfWeek: string;
}

// Calculate energy score based on journal sentiment and activity
async function calculateEnergyScore(supabase: any, userId: string, date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get journal entries for the day
  const { data: journals } = await supabase
    .from('journal_entries')
    .select('mood, energy_level')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  if (!journals || journals.length === 0) return 50; // Default neutral score

  // Calculate average from mood and energy_level
  const avgEnergy = journals.reduce((sum: number, j: any) => {
    const energyValue = j.energy_level || (j.mood === 'positive' ? 80 : j.mood === 'negative' ? 30 : 50);
    return sum + energyValue;
  }, 0) / journals.length;

  return Math.round(avgEnergy);
}

// Calculate focus score based on commitment completion and check-ins
async function calculateFocusScore(supabase: any, userId: string, date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get check-ins for the day
  const { data: checkIns } = await supabase
    .from('checkins')
    .select('focus_level, productivity_score')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString());

  // Get commitments completed
  const { data: commitments } = await supabase
    .from('commitments')
    .select('status, progress')
    .eq('user_id', userId)
    .gte('updated_at', startOfDay.toISOString())
    .lte('updated_at', endOfDay.toISOString());

  let focusScore = 50; // Default

  if (checkIns && checkIns.length > 0) {
    const avgFocus = checkIns.reduce((sum: number, c: any) => {
      return sum + (c.focus_level || c.productivity_score || 50);
    }, 0) / checkIns.length;
    focusScore = avgFocus;
  }

  // Boost score if commitments were progressed
  if (commitments && commitments.length > 0) {
    const completedCount = commitments.filter((c: any) => c.status === 'completed').length;
    const completionBoost = (completedCount / commitments.length) * 20;
    focusScore = Math.min(100, focusScore + completionBoost);
  }

  return Math.round(focusScore);
}

// Calculate fulfillment score from life area scores
async function calculateFulfillmentScore(supabase: any, userId: string, date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // Get latest fulfillment scores
  const { data: scores } = await supabase
    .from('life_area_scores')
    .select('score')
    .eq('user_id', userId)
    .lte('created_at', startOfDay.toISOString())
    .order('created_at', { ascending: false })
    .limit(12); // 12 life areas

  if (!scores || scores.length === 0) return 50; // Default

  const avgScore = scores.reduce((sum: number, s: any) => sum + s.score, 0) / scores.length;
  return Math.round(avgScore);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get time range from query params
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Generate pattern data for the last N days
    const patterns: PatternData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];

      // Calculate scores for this day
      const [energy, focus, fulfillment] = await Promise.all([
        calculateEnergyScore(supabase, user.id, date),
        calculateFocusScore(supabase, user.id, date),
        calculateFulfillmentScore(supabase, user.id, date),
      ]);

      // Get journal count for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      // Get commitment progress
      const { data: commitments } = await supabase
        .from('commitments')
        .select('progress')
        .eq('user_id', user.id)
        .eq('status', 'active');

      const avgProgress = commitments && commitments.length > 0
        ? commitments.reduce((sum: number, c: any) => sum + (c.progress || 0), 0) / commitments.length
        : 0;

      patterns.push({
        date: dateStr,
        energy,
        focus,
        fulfillment,
        journalCount: journalCount || 0,
        commitmentProgress: Math.round(avgProgress),
        dayOfWeek,
      });
    }

    // Calculate overall trends
    const recentPatterns = patterns.slice(-3); // Last 3 days
    const olderPatterns = patterns.slice(0, -3); // Previous days

    const avgRecent = (key: 'energy' | 'focus' | 'fulfillment') =>
      recentPatterns.reduce((sum, p) => sum + p[key], 0) / recentPatterns.length;

    const avgOlder = (key: 'energy' | 'focus' | 'fulfillment') =>
      olderPatterns.length > 0
        ? olderPatterns.reduce((sum, p) => sum + p[key], 0) / olderPatterns.length
        : avgRecent(key);

    const trends = {
      energy: avgRecent('energy') - avgOlder('energy'),
      focus: avgRecent('focus') - avgOlder('focus'),
      fulfillment: avgRecent('fulfillment') - avgOlder('fulfillment'),
    };

    return NextResponse.json({
      patterns,
      trends,
      summary: {
        avgEnergy: Math.round(patterns.reduce((sum, p) => sum + p.energy, 0) / patterns.length),
        avgFocus: Math.round(patterns.reduce((sum, p) => sum + p.focus, 0) / patterns.length),
        avgFulfillment: Math.round(patterns.reduce((sum, p) => sum + p.fulfillment, 0) / patterns.length),
        totalJournals: patterns.reduce((sum, p) => sum + p.journalCount, 0),
        mostActiveDay: patterns.reduce((max, p) => p.journalCount > max.journalCount ? p : max, patterns[0]),
      },
    });

  } catch (error) {
    console.error('Pattern analytics error:', error);

    // Return mock data for development
    const mockPatterns: PatternData[] = [
      { date: 'Mon', energy: 72, focus: 68, fulfillment: 65, journalCount: 2, commitmentProgress: 60, dayOfWeek: 'Mon' },
      { date: 'Tue', energy: 78, focus: 70, fulfillment: 68, journalCount: 3, commitmentProgress: 65, dayOfWeek: 'Tue' },
      { date: 'Wed', energy: 65, focus: 63, fulfillment: 62, journalCount: 1, commitmentProgress: 62, dayOfWeek: 'Wed' },
      { date: 'Thu', energy: 80, focus: 75, fulfillment: 72, journalCount: 2, commitmentProgress: 70, dayOfWeek: 'Thu' },
      { date: 'Fri', energy: 85, focus: 81, fulfillment: 78, journalCount: 3, commitmentProgress: 75, dayOfWeek: 'Fri' },
      { date: 'Sat', energy: 90, focus: 88, fulfillment: 85, journalCount: 4, commitmentProgress: 80, dayOfWeek: 'Sat' },
      { date: 'Sun', energy: 76, focus: 70, fulfillment: 73, journalCount: 2, commitmentProgress: 72, dayOfWeek: 'Sun' },
    ];

    return NextResponse.json({
      patterns: mockPatterns,
      trends: { energy: 4, focus: 2, fulfillment: 8 },
      summary: {
        avgEnergy: 78,
        avgFocus: 74,
        avgFulfillment: 72,
        totalJournals: 17,
        mostActiveDay: mockPatterns[5],
      },
      _note: 'Using mock data - database connection failed'
    });
  }
}
