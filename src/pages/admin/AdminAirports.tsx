
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plane, Edit, Plus, Search, X } from "lucide-react";

// Define airport type
type Airport = {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  total_parking_slots: number;
  available_parking_slots: number;
  hourly_rate: number;
  created_at: string;
};

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

const AdminAirports = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch airports using React Query
  const { data: airports = [], isLoading } = useQuery({
    queryKey: ["adminAirports"],
    queryFn: fetchAirports,
  });

  // Apply search filter
  const filteredAirports = airports.filter(airport => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return airport.name.toLowerCase().includes(query) || 
             airport.location.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Airports Management</h2>
        <Button asChild>
          <Link to="/admin/create-airport">
            <Plus className="mr-2" size={16} />
            Add Airport
          </Link>
        </Button>
      </div>
      
      <div className="mb-6 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search airports..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <Button variant="ghost" onClick={() => setSearchQuery("")}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Airport</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Hourly Rate</TableHead>
            <TableHead className="text-right">Parking Slots</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading airports...
              </TableCell>
            </TableRow>
          ) : filteredAirports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                {searchQuery ? "No airports match your search." : "No airports found. Create your first airport."}
              </TableCell>
            </TableRow>
          ) : (
            filteredAirports.map((airport) => (
              <TableRow key={airport.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 w-8 h-8 rounded-md flex items-center justify-center">
                      <Plane size={16} className="text-primary" />
                    </div>
                    {airport.name}
                  </div>
                </TableCell>
                <TableCell>{airport.location}</TableCell>
                <TableCell className="text-right">${airport.hourly_rate.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {airport.available_parking_slots}/{airport.total_parking_slots}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/airports/${airport.id}`}>
                      <Edit size={16} />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminAirports;
