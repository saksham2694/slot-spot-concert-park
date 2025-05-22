
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  fetchUniversityBookingSlots, 
  markUniversityCustomerArrived, 
  type BookingSlot 
} from "@/services/vendorService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UniversityCheckIn = () => {
  const { universityId } = useParams();
  const [bookingSlots, setBookingSlots] = useState<BookingSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [universityName, setUniversityName] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUniversityDetails = async () => {
      try {
        if (!universityId) return;
        
        // Fetch university details
        const { data: university } = await supabase
          .from("universities")
          .select("name")
          .eq("id", universityId)
          .single();
        
        if (university) {
          setUniversityName(university.name);
        }
        
        // Fetch booking slots
        await loadBookingSlots();
      } catch (error) {
        console.error("Error loading university details:", error);
        toast({
          title: "Error",
          description: "Failed to load university information.",
          variant: "destructive",
        });
      }
    };

    fetchUniversityDetails();
  }, [universityId]);

  const loadBookingSlots = async () => {
    setIsLoading(true);
    try {
      if (!universityId) return;
      
      const slots = await fetchUniversityBookingSlots(universityId);
      console.log("University booking slots:", slots);
      setBookingSlots(slots);
    } catch (error) {
      console.error("Error loading booking slots:", error);
      toast({
        title: "Error",
        description: "Failed to load booking information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkArrived = async (slotId: string) => {
    try {
      const success = await markUniversityCustomerArrived(slotId);
      
      if (success) {
        // Update the local state to reflect the change
        setBookingSlots(bookingSlots.map(slot => 
          slot.id === slotId ? { ...slot, customerArrived: true } : slot
        ));
      }
    } catch (error) {
      console.error("Error marking customer as arrived:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/vendor/universities" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Universities
        </Link>
        <h2 className="text-2xl font-semibold">{universityName}</h2>
        <p className="text-muted-foreground">Manage customer check-ins</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <Badge variant="outline" className="text-xs mb-2">
            {bookingSlots.filter(slot => slot.customerArrived).length} / {bookingSlots.length} Checked In
          </Badge>
        </div>
        <Button onClick={loadBookingSlots} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {bookingSlots.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There are no bookings for this university yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parking Spot</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{slot.slotId}</TableCell>
                  <TableCell>
                    {slot.customerName || "N/A"}
                    {slot.customerEmail && (
                      <div className="text-xs text-muted-foreground mt-1">{slot.customerEmail}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {slot.customerArrived ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Checked In</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Not Arrived</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkArrived(slot.id)}
                      disabled={slot.customerArrived}
                    >
                      {slot.customerArrived ? "Checked In" : "Mark as Arrived"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default UniversityCheckIn;
