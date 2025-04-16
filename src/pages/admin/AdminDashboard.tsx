
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEvents, deleteEvent } from "@/services/eventService";
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
import { Calendar, Edit, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event deleted",
        description: "The event was successfully deleted.",
      });
      setEventToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

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
                  {event.parkingAvailable}/{event.parkingTotal}
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/events/${event.id}`}>
                      <Edit size={16} />
                    </Link>
                  </Button>
                  <AlertDialog open={eventToDelete === event.id} onOpenChange={(open) => !open && setEventToDelete(null)}>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEventToDelete(event.id.toString())}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{event.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteEvent(event.id.toString())}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
