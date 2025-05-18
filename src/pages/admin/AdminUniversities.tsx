
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
import { Building, Edit, Plus, Search, X } from "lucide-react";

// Define university type
type University = {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  total_parking_slots: number;
  available_parking_slots: number;
  hourly_rate: number;
  created_at: string;
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

  return data as University[];
};

const AdminUniversities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch universities using React Query
  const { data: universities = [], isLoading } = useQuery({
    queryKey: ["adminUniversities"],
    queryFn: fetchUniversities,
  });

  // Apply search filter
  const filteredUniversities = universities.filter(university => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return university.name.toLowerCase().includes(query) || 
             university.location.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Universities Management</h2>
        <Button asChild>
          <Link to="/admin/create-university">
            <Plus className="mr-2" size={16} />
            Add University
          </Link>
        </Button>
      </div>
      
      <div className="mb-6 flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search universities..."
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
            <TableHead>University</TableHead>
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
                Loading universities...
              </TableCell>
            </TableRow>
          ) : filteredUniversities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                {searchQuery ? "No universities match your search." : "No universities found. Create your first university."}
              </TableCell>
            </TableRow>
          ) : (
            filteredUniversities.map((university) => (
              <TableRow key={university.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 w-8 h-8 rounded-md flex items-center justify-center">
                      <Building size={16} className="text-primary" />
                    </div>
                    {university.name}
                  </div>
                </TableCell>
                <TableCell>{university.location}</TableCell>
                <TableCell className="text-right">${university.hourly_rate.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {university.available_parking_slots}/{university.total_parking_slots}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/universities/${university.id}`}>
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

export default AdminUniversities;
