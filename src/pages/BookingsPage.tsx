
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, Download, ExternalLink, MapPin, QrCode, X } from "lucide-react";

interface Booking {
  id: string;
  eventId: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  parkingSpot: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
}

// Mock data for bookings
const mockBookings: Booking[] = [
  {
    id: "B12345",
    eventId: 1,
    eventName: "Taylor Swift: The Eras Tour",
    eventDate: "May 20, 2025",
    eventTime: "7:00 PM - 11:00 PM",
    location: "SoFi Stadium, Los Angeles",
    parkingSpot: "R2C3",
    price: 25,
    status: "upcoming"
  },
  {
    id: "B12346",
    eventId: 3,
    eventName: "Beyoncé: Renaissance World Tour",
    eventDate: "July 8, 2025",
    eventTime: "8:00 PM - 11:30 PM",
    location: "Mercedes-Benz Stadium, Atlanta",
    parkingSpot: "R1C5",
    price: 30,
    status: "upcoming"
  },
  {
    id: "B12347",
    eventId: 5,
    eventName: "NBA Finals Game 7",
    eventDate: "June 18, 2025",
    eventTime: "8:00 PM - 11:00 PM",
    location: "Madison Square Garden, New York",
    parkingSpot: "R4C2",
    price: 40,
    status: "upcoming"
  },
  {
    id: "B12230",
    eventId: 6,
    eventName: "The Weeknd: After Hours Tour",
    eventDate: "April 5, 2025",
    eventTime: "7:30 PM - 10:30 PM",
    location: "Barclays Center, Brooklyn",
    parkingSpot: "R3C4",
    price: 28,
    status: "completed"
  },
  {
    id: "B12115",
    eventId: 7,
    eventName: "UFC 300",
    eventDate: "March 12, 2025",
    eventTime: "7:00 PM - 1:00 AM",
    location: "T-Mobile Arena, Las Vegas",
    parkingSpot: "R2C1",
    price: 35,
    status: "completed"
  },
  {
    id: "B11999",
    eventId: 8,
    eventName: "Broadway: Hamilton",
    eventDate: "February 28, 2025",
    eventTime: "8:00 PM - 10:30 PM",
    location: "Richard Rodgers Theatre, New York",
    parkingSpot: "R1C6",
    price: 22,
    status: "cancelled"
  }
];

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Record<string, Booking[]>>({
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch bookings
    const fetchBookings = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const categorizedBookings: Record<string, Booking[]> = {
          upcoming: mockBookings.filter(b => b.status === "upcoming"),
          completed: mockBookings.filter(b => b.status === "completed"),
          cancelled: mockBookings.filter(b => b.status === "cancelled")
        };
        
        setBookings(categorizedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load your bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

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

  const handleCancelBooking = (bookingId: string) => {
    // In a real app, this would cancel the booking via API
    toast({
      title: "Booking Cancelled",
      description: `Booking ${bookingId} has been cancelled.`,
    });
    
    // Update the local state to move the booking to cancelled
    const updatedBookings = { ...bookings };
    const bookingToCancel = updatedBookings.upcoming.find(b => b.id === bookingId);
    
    if (bookingToCancel) {
      bookingToCancel.status = "cancelled";
      updatedBookings.upcoming = updatedBookings.upcoming.filter(b => b.id !== bookingId);
      updatedBookings.cancelled = [...updatedBookings.cancelled, bookingToCancel];
      setBookings(updatedBookings);
    }
  };

  const BookingsList = ({ items, type }: { items: Booking[], type: string }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {type === "upcoming" 
              ? "You don't have any upcoming bookings." 
              : type === "completed"
              ? "You don't have any completed bookings."
              : "You don't have any cancelled bookings."}
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
              <TableCell className="font-medium">{booking.id}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelBooking(booking.id)}
                        title="Cancel Booking"
                      >
                        <X className="h-4 w-4" />
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
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <Tabs defaultValue="upcoming">
              <TabsList className="w-full md:w-auto mb-6">
                <TabsTrigger value="upcoming">
                  Upcoming ({bookings.upcoming.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({bookings.completed.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({bookings.cancelled.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upcoming" className="border rounded-lg p-4">
                <BookingsList items={bookings.upcoming} type="upcoming" />
              </TabsContent>
              
              <TabsContent value="completed" className="border rounded-lg p-4">
                <BookingsList items={bookings.completed} type="completed" />
              </TabsContent>
              
              <TabsContent value="cancelled" className="border rounded-lg p-4">
                <BookingsList items={bookings.cancelled} type="cancelled" />
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
