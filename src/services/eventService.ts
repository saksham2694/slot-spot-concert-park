
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }

  return data?.map(mapDbEventToEvent) || [];
}

export async function fetchEventById(eventId: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 means no rows returned
        return null;
      }
      console.error("Error fetching event:", error);
      throw error;
    }

    return data ? mapDbEventToEvent(data) : null;
  } catch (error) {
    console.error("Error in fetchEventById:", error);
    throw error;
  }
}

export async function createEvent(eventData: {
  title: string;
  location: string;
  date: string;
  image_url?: string;
  total_parking_slots: number;
  available_parking_slots: number;
}): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert(eventData)
      .select("id")
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

// Helper function to map database event to frontend Event type
function mapDbEventToEvent(dbEvent: any): Event {
  return {
    id: dbEvent.id,
    title: dbEvent.title,
    date: new Date(dbEvent.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: new Date(dbEvent.date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    location: dbEvent.location,
    image: dbEvent.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
    parkingAvailable: dbEvent.available_parking_slots,
    parkingTotal: dbEvent.total_parking_slots
  };
}
