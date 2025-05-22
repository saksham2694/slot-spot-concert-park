
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchVendorEvents, type VendorEvent } from "@/services/vendorService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, CheckCircle, RefreshCw, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const VendorDashboard = () => {
  const [events, setEvents] = useState<VendorEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();

  const loadEvents = async (showLoading = true, showToast = false) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      // This should fetch fresh data for all vendor events
      const vendorEvents = await fetchVendorEvents();
      console.log("Fetched vendor events:", vendorEvents);
      setEvents(vendorEvents);
      
      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "Event information has been updated.",
        });
      }
    } catch (error) {
      console.error("Error loading events:", error);
      if (showToast) {
        toast({
          title: "Refresh failed",
          description: "Could not update event information.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    loadEvents();
  }, []);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadEvents(false, false);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadEvents(false, false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleManualRefresh = () => {
    loadEvents(false, true);
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">No Events Available</h2>
          <p className="text-muted-foreground">There are currently no events available for management.</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Manage Events</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
              <Link to="/vendor/scan-qr">
                <Button>Scan QR Code</Button>
              </Link>
            </div>
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
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.arrivedCustomers} / {event.totalBookings} customers arrived
                    </span>
                  </div>
                  <Progress 
                    value={event.totalBookings ? (event.arrivedCustomers / event.totalBookings) * 100 : 0} 
                    className="h-2" 
                  />
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
      )}
    </div>
  );
};

export default VendorDashboard;
