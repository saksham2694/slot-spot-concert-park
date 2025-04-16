
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingData {
  eventId: string;
  parkingLayoutId: string;
}

export async function createBooking(bookingData: BookingData): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    toast.error("You must be logged in to book a parking spot");
    return null;
  }
  
  try {
    // First check if the event has available slots
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("available_parking_slots")
      .eq("id", bookingData.eventId)
      .single();
    
    if (eventError || !eventData) {
      console.error("Error checking event availability:", eventError);
      toast.error("Unable to verify parking availability");
      throw new Error("Failed to check event availability");
    }
    
    if (eventData.available_parking_slots <= 0) {
      toast.error("No parking slots available for this event");
      return null;
    }
    
    // Create the booking
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: session.session.user.id,
        event_id: bookingData.eventId,
        parking_layout_id: bookingData.parkingLayoutId,
        status: "confirmed"
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
      throw error;
    }

    // Update the available parking slots for the event
    const { error: updateError } = await supabase
      .from("events")
      .update({ 
        available_parking_slots: eventData.available_parking_slots - 1 
      })
      .eq("id", bookingData.eventId);
    
    if (updateError) {
      console.error("Error updating available slots:", updateError);
      // We won't throw here since the booking was already created
    }

    toast.success("Booking confirmed successfully!");
    return data?.id || null;
  } catch (error) {
    console.error("Error in createBooking:", error);
    throw error;
  }
}

export async function fetchUserBookings() {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    return [];
  }
  
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_date,
      status,
      event_id,
      parking_layout_id,
      events (
        id,
        title,
        date,
        location,
        image_url
      ),
      parking_layouts (
        id,
        row_number,
        column_number,
        price
      )
    `)
    .eq("user_id", session.session.user.id)
    .order("booking_date", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }

  return data || [];
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    toast.error("Failed to cancel booking. Please try again.");
    throw error;
  }

  toast.success("Booking cancelled successfully!");
  return true;
}
