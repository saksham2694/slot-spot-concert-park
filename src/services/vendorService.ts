
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type VendorEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string | null;
  totalBookings: number;
  arrivedCustomers: number;
}

export type BookingSlot = {
  id: string;
  bookingId: string;
  slotId: string;
  rowNumber: number;
  columnNumber: number;
  customerName: string | null;
  customerEmail: string | null;
  customerArrived: boolean;
  qrCodeUrl: string | null;
}

// Fetch all events available to vendors
export const fetchVendorEvents = async (): Promise<VendorEvent[]> => {
  try {
    // First check if user is a vendor
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("Authentication required");
    }

    // Get all events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, date, location, image_url")
      .order("date", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    // For each event, get booking statistics
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const { data: bookingData, error: bookingError } = await supabase
          .from("vendor_bookings_view")
          .select("booking_slot_id, customer_arrived")
          .eq("event_id", event.id);

        if (bookingError) {
          console.error(`Error fetching bookings for event ${event.id}:`, bookingError);
          return {
            id: event.id,
            title: event.title,
            date: new Date(event.date).toLocaleDateString(),
            location: event.location,
            imageUrl: event.image_url,
            totalBookings: 0,
            arrivedCustomers: 0
          };
        }

        const totalBookings = bookingData?.length || 0;
        const arrivedCustomers = bookingData?.filter(b => b.customer_arrived)?.length || 0;

        return {
          id: event.id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString(),
          location: event.location,
          imageUrl: event.image_url,
          totalBookings,
          arrivedCustomers
        };
      })
    );

    return eventsWithStats;
  } catch (error) {
    console.error("Error in fetchVendorEvents:", error);
    toast({
      title: "Error fetching events",
      description: "Unable to fetch vendor events. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch all booking slots for a specific event
export const fetchEventBookingSlots = async (eventId: string): Promise<BookingSlot[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_bookings_view")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching booking slots:", error);
      throw error;
    }

    return (data || []).map(item => ({
      id: item.booking_slot_id,
      bookingId: item.booking_id,
      slotId: item.slot_id,
      rowNumber: item.row_number,
      columnNumber: item.column_number,
      customerName: item.customer_name,
      customerEmail: item.customer_email,
      customerArrived: item.customer_arrived || false,
      qrCodeUrl: item.qr_code_url
    }));
  } catch (error) {
    console.error("Error in fetchEventBookingSlots:", error);
    toast({
      title: "Error fetching booking details",
      description: "Unable to fetch booking slots. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

// Mark a customer as arrived by manually selecting the booking slot
export const markCustomerArrived = async (bookingSlotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("booking_slots")
      .update({ customer_arrived: true })
      .eq("id", bookingSlotId);

    if (error) {
      console.error("Error marking customer as arrived:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Customer has been marked as arrived.",
    });
    return true;
  } catch (error) {
    console.error("Error in markCustomerArrived:", error);
    toast({
      title: "Error updating status",
      description: "Unable to mark customer as arrived. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Verify and mark a customer as arrived by QR code
export const verifyAndCheckInByQR = async (qrCode: string): Promise<boolean> => {
  try {
    // First, find the booking by QR code
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("qr_code_url", qrCode)
      .eq("status", "confirmed")
      .single();

    if (bookingError || !bookingData) {
      console.error("Error finding booking by QR code:", bookingError);
      toast({
        title: "Invalid QR Code",
        description: "No valid booking found for this QR code.",
        variant: "destructive"
      });
      return false;
    }

    // Use the database function to mark customer as arrived
    const { data, error } = await supabase.rpc('mark_customer_arrived', {
      booking_id_param: bookingData.id
    });

    if (error) {
      console.error("Error marking customer as arrived:", error);
      throw error;
    }

    toast({
      title: "Check-in Successful",
      description: "Customer has been marked as arrived.",
    });
    return true;
  } catch (error) {
    console.error("Error in verifyAndCheckInByQR:", error);
    toast({
      title: "Check-in Failed",
      description: "Unable to process check-in. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
