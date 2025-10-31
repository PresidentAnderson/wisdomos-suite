/**
 * Signal Write Edge Function
 *
 * Write a dimension signal (0..5 scale) with optional note
 * Used for tracking fulfillment metrics over time
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { area_id, key, value, note } = await req.json();

    // Validate required fields
    if (!area_id || !key || value === undefined) {
      throw new Error("Missing required fields: area_id, key, value");
    }

    // Validate value range
    if (value < 0 || value > 5) {
      throw new Error("Value must be between 0 and 5");
    }

    const { error } = await supabase.rpc("upsert_dim_signal", {
      p_area_id: area_id,
      p_key: key,
      p_value: value,
      p_note: note ?? null
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Signal recorded successfully",
        data: { area_id, key, value, note }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Signal write error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
