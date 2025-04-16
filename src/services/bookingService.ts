
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
    // Check if the user already has a booking for this event
    const { data: existingBookings, error: existingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_id", session.session.user.id)
      .eq("event_id", bookingData.eventId)
      .eq("status", "confirmed");
      
    if (existingError) {
      console.error("Error checking existing bookings:", existingError);
      toast.error("Failed to check existing bookings. Please try again.");
      throw existingError;
    }
    
    if (existingBookings && existingBookings.length > 0) {
      toast.error("You already have a booking for this event. You can only book one spot per event.");
      return null;
    }
  
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

    // Update the available parking slots in the events table
    const { error: updateError } = await supabase.rpc('decrement', { 
      x: 1, 
      row_id: bookingData.eventId 
    });

    if (updateError) {
      console.error("Error updating event slots:", updateError);
      // Don't throw here, booking is already created
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
    // First get the booking to find the event ID and parking layout
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
    
    if (!booking || !booking.parking_layout_id || !booking.event_id) {
      console.error("Incomplete booking data:", booking);
      toast.error("Booking data is incomplete. Please try again.");
      return false;
    }
    
    // Get the layout details to release the parking spot
    const { data: layout, error: layoutFetchError } = await supabase
      .from("parking_layouts")
      .select("*")
      .eq("id", booking.parking_layout_id)
      .single();
      
    if (layoutFetchError) {
      console.error("Error fetching parking layout:", layoutFetchError);
      // Continue with the process
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
    
    // Free up the parking spot by updating the parking layout
    const { error: layoutError } = await supabase
      .from("parking_layouts")
      .update({ is_reserved: false })
      .eq("id", booking.parking_layout_id);
      
    if (layoutError) {
      console.error("Error updating parking layout:", layoutError);
      toast.error("Failed to free up the parking spot. Please contact support.");
      // Don't throw here, booking is already cancelled
    }
      
    // Update the available slots count in the events table
    const { error: eventError } = await supabase.rpc('increment', { 
      x: 1, 
      row_id: booking.event_id 
    });
      
    if (eventError) {
      console.error("Error updating event slots:", eventError);
      // Don't throw here, booking is already cancelled and spot freed
    }

    toast.success("Booking cancelled successfully!");
    return true;
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    throw error;
  }
}
