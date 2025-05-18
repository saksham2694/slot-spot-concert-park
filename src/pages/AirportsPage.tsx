
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, X, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Airport } from "@/types/airport";

// Function to fetch airports
const fetchAirports = async (): Promise<Airport[]> => {
  const { data, error } = await supabase
    .from("airports")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching airports:", error);
    throw error;
  }

  return data as Airport[];
};

const AirportsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState(0);

  // Fetch airports using React Query
  const { data: airports = [], isLoading } = useQuery({
    queryKey: ["airports"],
    queryFn: fetchAirports,
  });

  // Apply filters
  const filteredAirports = airports.filter(airport => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!airport.name.toLowerCase().includes(query) && 
          !airport.location.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Apply location filter if implemented
    if (selectedLocation && selectedLocation !== "all-locations") {
      if (!airport.location.includes(selectedLocation)) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate active filters
  useState(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedLocation && selectedLocation !== "all-locations") count++;
    setActiveFilters(count);
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-muted py-8">
          <div className="container">
            <h1 className="text-3xl font-bold mb-6">Airport Parking</h1>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search airports by name or location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {activeFilters > 0 && (
                <Button variant="ghost" onClick={clearFilters} className="w-full md:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters ({activeFilters})
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Airports List */}
        <div className="container py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filteredAirports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAirports.map((airport) => (
                <Card key={airport.id} className="overflow-hidden flex flex-col">
                  <div className="h-48 relative">
                    {airport.image_url ? (
                      <img 
                        src={airport.image_url} 
                        alt={airport.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Plane className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary">
                        ${airport.hourly_rate.toFixed(2)}/hr
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <h3 className="text-xl font-semibold">{airport.name}</h3>
                    <p className="text-muted-foreground text-sm">{airport.location}</p>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available Spots</span>
                      <span className="font-medium">{airport.available_parking_slots} / {airport.total_parking_slots}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ 
                          width: `${(airport.available_parking_slots / airport.total_parking_slots) * 100}%` 
                        }}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="mt-auto pt-4">
                    <Link to={`/airports/${airport.id}`} className="w-full">
                      <Button className="w-full">
                        Book Parking
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-muted inline-flex p-3 rounded-full mb-4">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No airports found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or check back later for more airports.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AirportsPage;
