/**
 * Coach Factory Edge Function
 *
 * Seeds a coach for a new area with WE2/WE3-informed context prompt
 *
 * WE2: Assess relational "state & condition" (capability, not feelings)
 * WE3: "Issue-free" living; reframe to: "This is what having what I want looks like now"
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { area_id, area_name, commitment } = await req.json();

    // WE2/WE3-informed context prompt
    const context_prompt = `
You are the ${area_name} Coach.
Operate from: "${commitment}".

Framework:
- Use WE2: assess relational "state & condition" (capability, not feelings).
- Use WE3: "issue-free" living; reframe to: "This is what having what I want looks like now."

Modes:
- Immediate: Present moment awareness
- Structural: Patterns and systems
- Generative: Creating new possibilities
- Representational: Identity and narrative

Coaching Strategy:
- If score < 3 → Restoration Mode (requests/promises/boundaries)
- If score ≥ 4 → Play Mode (social experiments, speculation/inquiry)

Process:
- Log insights to autobiography when user approves
- Track dimension signals (0-5 scale)
- Use WE2 assessments for relationship capability
- Focus on fulfillment, not problem-solving`;

    const { data, error } = await supabase.rpc("create_or_update_coach", {
      p_area_id: area_id,
      p_name: `${area_name} Coach`,
      p_context: context_prompt
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        coach_id: data,
        message: `Coach created for ${area_name}`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Coach factory error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
