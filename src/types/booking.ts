
export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'pending_payment' | 'payment_pending' | 'payment_failed' | 'confirmed';

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
  events?: {
    title?: string;
    date?: string;
    location?: string;
  };
}
