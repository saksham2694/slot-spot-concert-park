
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
    // Create a unique order ID
    const orderId = `ORDER_${bookingId}_${Date.now()}`;
    
    // Call the Supabase Edge Function to process the payment
    const { data, error } = await supabase.functions.invoke("process-payment", {
      body: {
        bookingId,
        amount,
        customerName,
        customerEmail,
        customerPhone,
        orderId,
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

    if (!data || !data.paymentLink) {
      toast({
        title: "Payment Error",
        description: "No payment link received. Please try again.",
        variant: "destructive",
      });
      throw new Error("No payment link received");
    }
    
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
