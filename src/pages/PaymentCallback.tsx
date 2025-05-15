
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { verifyPaymentStatus } from "@/services/paymentService";
import { LoaderCircle, CheckCircle2, XCircle } from "lucide-react";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
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
        const result = await verifyPaymentStatus(bookingId);
        setPaymentStatus(result.status);
        
        // Display appropriate toast message
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
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: "Failed to verify payment status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId, navigate, toast]);

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
          ) : paymentStatus === "confirmed" ? (
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
      
      <Footer />
    </div>
  );
};

export default PaymentCallback;
