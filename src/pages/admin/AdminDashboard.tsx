
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "@/services/eventService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar, Edit, Plus } from "lucide-react";

const AdminDashboard = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading events...</div>;
  }

  if (error) {
    return <div className="text-destructive">Error loading events</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Events Management</h2>
        <Button asChild>
          <Link to="/admin/create-event">
            <Plus className="mr-2" size={16} />
            Create Event
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Parking Slots</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No events found. Create your first event.
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {event.date}
                  </div>
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell className="text-right">
                  {event.availableParkingSlots}/{event.totalParkingSlots}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/events/${event.id}`}>
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

export default AdminDashboard;
