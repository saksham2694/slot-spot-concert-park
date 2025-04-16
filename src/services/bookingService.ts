
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

  toast.success("Booking confirmed successfully!");
  return data?.id || null;
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
