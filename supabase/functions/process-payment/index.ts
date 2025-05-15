
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const cashfreeAppId = Deno.env.get("CASHFREE_APP_ID") || "";
const cashfreeSecretKey = Deno.env.get("CASHFREE_SECRET_KEY") || "";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define function types
interface PaymentRequestBody {
  bookingId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  eventName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get session to verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify session
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // For POST requests, process the payment
    if (req.method === "POST") {
      const { bookingId, amount, customerName, customerEmail, customerPhone, orderId, eventName } = await req.json() as PaymentRequestBody;
      
      console.log(`Processing payment for booking ${bookingId}, amount: ${amount}`);

      // Validate required fields
      if (!bookingId || !amount || !customerName || !orderId) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // For testing, create a direct payment success response
      // Instead of calling Cashfree API which requires real credentials
      
      // Update booking with payment info
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          status: "payment_pending", 
          payment_order_id: orderId,
          payment_amount: amount
        })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking status:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update booking" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Create a mock payment URL for testing
      // In production, this would be the real Cashfree payment link
      const origin = req.headers.get("origin") || "https://time2park.app";
      const paymentLink = `${origin}/payment-callback?bookingId=${bookingId}&status=SUCCESS`;

      return new Response(
        JSON.stringify({
          success: true,
          paymentLink,
          orderId,
        }),
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
    console.error("Error processing payment:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
