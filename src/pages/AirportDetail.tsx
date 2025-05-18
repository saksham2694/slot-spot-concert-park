
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plane, CalendarIcon } from "lucide-react";
import { Airport } from "@/types/airport";
import { ParkingSlot, assertData } from "@/types/parking";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addHours } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AirportParkingLayout from "@/components/parking/AirportParkingLayout";
import AuthPrompt from "@/components/event/AuthPrompt";
import BookingConfirmation from "@/components/airport/BookingConfirmation";
import { createAirportBooking } from "@/services/airportBookingService";

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

const AuthPrompt2 = ({ open, onOpenChange, message }: AuthPromptProps) => {
  return <AuthPrompt isOpen={open} onClose={() => onOpenChange(false)} message={message} />;
};

const AirportDetail = () => {
  const { airportId } = useParams<{ airportId: string }>();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<ParkingSlot[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [hours, setHours] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchAirportDetails = async () => {
      if (!airportId) {
        toast({
          title: "Error",
          description: "Airport ID is missing.",
          variant: "destructive",
        });
        navigate("/airports");
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("airports")
          .select("*")
          .eq("id", airportId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setAirport(assertData<Airport>(data));
        } else {
          toast({
            title: "Not found",
            description: "Airport not found.",
            variant: "destructive",
          });
          navigate("/airports");
        }
      } catch (error) {
        console.error("Error fetching airport:", error);
        toast({
          title: "Error",
          description: "Failed to load airport details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAirportDetails();
  }, [airportId, navigate, toast]);

  const handleSlotSelection = (slots: ParkingSlot[]) => {
    setSelectedSlots(slots);
  };

  const handleBookButtonClick = async () => {
    if (!airport || !date) return;

    if (!isAuthenticated) {
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
      const endDate = addHours(date, hours);
      
      const newBookingId = await createAirportBooking({
        airportId: airport.id,
        selectedSlots,
        startDate: date,
        endDate,
        hours
      });
      
      if (newBookingId) {
        setBookingId(newBookingId);
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Error",
        description: "Failed to create the booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const totalPrice = selectedSlots.reduce((sum, slot) => sum + (slot.price * hours), 0);

  // If booking is confirmed, show confirmation page
  if (bookingId && airport) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-8">
          <BookingConfirmation
            bookingId={bookingId}
            airportName={airport.name}
            location={airport.location}
            startDate={date ? format(date, "PPP 'at' p") : ''}
            endDate={date ? format(addHours(date, hours), "PPP 'at' p") : ''}
            totalPrice={totalPrice}
            totalHours={hours}
            parkingSpots={selectedSlots.map(slot => slot.id)}
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
        {loading ? (
          <div className="container py-8">
            <Skeleton className="h-64 w-full rounded-xl mb-8" />
            <Skeleton className="h-10 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Skeleton className="h-72 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : airport ? (
          <>
            {/* Airport Hero */}
            <div className="relative bg-muted h-64 md:h-80">
              {airport.image_url ? (
                <img
                  src={airport.image_url}
                  alt={airport.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Plane className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="container">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{airport.name}</h1>
                  <p className="text-lg opacity-90">{airport.location}</p>
                </div>
              </div>
            </div>

            <div className="container py-8">
              <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-2xl font-semibold mb-4">Airport Parking Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-1">Hourly Rate</h3>
                    <p className="text-2xl font-bold text-primary">₹{airport.hourly_rate.toFixed(2)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-1">Available Spots</h3>
                    <p className="text-2xl font-bold">{airport.available_parking_slots} / {airport.total_parking_slots}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-1">Location</h3>
                    <p className="text-lg">{airport.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Tabs defaultValue="date" className="w-full">
                    <TabsList className="mb-6">
                      <TabsTrigger value="date">Select Date & Time</TabsTrigger>
                      <TabsTrigger value="slots">Select Parking Slot</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="date">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium mb-2">Select Date</h3>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div>
                              <h3 className="text-lg font-medium mb-2">Duration</h3>
                              <Select
                                defaultValue="1"
                                onValueChange={(value) => setHours(parseInt(value, 10))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[...Array(12)].map((_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                      {i + 1} {i + 1 === 1 ? "hour" : "hours"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="pt-4">
                              <p className="text-sm text-muted-foreground mb-4">
                                Once you've selected your date and duration, proceed to select your parking slot.
                              </p>
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  const tabElement = document.querySelector('[data-value="slots"]');
                                  if (tabElement instanceof HTMLElement) {
                                    tabElement.click();
                                  }
                                }}
                              >
                                Continue to Slot Selection
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    <TabsContent value="slots">
                      <AirportParkingLayout 
                        airportId={airport.id}
                        totalSlots={airport.total_parking_slots}
                        availableSlots={airport.available_parking_slots}
                        hourlyRate={airport.hourly_rate}
                        onSlotSelect={handleSlotSelection}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Airport:</span>
                          <span className="font-medium">{airport.name}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">{date ? format(date, "PPP") : "Not selected"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium">
                            {date ? format(date, "p") : "Not selected"} - {date ? format(addHours(date, hours), "p") : "Not selected"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">{hours} {hours === 1 ? "hour" : "hours"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Selected Spots:</span>
                          <span className="font-medium">
                            {selectedSlots.length > 0 
                              ? selectedSlots.map(spot => spot.id).join(", ") 
                              : "None selected"}
                          </span>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total Price:</span>
                            <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-6" 
                        disabled={!date || selectedSlots.length === 0 || isBooking}
                        onClick={handleBookButtonClick}
                      >
                        {isBooking ? "Processing..." : "Complete Booking"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Airport Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The airport you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/airports")}>
              Browse All Airports
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Auth Prompt Dialog */}
      {showAuthPrompt && (
        <AuthPrompt2
          open={showAuthPrompt}
          onOpenChange={setShowAuthPrompt}
          message="You need to be logged in to book a parking spot."
        />
      )}
    </div>
  );
};

export default AirportDetail;
