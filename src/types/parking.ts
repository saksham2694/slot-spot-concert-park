
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

// Enhanced safe type assertion helper with better error handling
export function assertData<T>(data: any): T {
  if (!data) {
    console.error('Error: No data returned from database');
    throw new Error('No data returned from database');
  }
  
  // Handle Supabase error objects
  if (data.error) {
    console.error('Database error:', data.error);
    throw new Error(`Database error: ${data.error.message || 'Unknown error'}`);
  }
  
  // Handle array of objects that might contain errors
  if (Array.isArray(data)) {
    // Check if any item in the array is an error object
    const errorItem = data.find(item => item && typeof item === 'object' && 'error' in item);
    if (errorItem) {
      console.error('Database error in array:', errorItem.error);
      throw new Error(`Database error: ${errorItem.error || 'Unknown error'}`);
    }
  }
  
  return data as T;
}

// Helper to safely handle Supabase query results
export function safeQueryResult<T>(data: any, error: any): T {
  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(`Database error: ${error.message || 'Unknown error'}`);
  }
  
  if (!data) {
    return [] as unknown as T; // Return empty array for list queries
  }
  
  return data as T;
}
