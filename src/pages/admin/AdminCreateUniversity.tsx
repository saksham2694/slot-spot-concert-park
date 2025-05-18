
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Building } from "lucide-react";

const AdminCreateUniversity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [totalParkingSlots, setTotalParkingSlots] = useState(100);
  const [hourlyRate, setHourlyRate] = useState(5);
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

      const newUniversity = {
        name,
        location,
        total_parking_slots: totalParkingSlots,
        available_parking_slots: totalParkingSlots, // Initially all spots are available
        hourly_rate: hourlyRate,
        image_url: imageUrl || null,
      };

      const { data, error } = await supabase
        .from("universities")
        .insert(newUniversity)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "University created successfully.",
      });

      navigate("/admin/universities");
    } catch (error) {
      console.error("Error creating university:", error);
      toast({
        title: "Error",
        description: "Failed to create university. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create a New University</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">University Name *</Label>
              <Input
                id="name"
                placeholder="Enter university name"
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
                  alt="University preview"
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
              onClick={() => navigate("/admin/universities")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create University"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminCreateUniversity;
