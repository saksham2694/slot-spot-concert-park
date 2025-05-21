
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEventBookingSlots, markCustomerArrived } from '@/services/vendorService';
import { CheckCircle, UserX, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { BookingSlot } from '@/services/vendorService';
import { useToast } from '@/hooks/use-toast';

const EventCheckIn = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchBookings = async (showToast = false) => {
    if (!eventId) return;
    
    try {
      setRefreshing(true);
      // This should fetch ALL booking slots for the event, regardless of status
      const data = await fetchEventBookingSlots(eventId);
      console.log("Fetched booking slots:", data);
      setBookingSlots(data);
      
      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "Booking information has been updated.",
        });
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (showToast) {
        toast({
          title: "Refresh failed",
          description: "Could not update booking information.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Set up auto-refresh every 15 seconds to ensure latest bookings are shown
    const interval = setInterval(() => {
      fetchBookings();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  // Refresh when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBookings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [eventId]);

  const handleCheckIn = async (slotId: string) => {
    try {
      await markCustomerArrived(slotId);
      
      // Update local state to reflect the change
      setBookingSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.id === slotId ? { ...slot, customerArrived: true } : slot
        )
      );
    } catch (error) {
      console.error('Error marking customer as arrived:', error);
    }
  };

  const handleRefresh = () => {
    fetchBookings(true);
  };

  if (loading) {
    return <div className="text-center py-10">Loading booking details...</div>;
  }

  if (bookingSlots.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-start mb-6">
          <Link to="/vendor">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h2 className="text-xl font-semibold mb-2">No Bookings Found</h2>
        <p className="text-muted-foreground mb-4">There are no bookings for this event yet.</p>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    );
  }

  // Group bookings by slot ID (row and column)
  const bookingsBySlot = bookingSlots.reduce((acc, slot) => {
    const key = `R${slot.rowNumber}C${slot.columnNumber}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, BookingSlot[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/vendor">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-2xl font-semibold">Check-In Management</h2>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={refreshing} 
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(bookingsBySlot).map(([slotId, slots]) => (
          <Card key={slotId} className="overflow-hidden">
            <CardHeader className="pb-2">
              <h3 className="text-xl font-semibold">Parking Slot {slotId}</h3>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {slots.map((slot) => (
                <div key={slot.id} className="border p-3 rounded-md">
                  {slot.customerName && (
                    <p className="font-medium">{slot.customerName}</p>
                  )}
                  {slot.customerEmail && (
                    <p className="text-sm text-muted-foreground">{slot.customerEmail}</p>
                  )}
                  <div className="mt-2 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        slot.customerArrived ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                    ></div>
                    <span className="text-sm">
                      {slot.customerArrived ? 'Arrived' : 'Not arrived yet'}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
            
            <CardFooter>
              {slots.some(slot => !slot.customerArrived) ? (
                <Button
                  onClick={() => {
                    const notArrivedSlot = slots.find(slot => !slot.customerArrived);
                    if (notArrivedSlot) {
                      handleCheckIn(notArrivedSlot.id);
                    }
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Arrived
                </Button>
              ) : (
                <Button variant="ghost" className="w-full" disabled>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  All Customers Arrived
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventCheckIn;
