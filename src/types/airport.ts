
export type Airport = {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  total_parking_slots: number;
  available_parking_slots: number;
  hourly_rate: number;
  created_at?: string;
};

export type AirportBooking = {
  id: string;
  airport_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_amount: number;
  payment_date: string | null;
  payment_reference_id: string | null;
  payment_order_id: string | null;
  payment_mode: string | null;
  qr_code_url: string | null;
  created_at: string;
};

export type AirportBookingSlot = {
  id: string;
  booking_id: string;
  parking_layout_id: string;
  created_at: string;
  customer_arrived: boolean;
};
