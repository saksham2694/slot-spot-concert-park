
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
import { Calendar, Clock, Download, ExternalLink, MapPin, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserBookings } from "@/services/bookingService";
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

interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: "upcoming" | "completed";
}

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  // Redirect to home page if user is not authenticated
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Log in to view this page",
        variant: "destructive"
      });
      navigate("/", { replace: true });
    }
  }, [user, navigate, toast]);

  // Fetch bookings from the backend
  const { data: allBookings = [], isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchUserBookings,
    enabled: !!user,
  });

  // If there's an error fetching bookings, show a toast
  useEffect(() => {
    if (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load your bookings. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Transform and categorize the fetched bookings
  const bookings = allBookings.reduce<Record<string, Booking[]>>((acc, booking) => {
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

    const transformedBooking: Booking = {
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
      status
    };

    // Add the booking to the appropriate category
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(transformedBooking);
    
    return acc;
  }, { upcoming: [], completed: [] });

  const handleShowQR = (bookingId: string) => {
    // Generate QR code data
    const qrCodeData = `TIME2PARK-BOOKING-${bookingId}`;
    setSelectedQRCode(qrCodeData);
    setQrDialogOpen(true);
  };

  const handleDownloadTicket = (booking: Booking) => {
    // Create mock event and slot data for the PDF generator
    const mockEvent: Event = {
      id: booking.eventId,
      title: booking.eventName,
      date: booking.eventDate,
      time: booking.eventTime,
      location: booking.location,
      image: "", // Adding required properties with default values
      parkingAvailable: 0,
      parkingTotal: 0,
      parkingPrice: booking.totalPrice / booking.parkingSpots.length
    };
    
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

  const BookingsList = ({ items, type }: { items: Booking[], type: string }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {type === "upcoming" 
              ? "You don't have any upcoming bookings." 
              : "You don't have any completed bookings."}
          </p>
          {type === "upcoming" && (
            <Link to="/events">
              <Button>Find Events</Button>
            </Link>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="hidden md:table-cell">Date & Time</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead>Spots</TableHead>
            <TableHead>Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.id.substring(0, 8)}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium line-clamp-1">{booking.eventName}</p>
                  <div className="md:hidden text-xs text-muted-foreground mt-1">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {booking.eventDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.eventTime}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {booking.eventDate}
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {booking.eventTime}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="line-clamp-1">{booking.location}</span>
                </div>
              </TableCell>
              <TableCell>
                {booking.parkingSpots.length > 0 ? 
                  booking.parkingSpots.length > 1 ? 
                    `${booking.parkingSpots.length} spots` : 
                    booking.parkingSpots[0] 
                  : "No spots"}
              </TableCell>
              <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
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
                  <Link to={`/events/${booking.eventId}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="View Event"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container py-12">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
          
          {!user ? (
            null
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full md:w-auto mb-6">
                <TabsTrigger value="upcoming">
                  Upcoming ({bookings.upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({bookings.completed.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="border rounded-lg p-4">
                <BookingsList items={bookings.upcoming} type="upcoming" />
              </TabsContent>
              
              <TabsContent value="completed" className="border rounded-lg p-4">
                <BookingsList items={bookings.completed} type="completed" />
              </TabsContent>
            </Tabs>
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
    </div>
  );
};

export default BookingsPage;
