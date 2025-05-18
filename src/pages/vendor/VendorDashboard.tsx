
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVendorEvents, type VendorEvent } from "@/services/vendorService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, CheckCircle } from "lucide-react";

const VendorDashboard = () => {
  const [events, setEvents] = useState<VendorEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const vendorEvents = await fetchVendorEvents();
        setEvents(vendorEvents);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">No Events Available</h2>
        <p className="text-muted-foreground">There are currently no events available for management.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Events</h2>
        <Link to="/vendor/scan-qr">
          <Button>Scan QR Code</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{event.title}</CardTitle>
            </CardHeader>
            
            {event.imageUrl && (
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.arrivedCustomers} / {event.totalBookings} customers arrived
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full mt-2">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ 
                    width: `${event.totalBookings ? (event.arrivedCustomers / event.totalBookings) * 100 : 0}%` 
                  }}
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Link to={`/vendor/events/${event.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Manage Check-ins
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboard;
