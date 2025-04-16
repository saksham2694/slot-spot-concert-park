
export interface Event {
  id: string | number;  // Adjust to allow both string and number for flexibility
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  parkingAvailable: number;
  parkingTotal: number;
  parkingPrice: number;
}
