
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building } from "lucide-react";
import { University } from "@/types/university";

const UniversityDetail = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUniversityDetails = async () => {
      if (!universityId) {
        toast({
          title: "Error",
          description: "University ID is missing.",
          variant: "destructive",
        });
        navigate("/universities");
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("universities")
          .select("*")
          .eq("id", universityId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setUniversity(data as University);
        } else {
          toast({
            title: "Not found",
            description: "University not found.",
            variant: "destructive",
          });
          navigate("/universities");
        }
      } catch (error) {
        console.error("Error fetching university:", error);
        toast({
          title: "Error",
          description: "Failed to load university details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityDetails();
  }, [universityId, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {loading ? (
          <div className="container py-8">
            <Skeleton className="h-64 w-full rounded-xl mb-8" />
            <Skeleton className="h-10 w-1/2 mb-4" />
            <Skeleton className="h-6 w-1/3 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Skeleton className="h-72 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ) : university ? (
          <>
            {/* University Hero */}
            <div className="relative bg-muted h-64 md:h-80">
              {university.image_url ? (
                <img
                  src={university.image_url}
                  alt={university.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <Building className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="container">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{university.name}</h1>
                  <p className="text-lg opacity-90">{university.location}</p>
                </div>
              </div>
            </div>

            <div className="container py-8">
              <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-2xl font-semibold mb-4">University Parking Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-1">Hourly Rate</h3>
                    <p className="text-2xl font-bold text-primary">${university.hourly_rate.toFixed(2)}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-1">Available Spots</h3>
                    <p className="text-2xl font-bold">{university.available_parking_slots} / {university.total_parking_slots}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-1">Location</h3>
                    <p className="text-lg">{university.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center p-8 mb-8 bg-muted rounded-lg">
                <h2 className="text-2xl font-semibold mb-4">Coming Soon!</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  The ability to book university parking spaces will be available soon.
                  Check back later for updates.
                </p>
                <Button onClick={() => navigate("/universities")}>
                  Back to Universities
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="container py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">University Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The university you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/universities")}>
              Browse All Universities
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default UniversityDetail;
