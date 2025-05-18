
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

// Add safe type assertion helper
export function assertData<T>(data: any): T {
  if (data && !('error' in data)) {
    return data as T;
  }
  console.error('Error in data:', data);
  throw new Error('Invalid data returned from database');
}
