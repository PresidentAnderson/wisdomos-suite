/**
 * Netlify Edge Function: Calculate GFS
 */

import { Context } from "https://edge.netlify.com";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GFSRequest {
  profile_id: string;
  period: string;
}

export default async (request: Request, context: Context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    const { profile_id, period }: GFSRequest = await request.json();

    if (!profile_id || !period) {
      return new Response(
        JSON.stringify({ error: 'profile_id and period are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabaseHeaders = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    };

    // Fetch scores with area data
    const scoresResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/fd_score_rollup?user_id=eq.${profile_id}&period=eq.${period}&select=score,fd_area(id,code,name,weight_default)`,
      { headers: supabaseHeaders }
    );
    const areaScores = await scoresResponse.json();

    // Fetch user weights
    const weightsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/fd_user_area_weight?user_id=eq.${profile_id}&effective_from=lte.${period}-01`,
      { headers: supabaseHeaders }
    );
    const userWeights = await weightsResponse.json();

    // Build weights map
    const weightsMap = new Map();
    userWeights?.forEach((w: any) => {
      weightsMap.set(w.area_id, w.weight);
    });

    // Calculate weighted score
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const breakdown: any[] = [];

    areaScores?.forEach((item: any) => {
      const area = item.fd_area;
      if (!area) return;

      const weight = weightsMap.get(area.id) || area.weight_default;
      const score = item.score || 0;
      const weightedScore = score * weight;

      totalWeightedScore += weightedScore;
      totalWeight += weight;

      breakdown.push({
        area_code: area.code,
        area_name: area.name,
        score,
        weight,
        weighted_score: weightedScore,
      });
    });

    const gfs = Math.round(totalWeightedScore * 20);
    const confidence = calculateConfidence(areaScores?.length || 0, totalWeight);

    const result = {
      profile_id,
      period,
      gfs,
      confidence,
      total_weighted_score: totalWeightedScore,
      total_weight: totalWeight,
      breakdown,
      calculated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

function calculateConfidence(areaCount: number, totalWeight: number): number {
  const areaCoverage = Math.min(areaCount / 16, 1.0);
  const weightNormalized = Math.min(totalWeight, 1.0);
  return Math.round((areaCoverage * 0.6 + weightNormalized * 0.4) * 100) / 100;
}

export const config = { path: "/functions/calculate-gfs" };
