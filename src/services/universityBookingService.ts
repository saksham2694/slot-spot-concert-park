import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { BookingStatus } from "@/types/booking";

interface UniversityBookingData {
  universityId: string;
  startDate: string;  // ISO string
  endDate: string;    // ISO string
  parkingSlots: Array<{
    slotId: string;
    price: number;
    slotLabel: string;
  }>;
}

export async function createUniversityBooking(bookingInput: UniversityBookingData): Promise<string | null> {
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
    // Calculate total amount and duration
    const totalAmount = bookingInput.parkingSlots.reduce((sum, slot) => sum + slot.price, 0);
    
    // First, check if any of the selected slots are already reserved for the given time period
    for (const slot of bookingInput.parkingSlots) {
      // Parse the row and column from the slot label (format: R1C1)
      const rowMatch = slot.slotLabel.match(/R(\d+)/);
      const colMatch = slot.slotLabel.match(/C(\d+)/);
      
      if (!rowMatch || !colMatch) {
        console.error(`Invalid slot label format: ${slot.slotLabel}`);
        toast({
          title: "Invalid Slot",
          description: `Parking slot ${slot.slotLabel} has an invalid format. Please try again.`,
          variant: "destructive",
        });
        return null;
      }
      
      const rowNumber = parseInt(rowMatch[1], 10);
      const columnNumber = parseInt(colMatch[1], 10);
      
      // Check reservations that overlap with the requested time period
      const { data: existingReservations, error: checkError } = await supabase
        .from("university_booking_slots")
        .select(`
          id,
          booking_id,
          university_bookings (
            status,
            start_date,
            end_date
          )
        `)
        .eq("parking_layout_id", slot.slotId)
        .neq("university_bookings.status", "cancelled");
        
      if (checkError) {
        console.error("Error checking slot availability:", checkError);
        toast({
          title: "Error",
          description: "Failed to check slot availability. Please try again.",
          variant: "destructive",
        });
        throw checkError;
      }
      
      // Check for time conflicts with existing bookings
      const conflictingBooking = existingReservations?.find(reservation => {
        const booking = reservation.university_bookings;
        if (!booking) return false;
        
        const newStartDate = new Date(bookingInput.startDate).getTime();
        const newEndDate = new Date(bookingInput.endDate).getTime();
        const existingStartDate = new Date(booking.start_date).getTime();
        const existingEndDate = new Date(booking.end_date).getTime();
        
        // Check if date ranges overlap
        return (
          (newStartDate >= existingStartDate && newStartDate < existingEndDate) ||
          (newEndDate > existingStartDate && newEndDate <= existingEndDate) ||
          (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
        );
      });
      
      if (conflictingBooking) {
        toast({
          title: "Slot Not Available",
          description: `Parking slot ${slot.slotLabel} is already reserved for the selected time period. Please select another slot or time.`,
          variant: "destructive",
        });
        return null;
      }
    }
    
    // Create a booking record
    const { data: booking, error: bookingError } = await supabase
      .from("university_bookings")
      .insert({
        university_id: bookingInput.universityId,
        user_id: session.session.user.id,
        start_date: bookingInput.startDate,
        end_date: bookingInput.endDate,
        status: "confirmed" as BookingStatus,
        payment_amount: totalAmount,
        payment_date: new Date().toISOString(),
        qr_code_url: `TIME2PARK-UNI-${bookingInput.universityId}-${Date.now()}`,
        payment_mode: "DIRECT"
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
      // Find or create the parking layout for this slot
      const { data: layoutData, error: layoutError } = await supabase
        .from("university_parking_layouts")
        .upsert({
          id: slot.slotId,  // We already have the ID
          university_id: bookingInput.universityId,
          is_reserved: false,  // This is managed by bookings, not a permanent state
          price: slot.price
        })
        .select("id")
        .single();
        
      if (layoutError) {
        console.error("Error updating parking layout:", layoutError);
        continue; // Continue with other slots
      }
      
      // Create the booking_slot entry
      const { error: slotError } = await supabase
        .from("university_booking_slots")
        .insert({
          booking_id: bookingId,
          parking_layout_id: layoutData.id
        });
        
      if (slotError) {
        console.error("Error creating booking slot:", slotError);
        // Continue with other slots
      }
    }
    
    // Update university available slots (optional, since slots are time-based)
    const { data: university } = await supabase
      .from("universities")
      .select("available_parking_slots")
      .eq("id", bookingInput.universityId)
      .single();
      
    if (university) {
      const availableSlots = university.available_parking_slots;
      const slotsToReduce = Math.min(bookingInput.parkingSlots.length, availableSlots);
      
      await supabase
        .from("universities")
        .update({ available_parking_slots: availableSlots - slotsToReduce })
        .eq("id", bookingInput.universityId);
    }

    toast({
      title: "Booking Confirmed",
      description: "Your university parking has been successfully reserved.",
    });
    
    return bookingId;
  } catch (error) {
    console.error("Error in createUniversityBooking:", error);
    throw error;
  }
}

export const getBookingTotalPrice = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('university_booking_slots')
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

export async function getUniversityParkingCount(universityId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("university_parking_layouts")
      .select("id", { count: "exact", head: true });
      
    if (error) {
      console.error("Error fetching university parking count:", error);
      return 0;
    }
    
    return (data as any)?.count || 0;
  } catch (error) {
    console.error("Error in getUniversityParkingCount:", error);
    return 0;
  }
}
