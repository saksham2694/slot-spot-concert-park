
import { supabase } from '@/integrations/supabase/client';
import { BookingStatus } from '@/types/booking';
import { safeQueryResult } from '@/types/parking';
import { toast } from "@/components/ui/use-toast";
import { ParkingSlot } from "@/types/parking";

interface AirportBookingInput {
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
}: AirportBookingInput): Promise<string | null> {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    toast({
      title: "Authentication Required",
      description: "You must be logged in to book a parking spot",
      variant: "destructive",
    });
    return null;
  }
  
  if (selectedSlots.length === 0) {
    toast({
      title: "No slots selected",
      description: "Please select at least one parking slot",
      variant: "destructive",
    });
    return null;
  }
  
  try {
    // First, check if any of the selected slots are already reserved
    for (const slot of selectedSlots) {
      const rowMatch = slot.id.match(/R(\d+)/);
      const colMatch = slot.id.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        console.error(`Invalid slot label format: ${slot.id}`);
        toast({
          title: "Invalid Slot",
          description: `Parking slot ${slot.id} has an invalid format. Please try again.`,
          variant: "destructive",
        });
        return null;
      }
      
      const rowNumber = parseInt(rowMatch[1], 10);
      const columnNumber = parseInt(colMatch[1], 10);
      
      if (isNaN(rowNumber) || isNaN(columnNumber)) {
        console.error(`Failed to parse row or column from: ${slot.id}`);
        toast({
          title: "Invalid Slot",
          description: `Parking slot ${slot.id} has invalid coordinates. Please try again.`,
          variant: "destructive",
        });
        return null;
      }
      
      const { data: existingLayouts, error: checkError } = await supabase
        .from("airport_parking_layouts")
        .select("id")
        .eq("airport_id", airportId)
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
          description: `Parking slot ${slot.id} has already been reserved. Please select another one.`,
          variant: "destructive",
        });
        return null;
      }
    }
    
    // Calculate total amount based on hourly rate and duration
    const totalAmount = selectedSlots.reduce((sum, slot) => sum + (slot.price * hours), 0);
    
    // Create a booking record
    const { data: bookingData, error: bookingError } = await supabase
      .from("airport_bookings")
      .insert({
        airport_id: airportId,
        user_id: session.session.user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: BookingStatus.Confirmed, // Skip payment for now
        payment_amount: totalAmount,
        payment_date: new Date().toISOString(),
        qr_code_url: `TIME2PARK-AIRPORT-${airportId}-${Date.now()}`
      })
      .select("id");
      
    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      throw bookingError;
    }

    if (!bookingData || bookingData.length === 0) {
      throw new Error("Failed to create booking record");
    }

    const bookingId = bookingData[0].id;
    
    // Reserve each parking slot for this booking
    for (const slot of selectedSlots) {
      const rowMatch = slot.id.match(/R(\d+)/);
      const colMatch = slot.id.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        console.error(`Invalid slot label format during reservation: ${slot.id}`);
        continue;
      }
      
      const rowNumber = parseInt(rowMatch[1], 10);
      const columnNumber = parseInt(colMatch[1], 10);
      
      if (isNaN(rowNumber) || isNaN(columnNumber)) {
        console.error(`Failed to parse row or column during reservation from: ${slot.id}`);
        continue;
      }
      
      // Create or update the parking layout for this slot
      const { data: layoutData, error: layoutError } = await supabase
        .from("airport_parking_layouts")
        .upsert({
          airport_id: airportId,
          row_number: rowNumber,
          column_number: columnNumber,
          is_reserved: true,
          price: slot.price
        })
        .select("id");
        
      if (layoutError) {
        console.error("Error creating parking layout:", layoutError);
        toast({
          title: "Error",
          description: "Failed to reserve parking slot. Please try again.",
          variant: "destructive",
        });
        throw layoutError;
      }

      if (!layoutData || layoutData.length === 0) {
        throw new Error("Failed to create parking layout");
      }
      
      // Create the booking_slot entry to link the booking with this layout
      const { error: slotError } = await supabase
        .from("airport_booking_slots")
        .insert({
          booking_id: bookingId,
          parking_layout_id: layoutData[0].id
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

    // Update available parking slots count for the airport
    const { error: updateError } = await supabase
      .from("airports")
      .update({ 
        available_parking_slots: Math.max(0, (await fetchAirportAvailableSlots(airportId)) - selectedSlots.length)
      })
      .eq("id", airportId);

    if (updateError) {
      console.error("Error updating available slots:", updateError);
    }

    return bookingId;
  } catch (error) {
    console.error("Error in createAirportBooking:", error);
    throw error;
  }
}

async function fetchAirportAvailableSlots(airportId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("airports")
      .select("available_parking_slots")
      .eq("id", airportId)
      .single();
      
    if (error) {
      console.error("Error fetching available slots:", error);
      return 0;
    }
    
    return data?.available_parking_slots || 0;
  } catch (error) {
    console.error("Error in fetchAirportAvailableSlots:", error);
    return 0;
  }
}

export const getBookingTotalPrice = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('airport_booking_slots')
      .select('parking_layout_id')
      .eq('booking_id', bookingId);
    
    if (error) throw error;
    
    const result = safeQueryResult(data);
    // Calculate the price based on the number of slots
    return result.length * 10; // Assuming each slot costs $10
  } catch (error) {
    console.error('Error getting booking total price:', error);
    return 0;
  }
};

export async function getAirportParkingCount(airportId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("airport_parking_layouts")
      .select("id", { count: "exact", head: true });
      
    if (error) {
      console.error("Error fetching airport parking count:", error);
      return 0;
    }
    
    return (data as any)?.count || 0;
  } catch (error) {
    console.error("Error in getAirportParkingCount:", error);
    return 0;
  }
}
