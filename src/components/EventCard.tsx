
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, IndianRupee } from "lucide-react";
import { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
        />
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
          
          <div className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-2 text-parking-primary" />
            <span><span className="font-medium">₹{event.parkingPrice}</span> per spot</span>
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
