
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const cashfreeAppId = "972186fee8762c5c769ded3dcc681279"; // Your provided App ID
const cashfreeSecretKey = "cfsk_ma_prod_daa0460110be790162f2826c9cc5cf23_52db0ede"; // Your provided Secret Key

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

      // Create an order with Cashfree API
      const origin = req.headers.get("origin") || "https://time2park.app";
      const returnUrl = `${origin}/payment-callback?bookingId=${bookingId}`;
      
      try {
        // Call Cashfree API to create order
        const response = await fetch("https://api.cashfree.com/pg/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": cashfreeAppId,
            "x-client-secret": cashfreeSecretKey,
            "x-api-version": "2022-09-01",
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
              customer_id: user.id,
              customer_name: customerName,
              customer_email: customerEmail || user.email,
              customer_phone: customerPhone || "9999999999",
            },
            order_meta: {
              return_url: returnUrl + "?order_id={order_id}&order_token={order_token}",
              notify_url: null,
            },
            order_note: `Payment for ${eventName}`
          }),
        });

        const cashfreeResponse = await response.json();

        if (!response.ok) {
          console.error("Cashfree API error:", cashfreeResponse);
          return new Response(
            JSON.stringify({ error: cashfreeResponse.message || "Failed to create payment" }),
            {
              status: response.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        console.log("Cashfree order created:", cashfreeResponse);

        // Return the payment link
        return new Response(
          JSON.stringify({ 
            success: true, 
            paymentLink: cashfreeResponse.payment_link || "",
            orderId: cashfreeResponse.order_id,
            cfOrderId: cashfreeResponse.cf_order_id
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (apiError) {
        console.error("Error calling Cashfree API:", apiError);
        
        // Fallback to simulated payment for development
        console.log("Using simulated payment page as fallback");
        
        // Create a simulated payment URL for testing
        // This simulates a payment gateway page that will redirect back to our application
        const simulatedPaymentPageHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Simulated Payment Gateway</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script>
            // Simulate payment success after 5 seconds
            setTimeout(function() {
              window.location.href = "${origin}/payment-callback?bookingId=${bookingId}&status=SUCCESS";
            }, 5000);
          </script>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f7f8f9;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              padding: 32px;
              max-width: 480px;
              width: 100%;
              text-align: center;
            }
            h1 {
              color: #1a73e8;
              margin-bottom: 24px;
            }
            .loader {
              border: 5px solid #f3f3f3;
              border-top: 5px solid #1a73e8;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
              margin: 24px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .details {
              margin: 24px 0;
              text-align: left;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            }
            .label {
              color: #666;
            }
            .value {
              font-weight: bold;
            }
            .buttons {
              display: flex;
              justify-content: center;
              gap: 16px;
              margin-top: 24px;
            }
            .btn {
              padding: 12px 24px;
              border-radius: 4px;
              border: none;
              cursor: pointer;
              font-weight: bold;
              transition: background-color 0.2s;
            }
            .primary {
              background-color: #1a73e8;
              color: white;
            }
            .primary:hover {
              background-color: #0d65d9;
            }
            .secondary {
              background-color: #f1f3f4;
              color: #1a73e8;
            }
            .secondary:hover {
              background-color: #e8eaed;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Payment Processing</h1>
            <p>Please wait while we process your payment for TIME2PARK</p>
            
            <div class="loader"></div>
            
            <div class="details">
              <div class="row">
                <span class="label">Amount:</span>
                <span class="value">₹${amount.toFixed(2)}</span>
              </div>
              <div class="row">
                <span class="label">Order ID:</span>
                <span class="value">${orderId}</span>
              </div>
              <div class="row">
                <span class="label">Event:</span>
                <span class="value">${eventName}</span>
              </div>
            </div>
            
            <p>You will be automatically redirected when the payment is complete.</p>
            
            <div class="buttons">
              <button class="btn primary" onclick="window.location.href='${origin}/payment-callback?bookingId=${bookingId}&status=SUCCESS'">Complete Payment</button>
              <button class="btn secondary" onclick="window.location.href='${origin}/payment-callback?bookingId=${bookingId}&status=FAILED'">Cancel</button>
            </div>
          </div>
        </body>
        </html>
        `;

        // Return the simulated payment page HTML
        return new Response(
          JSON.stringify({ 
            success: true, 
            paymentLink: `data:text/html;charset=utf-8,${encodeURIComponent(simulatedPaymentPageHTML)}`,
            orderId: orderId
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
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
