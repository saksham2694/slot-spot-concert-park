
import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot, AirportReservedSpot } from "@/types/parking";

const safeQueryResult = <T>(data: unknown, defaultValue: T): T => {
  if (data === null || data === undefined) return defaultValue;
  return data as T;
};

// Function to generate a unique ID using Date.now() and random numbers
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
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
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      console.error("User not authenticated:", userError);
      return null;
    }
    
    const userId = userData.user.id;

    // Generate a unique booking ID
    const bookingId = generateUniqueId();

    // 1. Create a new booking record
    const { data: bookingData, error: bookingError } = await supabase
      .from("airport_bookings")
      .insert([
        {
          id: bookingId,
          airport_id: airportId,
          user_id: userId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          payment_amount: totalPrice,
          status: "upcoming", // e.g., 'upcoming', 'completed', 'cancelled'
        },
      ])
      .select("id")
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Get the actual booking ID from the response
    const resultingBookingId = bookingData.id;

    // 2. Mark the selected parking slots as reserved
    for (const slot of selectedSlots) {
      // Extract row and column from slot ID (format: R1C2)
      const rowMatch = slot.id.match(/R(\d+)/);
      const colMatch = slot.id.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        console.error(`Invalid slot ID format: ${slot.id}`);
        continue;
      }
      
      const rowNumber = parseInt(rowMatch[1]);
      const colNumber = parseInt(colMatch[1]);

      // a. Update or insert into the parking layout to mark the slot as reserved
      const { data: existingSlot, error: checkError } = await supabase
        .from("airport_parking_layouts")
        .select("id")
        .eq("airport_id", airportId)
        .eq("row_number", rowNumber)
        .eq("column_number", colNumber)
        .single();

      let layoutId;
      
      if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned" which is fine
        console.error("Error checking slot existence:", checkError);
        continue;
      }

      if (existingSlot) {
        // Update existing slot
        const { error: updateError } = await supabase
          .from("airport_parking_layouts")
          .update({
            is_reserved: true,
            price: slot.price
          })
          .eq("id", existingSlot.id);

        if (updateError) {
          console.error("Error updating parking layout:", updateError);
          continue;
        }
        
        layoutId = existingSlot.id;
      } else {
        // Insert new slot
        const { data: newLayout, error: insertError } = await supabase
          .from("airport_parking_layouts")
          .insert({
            airport_id: airportId,
            row_number: rowNumber,
            column_number: colNumber,
            is_reserved: true,
            price: slot.price
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Error inserting parking layout:", insertError);
          continue;
        }
        
        layoutId = newLayout.id;
      }

      // b. Create a record for the specific parking slot in the booking
      if (layoutId) {
        const { error: slotBookingError } = await supabase
          .from("airport_booking_slots")
          .insert({
            booking_id: resultingBookingId,
            parking_layout_id: layoutId
          });

        if (slotBookingError) {
          console.error("Error creating booking slot:", slotBookingError);
        }
      }
    }

    // Update the airport's available parking slots
    const { data: airportData, error: airportError } = await supabase
      .from("airports")
      .select("available_parking_slots")
      .eq("id", airportId)
      .single();
    
    if (!airportError && airportData) {
      const newAvailableSlots = Math.max(0, airportData.available_parking_slots - selectedSlots.length);
      
      await supabase
        .from("airports")
        .update({ available_parking_slots: newAvailableSlots })
        .eq("id", airportId);
    }

    return resultingBookingId;
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
      .select("parking_layout_id")
      .eq("booking_id", bookingId);

    if (slotsError) {
      console.error("Error fetching booking slots:", slotsError);
      return null;
    }

    // Get the actual slot IDs from the layouts
    const parkingSpots = [];
    
    if (slotsData && slotsData.length > 0) {
      for (const item of slotsData) {
        const { data: layoutData, error: layoutError } = await supabase
          .from("airport_parking_layouts")
          .select("row_number, column_number")
          .eq("id", item.parking_layout_id)
          .single();
          
        if (!layoutError && layoutData) {
          // Reconstruct the slot ID in the format R1C2
          parkingSpots.push(`R${layoutData.row_number}C${layoutData.column_number}`);
        }
      }
    }

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
    // Fetch bookings directly for the user
    const { data: bookings, error: bookingsError } = await supabase
      .from("airport_bookings")
      .select("*")
      .eq("user_id", userId);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return [];
    }

    // For each booking, fetch the associated parking spots
    const enhancedBookings = [];
    
    for (const booking of bookings || []) {
      const { data: slotsData, error: slotsError } = await supabase
        .from("airport_booking_slots")
        .select("parking_layout_id")
        .eq("booking_id", booking.id);
        
      if (slotsError) {
        console.error(`Error fetching slots for booking ${booking.id}:`, slotsError);
        continue;
      }
      
      const parkingSpots = [];
      
      // Get airport name and location
      const { data: airportData, error: airportError } = await supabase
        .from("airports")
        .select("name, location")
        .eq("id", booking.airport_id)
        .single();
        
      if (airportError) {
        console.error(`Error fetching airport for booking ${booking.id}:`, airportError);
      }
      
      // Fetch slot details
      if (slotsData && slotsData.length > 0) {
        for (const item of slotsData) {
          const { data: layoutData, error: layoutError } = await supabase
            .from("airport_parking_layouts")
            .select("row_number, column_number")
            .eq("id", item.parking_layout_id)
            .single();
            
          if (!layoutError && layoutData) {
            parkingSpots.push(`R${layoutData.row_number}C${layoutData.column_number}`);
          }
        }
      }
      
      enhancedBookings.push({
        ...booking,
        parkingSpots,
        airport_name: airportData?.name || "Unknown Airport",
        location: airportData?.location || "Unknown Location"
      });
    }

    return enhancedBookings;
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
