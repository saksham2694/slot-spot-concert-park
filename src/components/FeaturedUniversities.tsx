
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type University = {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  total_parking_slots: number;
  available_parking_slots: number;
  hourly_rate: number;
};

const fetchUniversities = async (): Promise<University[]> => {
  const { data, error } = await supabase
    .from("universities")
    .select("*")
    .order("name", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Error fetching universities:", error);
    throw error;
  }

  return data as University[];
};

const FeaturedUniversities = () => {
  const navigate = useNavigate();
  
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["featuredUniversities"],
    queryFn: fetchUniversities,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <section className="py-12 bg-muted/50">
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Universities</h2>
          <Button variant="outline" onClick={() => navigate("/universities")}>
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : universities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {universities.map((university) => (
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
          <div className="text-center py-12 bg-card rounded-lg shadow-sm">
            <div className="bg-muted inline-flex p-3 rounded-full mb-4">
              <Building className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No universities available</h3>
            <p className="text-muted-foreground mb-6">
              Check back later for university parking options.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedUniversities;
