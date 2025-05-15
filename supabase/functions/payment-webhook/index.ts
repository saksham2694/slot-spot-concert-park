
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const cashfreeSecretKey = Deno.env.get("CASHFREE_SECRET_KEY") || "";

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

      // Validate the webhook signature
      // Note: In production, you should verify the webhook signature from Cashfree

      const { orderId, orderAmount, referenceId, txStatus, paymentMode, txTime } = payload;

      if (!orderId) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook payload" }),
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
      
      // Update booking status based on payment status
      const status = txStatus === "SUCCESS" ? "confirmed" : "payment_failed";
      
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: status,
          payment_reference_id: referenceId,
          payment_mode: paymentMode,
          payment_amount: orderAmount,
          payment_date: txTime,
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

      // If payment was successful, ensure parking slots are properly allocated
      if (status === "confirmed") {
        // No need to call decrement here, as it should be handled by the booking trigger
        console.log(`Payment confirmed for booking ${bookingId}`);
      } else if (status === "payment_failed") {
        // Release the parking slots if payment failed
        console.log(`Payment failed for booking ${bookingId}, releasing slots`);
        
        // Get all booking slots associated with this booking
        const { data: bookingSlots, error: slotsError } = await supabase
          .from("booking_slots")
          .select("parking_layout_id")
          .eq("booking_id", bookingId);
          
        if (!slotsError && bookingSlots && bookingSlots.length > 0) {
          // Free up all the parking spots
          for (const slot of bookingSlots) {
            await supabase
              .from("parking_layouts")
              .update({ is_reserved: false })
              .eq("id", slot.parking_layout_id);
          }
          
          // Update the available slots count in the events table
          if (booking.event_id) {
            await supabase.rpc('increment', { 
              x: bookingSlots.length, 
              row_id: booking.event_id 
            });
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
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
