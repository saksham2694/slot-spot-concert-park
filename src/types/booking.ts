
export interface Booking {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  parkingSpots: string[];
  totalPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending_payment' | 'payment_pending' | 'payment_failed';
  paymentOrderId?: string;
  paymentReferenceId?: string;
  paymentMode?: string;
  paymentAmount?: number;
  paymentDate?: string;
}
