
import { useState, useEffect } from "react";
import EventCard, { Event } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data - would come from an API in a real app
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Taylor Swift: The Eras Tour",
    date: "May 20, 2025",
    time: "7:00 PM - 11:00 PM",
    location: "SoFi Stadium, Los Angeles",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 123,
    parkingTotal: 500
  },
  {
    id: 2,
    title: "Coldplay: Music of the Spheres World Tour",
    date: "June 15, 2025",
    time: "6:30 PM - 10:30 PM",
    location: "MetLife Stadium, New Jersey",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 42,
    parkingTotal: 400
  },
  {
    id: 3,
    title: "Beyoncé: Renaissance World Tour",
    date: "July 8, 2025",
    time: "8:00 PM - 11:30 PM",
    location: "Mercedes-Benz Stadium, Atlanta",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 350,
    parkingTotal: 600
  },
  {
    id: 4,
    title: "Ed Sheeran: Mathematics Tour",
    date: "August 12, 2025",
    time: "7:30 PM - 10:30 PM",
    location: "Wembley Stadium, London",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    parkingAvailable: 75,
    parkingTotal: 450
  }
];

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchEvents = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
