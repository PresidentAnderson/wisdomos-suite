import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client lazily to avoid build-time errors
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

interface PatternData {
  patterns: any[];
  trends: {
    energy: number;
    focus: number;
    fulfillment: number;
  };
  summary: any;
}

interface Recommendation {
  content: string;
  category: string;
  priority: string;
  energyScore?: number;
  focusScore?: number;
  fulfillmentScore?: number;
  energyTrend?: string;
  focusTrend?: string;
  fulfillmentTrend?: string;
  metadata?: any;
}

// Fetch pattern data from our analytics API
async function getPatternData(): Promise<PatternData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/insights/patterns?days=7`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch patterns: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching pattern data:', error);
    // Return mock data if API fails
    return {
      patterns: [],
      trends: { energy: 0, focus: 0, fulfillment: 0 },
      summary: { avgEnergy: 70, avgFocus: 70, avgFulfillment: 70 },
    };
  }
}

// Determine trend direction
function getTrendDirection(value: number): string {
  if (value > 5) return 'rising';
  if (value < -5) return 'falling';
  return 'stable';
}

// Categorize recommendation based on content
function categorizeRecommendation(content: string): { category: string; priority: string } {
  const lowerContent = content.toLowerCase();

  // Determine category
  let category = 'general';
  if (lowerContent.includes('energy') || lowerContent.includes('rest') || lowerContent.includes('sleep')) {
    category = 'energy';
  } else if (lowerContent.includes('focus') || lowerContent.includes('concentration') || lowerContent.includes('work')) {
    category = 'focus';
  } else if (lowerContent.includes('fulfillment') || lowerContent.includes('purpose') || lowerContent.includes('meaning')) {
    category = 'fulfillment';
  } else if (lowerContent.includes('relationship') || lowerContent.includes('connection') || lowerContent.includes('social')) {
    category = 'relationships';
  } else if (lowerContent.includes('growth') || lowerContent.includes('learn') || lowerContent.includes('develop')) {
    category = 'growth';
  } else if (lowerContent.includes('health') || lowerContent.includes('exercise') || lowerContent.includes('wellness')) {
    category = 'health';
  }

  // Determine priority
  let priority = 'medium';
  if (lowerContent.includes('urgent') || lowerContent.includes('critical') || lowerContent.includes('immediately')) {
    priority = 'high';
  } else if (lowerContent.includes('consider') || lowerContent.includes('explore') || lowerContent.includes('optional')) {
    priority = 'low';
  }

  return { category, priority };
}

// Generate AI recommendations
async function generateAIRecommendations(patternData: PatternData): Promise<string[]> {
  const { patterns, trends, summary } = patternData;

  // Build trend summary
  let trendSummary = '';
  if (trends.energy > 5) trendSummary += 'Energy is trending upward. ';
  else if (trends.energy < -5) trendSummary += 'Energy is declining. ';
  else trendSummary += 'Energy is stable. ';

  if (trends.focus > 5) trendSummary += 'Focus is increasing. ';
  else if (trends.focus < -5) trendSummary += 'Focus is declining. ';
  else trendSummary += 'Focus is steady. ';

  if (trends.fulfillment > 5) trendSummary += 'Fulfillment is rising.';
  else if (trends.fulfillment < -5) trendSummary += 'Fulfillment is decreasing.';
  else trendSummary += 'Fulfillment is consistent.';

  // Build context
  const context = {
    avgEnergy: summary.avgEnergy || 70,
    avgFocus: summary.avgFocus || 70,
    avgFulfillment: summary.avgFulfillment || 70,
    totalJournals: summary.totalJournals || 0,
    mostActiveDay: summary.mostActiveDay?.dayOfWeek || 'Unknown',
    trends: trendSummary,
  };

  const prompt = `You are WisdomOS AI Coach, a compassionate and insightful personal development guide.

Analyze this user's behavioral pattern data:
${JSON.stringify(context, null, 2)}

Recent activity summary:
- Average Energy: ${context.avgEnergy}/100
- Average Focus: ${context.avgFocus}/100
- Average Fulfillment: ${context.avgFulfillment}/100
- Journal Entries: ${context.totalJournals} this week
- Most Active: ${context.mostActiveDay}

Trend Analysis: ${context.trends}

Generate 5 personalized, actionable recommendations that will help this user improve their energy, focus, or fulfillment.

Requirements:
- Be direct, motivating, and specific
- Each recommendation should be 15-25 words
- Reflect awareness of rising or falling trends
- Offer concrete actions, not just observations
- Balance immediate actions with long-term habits
- Use positive, empowering language

