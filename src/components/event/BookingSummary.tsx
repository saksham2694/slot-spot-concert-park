
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { Event } from "@/types/event";

interface ParkingSlot {
  id: string;
  state: string;
  row: number;
  column: number;
  price: number;
}

interface BookingSummaryProps {
  event: Event;
  selectedSlots: ParkingSlot[];
  isBooking: boolean;
  isUserLoggedIn: boolean;
  onBookingClick: () => void;
}

const BookingSummary = ({
  event,
  selectedSlots,
  isBooking,
  isUserLoggedIn,
  onBookingClick
}: BookingSummaryProps) => {
  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  return (
    <div className="bg-card border rounded-lg p-6 sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Event</p>
          <p className="font-medium">{event.title}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Date & Time</p>
          <p className="font-medium">{event.date}, {event.time}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p className="font-medium">{event.location}</p>
        </div>
        
        <Separator />
        
        <div>
          <p className="text-sm text-muted-foreground">Selected Parking</p>
          {selectedSlots.length > 0 ? (
            <div className="mt-2 space-y-2">
              {selectedSlots.map((slot) => (
                <div key={slot.id} className="flex justify-between items-center">
                  <span>Spot {slot.id}</span>
                  <span className="font-medium">${slot.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No spots selected</p>
          )}
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center font-semibold">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={onBookingClick} 
        disabled={!isUserLoggedIn || selectedSlots.length === 0 || isBooking}
      >
        {isBooking ? "Processing..." : "Complete Booking"}
      </Button>
      
      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          By completing this booking, you agree to our Terms of Service and Parking Policies. 
          Bookings are non-refundable after 24 hours before the event.
        </p>
      </div>
    </div>
  );
};

export default BookingSummary;
