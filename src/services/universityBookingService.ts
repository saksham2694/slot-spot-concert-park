
import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot, UniversityReservedSpot } from "@/types/parking";

const safeQueryResult = <T>(data: unknown, defaultValue: T): T => {
  if (data === null || data === undefined) return defaultValue;
  return data as T;
};

// Function to generate a unique ID using Date.now() and random numbers
const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

interface CreateUniversityBookingParams {
  universityId: string;
  selectedSlots: ParkingSlot[];
  startDate: Date;
  endDate: Date;
  hours: number;
}

export async function createUniversityBooking({
  universityId,
  selectedSlots,
  startDate,
  endDate,
  hours
}: CreateUniversityBookingParams): Promise<string> {
  try {
    // First verify the user is authenticated
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("User not authenticated");
    }
    
    console.log("Creating booking for user:", user.id);
    
    // Calculate total price
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + (slot.price * hours), 0);
    
    // Create the booking record with the authenticated user's ID
    const { data: bookingData, error: bookingError } = await supabase
      .from("university_bookings")
      .insert({
        university_id: universityId,
        user_id: user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_amount: totalPrice,
        status: "upcoming"
      })
      .select('id')
      .single();
    
    if (bookingError || !bookingData) {
      console.error("Error creating booking:", bookingError);
      throw new Error(`Failed to create booking: ${bookingError?.message || "Unknown error"}`);
    }
    
    const bookingId = bookingData.id;
    console.log("Successfully created booking with ID:", bookingId);
    
    // Mark the selected slots as reserved in the university_parking_layouts table
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
        .from("university_parking_layouts")
        .select("*")
        .eq("university_id", universityId)
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
          .from("university_parking_layouts")
          .update({
            is_reserved: true,
            price
          })
          .eq("university_id", universityId)
          .eq("row_number", rowNumber)
          .eq("column_number", colNumber);
        
        if (updateError) {
          console.error("Error updating slot:", updateError);
        }
      } else {
        // Insert new slot
        const { error: updateError } = await supabase
          .from("university_parking_layouts")
          .insert({
            university_id: universityId,
            row_number: rowNumber,
            column_number: colNumber,
            is_reserved: true,
            price
          });
        
        if (updateError) {
          console.error("Error inserting slot:", updateError);
        }
      }

      // Create a record in the university_booking_slots table to link the booking with the slot
      const { data: layoutData, error: layoutError } = await supabase
        .from("university_parking_layouts")
        .select("id")
        .eq("university_id", universityId)
        .eq("row_number", rowNumber)
        .eq("column_number", colNumber)
        .single();

      if (!layoutError && layoutData) {
        const { error: slotBookingError } = await supabase
          .from("university_booking_slots")
          .insert({
            booking_id: bookingId,
            parking_layout_id: layoutData.id
          });

        if (slotBookingError) {
          console.error("Error creating booking slot:", slotBookingError);
        }
      }
    }
    
    // Update the university's available parking slots count
    const { data: universityUpdateData, error: universityUpdateError } = await supabase
      .from("universities")
      .select("available_parking_slots")
      .eq("id", universityId)
      .single();
    
    if (!universityUpdateError && universityUpdateData) {
      const newAvailableSlots = Math.max(0, universityUpdateData.available_parking_slots - selectedSlots.length);
      
      await supabase
        .from("universities")
        .update({ available_parking_slots: newAvailableSlots })
        .eq("id", universityId);
    }
    
    return bookingId;
  } catch (error) {
    console.error("Error in createUniversityBooking:", error);
    throw error;
  }
}

export async function fetchUniversityBookings(userId: string) {
  try {
    const { data, error } = await supabase
      .from("university_bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching university bookings:", error);
    throw error;
  }
}

export async function fetchUniversityBookingsForUser(userId: string) {
  return fetchUniversityBookings(userId);
}

export async function fetchUniversityBookingById(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from("university_bookings")
      .select("*, university:university_id(name, location)")
      .eq("id", bookingId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching university booking:", error);
    throw error;
  }
}

export async function getUniversityBookingSlots(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from("university_booking_slots")
      .select(`
        id,
        parking_layout_id,
        university_parking_layouts (
          row_number,
          column_number,
          price
        )
      `)
      .eq("booking_id", bookingId);
    
    if (error) {
      throw error;
    }
    
    // Transform the data into an array of parking spot IDs
    const parkingSpots = data?.map(slot => {
      const layout = slot.university_parking_layouts;
      return `R${layout.row_number}C${layout.column_number}`;
    }) || [];
    
    return parkingSpots;
  } catch (error) {
    console.error("Error fetching university booking slots:", error);
    return [];
  }
}

export async function cancelUniversityBooking(bookingId: string) {
  try {
    // Update booking status first
    const { error: updateError } = await supabase
      .from("university_bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    
    if (updateError) {
      throw updateError;
    }

    // Get the booking slots
    const { data: bookingSlots, error: slotsError } = await supabase
      .from("university_booking_slots")
      .select("parking_layout_id")
      .eq("booking_id", bookingId);
    
    if (slotsError) {
      console.error("Error getting booking slots:", slotsError);
      throw slotsError;
    }

    // For each slot, get the layout info and free up the slot
    for (const slot of bookingSlots || []) {
      const { data: layoutData, error: layoutError } = await supabase
        .from("university_parking_layouts")
        .select("university_id, row_number, column_number")
        .eq("id", slot.parking_layout_id)
        .single();
      
      if (layoutError) {
        console.error("Error getting layout data:", layoutError);
        continue;
      }

      // Update the slot to be no longer reserved
      const { error: slotError } = await supabase
        .from("university_parking_layouts")
        .update({
          is_reserved: false
        })
        .eq("id", slot.parking_layout_id);
      
      if (slotError) {
        console.error("Error updating slot:", slotError);
      }
    }
    
    // Update the university's available parking slots count
    if (bookingSlots && bookingSlots.length > 0) {
      const { data: layoutData } = await supabase
        .from("university_parking_layouts")
        .select("university_id")
        .eq("id", bookingSlots[0].parking_layout_id)
        .single();

      if (layoutData) {
        const { data: universityData, error: universityError } = await supabase
          .from("universities")
          .select("available_parking_slots")
          .eq("id", layoutData.university_id)
          .single();
        
        if (!universityError && universityData) {
          const newAvailableSlots = universityData.available_parking_slots + bookingSlots.length;
          
          await supabase
            .from("universities")
            .update({ available_parking_slots: newAvailableSlots })
            .eq("id", layoutData.university_id);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error cancelling university booking:", error);
    throw error;
  }
}

export async function getReservedUniversityParkingSpots(universityId: string) {
  try {
    const { data, error } = await supabase
      .from("university_parking_layouts")
      .select("row_number, column_number, price")
      .eq("university_id", universityId)
      .eq("is_reserved", true);

    if (error) {
      console.error("Error fetching reserved spots:", error);
      return [];
    }

    const reservedSpots = data ? safeQueryResult<UniversityReservedSpot[]>(data, []) : [];
    return reservedSpots;
  } catch (error) {
    console.error("Error fetching reserved parking spots:", error);
    return [];
  }
}
