
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchVendorAirports, type VendorAirport } from "@/services/vendorService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const VendorAirports = () => {
  const [airports, setAirports] = useState<VendorAirport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();

  const loadAirports = async (showLoading = true, showToast = false) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const vendorAirports = await fetchVendorAirports();
      console.log("Fetched vendor airports:", vendorAirports);
      setAirports(vendorAirports);
      
      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "Airport information has been updated.",
        });
      }
    } catch (error) {
      console.error("Error loading airports:", error);
      if (showToast) {
        toast({
          title: "Refresh failed",
          description: "Could not update airport information.",
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
    loadAirports();
  }, []);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadAirports(false, false);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAirports(false, false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleManualRefresh = () => {
    loadAirports(false, true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (airports.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">No Airports Available</h2>
        <p className="text-muted-foreground">There are currently no airports available for management.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Airports</h2>
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
        {airports.map((airport) => (
          <Card key={airport.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{airport.name}</CardTitle>
            </CardHeader>
            
            {airport.imageUrl && (
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={airport.imageUrl} 
                  alt={airport.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{airport.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {airport.arrivedCustomers} / {airport.totalBookings} customers arrived
                </span>
              </div>
              <Progress 
                value={airport.totalBookings ? (airport.arrivedCustomers / airport.totalBookings) * 100 : 0} 
                className="h-2" 
              />
            </CardContent>
            
            <CardFooter>
              <Link to={`/vendor/airports/${airport.id}`} className="w-full">
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

export default VendorAirports;
