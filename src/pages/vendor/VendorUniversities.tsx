
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchVendorUniversities, type VendorUniversity } from "@/services/vendorService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Users, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const VendorUniversities = () => {
  const [universities, setUniversities] = useState<VendorUniversity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { toast } = useToast();

  const loadUniversities = async (showLoading = true, showToast = false) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const vendorUniversities = await fetchVendorUniversities();
      console.log("Fetched vendor universities:", vendorUniversities);
      setUniversities(vendorUniversities);
      
      if (showToast) {
        toast({
          title: "Data refreshed",
          description: "University information has been updated.",
        });
      }
    } catch (error) {
      console.error("Error loading universities:", error);
      if (showToast) {
        toast({
          title: "Refresh failed",
          description: "Could not update university information.",
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
    loadUniversities();
  }, []);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUniversities(false, false);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh when the component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadUniversities(false, false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleManualRefresh = () => {
    loadUniversities(false, true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (universities.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">No Universities Available</h2>
        <p className="text-muted-foreground">There are currently no universities available for management.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manage Universities</h2>
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
        {universities.map((university) => (
          <Card key={university.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{university.name}</CardTitle>
            </CardHeader>
            
            {university.imageUrl && (
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={university.imageUrl} 
                  alt={university.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{university.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {university.arrivedCustomers} / {university.totalBookings} customers arrived
                </span>
              </div>
              <Progress 
                value={university.totalBookings ? (university.arrivedCustomers / university.totalBookings) * 100 : 0} 
                className="h-2" 
              />
            </CardContent>
            
            <CardFooter>
              <Link to={`/vendor/universities/${university.id}`} className="w-full">
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

export default VendorUniversities;
