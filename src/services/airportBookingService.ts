import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot, AirportReservedSpot } from "@/types/parking";

const safeQueryResult = <T>(data: unknown, defaultValue: T): T => {
  if (data === null || data === undefined) return defaultValue;
  return data as T;
};

interface BookingData {
  airportId: string;
  selectedSlots: ParkingSlot[];
  startDate: Date;
  endDate: Date;
  hours: number;
}

export const createAirportBooking = async (bookingData: BookingData): Promise<string | null> => {
  const { airportId, selectedSlots, startDate, endDate, hours } = bookingData;

  // Calculate the total price
  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  try {
    // 1. Create a new booking record
    const { data: bookingData, error: bookingError } = await supabase
      .from("airport_bookings")
      .insert([
        {
          airport_id: airportId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_price: totalPrice,
          hours: hours,
          status: "upcoming", // e.g., 'upcoming', 'completed', 'cancelled'
        },
      ])
      .select("id")
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    const bookingId = bookingData.id;

    // 2. Mark the selected parking slots as reserved
    for (const slot of selectedSlots) {
      // a. Update the parking layout to mark the slot as reserved
      const { error: updateError } = await supabase
        .from("airport_parking_layouts")
        .insert({
          airport_id: airportId,
          row_number: parseInt(slot.id.substring(1, 2)), // Extract row from slot ID
          column_number: parseInt(slot.id.substring(3, 4)), // Extract column from slot ID
          is_reserved: true,
          price: slot.price
        });

      if (updateError) {
        throw new Error(`Failed to update parking layout: ${updateError.message}`);
      }

      // b. Create a record for the specific parking slot in the booking
      const { error: slotBookingError } = await supabase
        .from("airport_booking_slots")
        .insert([
          {
            booking_id: bookingId,
            slot_id: slot.id,
            price: slot.price,
          },
        ]);

      if (slotBookingError) {
        throw new Error(`Failed to create booking slot: ${slotBookingError.message}`);
      }
    }

    return bookingId;
  } catch (error: any) {
    console.error("Error creating airport booking:", error.message);
    return null;
  }
};

export const fetchAirportBookingById = async (bookingId: string) => {
  try {
    const { data: booking, error: bookingError } = await supabase
      .from("airport_bookings")
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
      .from("airport_booking_slots")
      .select("slot_id")
      .eq("booking_id", bookingId);

    if (slotsError) {
      console.error("Error fetching booking slots:", slotsError);
      return null;
    }

    const parkingSpots = slotsData ? slotsData.map((slot) => slot.slot_id) : [];

    return {
      ...booking,
      parkingSpots,
    };
  } catch (error) {
    console.error("Error in fetchAirportBookingById:", error);
    return null;
  }
};

export const fetchAirportBookingsForUser = async (userId: string) => {
  try {
    // Fetch the airport IDs associated with the user
    const { data: userAirports, error: userAirportsError } = await supabase
      .from("user_airports")
      .select("airport_id")
      .eq("user_id", userId);

    if (userAirportsError) {
      console.error("Error fetching user airports:", userAirportsError);
      return [];
    }

    if (!userAirports || userAirports.length === 0) {
      console.log("No airports associated with the user.");
      return [];
    }

    const airportIds = userAirports.map((ua) => ua.airport_id);

    // Fetch bookings for those airports
    const { data: bookings, error: bookingsError } = await supabase
      .from("airport_bookings")
      .select("*")
      .in("airport_id", airportIds);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    return bookings || [];
  } catch (error) {
    console.error("Error in fetchAirportBookingsForUser:", error);
    return [];
  }
};

export const getReservedAirportParkingSpots = async (airportId: string) => {
  try {
    const { data, error } = await supabase
      .from("airport_parking_layouts")
      .select("row_number, column_number, price")
      .eq("airport_id", airportId)
      .eq("is_reserved", true);

    if (error) {
      console.error("Error fetching reserved spots:", error);
      return [];
    }

    const reservedSpots = data ? safeQueryResult<AirportReservedSpot[]>(data, []) : [];
    return reservedSpots;
  } catch (error) {
    console.error("Error fetching reserved parking spots:", error);
    return [];
  }
};
