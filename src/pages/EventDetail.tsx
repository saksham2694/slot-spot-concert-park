
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { ParkingSlot } from "@/types/parking";
import EventHero from "@/components/event/EventHero";
import EventTabs from "@/components/event/EventTabs";
import BookingSummary from "@/components/event/BookingSummary";
import AuthPrompt from "@/components/event/AuthPrompt";
import BookingConfirmation from "@/components/event/BookingConfirmation";
import { useAuth } from "@/context/AuthContext";
import { fetchEventById } from "@/services/eventService";
import { createBooking } from "@/services/bookingService";
import { useParkingLayout } from "@/hooks/useParkingLayout";
import ErrorDialog from "@/components/ui/error-dialog";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<ParkingSlot[]>([]);
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getEventDetails = async () => {
      if (!eventId) {
        toast({
          title: "Error",
          description: "Event ID is missing.",
          variant: "destructive",
        });
        navigate("/events");
        return;
      }

      try {
        setLoading(true);
        const eventData = await fetchEventById(eventId);
        
        if (eventData) {
          setEvent(eventData);
        } else {
          toast({
            title: "Not found",
            description: "Event not found.",
            variant: "destructive",
          });
          navigate("/events");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getEventDetails();
  }, [eventId, navigate, toast]);

  // Handle slot selection from the parking layout
  const handleSlotSelect = (slots: ParkingSlot[]) => {
    console.log("Selected slots updated:", slots);
    setSelectedSlots(slots);
  };

  // Handle booking click
  const handleBookingClick = async () => {
    if (!event) return;

    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (selectedSlots.length === 0) {
      toast({
        title: "No slots selected",
        description: "Please select at least one parking slot",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);
      const createdBookingId = await createBooking(
        eventId!,
        user.id,
        selectedSlots
      );
      
      if (createdBookingId) {
        setBookingId(createdBookingId);
      } else {
        throw new Error("Failed to create booking. No booking ID returned.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setErrorMessage("Failed to create the booking. Please try again.");
      setShowError(true);
    } finally {
      setIsBooking(false);
    }
  };

  // If booking is confirmed, show confirmation page
  if (bookingId && event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-8">
          <BookingConfirmation 
            bookingId={bookingId}
            event={event}
            selectedSlots={selectedSlots}
            qrCodeData={`TIME2PARK-EVENT-${bookingId}`}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {event && <EventHero event={event} />}
        
        <div className="container py-8">
          {loading ? (
            <div className="text-center py-10">Loading event details...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                {event && (
                  <EventTabs
                    eventId={event.id}
                    parkingTotal={event.parkingTotal || 0}
                    parkingAvailable={event.parkingAvailable || 0}
                    parkingPrice={event.parkingPrice || 0}
                    onSlotSelect={handleSlotSelect}
                  />
                )}
              </div>
              
              <div>
                <BookingSummary
                  event={event}
                  selectedSlots={selectedSlots}
                  isBooking={isBooking}
                  isUserLoggedIn={!!user}
                  onBookingClick={handleBookingClick}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
      
      {showAuthPrompt && (
        <AuthPrompt
          isOpen={true}
          onClose={() => setShowAuthPrompt(false)}
          message="You need to be logged in to book a parking spot."
        />
      )}
      
      {showError && (
        <ErrorDialog 
          isOpen={showError} 
          onClose={() => setShowError(false)} 
          message={errorMessage}
        />
      )}
    </div>
  );
};

export default EventDetail;
