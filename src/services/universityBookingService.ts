import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot, UniversityReservedSpot } from "@/types/parking";
import { v4 as uuidv4 } from "uuid";

// Add this function at the top level of the file if it doesn't exist
const safeQueryResult = <T>(data: unknown, defaultValue: T): T => {
  if (data === null || data === undefined) return defaultValue;
  return data as T;
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
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    
    const userId = userData.user.id;
    
    // Calculate total price
    const totalPrice = selectedSlots.reduce((sum, slot) => sum + (slot.price * hours), 0);
    
    // Get university details
    const { data: universityData, error: universityError } = await supabase
      .from("universities")
      .select("name, location")
      .eq("id", universityId)
      .single();
    
    if (universityError || !universityData) {
      throw new Error("Failed to fetch university details");
    }
    
    // Create a new booking ID
    const bookingId = uuidv4();
    
    // Create the booking record
    const { error: bookingError } = await supabase
      .from("university_bookings")
      .insert({
        id: bookingId,
        user_id: userId,
        university_id: universityId,
        university_name: universityData.name,
        location: universityData.location,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        duration_hours: hours,
        total_price: totalPrice,
        parking_spots: selectedSlots.map(slot => slot.id),
        status: "upcoming",
        created_at: new Date().toISOString()
      });
    
    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      throw new Error("Failed to create booking");
    }
    
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
            price,
            booking_id: bookingId,
            reserved_until: endDate.toISOString()
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
            price,
            booking_id: bookingId,
            reserved_until: endDate.toISOString()
          });
        
        if (updateError) {
          console.error("Error inserting slot:", updateError);
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

export async function fetchUniversityBookingById(bookingId: string) {
  try {
    const { data, error } = await supabase
      .from("university_bookings")
      .select("*")
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

export async function cancelUniversityBooking(bookingId: string) {
  try {
    // Get booking details first
    const { data: bookingData, error: bookingError } = await supabase
      .from("university_bookings")
      .select("university_id, parking_spots")
      .eq("id", bookingId)
      .single();
    
    if (bookingError || !bookingData) {
      throw new Error("Failed to fetch booking details");
    }
    
    // Update booking status
    const { error: updateError } = await supabase
      .from("university_bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    
    if (updateError) {
      throw updateError;
    }
    
    // Free up the reserved slots
    for (const slotId of bookingData.parking_spots) {
      // Extract row and column from slot ID (format: R1C2)
      const rowMatch = slotId.match(/R(\d+)/);
      const colMatch = slotId.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        console.error(`Invalid slot ID format: ${slotId}`);
        continue;
      }
      
      const rowNumber = parseInt(rowMatch[1]);
      const colNumber = parseInt(colMatch[1]);
      
      const { error: slotError } = await supabase
        .from("university_parking_layouts")
        .update({
          is_reserved: false,
          booking_id: null,
          reserved_until: null
        })
        .eq("university_id", bookingData.university_id)
        .eq("row_number", rowNumber)
        .eq("column_number", colNumber);
      
      if (slotError) {
        console.error("Error updating slot:", slotError);
      }
    }
    
    // Update the university's available parking slots count
    const { data: universityData, error: universityError } = await supabase
      .from("universities")
      .select("available_parking_slots")
      .eq("id", bookingData.university_id)
      .single();
    
    if (!universityError && universityData) {
      const newAvailableSlots = universityData.available_parking_slots + bookingData.parking_spots.length;
      
      await supabase
        .from("universities")
        .update({ available_parking_slots: newAvailableSlots })
        .eq("id", bookingData.university_id);
    }
    
    return true;
  } catch (error) {
    console.error("Error cancelling university booking:", error);
    throw error;
  }
}
