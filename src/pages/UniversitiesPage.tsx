
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, CalendarIcon, Search, X, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define university type
type University = {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  total_parking_slots: number;
  available_parking_slots: number;
  hourly_rate: number;
};

// Function to fetch universities
const fetchUniversities = async (): Promise<University[]> => {
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching universities:", error);
    throw error;
  }

  return data || [];
};

const UniversitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState(0);

  // Fetch universities using React Query
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
  });

  // Apply filters
  const filteredUniversities = universities.filter(university => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!university.name.toLowerCase().includes(query) && 
          !university.location.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Apply location filter if implemented
    if (selectedLocation && selectedLocation !== "all-locations") {
      if (!university.location.includes(selectedLocation)) {
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

  // Extract unique locations for filtering
  const locations = [...new Set(universities.map(university => {
    const parts = university.location.split(',');
    return parts[parts.length - 1].trim();
  }))];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Page Header */}
        <div className="bg-muted py-8">
          <div className="container">
            <h1 className="text-3xl font-bold mb-6">University Parking</h1>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search universities by name or location..."
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
        
        {/* Universities List */}
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
          ) : filteredUniversities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map((university) => (
                <Card key={university.id} className="overflow-hidden flex flex-col">
                  <div className="h-48 relative">
                    {university.image_url ? (
                      <img 
                        src={university.image_url} 
                        alt={university.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Building className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary">
                        ${university.hourly_rate.toFixed(2)}/hr
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <h3 className="text-xl font-semibold">{university.name}</h3>
                    <p className="text-muted-foreground text-sm">{university.location}</p>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Available Spots</span>
                      <span className="font-medium">{university.available_parking_slots} / {university.total_parking_slots}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ 
                          width: `${(university.available_parking_slots / university.total_parking_slots) * 100}%` 
                        }}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="mt-auto pt-4">
                    <Link to={`/universities/${university.id}`} className="w-full">
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
              <h3 className="text-xl font-semibold mb-2">No universities found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or check back later for more universities.
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

export default UniversitiesPage;
