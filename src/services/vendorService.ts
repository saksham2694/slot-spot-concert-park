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

export type VendorUniversity = {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
  totalBookings: number;
  arrivedCustomers: number;
  hourlyRate: number;
}

export type VendorAirport = {
  id: string;
  name: string;
  location: string;
  imageUrl: string | null;
  totalBookings: number;
  arrivedCustomers: number;
  hourlyRate: number;
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

    // Get all events with cache control to ensure fresh data
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, date, location, image_url")
      .order('date', { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    if (!events) {
      return [];
    }

    // For each event, get booking statistics with cache control
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

        if (!bookingData) {
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

        const totalBookings = bookingData.length || 0;
        const arrivedCustomers = bookingData.filter(b => b.customer_arrived)?.length || 0;

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

// Fetch all universities available to vendors
export const fetchVendorUniversities = async (): Promise<VendorUniversity[]> => {
  try {
    // First check if user is a vendor
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("Authentication required");
    }

    // Get all universities
    const { data: universities, error: universitiesError } = await supabase
      .from("universities")
      .select("id, name, location, image_url, hourly_rate");

    if (universitiesError) {
      console.error("Error fetching universities:", universitiesError);
      throw universitiesError;
    }

    if (!universities) {
      return [];
    }

    // For each university, get booking statistics
    const universitiesWithStats = await Promise.all(
      universities.map(async (university) => {
        const { data: bookingData, error: bookingError } = await supabase
          .from("vendor_university_bookings_view")
          .select("booking_slot_id, customer_arrived")
          .eq("university_id", university.id);

        if (bookingError) {
          console.error(`Error fetching bookings for university ${university.id}:`, bookingError);
          return {
            id: university.id,
            name: university.name,
            location: university.location,
            imageUrl: university.image_url,
            totalBookings: 0,
            arrivedCustomers: 0,
            hourlyRate: university.hourly_rate
          };
        }

        if (!bookingData) {
          return {
            id: university.id,
            name: university.name,
            location: university.location,
            imageUrl: university.image_url,
            totalBookings: 0,
            arrivedCustomers: 0,
            hourlyRate: university.hourly_rate
          };
        }

        const totalBookings = bookingData.length || 0;
        const arrivedCustomers = bookingData.filter(b => b.customer_arrived)?.length || 0;

        return {
          id: university.id,
          name: university.name,
          location: university.location,
          imageUrl: university.image_url,
          totalBookings,
          arrivedCustomers,
          hourlyRate: university.hourly_rate
        };
      })
    );

    return universitiesWithStats;
  } catch (error) {
    console.error("Error in fetchVendorUniversities:", error);
    toast({
      title: "Error fetching universities",
      description: "Unable to fetch university data. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch all airports available to vendors
export const fetchVendorAirports = async (): Promise<VendorAirport[]> => {
  try {
    // First check if user is a vendor
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("Authentication required");
    }

    // Get all airports
    const { data: airports, error: airportsError } = await supabase
      .from("airports")
      .select("id, name, location, image_url, hourly_rate");

    if (airportsError) {
      console.error("Error fetching airports:", airportsError);
      throw airportsError;
    }

    if (!airports) {
      return [];
    }

    // For each airport, get booking statistics
    const airportsWithStats = await Promise.all(
      airports.map(async (airport) => {
        const { data: bookingData, error: bookingError } = await supabase
          .from("vendor_airport_bookings_view")
          .select("booking_slot_id, customer_arrived")
          .eq("airport_id", airport.id);

        if (bookingError) {
          console.error(`Error fetching bookings for airport ${airport.id}:`, bookingError);
          return {
            id: airport.id,
            name: airport.name,
            location: airport.location,
            imageUrl: airport.image_url,
            totalBookings: 0,
            arrivedCustomers: 0,
            hourlyRate: airport.hourly_rate
          };
        }

        if (!bookingData) {
          return {
            id: airport.id,
            name: airport.name,
            location: airport.location,
            imageUrl: airport.image_url,
            totalBookings: 0,
            arrivedCustomers: 0,
            hourlyRate: airport.hourly_rate
          };
        }

        const totalBookings = bookingData.length || 0;
        const arrivedCustomers = bookingData.filter(b => b.customer_arrived)?.length || 0;

        return {
          id: airport.id,
          name: airport.name,
          location: airport.location,
          imageUrl: airport.image_url,
          totalBookings,
          arrivedCustomers,
          hourlyRate: airport.hourly_rate
        };
      })
    );

    return airportsWithStats;
  } catch (error) {
    console.error("Error in fetchVendorAirports:", error);
    toast({
      title: "Error fetching airports",
      description: "Unable to fetch airport data. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch all booking slots for a specific event
export const fetchEventBookingSlots = async (eventId: string): Promise<BookingSlot[]> => {
  try {
    // Use the vendor_bookings_view which includes all bookings for an event, not filtered by user
    const { data, error } = await supabase
      .from("vendor_bookings_view")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching booking slots:", error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(item => ({
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

// Fetch all booking slots for a specific university
export const fetchUniversityBookingSlots = async (universityId: string): Promise<BookingSlot[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_university_bookings_view")
      .select("*")
      .eq("university_id", universityId);

    if (error) {
      console.error("Error fetching university booking slots:", error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(item => ({
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
    console.error("Error in fetchUniversityBookingSlots:", error);
    toast({
      title: "Error fetching university booking details",
      description: "Unable to fetch booking slots. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

// Fetch all booking slots for a specific airport
export const fetchAirportBookingSlots = async (airportId: string): Promise<BookingSlot[]> => {
  try {
    const { data, error } = await supabase
      .from("vendor_airport_bookings_view")
      .select("*")
      .eq("airport_id", airportId);

    if (error) {
      console.error("Error fetching airport booking slots:", error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(item => ({
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
    console.error("Error in fetchAirportBookingSlots:", error);
    toast({
      title: "Error fetching airport booking details",
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

// Mark a university customer as arrived
export const markUniversityCustomerArrived = async (bookingSlotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("university_booking_slots")
      .update({ customer_arrived: true })
      .eq("id", bookingSlotId);

    if (error) {
      console.error("Error marking university customer as arrived:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "University customer has been marked as arrived.",
    });
    return true;
  } catch (error) {
    console.error("Error in markUniversityCustomerArrived:", error);
    toast({
      title: "Error updating status",
      description: "Unable to mark university customer as arrived. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Mark an airport customer as arrived
export const markAirportCustomerArrived = async (bookingSlotId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("airport_booking_slots")
      .update({ customer_arrived: true })
      .eq("id", bookingSlotId);

    if (error) {
      console.error("Error marking airport customer as arrived:", error);
      throw error;
    }

    toast({
      title: "Success",
      description: "Airport customer has been marked as arrived.",
    });
    return true;
  } catch (error) {
    console.error("Error in markAirportCustomerArrived:", error);
    toast({
      title: "Error updating status",
      description: "Unable to mark airport customer as arrived. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Verify and mark a customer as arrived by QR code
export const verifyAndCheckInByQR = async (bookingId: string): Promise<boolean> => {
  try {
    console.log("Verifying booking with ID:", bookingId);
    
    // Try to find the booking across all booking types (event, university, airport)
    // First check event bookings
    let { data: eventBooking, error: eventError } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId)
      .single();
      
    if (!eventError && eventBooking) {
      console.log("Found event booking:", eventBooking);
      
      if (eventBooking.status !== 'confirmed') {
        toast({
          title: "Invalid Booking Status",
          description: `Event booking found but status is '${eventBooking.status}'. Only confirmed bookings can be checked in.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Use the database function to mark event customer as arrived
      const { error } = await supabase.rpc('mark_customer_arrived', {
        booking_id_param: bookingId
      });

      if (error) {
        console.error("Error marking event customer as arrived:", error);
        throw error;
      }

      toast({
        title: "Event Check-in Successful",
        description: "Customer has been marked as arrived for the event.",
      });
      return true;
    } 
    
    // If not an event booking, check university bookings
    let { data: uniBooking, error: uniError } = await supabase
      .from("university_bookings")
      .select("id, status")
      .eq("id", bookingId)
      .single();
    
    if (!uniError && uniBooking) {
      console.log("Found university booking:", uniBooking);
      
      if (uniBooking.status !== 'confirmed') {
        toast({
          title: "Invalid Booking Status",
          description: `University booking found but status is '${uniBooking.status}'. Only confirmed bookings can be checked in.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Mark university customer as arrived
      const { data: slots, error: slotsError } = await supabase
        .from("university_booking_slots")
        .select("id")
        .eq("booking_id", bookingId);
        
      if (slotsError) {
        console.error("Error fetching university booking slots:", slotsError);
        throw slotsError;
      }
      
      if (!slots || slots.length === 0) {
        console.log("No university booking slots found for this ID");
        toast({
          title: "University Booking Error",
          description: "University booking found but no associated parking slots were found.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update all slots for this booking
      for (const slot of slots) {
        const { error } = await supabase
          .from("university_booking_slots")
          .update({ customer_arrived: true })
          .eq("id", slot.id);
          
        if (error) {
          console.error(`Error marking university slot ${slot.id} as arrived:`, error);
        }
      }
      
      toast({
        title: "University Check-in Successful",
        description: "Customer has been marked as arrived for university parking.",
      });
      return true;
    }
    
    // If not a university booking, check airport bookings
    let { data: airportBooking, error: airportError } = await supabase
      .from("airport_bookings")
      .select("id, status")
      .eq("id", bookingId)
      .single();
    
    if (!airportError && airportBooking) {
      console.log("Found airport booking:", airportBooking);
      
      if (airportBooking.status !== 'confirmed') {
        toast({
          title: "Invalid Booking Status",
          description: `Airport booking found but status is '${airportBooking.status}'. Only confirmed bookings can be checked in.`,
          variant: "destructive"
        });
        return false;
      }
      
      // Mark airport customer as arrived
      const { data: slots, error: slotsError } = await supabase
        .from("airport_booking_slots")
        .select("id")
        .eq("booking_id", bookingId);
        
      if (slotsError) {
        console.error("Error fetching airport booking slots:", slotsError);
        throw slotsError;
      }
      
      if (!slots || slots.length === 0) {
        console.log("No airport booking slots found for this ID");
        toast({
          title: "Airport Booking Error",
          description: "Airport booking found but no associated parking slots were found.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update all slots for this booking
      for (const slot of slots) {
        const { error } = await supabase
          .from("airport_booking_slots")
          .update({ customer_arrived: true })
          .eq("id", slot.id);
          
        if (error) {
          console.error(`Error marking airport slot ${slot.id} as arrived:`, error);
        }
      }
      
      toast({
        title: "Airport Check-in Successful",
        description: "Customer has been marked as arrived for airport parking.",
      });
      return true;
    }
    
    // If we got here, no booking was found with this ID
    console.log("No booking found with ID:", bookingId);
    toast({
      title: "Invalid QR Code",
      description: "No booking found for this QR code.",
      variant: "destructive"
    });
    return false;

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
