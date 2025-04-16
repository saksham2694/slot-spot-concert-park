import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Event } from "@/types/event";
import { fetchEventById } from "@/services/eventService";
import { useAuth } from "@/context/AuthContext";
import { createBooking } from "@/services/bookingService";
import EventHero from "@/components/event/EventHero";
import BookingSummary from "@/components/event/BookingSummary";
import AuthPrompt from "@/components/event/AuthPrompt";
import EventTabs from "@/components/event/EventTabs";
import BookingConfirmation from "@/components/event/BookingConfirmation";
import { ParkingSlot } from "@/types/parking";

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<ParkingSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      if (!eventId) {
        toast({
          title: "Invalid event ID",
          description: "The event ID is missing.",
          variant: "destructive",
        });
        navigate("/events");
        return;
      }

      const fetchedEvent = await fetchEventById(eventId);
      
      if (fetchedEvent) {
        setEvent(fetchedEvent);
      } else {
        toast({
          title: "Event not found",
          description: "The event you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/events");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [eventId, navigate, toast]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent, refreshTrigger]);

  const handleSlotSelect = useCallback((slots: ParkingSlot[]) => {
    setSelectedSlots(slots);
  }, []);

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book a parking spot.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedSlots.length === 0) {
      toast({
        title: "No parking selected",
        description: "Please select a parking slot before booking.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const slot = selectedSlots[0];
      const bookingData = {
        eventId: eventId!,
        parkingSlotId: slot.id,
        price: slot.price,
        slotLabel: slot.id,
      };
      
      const newBookingId = await createBooking(bookingData);
      
      if (newBookingId) {
        setBookingId(newBookingId);
        setIsBooking(false);
        setBookingComplete(true);
        
        setRefreshTrigger(prev => prev + 1);
        
        toast({
          title: "Booking successful!",
          description: "Your parking spot has been reserved.",
        });
      } else {
        throw new Error("Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking failed",
        description: "Failed to create your booking. Please try again.",
        variant: "destructive",
      });
      setIsBooking(false);
    }
  };

  const qrCodeData = `SLOTSPOT-${eventId}-${selectedSlots.map(s => s.id).join('-')}-${bookingId || Date.now()}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {loading ? (
          <div className="container py-8">
            <Skeleton className="h-80 w-full rounded-xl mb-8" />
            <Skeleton className="h-10 w-2/3 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-6 w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : event ? (
          <>
            <EventHero event={event} />

            <div className="container py-8">
              {bookingComplete ? (
                <BookingConfirmation 
                  event={event}
                  selectedSlots={selectedSlots}
                  qrCodeData={qrCodeData}
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    {!user ? (
                      <AuthPrompt />
                    ) : (
                      <EventTabs
                        eventId={eventId || ""}
                        parkingTotal={event.parkingTotal}
                        parkingAvailable={event.parkingAvailable}
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
                      onBookingClick={handleBooking}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/events")}>
              Browse All Events
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default EventDetail;
