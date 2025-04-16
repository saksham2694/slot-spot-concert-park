
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
