
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"; 
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Building } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { University as UniversityType } from "@/types/university";

const FeaturedUniversities = () => {
  const [universities, setUniversities] = useState<UniversityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('universities')
          .select('*')
          .limit(3);

        if (error) {
          console.error("Error fetching universities:", error);
          setError(error.message);
        } else {
          setUniversities(data || []);
        }
      } catch (err: any) {
        console.error("Unexpected error fetching universities:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);
  
  return (
    <section className="py-12">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Popular Universities</h2>
          <Link to="/universities">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {universities.slice(0, 4).map((university) => (
            <Card key={university.id} className="overflow-hidden flex flex-col">
              <div className="h-48 relative">
                {university.image_url ? (
                  <img 
                    src={university.image_url || 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b'} 
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
                    ₹{university.hourly_rate?.toFixed(2)}/hr
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <h3 className="text-xl font-semibold">{university.name}</h3>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{university.location}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available Spots</span>
                  <span className="font-medium">{university.available_parking_slots} / {university.total_parking_slots}</span>
                </div>
                <Progress className="h-2 mt-2" value={
                  (university.available_parking_slots / university.total_parking_slots) * 100
                } />
              </CardContent>
              
              <CardFooter className="mt-auto pt-4">
                <Link to={`/universities/${university.id}`} className="w-full">
                  <Button className="w-full">Book Parking</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedUniversities;
