
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ProcessPaymentParams {
  bookingId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  eventName: string;
}

export async function processPayment(params: ProcessPaymentParams) {
  const { bookingId, amount, customerName, customerEmail, customerPhone, eventName } = params;
  
  try {
    console.log("Calling process-payment function with params:", params);
    
    // Call the Supabase Edge Function to process the payment
    const { data, error } = await supabase.functions.invoke("process-payment", {
      body: {
        bookingId,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        eventName
      }
    });
    
    if (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }

    // Check for valid response data
    if (!data) {
      const noDataError = new Error("No response data received");
      console.error("Payment service error:", noDataError);
      toast({
        title: "Payment Error",
        description: "No response received from payment server. Please try again.",
        variant: "destructive",
      });
      throw noDataError;
    }
    
    // Check for payment link
    if (!data.paymentLink) {
      const noLinkError = new Error("No payment link received");
      console.error("Payment service error:", noLinkError);
      toast({
        title: "Payment Error",
        description: "Failed to generate payment link. Please try again.",
        variant: "destructive",
      });
      throw noLinkError;
    }
    
    // Return the payment link data
    console.log("Payment link generated:", data.paymentLink);
    return data;
  } catch (error) {
    console.error("Payment service error:", error);
    toast({
      title: "Payment Error",
      description: "Failed to process payment. Please try again.",
      variant: "destructive",
    });
    throw error;
  }
}

export async function verifyPaymentStatus(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select("status, payment_reference_id, payment_amount, payment_date")
      .eq("id", bookingId)
      .single();
    
    if (error) {
      console.error("Error verifying payment status:", error);
      throw error;
    }
    
    return {
      status: data.status,
      paymentReferenceId: data.payment_reference_id,
      amount: data.payment_amount,
      date: data.payment_date
    };
  } catch (error) {
    console.error("Error verifying payment status:", error);
    throw error;
  }
}
