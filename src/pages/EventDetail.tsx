import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ParkingLayout from "@/components/ParkingLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Info, MapPin, QrCode, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Event } from "@/types/event";

// Mock data - in a real app, this would come from an API
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Taylor Swift: The Eras Tour",
    date: "May 20, 2025",
    time: "7:00 PM - 11:00 PM",
    location: "SoFi Stadium, Los Angeles",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 123,
    parkingTotal: 500
  },
  {
    id: 2,
    title: "Coldplay: Music of the Spheres World Tour",
    date: "June 15, 2025",
    time: "6:30 PM - 10:30 PM",
    location: "MetLife Stadium, New Jersey",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 42,
    parkingTotal: 400
  },
  {
    id: 3,
    title: "Beyoncé: Renaissance World Tour",
    date: "July 8, 2025",
    time: "8:00 PM - 11:30 PM",
    location: "Mercedes-Benz Stadium, Atlanta",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 350,
    parkingTotal: 600
  },
  {
    id: 4,
    title: "Ed Sheeran: Mathematics Tour",
    date: "August 12, 2025",
    time: "7:30 PM - 10:30 PM",
    location: "Wembley Stadium, London",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 75,
    parkingTotal: 450
  }
];

interface ParkingSlot {
  id: string;
  state: string;
  row: number;
  column: number;
  price: number;
}

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<ParkingSlot[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to fetch event details
    const fetchEvent = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        const foundEvent = mockEvents.find(e => e.id === Number(eventId));
        
        if (foundEvent) {
          setEvent(foundEvent);
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
    };

    fetchEvent();
  }, [eventId, navigate, toast]);

  const handleSlotSelect = (slots: ParkingSlot[]) => {
    setSelectedSlots(slots);
  };

  const handleBooking = () => {
    if (selectedSlots.length === 0) {
      toast({
        title: "No parking selected",
        description: "Please select a parking slot before booking.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    // Simulate booking process
    setTimeout(() => {
      setIsBooking(false);
      setBookingComplete(true);
      toast({
        title: "Booking successful!",
        description: "Your parking spot has been reserved.",
      });
    }, 1500);
  };

  // Calculate total price
  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  // Generate QR code data (in a real app, this would be a unique identifier)
  const qrCodeData = `SLOTSPOT-${eventId}-${selectedSlots.map(s => s.id).join('-')}-${Date.now()}`;

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
            {/* Event Hero */}
            <div className="relative h-80 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 container py-8 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-4 items-center text-sm md:text-base">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="container py-8">
              {bookingComplete ? (
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Ticket className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your parking spot{selectedSlots.length > 1 ? 's' : ''} for {event.title} {selectedSlots.length > 1 ? 'have' : 'has'} been reserved.
                  </p>
                  
                  <div className="mb-6 flex justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`}
                      alt="Booking QR Code"
                      className="border rounded-lg p-3 max-w-full h-auto"
                    />
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg mb-6 text-left">
                    <h3 className="font-semibold mb-2">Booking Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Event:</div>
                      <div className="font-medium">{event.title}</div>
                      
                      <div>Date:</div>
                      <div className="font-medium">{event.date}</div>
                      
                      <div>Time:</div>
                      <div className="font-medium">{event.time}</div>
                      
                      <div>Location:</div>
                      <div className="font-medium">{event.location}</div>
                      
                      <div>Parking Spot{selectedSlots.length > 1 ? 's' : ''}:</div>
                      <div className="font-medium">
                        {selectedSlots.map(slot => slot.id).join(', ')}
                      </div>
                      
                      <div>Total Paid:</div>
                      <div className="font-medium">${totalPrice.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => {
                        // Download as PDF - in a real app, this would generate a PDF
                        toast({
                          title: "PDF Generated",
                          description: "Your booking confirmation has been downloaded.",
                        });
                      }}
                      variant="outline"
                    >
                      Download PDF
                    </Button>
                    <Button onClick={() => navigate("/")}>
                      Return to Home
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Tabs defaultValue="parking" className="w-full">
                      <TabsList className="mb-6">
                        <TabsTrigger value="parking">Parking</TabsTrigger>
                        <TabsTrigger value="details">Event Details</TabsTrigger>
                        <TabsTrigger value="venue">Venue Info</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="parking">
                        <ParkingLayout eventId={Number(eventId)} onSlotSelect={handleSlotSelect} />
                      </TabsContent>
                      
                      <TabsContent value="details">
                        <div className="prose max-w-none">
                          <h3>About This Event</h3>
                          <p>
                            {event.title} is coming to {event.location.split(',')[0]} on {event.date}! 
                            Don't miss this incredible live performance featuring all their hit songs and amazing stage production.
                          </p>
                          
                          <h3>Event Schedule</h3>
                          <ul>
                            <li><strong>Doors Open:</strong> 5:30 PM</li>
                            <li><strong>Opening Act:</strong> 7:00 PM</li>
                            <li><strong>Main Performance:</strong> 8:15 PM</li>
                            <li><strong>Event End (Estimated):</strong> 11:00 PM</li>
                          </ul>
                          
                          <h3>Important Information</h3>
                          <p>
                            Please arrive early to ensure smooth entry. All attendees must have valid tickets for the event.
                            Photography is permitted but professional cameras and recording equipment are prohibited.
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="venue">
                        <div className="prose max-w-none">
                          <h3>Venue Information</h3>
                          <p>
                            {event.location} is one of the premier entertainment venues in the country, 
                            hosting major concerts, sporting events, and special occasions throughout the year.
                          </p>
                          
                          <h3>Parking Information</h3>
                          <p>
                            The venue offers several parking lots with varying proximity to the main entrance.
                            All parking spots reserved through SlotSpot are guaranteed and will be held until the event starts.
                          </p>
                          
                          <h3>Accessibility</h3>
                          <p>
                            The venue is fully accessible for guests with disabilities. Accessible parking spots are available in all lots.
                            Please contact the venue directly for any specific accessibility requirements.
                          </p>
                          
                          <div className="mt-6">
                            <img 
                              src="https://images.unsplash.com/photo-1522158637959-30ab8018e198?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                              alt="Venue map" 
                              className="rounded-lg w-full max-w-xl h-auto"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div>
                    <div className="bg-card border rounded-lg p-6 sticky top-24">
                      <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Event</p>
                          <p className="font-medium">{event.title}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium">{event.date}, {event.time}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{event.location}</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Selected Parking</p>
                          {selectedSlots.length > 0 ? (
                            <div className="mt-2 space-y-2">
                              {selectedSlots.map((slot) => (
                                <div key={slot.id} className="flex justify-between items-center">
                                  <span>Spot {slot.id}</span>
                                  <span className="font-medium">${slot.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic">No spots selected</p>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total</span>
                          <span>${totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        onClick={handleBooking} 
                        disabled={selectedSlots.length === 0 || isBooking}
                      >
                        {isBooking ? "Processing..." : "Complete Booking"}
                      </Button>
                      
                      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <p>
                          By completing this booking, you agree to our Terms of Service and Parking Policies. 
                          Bookings are non-refundable after 24 hours before the event.
                        </p>
                      </div>
                    </div>
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
