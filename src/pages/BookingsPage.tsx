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

interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  parkingSpot: string;
  price: number;
  status: "upcoming" | "completed";
}

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect to home page if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
      parkingSpot: `R${booking.parking_layouts?.row_number || 0}C${booking.parking_layouts?.column_number || 0}`,
      price: booking.parking_layouts?.price || 0,
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
    // In a real app, this would fetch the QR from the server
    toast({
      title: "QR Code",
      description: `QR code for booking ${bookingId} has been generated.`,
    });
  };

  const handleDownloadTicket = (bookingId: string) => {
    // In a real app, this would download the ticket
    toast({
      title: "Ticket Downloaded",
      description: `Ticket for booking ${bookingId} has been downloaded.`,
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
            <TableHead>Spot</TableHead>
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
              <TableCell>{booking.parkingSpot}</TableCell>
              <TableCell>${booking.price.toFixed(2)}</TableCell>
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
                    onClick={() => handleDownloadTicket(booking.id)}
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
    </div>
  );
};

export default BookingsPage;
