
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeProvider";

interface BookingConfirmationProps {
  bookingId: string;
  universityName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  totalHours: number;
  parkingSpots: string[];
}

const BookingConfirmation = ({
  bookingId,
  universityName,
  location,
  startDate,
  endDate,
  totalPrice,
  totalHours,
  parkingSpots,
}: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Generate QR code image URL (using a public QR code API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingId}`;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center flex-col mb-6">
        <div className={`${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} rounded-full p-4 mb-4`}>
          <Check className={`h-8 w-8 ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Booking Confirmed!
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          Your university parking has been successfully booked.
        </p>
      </div>

      <Card className={theme === 'dark' ? 'border-slate-800' : ''}>
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="Booking QR Code" 
                className="w-48 h-48" 
              />
            </div>
          </div>
          
          <p className="text-center mb-6 text-sm text-muted-foreground">
            Present this QR code upon arrival at the parking location
          </p>

          <div className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">Booking Reference</h3>
              <span className="font-mono">{bookingId.slice(0, 8)}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">University</h3>
              <span>{universityName}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">Location</h3>
              <span>{location}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">Duration</h3>
              <span>{totalHours} hours</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">Start Time</h3>
              <span>{startDate}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">End Time</h3>
              <span>{endDate}</span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <h3 className="font-semibold">Parking Spots</h3>
              <span>{parkingSpots.join(", ")}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <h3>Total Price</h3>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate("/bookings")}
            >
              View My Bookings
            </Button>
            <Button className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingConfirmation;
