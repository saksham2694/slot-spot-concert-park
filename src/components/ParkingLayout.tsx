
import React, { useEffect } from "react";
import { Info } from "lucide-react";
import { useParkingLayout } from "@/hooks/useParkingLayout";
import ParkingSlotLegend from "./parking/ParkingSlotLegend";
import ParkingSlotButton from "./parking/ParkingSlot";
import { ParkingSlot } from "@/types/parking";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ParkingLayoutProps {
  eventId: string;
  totalSlots: number;
  availableSlots: number;
  eventPrice: number;
  onSlotSelect: (selectedSlots: ParkingSlot[], refreshLayout?: (() => Promise<void>)) => void;
  onReservedCountChange?: (totalSlots: number, reservedCount: number) => void;
}

const ParkingLayout = ({ 
  eventId, 
  totalSlots, 
  availableSlots, 
  eventPrice,
  onSlotSelect,
  onReservedCountChange 
}: ParkingLayoutProps) => {
  const {
    selectedSlots,
    parkingSlots,
    slotsByRow,
    isLoading,
    handleSlotClick,
    refreshLayout
  } = useParkingLayout(eventId, totalSlots, eventPrice);
  
  // Calculate reserved slots and notify parent component
  useEffect(() => {
    if (!isLoading && parkingSlots.length > 0 && onReservedCountChange) {
      const reservedCount = parkingSlots.filter(slot => slot.state === "reserved").length;
      onReservedCountChange(totalSlots, reservedCount);
    }
  }, [parkingSlots, isLoading, totalSlots, onReservedCountChange]);
  
  // Update parent component whenever selected slots change
  useEffect(() => {
    onSlotSelect(selectedSlots, refreshLayout);
  }, [selectedSlots, onSlotSelect, refreshLayout]);
  
  if (isLoading) {
    return <div className="py-8 text-center">Loading parking layout...</div>;
  }
  
  return (
    <div className="border rounded-lg p-6 bg-background shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Your Parking Spot</h3>
        <ParkingSlotLegend />
      </div>
      
      <div className="relative mb-8">
        <div className="bg-muted w-full h-10 flex items-center justify-center font-semibold rounded-t-lg mb-6">
          ENTRANCE / EXIT
        </div>
        
        <ScrollArea className="h-[350px] w-full">
          <div className="space-y-4 px-4">
            {Object.keys(slotsByRow).map((rowNum) => (
              <div key={rowNum} className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">Row {rowNum}</div>
                <div className="overflow-auto">
                  <div className="flex justify-start gap-2 pb-2 min-w-max">
                    {slotsByRow[Number(rowNum)]
                      .sort((a, b) => a.column - b.column)
                      .map((slot) => (
                        <ParkingSlotButton 
                          key={slot.id} 
                          slot={slot} 
                          onClick={handleSlotClick} 
                        />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Parking Information</p>
            <p className="text-muted-foreground mt-1">
              You may select multiple parking spots per booking. Parking spots are
              non-refundable after purchase. Please arrive at least 30 minutes before
              the event starts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLayout;
