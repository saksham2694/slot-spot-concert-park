
import { supabase } from "@/integrations/supabase/client";

export const createBooking = async (
  eventId: string,
  userId: string,
  selectedSlots: { id: string; price: number }[]
): Promise<string> => {
  try {
    // Calculate total price
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

    // Create booking record
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        event_id: eventId,
        user_id: userId,
        payment_amount: totalPrice,
        status: "pending", // Changed from pending_payment to pending to match allowed values
      })
      .select('id')
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      throw new Error("Failed to create booking");
    }

    const bookingId = bookingData.id;

    // Create booking slots records
    for (const slot of selectedSlots) {
      // Parse the row and column from the slot ID (format: R1C3)
      const rowMatch = slot.id.match(/R(\d+)/);
      const colMatch = slot.id.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        throw new Error(`Invalid slot ID format: ${slot.id}`);
      }
      
      const rowNumber = parseInt(rowMatch[1]);
      const columnNumber = parseInt(colMatch[1]);
      
      // Check if parking layout exists, if not create it
      let parkingLayoutId;
      
      // First try to get the existing layout
      const { data: existingLayout, error: layoutQueryError } = await supabase
        .from("parking_layouts")
        .select("id")
        .eq("event_id", eventId)
        .eq("row_number", rowNumber)
        .eq("column_number", columnNumber)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows are found
      
      if (layoutQueryError) {
        console.error("Error querying parking layout:", layoutQueryError);
        throw new Error("Failed to query parking layout");
      }
      
      // If layout doesn't exist, create it
      if (!existingLayout) {
        console.log(`Creating new parking layout for R${rowNumber}C${columnNumber}`);
        const { data: newLayout, error: createLayoutError } = await supabase
          .from("parking_layouts")
          .insert({
            event_id: eventId,
            row_number: rowNumber,
            column_number: columnNumber,
            price: slot.price,
            is_reserved: false
          })
          .select("id")
          .single();
        
        if (createLayoutError) {
          console.error("Error creating parking layout:", createLayoutError);
          throw new Error("Failed to create parking layout");
        }
        
        parkingLayoutId = newLayout.id;
      } else {
        parkingLayoutId = existingLayout.id;
      }
      
      // Create the booking slot with the parking layout ID
      const { error: slotError } = await supabase
        .from("booking_slots")
        .insert({
          booking_id: bookingId,
          parking_layout_id: parkingLayoutId,
        });

      if (slotError) {
        console.error("Error creating booking slot:", slotError);
        throw new Error("Failed to create booking slot");
      }
    }

    // Update event's available parking slots
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("available_parking_slots")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("Error fetching event:", eventError);
      throw new Error("Failed to fetch event");
    }

    const newAvailableSlots = eventData.available_parking_slots - selectedSlots.length;

    const { error: updateError } = await supabase
      .from("events")
      .update({ available_parking_slots: newAvailableSlots })
      .eq("id", eventId);

    if (updateError) {
      console.error("Error updating event:", updateError);
      throw new Error("Failed to update event");
    }

    return bookingId;
  } catch (error) {
    console.error("Error in createBooking:", error);
    throw error;
  }
};

export const fetchBookingById = async (bookingId: string) => {
  try {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          title,
          date,
          location
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      console.error("Error fetching booking:", bookingError);
      return null;
    }

    if (!booking) {
      console.log("Booking not found");
      return null;
    }

    const { data: slotsData, error: slotsError } = await supabase
      .from("booking_slots")
      .select(`
        *,
        parking_layouts (
          row_number,
          column_number,
          price
        )
      `)
      .eq("booking_id", bookingId);

    if (slotsError) {
      console.error("Error fetching booking slots:", slotsError);
      return null;
    }

    // Format the booking data to match what's expected by components
    const eventDate = booking.events ? new Date(booking.events.date) : null;
    const formattedDate = eventDate ? eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }) : "";
    
    const formattedTime = eventDate ? eventDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) : "";

    // Extract parking spots from slots
    const parkingSpots = slotsData ? slotsData.map((slot) => {
      if (slot.parking_layouts) {
        return `R${slot.parking_layouts.row_number}C${slot.parking_layouts.column_number}`;
      }
      return "";
    }).filter(Boolean) : [];

    // Calculate total price from slots
    const totalPrice = slotsData ? slotsData.reduce((sum, slot) => {
      return sum + (slot.parking_layouts?.price || 0);
    }, 0) : 0;

    return {
      ...booking,
      parkingSpots,
      eventId: booking.event_id,
      eventName: booking.events?.title || 'Unknown Event',
      eventDate: formattedDate,
      eventTime: formattedTime,
      location: booking.events?.location || 'Unknown Location',
      totalPrice: booking.payment_amount || totalPrice,
    };
  } catch (error) {
    console.error("Error in fetchBookingById:", error);
    return null;
  }
};

export const fetchBookingsForUser = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          title,
          date,
          location
        ),
        booking_slots (
          *,
          parking_layouts (
            row_number,
            column_number,
            price
          )
        )
      `)
      .eq("user_id", userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchBookingsForUser:", error);
    return [];
  }
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  try {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    throw error;
  }
};

export const updateBookingPaymentDetails = async (
  bookingId: string,
  paymentOrderId: string,
  paymentReferenceId: string,
  paymentMode: string,
  paymentAmount: number,
  paymentDate: string
) => {
  try {
    const { error } = await supabase
      .from("bookings")
      .update({
        payment_order_id: paymentOrderId,
        payment_reference_id: paymentReferenceId,
        payment_mode: paymentMode,
        payment_amount: paymentAmount,
        payment_date: paymentDate,
        status: 'confirmed' // or 'completed' based on your workflow
      })
      .eq("id", bookingId);

    if (error) {
      console.error("Error updating booking payment details:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateBookingPaymentDetails:", error);
    throw error;
  }
};
