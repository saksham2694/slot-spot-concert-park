
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingData {
  eventId: string;
  parkingSlotId: string;
  price: number;
  slotLabel: string;
}

export async function createBooking(bookingData: BookingData): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    toast.error("You must be logged in to book a parking spot");
    return null;
  }
  
  try {
    // Parse the row and column from the slot label (format: R1C1)
    const rowNumber = parseInt(bookingData.slotLabel.charAt(1));
    const columnNumber = parseInt(bookingData.slotLabel.charAt(3));
    
    // First, check if the slot is already reserved
    const { data: existingLayouts, error: checkError } = await supabase
      .from("parking_layouts")
      .select("id")
      .eq("event_id", bookingData.eventId)
      .eq("row_number", rowNumber)
      .eq("column_number", columnNumber)
      .eq("is_reserved", true);
      
    if (checkError) {
      console.error("Error checking slot availability:", checkError);
      toast.error("Failed to check slot availability. Please try again.");
      throw checkError;
    }
    
    if (existingLayouts && existingLayouts.length > 0) {
      toast.error("This parking slot has already been reserved. Please select another one.");
      return null;
    }
    
    // Create or update the parking layout for this slot
    const { data: layoutData, error: layoutError } = await supabase
      .from("parking_layouts")
      .upsert({
        event_id: bookingData.eventId,
        row_number: rowNumber,
        column_number: columnNumber,
        is_reserved: true,
        price: bookingData.price
      })
      .select("id")
      .single();
      
    if (layoutError) {
      console.error("Error creating parking layout:", layoutError);
      toast.error("Failed to reserve parking slot. Please try again.");
      throw layoutError;
    }
    
    // Now create the booking with the new layout ID
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        user_id: session.session.user.id,
        event_id: bookingData.eventId,
        parking_layout_id: layoutData.id,
        status: "confirmed",
        qr_code_url: `SLOTSPOT-${bookingData.eventId}-${bookingData.slotLabel}-${Date.now()}`
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
      throw error;
    }

    // The update_available_slots trigger will handle decrementing the available slots
    
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
      qr_code_url,
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
  try {
    // First get the booking to find the event ID
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("event_id, parking_layout_id")
      .eq("id", bookingId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching booking:", fetchError);
      toast.error("Failed to find booking details. Please try again.");
      throw fetchError;
    }
    
    // Update the booking status to cancelled
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error cancelling booking:", updateError);
      toast.error("Failed to cancel booking. Please try again.");
      throw updateError;
    }
    
    // The trigger will handle incrementing the available slots count
    
    // Optional: You can also update the parking layout to free up the spot
    if (booking && booking.parking_layout_id) {
      const { error: layoutError } = await supabase
        .from("parking_layouts")
        .update({ is_reserved: false })
        .eq("id", booking.parking_layout_id);
        
      if (layoutError) {
        console.error("Error updating parking layout:", layoutError);
        // Don't throw here, booking is already cancelled
      }
    }

    toast.success("Booking cancelled successfully!");
    return true;
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    throw error;
  }
}
