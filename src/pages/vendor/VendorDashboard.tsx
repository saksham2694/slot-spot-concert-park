
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
      ) : (
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-4">Vendor Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to the vendor dashboard. Here you can manage check-ins for events, universities, and airports.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Link to="/vendor/events">
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" /> Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Manage event check-ins and view booking statistics.</p>
                </CardContent>
                <CardFooter>
                  <p className="text-sm">{events.length} events available</p>
                </CardFooter>
              </Card>
            </Link>
            
            <Link to="/vendor/universities">
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" /> Universities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Manage university parking check-ins.</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/vendor/airports">
              <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" /> Airports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Manage airport parking check-ins.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" /> Quick Check-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  For quick customer check-in, scan their QR code directly.
                </p>
                <Link to="/vendor/scan-qr">
                  <Button>Scan QR Code</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