Format: Return ONLY the recommendations, one per line, numbered 1-5.`;

  try {
    const openai = getOpenAIClient();
    if (!openai) {
      throw new Error('OpenAI API key not configured');
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const text = completion.choices[0].message.content || '';
    const recommendations = text
      .split('\n')
      .filter(Boolean)
      .map((r) => r.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((r) => r.length > 10); // Filter out empty or too short lines

    return recommendations.slice(0, 5); // Ensure we get exactly 5

  } catch (error) {
    console.error('OpenAI API error:', error);

    // Fallback recommendations based on trends
    const fallbacks: string[] = [];

    if (trends.energy < 0) {
      fallbacks.push('Prioritize 8 hours of sleep tonight to rebuild your energy reserves and restore vitality.');
    } else if (trends.energy > 5) {
      fallbacks.push('Channel your rising energy into a challenging project or physical activity to maximize momentum.');
    }

    if (trends.focus < 0) {
      fallbacks.push('Try the Pomodoro Technique: 25-minute focused blocks with 5-minute breaks to rebuild concentration.');
    } else if (trends.focus > 5) {
      fallbacks.push('Leverage your heightened focus by tackling your most complex tasks during your peak hours.');
    }

    if (trends.fulfillment < 0) {
      fallbacks.push('Reconnect with your core values through journaling: What truly matters to you right now?');
    } else if (trends.fulfillment > 5) {
      fallbacks.push('Celebrate your growing fulfillment by sharing your wins with someone who supported your journey.');
    }

    // Add general recommendations
    fallbacks.push('Set a single, clear intention each morning to guide your daily choices with purpose.');
    fallbacks.push('Take a 15-minute mindful walk today to reset your mental state and gain fresh perspective.');

    return fallbacks.slice(0, 5);
  }
}

// Save recommendations to database
async function saveRecommendations(
  supabase: any,
  userId: string,
  recommendations: string[],
  patternData: PatternData
): Promise<void> {
  const { trends, summary } = patternData;

  const recommendationRecords = recommendations.map((content) => {
    const { category, priority } = categorizeRecommendation(content);

    return {
      user_id: userId,
      content,
      category,
      priority,
      energy_score: Math.round(summary.avgEnergy || 70),
      focus_score: Math.round(summary.avgFocus || 70),
      fulfillment_score: Math.round(summary.avgFulfillment || 70),
      energy_trend: getTrendDirection(trends.energy),
      focus_trend: getTrendDirection(trends.focus),
      fulfillment_trend: getTrendDirection(trends.fulfillment),
      metadata: {
        trends,
        summary,
        generated_at: new Date().toISOString(),
      },
    };
  });

  const { error } = await supabase
    .from('recommendations')
    .insert(recommendationRecords);

  if (error) {
    console.error('Error saving recommendations:', error);
  }
}

// GET - Fetch recommendations
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we should generate new recommendations
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Get latest recommendations (within last 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentRecommendations, error: fetchError } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching recommendations:', fetchError);
    }

    // If we have recent recommendations and not forcing refresh, return them
    if (recentRecommendations && recentRecommendations.length > 0 && !forceRefresh) {
      // Also get historical recommendations
      const { data: historicalRecommendations } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .lt('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      return NextResponse.json({
        recommendations: recentRecommendations.map((r: any) => ({
          id: r.id,
          content: r.content,
          category: r.category,
          priority: r.priority,
          createdAt: r.created_at,
          isActioned: r.is_actioned,
          feedbackRating: r.feedback_rating,
        })),
        historical: historicalRecommendations || [],
        cached: true,
      });
    }

    // Generate new recommendations
    const patternData = await getPatternData();
    const newRecommendations = await generateAIRecommendations(patternData);

    // Save to database
    await saveRecommendations(supabase, user.id, newRecommendations, patternData);

    // Fetch the newly created recommendations
    const { data: savedRecommendations } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    return NextResponse.json({
      recommendations: savedRecommendations?.map((r: any) => ({
        id: r.id,
        content: r.content,
        category: r.category,
        priority: r.priority,
        createdAt: r.created_at,
        energyScore: r.energy_score,
        focusScore: r.focus_score,
        fulfillmentScore: r.fulfillment_score,
        trends: {
          energy: r.energy_trend,
          focus: r.focus_trend,
          fulfillment: r.fulfillment_trend,
        },
      })) || [],
      cached: false,
      fresh: true,
    });

  } catch (error) {
    console.error('Recommendations API error:', error);

    // Return fallback recommendations
    return NextResponse.json({
      recommendations: [
        {
          content: 'Start your day with a clear intention to guide your focus and energy.',
          category: 'focus',
          priority: 'high',
        },
        {
          content: 'Take regular breaks every 90 minutes to maintain sustainable productivity.',
          category: 'energy',
          priority: 'medium',
        },
        {
          content: 'Journal for 10 minutes tonight to process your day and gain clarity.',
          category: 'growth',
          priority: 'medium',
        },
        {
          content: 'Connect with someone meaningful today to nurture your relationships.',
          category: 'relationships',
          priority: 'medium',
        },
        {
          content: 'Celebrate one small win from today to reinforce positive momentum.',
          category: 'fulfillment',
          priority: 'low',
        },
      ],
      error: 'Using fallback recommendations',
      cached: false,
    });
  }
}

// POST - Mark recommendation as actioned or provide feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recommendationId, action, rating, feedback } = body;

    if (!recommendationId) {
      return NextResponse.json({ error: 'Recommendation ID required' }, { status: 400 });
    }

    let updateData: any = {};

    if (action === 'mark_actioned') {
      updateData = {
        is_actioned: true,
        actioned_at: new Date().toISOString(),
      };
    }

    if (rating) {
      updateData.feedback_rating = rating;
    }

    if (feedback) {
      updateData.feedback_text = feedback;
    }

    const { error: updateError } = await supabase
      .from('recommendations')
      .update(updateData)
      .eq('id', recommendationId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating recommendation:', updateError);
      return NextResponse.json({ error: 'Failed to update recommendation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing recommendation action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
