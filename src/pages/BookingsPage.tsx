import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Download, ExternalLink, MapPin, QrCode, Building, Plane } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserBookings } from "@/services/bookingService";
import { fetchUniversityBookings } from "@/services/universityBookingService";
import { fetchAirportBookingsForUser } from "@/services/airportBookingService";
import { useAuth } from "@/context/AuthContext";
import { downloadBookingPDF, showQRCode } from "@/services/pdfService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Event } from "@/types/event";
import { ParkingSlot } from "@/types/parking";
import AuthPrompt from "@/components/event/AuthPrompt";

interface EventBooking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
  type: "event";
}

interface UniversityBooking {
  id: string;
  universityId: string;
  universityName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
  type: "university";
}

interface AirportBooking {
  id: string;
  airportId: string;
  airportName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
  type: "airport";
}

type Booking = EventBooking | UniversityBooking | AirportBooking;

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);

  // Fetch event bookings
  const { 
    data: eventBookings = [], 
    isLoading: eventBookingsLoading, 
    error: eventBookingsError 
  } = useQuery({
    queryKey: ["eventBookings"],
    queryFn: fetchUserBookings,
    enabled: !!user,
    retry: false,
  });

  // Fetch university bookings
  const { 
    data: universityBookingsData = [], 
    isLoading: universityBookingsLoading, 
    error: universityBookingsError 
  } = useQuery({
    queryKey: ["universityBookings"],
    queryFn: () => user ? fetchUniversityBookings(user.id) : Promise.resolve([]),
    enabled: !!user,
    retry: false,
  });

  // Fetch airport bookings
  const { 
    data: airportBookingsData = [], 
    isLoading: airportBookingsLoading, 
    error: airportBookingsError 
  } = useQuery({
    queryKey: ["airportBookings"],
    queryFn: () => user ? fetchAirportBookingsForUser(user.id) : Promise.resolve([]),
    enabled: !!user,
    retry: false,
  });

  // Check for errors
  useEffect(() => {
    const errors = [eventBookingsError, universityBookingsError, airportBookingsError].filter(Boolean);
    if (errors.length) {
      console.error("Error fetching bookings:", errors);
      toast({
        title: "Error",
        description: "Failed to load some of your bookings. Please try again.",
        variant: "destructive",
      });
    }
  }, [eventBookingsError, universityBookingsError, airportBookingsError, toast]);

  // Transform university bookings to common format
  const universityBookings = universityBookingsData.map(booking => {
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const now = new Date();

    let status: "upcoming" | "completed" = "upcoming";
    if (booking.status === "cancelled") {
      return null; // Skip cancelled bookings
    } else if (endDate < now) {
      status = "completed";
    }

    // Format dates
    const formattedDate = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const startTime = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Extract parking spots (assuming we store them in a way we can retrieve)
    const parkingSpots = [];

    return {
      id: booking.id,
      universityId: booking.university_id,
      universityName: booking.university_name || "University",
      bookingDate: formattedDate,
      startTime,
      endTime,
      location: booking.location || "",
      parkingSpots: booking.parking_spots || [],
      totalPrice: booking.payment_amount || 0,
      status,
      type: "university" as const
    };
  }).filter(Boolean) as UniversityBooking[];

  // Transform airport bookings to common format
  const airportBookings = airportBookingsData.map(booking => {
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const now = new Date();

    let status: "upcoming" | "completed" = "upcoming";
    if (booking.status === "cancelled") {
      return null; // Skip cancelled bookings
    } else if (endDate < now) {
      status = "completed";
    }

    // Format dates
    const formattedDate = startDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const startTime = startDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const endTime = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const parkingSpots = booking.parkingSpots || [];

    return {
      id: booking.id,
      airportId: booking.airport_id,
      airportName: booking.airport_name || "Airport",
      bookingDate: formattedDate,
      startTime,
      endTime,
      location: booking.location || "",
      parkingSpots: parkingSpots,
      totalPrice: booking.payment_amount || 0,
      status,
      type: "airport" as const
    };
  }).filter(Boolean) as AirportBooking[];

  // Transform event bookings
  const transformedEventBookings = eventBookings.reduce<EventBooking[]>((acc, booking) => {
    if (!booking.events) return acc;
    
    const eventDate = new Date(booking.events.date);
    const now = new Date();
    
    let status: "upcoming" | "completed" = "upcoming";
    
    // Skip cancelled bookings entirely
    if (booking.status === "cancelled") {
      return acc;
    } 
    // If the event date is in the past, mark it as completed
    else if (eventDate < now) {
      status = "completed";
    }

    // Format the event date and time
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const formattedTime = eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Extract parking spots from booking_slots
    const parkingSpots = booking.booking_slots?.map(slot => 
      `R${slot.parking_layouts.row_number}C${slot.parking_layouts.column_number}`
    ) || [];

    // Calculate total price
    const totalPrice = booking.booking_slots?.reduce((total, slot) => 
      total + (slot.parking_layouts.price || 0), 0
    ) || 0;

    const transformedBooking: EventBooking = {
      id: booking.id,
      eventId: booking.event_id || "",
      eventName: booking.events.title,
      eventDate: formattedDate,
      eventTime: `${formattedTime} - ${new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`,
      location: booking.events.location,
      parkingSpots,
      totalPrice,
      status,
      type: "event"
    };

    acc.push(transformedBooking);
    return acc;
  }, []);

  // Combine all bookings
  const allBookings: Booking[] = [
    ...transformedEventBookings,
    ...universityBookings,
    ...airportBookings
  ];

  // Filter bookings by status and category
  const filteredBookings = allBookings.filter(booking => {
    if (activeCategory === 'all') {
      return booking.status === activeTab;
    } else {
      return booking.status === activeTab && booking.type === activeCategory;
    }
  });

  // Group bookings by type
  const bookingsByType = {
    all: {
      upcoming: allBookings.filter(b => b.status === 'upcoming'),
      completed: allBookings.filter(b => b.status === 'completed')
    },
    event: {
      upcoming: transformedEventBookings.filter(b => b.status === 'upcoming'),
      completed: transformedEventBookings.filter(b => b.status === 'completed')
    },
    university: {
      upcoming: universityBookings.filter(b => b.status === 'upcoming'),
      completed: universityBookings.filter(b => b.status === 'completed')
    },
    airport: {
      upcoming: airportBookings.filter(b => b.status === 'upcoming'),
      completed: airportBookings.filter(b => b.status === 'completed')
    }
  };

  const handleShowQR = (bookingId: string) => {
    // Generate QR code data
    const qrCodeData = `TIME2PARK-BOOKING-${bookingId}`;
    setSelectedQRCode(qrCodeData);
    setQrDialogOpen(true);
  };

  const handleDownloadTicket = (booking: Booking) => {
    let mockEvent: Event;
    
    // Create appropriate mock event data based on booking type
    if (booking.type === "event") {
      mockEvent = {
        id: booking.eventId,
        title: booking.eventName,
        date: booking.eventDate,
        time: booking.eventTime,
        location: booking.location,
        image: "",
        parkingAvailable: 0,
        parkingTotal: 0,
        parkingPrice: booking.totalPrice / booking.parkingSpots.length
      };
    } else if (booking.type === "university") {
      mockEvent = {
        id: booking.universityId,
        title: booking.universityName,
        date: booking.bookingDate,
        time: `${booking.startTime} - ${booking.endTime}`,
        location: booking.location,
        image: "",
        parkingAvailable: 0,
        parkingTotal: 0,
        parkingPrice: booking.totalPrice / booking.parkingSpots.length
      };
    } else {
      mockEvent = {
        id: booking.airportId,
        title: booking.airportName,
        date: booking.bookingDate,
        time: `${booking.startTime} - ${booking.endTime}`,
        location: booking.location,
        image: "",
        parkingAvailable: 0,
        parkingTotal: 0,
        parkingPrice: booking.totalPrice / booking.parkingSpots.length
      };
    }
    
    // Create mock slots
    const mockSlots: ParkingSlot[] = booking.parkingSpots.map((spotId, index) => ({
      id: spotId,
      state: "reserved",
      row: parseInt(spotId.charAt(1)),
      column: parseInt(spotId.charAt(3)),
      price: booking.totalPrice / booking.parkingSpots.length
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

  const isLoading = eventBookingsLoading || universityBookingsLoading || airportBookingsLoading;

  const BookingsList = ({ items, type }: { items: Booking[], type: string }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {type === "upcoming" 
              ? `You don't have any upcoming ${activeCategory !== 'all' ? activeCategory : ''} bookings.` 
              : `You don't have any completed ${activeCategory !== 'all' ? activeCategory : ''} bookings.`}
          </p>
          {type === "upcoming" && (
            <div className="space-x-4">
              {(activeCategory === 'all' || activeCategory === 'event') && (
                <Link to="/events">
                  <Button className="mr-2">Find Events</Button>
                </Link>
              )}
              {(activeCategory === 'all' || activeCategory === 'university') && (
                <Link to="/universities">
                  <Button className="mr-2" variant="outline">Find Universities</Button>
                </Link>
              )}
              {(activeCategory === 'all' || activeCategory === 'airport') && (
                <Link to="/airports">
                  <Button variant="outline">Find Airports</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>
              {activeCategory === 'all' ? 'Name' : 
               activeCategory === 'event' ? 'Event' : 
               activeCategory === 'university' ? 'University' : 'Airport'}
            </TableHead>
            <TableHead className="hidden md:table-cell">Date & Time</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead>Spots</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((booking) => {
            // Determine booking name and location based on type
            let name = "";
            let date = "";
            let time = "";
            let location = "";
            let icon = <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />;
            
            if (booking.type === "event") {
              name = booking.eventName;
              date = booking.eventDate;
              time = booking.eventTime;
              location = booking.location;
            } else if (booking.type === "university") {
              name = booking.universityName;
              date = booking.bookingDate;
              time = `${booking.startTime} - ${booking.endTime}`;
              location = booking.location;
              icon = <Building className="h-4 w-4 mr-2 text-muted-foreground" />;
            } else {
              name = booking.airportName;
              date = booking.bookingDate;
              time = `${booking.startTime} - ${booking.endTime}`;
              location = booking.location;
              icon = <Plane className="h-4 w-4 mr-2 text-muted-foreground" />;
            }

            return (
              <TableRow key={`${booking.type}-${booking.id}`}>
                <TableCell className="font-medium">{booking.id.substring(0, 8)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium line-clamp-1">{name}</p>
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      {icon}
                      {date}
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {time}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="line-clamp-1">{location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {booking.parkingSpots.length > 0 ? 
                    booking.parkingSpots.length > 1 ? 
                      `${booking.parkingSpots.length} spots` : 
                      booking.parkingSpots[0] 
                    : "No spots"}
                </TableCell>
                <TableCell>₹{booking.totalPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    {type === "upcoming" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShowQR(booking.id)}
                          title="Show QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadTicket(booking)}
                      title="Download Ticket"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Link to={`/bookings/${booking.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Booking Details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container py-12">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
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
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          <AuthPrompt
            isOpen={true}
            onClose={() => setShowAuthPrompt(false)}
            message="You need to be logged in to view your bookings."
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
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 mb-6">
                <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList>
                    <TabsTrigger value="upcoming">
                      Upcoming ({bookingsByType[activeCategory].upcoming.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({bookingsByType[activeCategory].completed.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full sm:max-w-md">
                  <TabsList>
                    <TabsTrigger value="all">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="event">
                      Events
                    </TabsTrigger>
                    <TabsTrigger value="university">
                      Universities
                    </TabsTrigger>
                    <TabsTrigger value="airport">
                      Airports
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="border rounded-lg p-4">
                <BookingsList 
                  items={filteredBookings}
                  type={activeTab}
                />
              </div>
            </>
          )}
        </div>
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
            {selectedQRCode && (
              <img
                src={showQRCode("", selectedQRCode)}
                alt="Booking QR Code"
                className="border rounded-lg p-3 w-full max-w-xs h-auto"
              />
            )}
          </div>
          <div className="flex justify-between mt-4">
            {selectedQRCode && (
              <a 
                href={showQRCode("", selectedQRCode)} 
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

      {/* Auth Prompt Dialog */}
      {showAuthPrompt && (
        <AuthPrompt
          isOpen={true}
          onClose={() => setShowAuthPrompt(false)}
          message="You need to be logged in to view your bookings."
        />
      )}
    </div>
  );
};

export default BookingsPage;
