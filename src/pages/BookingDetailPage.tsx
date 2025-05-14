
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, Download, MapPin, QrCode, ChevronLeft, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fetchBookingById } from "@/services/bookingService";
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

  // Fetch booking details
  const { 
    data: booking, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => fetchBookingById(bookingId as string),
    enabled: !!user && !!bookingId,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error",
        description: "Failed to load booking details. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleShowQR = () => {
    if (booking) {
      // Generate QR code data
      const qrCodeData = `TIME2PARK-BOOKING-${booking.id}`;
      setQrDialogOpen(true);
    }
  };

  const handleDownloadTicket = () => {
    if (!booking) return;

    // Create mock event and slot data for the PDF generator
    const mockEvent: Event = {
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
          <AuthPrompt />
        </main>
        <Footer />
      </div>
    );
  }

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
                <CardTitle>{booking.eventName}</CardTitle>
                <CardDescription>Booking ID: {booking.id.substring(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{booking.eventDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{booking.eventTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <span>{booking.location}</span>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Your Parking Spots</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {booking.parkingSpots.map((spot) => (
                      <div 
                        key={spot} 
                        className="bg-primary/10 border border-primary/20 rounded-md p-3 text-center"
                      >
                        <Ticket className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <span className="font-medium">{spot}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Price:</span>
                    <span className="text-lg font-bold">${booking.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
                {booking.status === "upcoming" && (
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
                <Link to={`/events/${booking.eventId}`}>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Event
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
