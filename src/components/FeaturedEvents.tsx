
import EventCard from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEvents } from "@/services/eventService";
import { Event } from "@/types/event";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FeaturedEvents = () => {
  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Subscribe to changes on the events table to update available slots
  useEffect(() => {
    console.log("Setting up real-time subscription for events updates");
    
    const channel = supabase
      .channel('events-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log("Event updated in database:", payload);
          refetch();
        }
      )
      .subscribe();
      
    return () => {
      console.log("Cleaning up events subscription");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (error) {
    console.error("Error fetching events:", error);
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Events</h2>
          <Link to="/events">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        
        {isLoading ? (
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
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">No events available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
