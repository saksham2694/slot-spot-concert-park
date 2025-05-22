
import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot } from "@/types/parking";
import { Booking } from "@/types/booking";

interface CreateAirportBookingParams {
  airportId: string;
  selectedSlots: ParkingSlot[];
  startDate: Date;
  endDate: Date;
  hours: number;
}

export async function createAirportBooking({
  airportId,
  selectedSlots,
  startDate,
  endDate,
  hours
}: CreateAirportBookingParams): Promise<string> {
  try {
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    
    const userId = userData.user.id;
    
    // Calculate total price
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + (slot.price * hours), 0);
    
    // Create the booking record - let Supabase generate the UUID
    // IMPORTANT: user_id must be set to auth.uid() to satisfy RLS policies
    const { data: bookingData, error: bookingError } = await supabase
      .from("airport_bookings")
      .insert({
        user_id: userId, // This must match auth.uid() for RLS policy
        airport_id: airportId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_amount: totalPrice,
        status: "upcoming"
      })
      .select('id')
      .single();
    
    if (bookingError || !bookingData) {
      console.error("Error creating booking:", bookingError);
      throw new Error(bookingError?.message || "Failed to create booking");
    }
    
    const bookingId = bookingData.id;
    
    // Mark the selected slots as reserved in the airport_parking_layouts table
    for (const slot of selectedSlots) {
      const slotId = slot.id;
      const price = slot.price;
      
      // Extract row and column from slot ID (format: R1C2)
      const rowMatch = slotId.match(/R(\d+)/);
      const colMatch = slotId.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        console.error(`Invalid slot ID format: ${slotId}`);
        continue;
      }
      
      const rowNumber = parseInt(rowMatch[1]);
      const colNumber = parseInt(colMatch[1]);
      
      // Check if the slot already exists
      const { data: existingSlot, error: checkError } = await supabase
        .from("airport_parking_layouts")
        .select("*")
        .eq("airport_id", airportId)
        .eq("row_number", rowNumber)
        .eq("column_number", colNumber)
        .single();
      
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
            price
          })
          .eq("airport_id", airportId)
          .eq("row_number", rowNumber)
          .eq("column_number", colNumber);
        
        if (updateError) {
          console.error("Error updating slot:", updateError);
        }
      } else {
        // Insert new slot
        const { error: insertError } = await supabase
          .from("airport_parking_layouts")
          .insert({
            airport_id: airportId,
            row_number: rowNumber,
            column_number: colNumber,
            is_reserved: true,
            price
          });
        
        if (insertError) {
          console.error("Error inserting slot:", insertError);
        }
      }

      // Create a record in the airport_booking_slots table to link the booking with the slot
      const { data: layoutData, error: layoutError } = await supabase
        .from("airport_parking_layouts")
        .select("id")
        .eq("airport_id", airportId)
        .eq("row_number", rowNumber)
        .eq("column_number", colNumber)
        .single();

      if (!layoutError && layoutData) {
        const { error: slotBookingError } = await supabase
          .from("airport_booking_slots")
          .insert({
            booking_id: bookingId,
            parking_layout_id: layoutData.id
          });

        if (slotBookingError) {
          console.error("Error creating booking slot:", slotBookingError);
        }
      }
    }
    
    // Update the airport's available parking slots count
    const { data: airportUpdateData, error: airportUpdateError } = await supabase
      .from("airports")
      .select("available_parking_slots")
      .eq("id", airportId)
      .single();
    
    if (!airportUpdateError && airportUpdateData) {
      const newAvailableSlots = Math.max(0, airportUpdateData.available_parking_slots - selectedSlots.length);
      
      await supabase
        .from("airports")
        .update({ available_parking_slots: newAvailableSlots })
        .eq("id", airportId);
    }
    
    return bookingId;
  } catch (error: any) {
    console.error("Error in createAirportBooking:", error);
    throw error;
  }
}

export const fetchAirportBookingById = async (bookingId: string): Promise<Booking | null> => {
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

    // Get airport details
    const { data: airportData, error: airportError } = await supabase
      .from("airports")
      .select("name, location")
      .eq("id", booking.airport_id)
      .single();
      
    if (airportError) {
      console.error("Error fetching airport details:", airportError);
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
      status: booking.status as BookingStatus,
      parkingSpots,
      airport_name: airportData?.name || "Unknown Airport",
      location: airportData?.location || "Unknown Location",
      airport: {
        name: airportData?.name || "Unknown Airport",
        location: airportData?.location || "Unknown Location"
      }
    };
  } catch (error) {
    console.error("Error in fetchAirportBookingById:", error);
    return null;
  }
};

export const fetchAirportBookingsForUser = async (userId: string): Promise<Booking[]> => {
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
        status: booking.status as BookingStatus,
        parkingSpots,
        airport_name: airportData?.name || "Unknown Airport",
        location: airportData?.location || "Unknown Location",
        parking_spots: parkingSpots,
        airport: {
          name: airportData?.name || "Unknown Airport",
          location: airportData?.location || "Unknown Location"
        }
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

    return data || [];
  } catch (error) {
    console.error("Error fetching reserved parking spots:", error);
    return [];
  }
};
