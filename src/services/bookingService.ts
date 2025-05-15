import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface BookingData {
  eventId: string;
  parkingSlots: Array<{
    slotId: string;
    price: number;
    slotLabel: string;
  }>;
}

interface BookingInput {
  eventId: string;
  parkingSlots: Array<{
    slotId: string;
    price: number;
    slotLabel: string;
  }>;
}

export async function createBooking(bookingInput: BookingData): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    toast({
      title: "Authentication Required",
      description: "You must be logged in to book a parking spot",
      variant: "destructive",
    });
    return null;
  }
  
  try {
    // Check if the user already has a booking for this event
    const { data: existingBookings, error: existingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("user_id", session.session.user.id)
      .eq("event_id", bookingInput.eventId)
      .eq("status", "confirmed");
      
    if (existingError) {
      console.error("Error checking existing bookings:", existingError);
      toast({
        title: "Error",
        description: "Failed to check existing bookings. Please try again.",
        variant: "destructive",
      });
      throw existingError;
    }
    
    // First, check if any of the selected slots are already reserved
    for (const slot of bookingInput.parkingSlots) {
      // Parse the row and column from the slot label (format: R1C1)
      const rowNumber = parseInt(slot.slotLabel.charAt(1));
      const columnNumber = parseInt(slot.slotLabel.charAt(3));
      
      const { data: existingLayouts, error: checkError } = await supabase
        .from("parking_layouts")
        .select("id")
        .eq("event_id", bookingInput.eventId)
        .eq("row_number", rowNumber)
        .eq("column_number", columnNumber)
        .eq("is_reserved", true);
        
      if (checkError) {
        console.error("Error checking slot availability:", checkError);
        toast({
          title: "Error",
          description: "Failed to check slot availability. Please try again.",
          variant: "destructive",
        });
        throw checkError;
      }
      
      if (existingLayouts && existingLayouts.length > 0) {
        toast({
          title: "Slot Already Reserved",
          description: `Parking slot ${slot.slotLabel} has already been reserved. Please select another one.`,
          variant: "destructive",
        });
        return null;
      }
    }
    
    // Create a booking record with initial status as 'pending_payment'
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        user_id: session.session.user.id,
        event_id: bookingInput.eventId,
        status: "pending_payment", // Changed from 'confirmed' to 'pending_payment'
        qr_code_url: `TIME2PARK-${bookingInput.eventId}-${Date.now()}`
      })
      .select("id")
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      throw bookingError;
    }

    const bookingId = booking.id;
    
    // Reserve each parking slot for this booking
    for (const slot of bookingInput.parkingSlots) {
      // Parse the row and column from the slot label (format: R1C1)
      const rowNumber = parseInt(slot.slotLabel.charAt(1));
      const columnNumber = parseInt(slot.slotLabel.charAt(3));
      
      // Create or update the parking layout for this slot
      const { data: layoutData, error: layoutError } = await supabase
        .from("parking_layouts")
        .upsert({
          event_id: bookingInput.eventId,
          row_number: rowNumber,
          column_number: columnNumber,
          is_reserved: true,
          price: slot.price
        })
        .select("id")
        .single();
        
      if (layoutError) {
        console.error("Error creating parking layout:", layoutError);
        toast({
          title: "Error",
          description: "Failed to reserve parking slot. Please try again.",
          variant: "destructive",
        });
        throw layoutError;
      }
      
      // Create the booking_slot entry to link the booking with this layout
      const { error: slotError } = await supabase
        .from("booking_slots")
        .insert({
          booking_id: bookingId,
          parking_layout_id: layoutData.id
        });
        
      if (slotError) {
        console.error("Error creating booking slot:", slotError);
        toast({
          title: "Error",
          description: "Failed to associate parking slot with booking. Please try again.",
          variant: "destructive",
        });
        throw slotError;
      }
    }

    // The available parking slots will be updated after successful payment
    // Update happens in the payment-webhook edge function

    return bookingId;
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
      qr_code_url,
      events (
        id,
        title,
        date,
        location,
        image_url
      ),
      booking_slots (
        parking_layouts (
          id,
          row_number,
          column_number,
          price
        )
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
    // First get the booking to find the event ID and associated slots
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("event_id")
      .eq("id", bookingId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching booking:", fetchError);
      toast({
        title: "Error",
        description: "Failed to find booking details. Please try again.",
        variant: "destructive",
      });
      throw fetchError;
    }
    
    // Get all booking slots associated with this booking
    const { data: bookingSlots, error: slotsError } = await supabase
      .from("booking_slots")
      .select("parking_layout_id")
      .eq("booking_id", bookingId);
      
    if (slotsError) {
      console.error("Error fetching booking slots:", slotsError);
      toast({
        title: "Error",
        description: "Failed to find booking slot details. Please try again.",
        variant: "destructive",
      });
      throw slotsError;
    }
    
    // Update the booking status to cancelled
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error cancelling booking:", updateError);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
      throw updateError;
    }
    
    // Free up all the parking spots
    for (const slot of bookingSlots || []) {
      const { error: layoutError } = await supabase
        .from("parking_layouts")
        .update({ is_reserved: false })
        .eq("id", slot.parking_layout_id);
        
      if (layoutError) {
        console.error("Error updating parking layout:", layoutError);
        // Continue with other slots
      }
    }
      
    // Update the available slots count in the events table
    const slotCount = bookingSlots?.length || 0;
    if (slotCount > 0) {
      const { error: eventError } = await supabase.rpc('increment', { 
        x: slotCount, 
        row_id: booking.event_id 
      });
        
      if (eventError) {
        console.error("Error updating event slots:", eventError);
        // Don't throw here, booking is already cancelled and spots freed
      }
    }

    toast({
      title: "Success",
      description: "Booking cancelled successfully!",
    });
    return true;
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    throw error;
  }
}

export async function fetchBookingById(bookingId: string) {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_date,
        status,
        event_id,
        qr_code_url,
        events (
          id,
          title,
          date,
          location,
          image_url
        ),
        booking_slots (
          parking_layouts (
            id,
            row_number,
            column_number,
            price
          )
        )
      `)
      .eq("id", bookingId)
      .eq("user_id", session.session.user.id)
      .single();

    if (error) {
      console.error("Error fetching booking:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Format the booking data
    const eventDate = new Date(data.events.date);
    const status = eventDate < new Date() ? "completed" : "upcoming";
    
    // Format the event date and time
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const formattedTime = eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Extract parking spots from booking_slots
    const parkingSpots = data.booking_slots?.map(slot => 
      `R${slot.parking_layouts.row_number}C${slot.parking_layouts.column_number}`
    ) || [];

    // Calculate total price
    const totalPrice = data.booking_slots?.reduce((total, slot) => 
      total + (slot.parking_layouts.price || 0), 0
    ) || 0;

    return {
      id: data.id,
      eventId: data.event_id || "",
      eventName: data.events.title,
      eventDate: formattedDate,
      eventTime: `${formattedTime} - ${new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`,
      location: data.events.location,
      parkingSpots,
      totalPrice,
      status
    };
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    throw error;
  }
}
