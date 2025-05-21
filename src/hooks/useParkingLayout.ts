
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot, ReservedSpot, safeQueryResult } from "@/types/parking";
import { useToast } from "@/hooks/use-toast";

export function useParkingLayout(eventId: string, totalSlots: number, eventPrice: number) {
  const { toast } = useToast();
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize the fetch function with dependencies that don't change frequently
  const fetchReservedSpotsAndGenerateLayout = useCallback(async () => {
    if (!eventId || totalSlots <= 0) {
      setParkingSlots([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Always fetch ALL parking layouts for this event regardless of reservation status
      const { data, error } = await supabase
        .from("parking_layouts")
        .select("row_number, column_number, price, is_reserved")
        .eq("event_id", eventId);
        
      if (error) {
        console.error("Error fetching parking layouts:", error);
        toast({
          title: "Error",
          description: "Failed to load parking layout. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Safely handle the query result and log for debugging
      const layoutSpots = data ? safeQueryResult<ReservedSpot[]>(data, null) : [];
      console.log("All parking layouts:", layoutSpots);
      console.log("Reserved spots:", layoutSpots.filter(spot => spot.is_reserved));
      
      // Create a map of reserved spots for quick lookup
      const reservedSpotsMap = new Map<string, number>();
      layoutSpots.forEach((spot: ReservedSpot) => {
        if (spot.is_reserved) {
          const key = `R${spot.row_number}C${spot.column_number}`;
          reservedSpotsMap.set(key, spot.price);
        }
      });
      
      // Calculate reasonable grid dimensions based on total slots
      const columns = Math.min(8, Math.ceil(Math.sqrt(totalSlots)));
      const rows = Math.ceil(totalSlots / columns);
      const result: ParkingSlot[] = [];
      
      let slotCount = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (slotCount >= totalSlots) break;
          
          const slotId = `R${row + 1}C${col + 1}`;
          const isReserved = reservedSpotsMap.has(slotId);
          
          // Find if this position already has a parking layout
          const existingLayout = layoutSpots.find(
            spot => spot.row_number === row + 1 && spot.column_number === col + 1
          );
          
          // Use the price from layout if available, otherwise use the event price
          const price = existingLayout ? existingLayout.price : eventPrice;
          
          result.push({
            id: slotId,
            state: isReserved ? "reserved" : "available",
            row: row + 1,
            column: col + 1,
            price,
          });
          
          slotCount++;
        }
      }
      
      setParkingSlots(result);
      
      // Reset selected slots
      setSelectedSlots([]);
    } catch (err) {
      console.error("Error in fetchReservedSpotsAndGenerateLayout:", err);
      toast({
        title: "Error",
        description: "Failed to load parking layout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventId, totalSlots, eventPrice, toast]);
  
  // Use effect with appropriate dependencies
  useEffect(() => {
    fetchReservedSpotsAndGenerateLayout();
  }, [fetchReservedSpotsAndGenerateLayout]);
  
  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.state === "reserved") return;
    
    const updatedSlots = [...parkingSlots];
    const slotIndex = updatedSlots.findIndex((s) => s.id === slot.id);
    
    if (slot.state === "available") {
      // Select the slot
      updatedSlots[slotIndex].state = "selected";
      setParkingSlots(updatedSlots);
      setSelectedSlots([...selectedSlots, updatedSlots[slotIndex]]);
    } else {
      // Deselect
      updatedSlots[slotIndex].state = "available";
      setParkingSlots(updatedSlots);
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
    }
  };

  // Group slots by row
  const slotsByRow = parkingSlots.reduce((acc, slot) => {
    if (!acc[slot.row]) {
      acc[slot.row] = [];
    }
    acc[slot.row].push(slot);
    return acc;
  }, {} as Record<number, ParkingSlot[]>);
  
  return {
    parkingSlots,
    selectedSlots,
    slotsByRow,
    isLoading,
    handleSlotClick,
    resetSelectedSlots: () => setSelectedSlots([]),
    refreshLayout: fetchReservedSpotsAndGenerateLayout
  };
}
