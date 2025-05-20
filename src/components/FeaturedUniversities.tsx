import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heading } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { safeQueryResult } from "@/lib/utils";
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
          const result = safeQueryResult(data);
          setUniversities(result);
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
          <Heading level={2}>Popular Universities</Heading>
          <Link to="/universities">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {universities.slice(0, 3).map((university) => (
            <Link 
              key={university.id} 
              to={`/universities/${university.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={university.image_url || 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b'} 
                  alt={university.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{university.name}</h3>
                <div className="flex items-center text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{university.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Available Parking Spots</span>
                  <span className="font-medium">{university.available_spots}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedUniversities;
