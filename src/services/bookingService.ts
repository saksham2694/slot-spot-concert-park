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
        total_price: totalPrice,
        status: "pending_payment", // Initial status
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
      const { error: slotError } = await supabase
        .from("booking_slots")
        .insert({
          booking_id: bookingId,
          slot_id: slot.id,
          price: slot.price,
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
      .select("*")
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
      .select("slot_id")
      .eq("booking_id", bookingId);

    if (slotsError) {
      console.error("Error fetching booking slots:", slotsError);
      return null;
    }

    return {
      ...booking,
      parkingSpots: slotsData ? slotsData.map((slot: any) => slot.slot_id) : [],
    };
  } catch (error) {
    console.error("Error in fetchBookingById:", error);
    return null;
  }
};

export const fetchBookingsForUser = async (userId: string) => {
  try {
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        *,
        events (
          title,
          date,
          location
        )
      `)
      .eq("user_id", userId)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    return bookings.map(booking => ({
      id: booking.id,
      eventId: booking.event_id,
      eventName: booking.events?.title || 'Unknown Event',
      eventDate: new Date(booking.events?.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      eventTime: new Date(booking.events?.date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      location: booking.events?.location || 'Unknown Location',
      parkingSpots: [], // Initialize as empty, will be populated later
      totalPrice: booking.total_price,
      status: booking.status,
      paymentOrderId: booking.payment_order_id,
      paymentReferenceId: booking.payment_reference_id,
      paymentMode: booking.payment_mode,
      paymentAmount: booking.payment_amount,
      paymentDate: booking.payment_date
    }));
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
