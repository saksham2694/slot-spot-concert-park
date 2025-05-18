
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Plane } from "lucide-react";

const AdminCreateAirport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [totalParkingSlots, setTotalParkingSlots] = useState(500);
  const [hourlyRate, setHourlyRate] = useState(10);
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location) {
      toast({
        title: "Missing information",
        description: "Please provide all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const newAirport = {
        name,
        location,
        total_parking_slots: totalParkingSlots,
        available_parking_slots: totalParkingSlots, // Initially all spots are available
        hourly_rate: hourlyRate,
        image_url: imageUrl || null,
      };

      const { data, error } = await supabase
        .from("airports")
        .insert(newAirport)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Airport created successfully.",
      });

      navigate("/admin/airports");
    } catch (error) {
      console.error("Error creating airport:", error);
      toast({
        title: "Error",
        description: "Failed to create airport. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create a New Airport</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Airport Name *</Label>
              <Input
                id="name"
                placeholder="Enter airport name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSlots">Total Parking Slots *</Label>
              <Input
                id="totalSlots"
                type="number"
                min="1"
                value={totalParkingSlots}
                onChange={(e) => setTotalParkingSlots(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Leave empty for a default placeholder</p>
            </div>
          </div>

          {imageUrl && (
            <div className="mt-4">
              <Label>Image Preview</Label>
              <div className="mt-2 border rounded-md overflow-hidden h-48 bg-muted">
                <img
                  src={imageUrl}
                  alt="Airport preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = ""; 
                    e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-muted-foreground">Invalid image URL</span></div>';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/airports")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Airport"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateAirport;
