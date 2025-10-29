/**
 * Calculate GFS (Global Fulfillment Score) Edge Function
 *
 * Purpose: Calculates the weighted global fulfillment score (0-100)
 * based on area scores and user-defined weights.
 *
 * Formula: GFS = SUM(area_score * area_weight) * 20
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GFSRequest {
  profile_id: string;
  period: string; // 'YYYY-MM' or 'YYYY-Q1'
}

serve(async (req) => {
  try {
    // CORS handling
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { profile_id, period }: GFSRequest = await req.json();

    if (!profile_id || !period) {
      return new Response(
        JSON.stringify({ error: 'profile_id and period are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Calculating GFS for profile ${profile_id}, period ${period}`);

    // 1. Fetch all areas with scores
    const { data: areaScores, error: scoresError } = await supabase
      .from('fd_score_rollup')
      .select(`
        score,
        fd_area (
          id,
          code,
          name,
          weight_default
        )
      `)
      .eq('user_id', profile_id)
      .eq('period', period);

    if (scoresError) throw scoresError;

    // 2. Fetch user-defined weights
    const { data: userWeights, error: weightsError } = await supabase
      .from('fd_user_area_weight')
      .select('area_id, weight')
      .eq('user_id', profile_id)
      .lte('effective_from', `${period}-01`);

    if (weightsError) throw weightsError;

    // 3. Build weights map
    const weightsMap = new Map<string, number>();
    userWeights?.forEach((w) => {
      weightsMap.set(w.area_id, w.weight);
    });

    // 4. Calculate weighted score
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const breakdown: any[] = [];

    areaScores?.forEach((item) => {
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

    // 5. Normalize to 0-100 scale
    // GFS = (sum of weighted scores) * 20
    // Assumes max score per area is 5, and weights sum to 1
    const gfs = Math.round(totalWeightedScore * 20);
    const confidence = calculateConfidence(areaScores?.length || 0, totalWeight);

    // 6. Save to cache (optional)
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-gfs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(areaCount: number, totalWeight: number): number {
  // Ideal: 16 areas, total weight = 1.0
  const areaCoverage = Math.min(areaCount / 16, 1.0);
  const weightNormalized = Math.min(totalWeight, 1.0);

  return Math.round((areaCoverage * 0.6 + weightNormalized * 0.4) * 100) / 100;
}
