export type SlotState = "available" | "reserved" | "selected";

export interface ParkingSlot {
  id: string;
  state: SlotState;
  row: number;
  column: number;
  price: number;
}

export interface ReservedSpot {
  row_number: number;
  column_number: number;
  price: number;
}

// Add new types for university and airport parking layouts
export type UniversityParkingLayout = {
  id: string;
  university_id: string;
  row_number: number;
  column_number: number;
  is_reserved: boolean;
  price: number;
};

export type AirportParkingLayout = {
  id: string;
  airport_id: string;
  row_number: number;
  column_number: number;
  is_reserved: boolean;
  price: number;
};

// Add new types for university and airport reserved spots
export type UniversityReservedSpot = {
  row_number: number;
  column_number: number;
  price: number;
};

export type AirportReservedSpot = {
  row_number: number;
  column_number: number;
  price: number;
};
