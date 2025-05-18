
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Event } from "@/types/event";
import { Ticket, IndianRupee, Download, QrCode, Info } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { downloadBookingPDF, showQRCode } from "@/services/pdfService";
import { useState } from "react";
import { ParkingSlot } from "@/types/parking";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface BookingConfirmationProps {
  event: Event;
  selectedSlots: ParkingSlot[];
  qrCodeData: string;
  bookingId?: string;
}

const BookingConfirmation = ({ 
  event, 
  selectedSlots, 
  qrCodeData,
  bookingId 
}: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const handleDownloadPDF = () => {
    downloadBookingPDF(event, selectedSlots, bookingId || "", qrCodeData)
      .then(() => {
        toast({
          title: "Success",
          description: "Your booking confirmation has been downloaded.",
        });
      })
      .catch(error => {
        console.error("Error downloading PDF:", error);
        toast({
          title: "Error",
          description: "Failed to download confirmation. Please try again later.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Ticket className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
      <p className="text-muted-foreground mb-6">
        Your parking spot{selectedSlots.length > 1 ? 's' : ''} for {event.title} {selectedSlots.length > 1 ? 'have' : 'has'} been reserved.
      </p>
      
      <div className="mb-6 flex flex-col items-center">
        <div className="relative">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`}
            alt="Booking QR Code"
            className="border rounded-lg p-3 max-w-full h-auto cursor-pointer"
            onClick={() => setQrDialogOpen(true)}
          />
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/70">
            Click to enlarge
          </Badge>
        </div>
        
        <div className="mt-3 text-sm px-4 py-2 bg-muted rounded-md">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <p>
              Present this QR code at the venue for check-in
            </p>
          </div>
          {/* Display QR code data if we want to show it */}
          {/* <p className="mt-1 font-mono text-xs text-muted-foreground select-all">{qrCodeData}</p> */}
        </div>
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
          <div className="font-medium flex items-center">
            <IndianRupee className="h-3 w-3 mr-1" />{totalPrice.toFixed(2)}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleDownloadPDF}
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={() => navigate("/bookings")}>
          View My Bookings
        </Button>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Booking QR Code</DialogTitle>
            <DialogDescription>
              Present this QR code at the venue entrance for verification.
              When scanned by venue staff, this will check you in automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <img
              src={showQRCode(bookingId || "", qrCodeData)}
              alt="Booking QR Code"
              className="border rounded-lg p-3 w-full max-w-xs h-auto"
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Booking ID: {bookingId || "Temporary ID"}
            </p>
          </div>
          <div className="flex justify-between mt-4">
            <a 
              href={showQRCode(bookingId || "", qrCodeData)} 
              download={`qrcode-${bookingId || "booking"}.png`}
              className="w-full"
            >
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Save QR Code
              </Button>
            </a>
            <DialogClose asChild>
              <Button className="ml-4">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingConfirmation;
