import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Download, MapPin, QrCode, ChevronLeft, Ticket, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchBookingById } from "@/services/bookingService";
import { fetchUniversityBookingById } from "@/services/universityBookingService";
import { fetchAirportBookingById } from "@/services/airportBookingService";
import { downloadBookingPDF, showQRCode } from "@/services/pdfService";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import AuthPrompt from "@/components/event/AuthPrompt";
import { Event } from "@/types/event";
import { ParkingSlot } from "@/types/parking";
import { Booking, BookingStatus } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

// Helper functions to type check the type of booking
const isEventBooking = (booking: Booking | null): booking is Booking & { eventId?: string, event_id?: string } => {
  return booking !== null && (booking.eventId !== undefined || booking.event_id !== undefined);
};

const isUniversityBooking = (booking: Booking | null): booking is Booking & { university_id: string } => {
  return booking !== null && booking.university_id !== undefined;
};

const isAirportBooking = (booking: Booking | null): booking is Booking & { airport_id: string } => {
  return booking !== null && booking.airport_id !== undefined;
};

const BookingDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);
  const [bookingType, setBookingType] = useState<"event" | "university" | "airport" | null>(null);
  const [universityData, setUniversityData] = useState<{ name: string; location: string } | null>(null);
  const [airportData, setAirportData] = useState<{ name: string; location: string } | null>(null);
  const [parkingSpots, setParkingSpots] = useState<string[]>([]);

  // Try to fetch event booking first
  const { 
    data: eventBooking, 
    isLoading: eventBookingLoading, 
    error: eventBookingError 
  } = useQuery({
    queryKey: ["eventBooking", bookingId],
    queryFn: () => fetchBookingById(bookingId as string),
    enabled: !!user && !!bookingId,
    retry: false,
    meta: {
      onSuccess: (data: any) => {
        if (data) setBookingType("event");
      }
    }
  });

  // If not an event booking, try university booking
  const { 
    data: universityBooking, 
    isLoading: universityBookingLoading, 
    error: universityBookingError 
  } = useQuery({
    queryKey: ["universityBooking", bookingId],
    queryFn: () => fetchUniversityBookingById(bookingId as string),
    enabled: !!user && !!bookingId && !eventBooking,
    retry: false,
    meta: {
      onSuccess: (data: any) => {
        if (data) setBookingType("university");
      }
    }
  });

  // If not an event or university booking, try airport booking
  const { 
    data: airportBooking, 
    isLoading: airportBookingLoading, 
    error: airportBookingError 
  } = useQuery({
    queryKey: ["airportBooking", bookingId],
    queryFn: () => fetchAirportBookingById(bookingId as string),
    enabled: !!user && !!bookingId && !eventBooking && !universityBooking,
    retry: false,
    meta: {
      onSuccess: (data: any) => {
        if (data) setBookingType("airport");
      }
    }
  });

  // Update booking type when data is fetched
  useEffect(() => {
    if (eventBooking) {
      setBookingType("event");
    } else if (universityBooking) {
      setBookingType("university");
      // Fetch university details and parking spots
      fetchUniversityDetails();
    } else if (airportBooking) {
      setBookingType("airport");
      // Fetch airport details and parking spots
      fetchAirportDetails();
    }
  }, [eventBooking, universityBooking, airportBooking]);

  // Fetch university details and parking spots
  const fetchUniversityDetails = async () => {
    if (!universityBooking || !isUniversityBooking(universityBooking)) return;
    
    try {
      // Fetch university data
      const { data: universityData, error: universityError } = await supabase
        .from("universities")
        .select("name, location")
        .eq("id", universityBooking.university_id)
        .single();
      
      if (universityError) {
        console.error("Error fetching university:", universityError);
        return;
      }
      
      setUniversityData(universityData);
      
      // Fetch booking slots
      const { data: bookingSlots, error: slotsError } = await supabase
        .from("university_booking_slots")
        .select("parking_layout_id")
        .eq("booking_id", bookingId);
      
      if (slotsError) {
        console.error("Error fetching booking slots:", slotsError);
        return;
      }
      
      // For each slot, get the layout details
      const spots: string[] = [];
      for (const slot of bookingSlots || []) {
        const { data: layoutData, error: layoutError } = await supabase
          .from("university_parking_layouts")
          .select("row_number, column_number")
          .eq("id", slot.parking_layout_id)
          .single();
        
        if (!layoutError && layoutData) {
          spots.push(`R${layoutData.row_number}C${layoutData.column_number}`);
        }
      }
      
      setParkingSpots(spots);
    } catch (error) {
      console.error("Error fetching university details:", error);
    }
  };

  // Fetch airport details and parking spots
  const fetchAirportDetails = async () => {
    if (!airportBooking || !isAirportBooking(airportBooking)) return;
    
    try {
      // Fetch airport data
      const { data: airportData, error: airportError } = await supabase
        .from("airports")
        .select("name, location")
        .eq("id", airportBooking.airport_id)
        .single();
      
      if (airportError) {
        console.error("Error fetching airport:", airportError);
        return;
      }
      
      setAirportData(airportData);
      
      // Fetch booking slots
      const { data: bookingSlots, error: slotsError } = await supabase
        .from("airport_booking_slots")
        .select("parking_layout_id")
        .eq("booking_id", bookingId);
      
      if (slotsError) {
        console.error("Error fetching booking slots:", slotsError);
        return;
      }
      
      // For each slot, get the layout details
      const spots: string[] = [];
      for (const slot of bookingSlots || []) {
        const { data: layoutData, error: layoutError } = await supabase
          .from("airport_parking_layouts")
          .select("row_number, column_number")
          .eq("id", slot.parking_layout_id)
          .single();
        
        if (!layoutError && layoutData) {
          spots.push(`R${layoutData.row_number}C${layoutData.column_number}`);
        }
      }
      
      setParkingSpots(spots);
    } catch (error) {
      console.error("Error fetching airport details:", error);
    }
  };

  const isLoading = eventBookingLoading || universityBookingLoading || airportBookingLoading;

  // Combine the booking data based on type
  const booking = bookingType === "event" ? eventBooking : 
                  bookingType === "university" ? universityBooking :
                  bookingType === "airport" ? airportBooking : null;

  useEffect(() => {
    const errors = [eventBookingError, universityBookingError, airportBookingError].filter(Boolean);
    if (errors.length === 3) {
      console.error("Error fetching booking:", errors);
      toast({
        title: "Error",
        description: "Failed to load booking details. Please try again.",
        variant: "destructive",
      });
    }
  }, [eventBookingError, universityBookingError, airportBookingError, toast]);

  const handleShowQR = () => {
    if (booking) {
      // Generate QR code data
      const qrCodeData = `TIME2PARK-BOOKING-${booking.id}`;
      setQrDialogOpen(true);
    }
  };

  const handleDownloadTicket = () => {
    if (!booking) return;

    // Create appropriate mock event data based on booking type
    let mockEvent: Event;
    let bookingTitle = "";
    let bookingDate = "";
    let bookingTime = "";
    let bookingLocation = "";
    let bookingId = "";
    let bookingParkingSpots: string[] = [];
    let bookingTotalPrice = 0;
    
    if (bookingType === "event" && isEventBooking(booking)) {
      bookingTitle = booking.eventName || (booking.events?.title || "Unknown Event");
      bookingDate = booking.eventDate || "Unknown Date";
      bookingTime = booking.eventTime || "Unknown Time";
      bookingLocation = booking.location || (booking.events?.location || "Unknown Location");
      bookingId = booking.eventId || booking.event_id || "";
      bookingParkingSpots = booking.parkingSpots || [];
      bookingTotalPrice = booking.totalPrice || booking.payment_amount || 0;
    } else if (bookingType === "university" && isUniversityBooking(booking) && booking.start_date && booking.end_date) {
      bookingTitle = universityData?.name || "University";
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      bookingDate = startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      bookingTime = `${startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} - ${endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
      bookingLocation = universityData?.location || "";
      bookingId = booking.university_id || "";
      bookingParkingSpots = parkingSpots;
      bookingTotalPrice = booking.payment_amount || 0;
    } else if (bookingType === "airport" && isAirportBooking(booking) && booking.start_date && booking.end_date) {
      bookingTitle = airportData?.name || "Airport";
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      bookingDate = startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      bookingTime = `${startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} - ${endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
      bookingLocation = airportData?.location || "";
      bookingId = booking.airport_id || "";
      bookingParkingSpots = parkingSpots;
      bookingTotalPrice = booking.payment_amount || 0;
    }
    
    mockEvent = {
      id: bookingId,
      title: bookingTitle,
      date: bookingDate,
      time: bookingTime,
      location: bookingLocation,
      image: "", 
      parkingAvailable: 0,
      parkingTotal: 0,
      parkingPrice: bookingParkingSpots.length > 0 ? bookingTotalPrice / bookingParkingSpots.length : 0
    };
    
    // Create mock slots
    const mockSlots: ParkingSlot[] = bookingParkingSpots.map((spotId, index) => ({
      id: spotId,
      state: "reserved",
      row: parseInt(spotId.charAt(1)),
      column: parseInt(spotId.charAt(3)),
      price: bookingParkingSpots.length > 0 ? bookingTotalPrice / bookingParkingSpots.length : 0
    }));
    
    const qrCodeData = `TIME2PARK-BOOKING-${booking.id}`;
    
    downloadBookingPDF(mockEvent, mockSlots, booking.id, qrCodeData)
      .then(() => {
        toast({
          title: "Ticket Downloaded",
          description: `Ticket for booking ${booking.id.substring(0, 8)} has been downloaded.`,
        });
      })
      .catch(error => {
        console.error("Error downloading ticket:", error);
        toast({
          title: "Download Failed",
          description: "Could not download the ticket. Please try again.",
          variant: "destructive",
        });
      });
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-12">
          <h1 className="text-3xl font-bold mb-8">Booking Details</h1>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show auth prompt if not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-12">
          <h1 className="text-3xl font-bold mb-8">Booking Details</h1>
          <AuthPrompt
            isOpen={true}
            onClose={() => setShowAuthPrompt(false)}
            message="You need to be logged in to view this booking."
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Helper function to get booking title
  const getBookingTitle = () => {
    if (!booking) return "Booking";
    
    if (isEventBooking(booking)) {
      return booking.eventName || (booking.events?.title || "Event Booking");
    } else if (isUniversityBooking(booking)) {
      return universityData?.name || "University Booking";
    } else if (isAirportBooking(booking)) {
      return airportData?.name || "Airport Booking";
    }
    return "Booking";
  };

  // Helper function to get booking date
  const getBookingDate = () => {
    if (!booking) return "Unknown Date";
    
    if (isEventBooking(booking)) {
      return booking.eventDate || "Unknown Date";
    } else if (isUniversityBooking(booking) && booking.start_date) {
      const startDate = new Date(booking.start_date);
      return startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (isAirportBooking(booking) && booking.start_date) {
      const startDate = new Date(booking.start_date);
      return startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "Unknown Date";
  };

  // Helper function to get booking time
  const getBookingTime = () => {
    if (!booking) return "Unknown Time";
    
    if (isEventBooking(booking)) {
      return booking.eventTime || "Unknown Time";
    } else if (isUniversityBooking(booking) && booking.start_date && booking.end_date) {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      return `${startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} - ${endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (isAirportBooking(booking) && booking.start_date && booking.end_date) {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      return `${startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} - ${endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    return "Unknown Time";
  };

  // Helper function to get booking location
  const getBookingLocation = () => {
    if (!booking) return "Unknown Location";
    
    if (isEventBooking(booking)) {
      return booking.location || (booking.events?.location || "Unknown Location");
    } else if (isUniversityBooking(booking)) {
      return universityData?.location || "Unknown Location";
    } else if (isAirportBooking(booking)) {
      return airportData?.location || "Unknown Location";
    }
    return "Unknown Location";
  };

  // Helper function to get entity ID
  const getEntityId = () => {
    if (!booking) return "";
    
    if (isEventBooking(booking)) {
      return booking.eventId || booking.event_id || "";
    } else if (isUniversityBooking(booking)) {
      return booking.university_id || "";
    } else if (isAirportBooking(booking)) {
      return booking.airport_id || "";
    }
    return "";
  };

  // Helper function to get parking spots
  const getParkingSpots = () => {
    if (bookingType === "event" && isEventBooking(booking)) {
      return booking.parkingSpots || [];
    } else {
      return parkingSpots;
    }
  };

  // Helper function to get payment amount
  const getPaymentAmount = () => {
    if (!booking) return 0;
    
    return booking.payment_amount || 0;
  };

  // Helper function to get status
  const getBookingStatus = () => {
    if (!booking) return "unknown";
    return booking.status || "unknown";
  };

  // Helper function to get view entity link
  const getEntityLink = () => {
    if (bookingType === "event") {
      return `/events/${getEntityId()}`;
    } else if (bookingType === "university") {
      return `/universities/${getEntityId()}`;
    } else if (bookingType === "airport") {
      return `/airports/${getEntityId()}`;
    }
    return "/";
  };

  // Helper function to get entity type text
  const getEntityTypeText = () => {
    if (bookingType === "event") {
      return "Event";
    } else if (bookingType === "university") {
      return "University";
    } else if (bookingType === "airport") {
      return "Airport";
    }
    return "Event";
  };

  // Helper function to get entity type icon
  const getEntityTypeIcon = () => {
    if (bookingType === "university") {
      return <Building className="mr-2 h-4 w-4" />;
    }
    return <Calendar className="mr-2 h-4 w-4" />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container py-12">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Booking Details</h1>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !booking ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Booking not found or you don't have permission to view it.
            </p>
            <Link to="/bookings">
              <Button>Back to Bookings</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{getBookingTitle()}</CardTitle>
                <CardDescription>Booking ID: {booking.id.substring(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{getBookingDate()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{getBookingTime()}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{getBookingLocation()}</span>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Your Parking Spots</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {(getParkingSpots().length > 0) ? (
                      getParkingSpots().map((spot) => (
                        <div 
                          key={spot} 
                          className="bg-primary/10 border border-primary/20 rounded-md p-3 text-center"
                        >
                          <Ticket className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <span className="font-medium">{spot}</span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-muted-foreground">
                        No parking spots found for this booking.
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-lg font-bold">₹{getPaymentAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getBookingStatus() === "upcoming" || getBookingStatus() === "confirmed" ? 
                      "bg-green-100 text-green-800" : 
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {getBookingStatus() ? (getBookingStatus().charAt(0).toUpperCase() + getBookingStatus().slice(1)) : "Unknown"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ticket Actions</CardTitle>
                <CardDescription>Manage your booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(getBookingStatus() === "upcoming" || getBookingStatus() === "confirmed") && (
                  <Button 
                    className="w-full justify-start" 
                    onClick={handleShowQR}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Show QR Code
                  </Button>
                )}
                <Button 
                  className="w-full justify-start" 
                  onClick={handleDownloadTicket}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Ticket
                </Button>
                <Link to={getEntityLink()}>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {getEntityTypeIcon()}
                    View {getEntityTypeText()}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking QR Code</DialogTitle>
            <DialogDescription>
              Present this QR code at the venue entrance for verification.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {booking && (
              <img
                src={showQRCode("", `TIME2PARK-BOOKING-${booking.id}`)}
                alt="Booking QR Code"
                className="border rounded-lg p-3 w-full max-w-xs h-auto"
              />
            )}
          </div>
          <div className="flex justify-between mt-4">
            {booking && (
              <a 
                href={showQRCode("", `TIME2PARK-BOOKING-${booking.id}`)} 
                download="booking-qrcode.png"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Save QR Code
                </Button>
              </a>
            )}
            <DialogClose asChild>
              <Button className="ml-4">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingDetailPage;
