
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "@/types/event";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const [parkingAvailable, setParkingAvailable] = useState(event.parkingAvailable);
  
  useEffect(() => {
    // Set initial value from props
    setParkingAvailable(event.parkingAvailable);
    
    // Subscribe to real-time changes for this specific event
    const channel = supabase
      .channel(`event-updates-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${event.id}`
        },
        (payload) => {
          console.log("Event updated:", payload);
          if (payload.new && typeof payload.new.available_parking_slots === 'number') {
            setParkingAvailable(payload.new.available_parking_slots);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id, event.parkingAvailable]);
  
  let availabilityColor = "bg-parking-available";
  if (parkingAvailable <= Math.floor(event.parkingTotal * 0.3)) {
    availabilityColor = "bg-parking-error";
  } else if (parkingAvailable <= Math.floor(event.parkingTotal * 0.6)) {
    availabilityColor = "bg-parking-accent";
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
        />
        <div className="absolute top-2 right-2">
          <Badge 
            variant="outline" 
            className={`${availabilityColor} text-white font-medium`}
          >
            {parkingAvailable} spots left
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{event.title}</h3>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-parking-primary" />
            <span>{event.date}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-parking-primary" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-parking-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/events/${event.id}`} className="w-full">
          <Button className="w-full">Book Parking</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
