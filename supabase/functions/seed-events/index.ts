
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Sample event data
    const sampleEvents = [
      {
        title: "Taylor Swift: The Eras Tour",
        date: new Date(2025, 4, 20, 19, 0), // May 20, 2025, 7:00 PM
        location: "SoFi Stadium, Los Angeles",
        total_parking_slots: 500,
        available_parking_slots: 500,
        image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
      },
      {
        title: "Coldplay: Music of the Spheres World Tour",
        date: new Date(2025, 5, 15, 18, 30), // June 15, 2025, 6:30 PM
        location: "MetLife Stadium, New Jersey",
        total_parking_slots: 400,
        available_parking_slots: 400,
        image_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
      },
      {
        title: "Beyoncé: Renaissance World Tour",
        date: new Date(2025, 6, 8, 20, 0), // July 8, 2025, 8:00 PM
        location: "Mercedes-Benz Stadium, Atlanta",
        total_parking_slots: 600,
        available_parking_slots: 600,
        image_url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
      },
      {
        title: "Ed Sheeran: Mathematics Tour",
        date: new Date(2025, 7, 12, 19, 30), // August 12, 2025, 7:30 PM
        location: "Wembley Stadium, London",
        total_parking_slots: 450,
        available_parking_slots: 450,
        image_url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
      }
    ];

    // Insert events
    const { data, error } = await supabaseClient
      .from("events")
      .insert(sampleEvents)
      .select();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
