
export interface Event {
  id: string | number;  // Adjust to allow both string and number for flexibility
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  availableParkingSlots: number;
  totalParkingSlots: number;
  parkingPrice: number;
}
