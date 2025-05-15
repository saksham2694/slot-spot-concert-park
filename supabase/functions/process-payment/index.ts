
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

      // Build request body for Cashfree API
      const paymentLinkData = {
        appId: cashfreeAppId,
        secretKey: cashfreeSecretKey,
        orderId: orderId,
        orderAmount: amount,
        orderCurrency: "INR",
        orderNote: `Parking reservation for ${eventName}`,
        customerName: customerName,
        customerEmail: customerEmail || "customer@example.com", // Fallback if email not provided
        customerPhone: customerPhone || "9999999999", // Fallback if phone not provided
        returnUrl: `${req.headers.get("origin") || "https://time2park.app"}/payment-callback?bookingId=${bookingId}`,
        notifyUrl: `${supabaseUrl}/functions/v1/payment-webhook`,
      };

      // Call Cashfree API to create payment link
      const response = await fetch("https://api.cashfree.com/api/v1/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentLinkData),
      });

      const responseData = await response.json();
      
      console.log("Cashfree API response:", responseData);

      if (!response.ok) {
        throw new Error(`Cashfree API error: ${JSON.stringify(responseData)}`);
      }

      // Update booking status to pending payment
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "payment_pending", payment_order_id: orderId })
        .eq("id", bookingId);

      if (updateError) {
        console.error("Error updating booking status:", updateError);
      }

      // Return the payment link to the client
      return new Response(
        JSON.stringify({
          success: true,
          paymentLink: responseData.paymentLink,
          orderId: orderId,
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
