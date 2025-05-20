
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    if (req.method === "POST") {
      const payload = await req.json();
      console.log("Payment webhook received:", payload);

      // Extract relevant fields based on whether it's a test or Cashfree callback
      let orderId, paymentStatus, referenceId, paymentMode;
      
      if (payload.orderId) {
        // Simulated payment format
        orderId = payload.orderId;
        paymentStatus = payload.status;
        referenceId = payload.referenceId || `REF_${Date.now()}`;
        paymentMode = payload.paymentMode || "SIMULATED";
      } else if (payload.order_id) {
        // Cashfree callback format
        orderId = payload.order_id;
        paymentStatus = payload.order_status || payload.txStatus;
        referenceId = payload.cf_payment_id || payload.transaction_id;
        paymentMode = payload.payment_method || "CASHFREE";
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid webhook payload" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Missing order ID in payload" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Find the booking associated with this order
      const { data: bookings, error: bookingError } = await supabase
        .from("bookings")
        .select("id, event_id")
        .eq("payment_order_id", orderId);

      if (bookingError || !bookings || bookings.length === 0) {
        console.error("Error finding booking:", bookingError || "Booking not found");
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const booking = bookings[0];
      const bookingId = booking.id;
      
      // Determine status from payment response
      let status;
      if (paymentStatus === "SUCCESS" || paymentStatus === "PAID" || paymentStatus === "confirmed") {
        status = "confirmed";
      } else {
        status = "payment_failed";
      }
      
      // Update the booking with payment information
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: status,
          payment_reference_id: referenceId,
          payment_mode: paymentMode,
          payment_date: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update booking" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, status: status }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If not a POST request, return method not allowed
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
