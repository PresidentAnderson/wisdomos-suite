/**
 * Coach Turn Edge Function
 *
 * Logs a conversation turn between user and coach
 * Optionally adds approved insights to autobiography
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const {
      area_id,
      role,
      content_md,
      tags = [],
      autobio = false
    } = body;

    // Validate required fields
    if (!area_id || !role || !content_md) {
      throw new Error("Missing required fields: area_id, role, content_md");
    }

    // Validate role
    if (!['user', 'coach', 'system'].includes(role)) {
      throw new Error("Role must be one of: user, coach, system");
    }

    const { error } = await supabase.rpc("coach_log", {
      p_area_id: area_id,
      p_role: role,
      p_content_md: content_md,
      p_tags: tags,
      p_autobio: autobio
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({
        ok: true,
        message: autobio
          ? "Turn logged and added to autobiography"
          : "Turn logged successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Coach turn error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
