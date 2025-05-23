
export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'pending_payment' | 'payment_pending' | 'payment_failed' | 'confirmed' | 'pending' | string;

export interface Booking {
  id: string;
  eventId?: string;
  event_id?: string;
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  parkingSpots?: string[];
  totalPrice?: number;
  status: BookingStatus;
  paymentOrderId?: string;
  paymentReferenceId?: string;
  paymentMode?: string;
  paymentAmount?: number;
  paymentDate?: string;
  payment_order_id?: string;
  payment_reference_id?: string;
  payment_mode?: string;
  payment_amount?: number;
  payment_date?: string;
  booking_date?: string | null;
  start_date?: string;
  end_date?: string;
  university_id?: string;
  airport_id?: string;
  university_name?: string;
  airport_name?: string;
  parking_spots?: string[];
  events?: {
    title?: string;
    date?: string;
    location?: string;
  };
  booking_slots?: Array<{
    parking_layouts: {
      row_number: number;
      column_number: number;
      price: number;
    }
  }>;
  university?: {
    name: string;
    location: string;
  };
  airport?: {
    name: string;
    location: string;
  };
}
