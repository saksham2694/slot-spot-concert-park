
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParkingSlot, ReservedSpot } from "@/types/parking";
import { useToast } from "@/hooks/use-toast";

export function useParkingLayout(eventId: string, totalSlots: number) {
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
      // Fetch all reserved parking spots for this event
      const { data: reservedSpots, error } = await supabase
        .from("parking_layouts")
        .select("row_number, column_number, price")
        .eq("event_id", eventId)
        .eq("is_reserved", true);
        
      if (error) {
        console.error("Error fetching reserved spots:", error);
        toast({
          title: "Error",
          description: "Failed to load parking layout. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Reserved spots:", reservedSpots);
      
      // Create a map of reserved spots for quick lookup
      const reservedSpotsMap = new Map<string, number>();
      (reservedSpots || []).forEach((spot: ReservedSpot) => {
        const key = `R${spot.row_number}C${spot.column_number}`;
        reservedSpotsMap.set(key, spot.price);
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
          // Use the price from reserved spot if available, otherwise generate a random price
          const price = isReserved 
            ? reservedSpotsMap.get(slotId)! 
            : 15 + Math.floor(Math.random() * 10); // Random price between $15-$24
          
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
    } finally {
      setIsLoading(false);
    }
  }, [eventId, totalSlots, toast]);
  
  // Use effect with appropriate dependencies
  useEffect(() => {
    fetchReservedSpotsAndGenerateLayout();
  }, [fetchReservedSpotsAndGenerateLayout]);
  
  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.state === "reserved") return;
    
    const updatedSlots = [...parkingSlots];
    const slotIndex = updatedSlots.findIndex((s) => s.id === slot.id);
    
    if (slot.state === "available") {
      // If we're trying to select more than one slot, show a message
      if (selectedSlots.length >= 1) {
        toast({
          title: "Maximum selection reached",
          description: "You can only select one parking slot per booking.",
          variant: "destructive",
        });
        return;
      }
      
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
    resetSelectedSlots: () => setSelectedSlots([])
  };
}
