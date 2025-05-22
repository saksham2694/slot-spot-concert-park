
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

const BookingDetailPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);
  const [bookingType, setBookingType] = useState<"event" | "university" | "airport" | null>(null);

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
    } else if (airportBooking) {
      setBookingType("airport");
    }
  }, [eventBooking, universityBooking, airportBooking]);

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
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      bookingTitle = eventBookingData.eventName || (eventBookingData.events?.title || "Unknown Event");
      bookingDate = eventBookingData.eventDate || "Unknown Date";
      bookingTime = eventBookingData.eventTime || "Unknown Time";
      bookingLocation = eventBookingData.location || (eventBookingData.events?.location || "Unknown Location");
      bookingId = eventBookingData.eventId || eventBookingData.event_id || "";
      bookingParkingSpots = eventBookingData.parkingSpots || [];
      bookingTotalPrice = eventBookingData.totalPrice || eventBookingData.payment_amount || 0;
    } else if (bookingType === "university") {
      const universityBookingData = booking as any;
      bookingTitle = universityBookingData.university_name || "University";
      const startDate = new Date(universityBookingData.start_date);
      const endDate = new Date(universityBookingData.end_date);
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
      bookingLocation = universityBookingData.location || "";
      bookingId = universityBookingData.university_id || "";
      bookingParkingSpots = universityBookingData.parking_spots || [];
      bookingTotalPrice = universityBookingData.payment_amount || 0;
    } else if (bookingType === "airport") {
      const airportBookingData = booking as any;
      bookingTitle = airportBookingData.airport_name || "Airport";
      const startDate = new Date(airportBookingData.start_date);
      const endDate = new Date(airportBookingData.end_date);
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
      bookingLocation = airportBookingData.location || "";
      bookingId = airportBookingData.airport_id || "";
      bookingParkingSpots = airportBookingData.parking_spots || [];
      bookingTotalPrice = airportBookingData.payment_amount || 0;
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
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.eventName || (eventBookingData.events?.title || "Event Booking");
    } else if (bookingType === "university") {
      const universityBookingData = booking as any;
      return universityBookingData.university_name || "University Booking";
    } else if (bookingType === "airport") {
      const airportBookingData = booking as any;
      return airportBookingData.airport_name || "Airport Booking";
    }
    return "Booking";
  };

  // Helper function to get booking date
  const getBookingDate = () => {
    if (!booking) return "Unknown Date";
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.eventDate || "Unknown Date";
    } else if (bookingType === "university" || bookingType === "airport") {
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
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.eventTime || "Unknown Time";
    } else if (bookingType === "university" || bookingType === "airport") {
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
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.location || (eventBookingData.events?.location || "Unknown Location");
    } else if (bookingType === "university" || bookingType === "airport") {
      return booking.location || "Unknown Location";
    }
    return "Unknown Location";
  };

  // Helper function to get entity ID
  const getEntityId = () => {
    if (!booking) return "";
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.eventId || eventBookingData.event_id || "";
    } else if (bookingType === "university") {
      const universityBookingData = booking as any;
      return universityBookingData.university_id || "";
    } else if (bookingType === "airport") {
      const airportBookingData = booking as any;
      return airportBookingData.airport_id || "";
    }
    return "";
  };

  // Helper function to get parking spots
  const getParkingSpots = () => {
    if (!booking) return [];
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.parkingSpots || [];
    } else if (bookingType === "university") {
      const universityBookingData = booking as any;
      return universityBookingData.parking_spots || [];
    } else if (bookingType === "airport") {
      const airportBookingData = booking as any;
      return airportBookingData.parking_spots || [];
    }
    return [];
  };

  // Helper function to get payment amount
  const getPaymentAmount = () => {
    if (!booking) return 0;
    
    if (bookingType === "event") {
      const eventBookingData = booking as any;
      return eventBookingData.totalPrice || eventBookingData.payment_amount || 0;
    } else if (bookingType === "university" || bookingType === "airport") {
      return booking.payment_amount || 0;
    }
    return 0;
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
