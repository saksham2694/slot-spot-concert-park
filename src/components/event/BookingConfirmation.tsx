
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Event } from "@/types/event";
import { Ticket, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface ParkingSlot {
  id: string;
  state: string;
  row: number;
  column: number;
  price: number;
}

interface BookingConfirmationProps {
  event: Event;
  selectedSlots: ParkingSlot[];
  qrCodeData: string;
}

const BookingConfirmation = ({ 
  event, 
  selectedSlots, 
  qrCodeData 
}: BookingConfirmationProps) => {
  const navigate = useNavigate();
  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Ticket className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
      <p className="text-muted-foreground mb-6">
        Your parking spot{selectedSlots.length > 1 ? 's' : ''} for {event.title} {selectedSlots.length > 1 ? 'have' : 'has'} been reserved.
      </p>
      
      <div className="mb-6 flex justify-center">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`}
          alt="Booking QR Code"
          className="border rounded-lg p-3 max-w-full h-auto"
        />
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
          onClick={() => {
            toast("Your booking confirmation has been downloaded.", {
              description: "PDF Generated",
            });
          }}
          variant="outline"
        >
          Download PDF
        </Button>
        <Button onClick={() => navigate("/bookings")}>
          View My Bookings
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
