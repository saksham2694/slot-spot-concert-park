
import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "@/types/event";

interface EventHeroProps {
  event: Event;
}

const EventHero = ({ event }: EventHeroProps) => {
  return (
    <div className="relative h-80 overflow-hidden">
      <img
        src={event.image}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 container py-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
        <div className="flex flex-wrap gap-4 items-center text-sm md:text-base">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
