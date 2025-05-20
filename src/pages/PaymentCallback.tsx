
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { verifyPaymentStatus } from "@/services/paymentService";
import { LoaderCircle, CheckCircle2, XCircle } from "lucide-react";
import PaymentErrorDialog from "@/components/ui/payment-error-dialog";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentStatus = searchParams.get("status");
  const orderId = searchParams.get("order_id");
  const simulated = searchParams.get("simulated") === "true";
  
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!bookingId) {
        toast({
          title: "Invalid booking",
          description: "No booking ID provided",
          variant: "destructive",
        });
        navigate("/events");
        return;
      }

      try {
        setLoading(true);
        
        // For Cashfree callbacks with order_id, or simulated payments with status
        if ((orderId || simulated) && paymentStatus) {
          // This could be a real Cashfree callback or our simulated payment
          console.log("Processing payment callback", { orderId, paymentStatus, simulated });
          
          // Call payment webhook to update booking status
          try {
            const response = await fetch(`/api/payment-webhook`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: orderId || `ORDER_${bookingId}_${Date.now()}`,
                status: paymentStatus,
                referenceId: `REF_${Date.now()}`,
                paymentMode: simulated ? "SIMULATED" : "CASHFREE",
              }),
            });
            
            if (response.ok) {
              setBookingStatus("confirmed");
              toast({
                title: "Payment successful",
                description: "Your booking has been confirmed",
              });
            } else {
              setBookingStatus("payment_failed");
              toast({
                title: "Payment failed",
                description: "Your payment was not successful",
                variant: "destructive",
              });
            }
          } catch (webhookError) {
            console.error("Error calling payment webhook:", webhookError);
            setBookingStatus("payment_failed");
            setShowError(true);
            setErrorMessage("Failed to update payment status. Please contact support.");
          }
        } else {
          // No status in URL, verify with the backend
          try {
            const result = await verifyPaymentStatus(bookingId);
            setBookingStatus(result.status);
            
            if (result.status === "confirmed") {
              toast({
                title: "Payment successful",
                description: "Your booking has been confirmed",
              });
            } else if (result.status === "payment_failed") {
              toast({
                title: "Payment failed",
                description: "Your payment was not successful",
                variant: "destructive",
              });
            }
          } catch (verifyError) {
            console.error("Error verifying payment:", verifyError);
            setShowError(true);
            setErrorMessage("Failed to verify payment status. Please check your bookings page.");
          }
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: "Failed to verify payment status",
          variant: "destructive",
        });
        setShowError(true);
        setErrorMessage("An unexpected error occurred. Please check your bookings page or try again.");
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
    
    // Clean up URL parameters after processing
    const cleanupUrlParams = () => {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    };
    
    // Clean up after a short delay to allow processing
    const cleanupTimeout = setTimeout(cleanupUrlParams, 1000);
    
    return () => clearTimeout(cleanupTimeout);
  }, [bookingId, navigate, toast, paymentStatus, orderId, simulated]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container py-12">
        <div className="max-w-md mx-auto text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <LoaderCircle className="h-16 w-16 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Verifying Payment</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your payment status...
              </p>
            </div>
          ) : bookingStatus === "confirmed" ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-20 w-20 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p>
                Your booking has been confirmed and your parking spots are reserved.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => navigate(`/bookings/${bookingId}`)} 
                  className="w-full"
                >
                  View Booking
                </Button>
                <Button 
                  onClick={() => navigate("/events")} 
                  variant="outline" 
                  className="w-full"
                >
                  Browse More Events
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <XCircle className="h-20 w-20 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold">Payment Failed</h1>
              <p>
                Your payment was not successful. Please try booking again.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => navigate("/events")} 
                  className="w-full"
                >
                  Browse Events
                </Button>
                <Button 
                  onClick={() => window.history.back()} 
                  variant="outline" 
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <PaymentErrorDialog
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />
      
      <Footer />
    </div>
  );
};

export default PaymentCallback;
