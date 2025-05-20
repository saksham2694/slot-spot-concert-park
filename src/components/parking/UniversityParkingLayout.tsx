
import React from "react";
import { Info } from "lucide-react";
import { useUniversityParkingLayout } from "@/hooks/useUniversityParkingLayout";
import ParkingSlotLegend from "./ParkingSlotLegend";
import ParkingSlotButton from "./ParkingSlot";
import { ParkingSlot } from "@/types/parking";

interface UniversityParkingLayoutProps {
  universityId: string;
  totalSlots: number;
  availableSlots: number;
  hourlyRate: number;
  onSlotSelect: (selectedSlots: ParkingSlot[]) => void;
}

const UniversityParkingLayout = ({
  universityId,
  totalSlots,
  availableSlots,
  hourlyRate,
  onSlotSelect
}: UniversityParkingLayoutProps) => {
  const {
    selectedSlots,
    slotsByRow,
    isLoading,
    handleSlotClick
  } = useUniversityParkingLayout(universityId, totalSlots, hourlyRate);
  
  // Update parent component whenever selected slots change
  React.useEffect(() => {
    onSlotSelect(selectedSlots);
  }, [selectedSlots, onSlotSelect]);
  
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
        
        <div className="space-y-2">
          {Object.keys(slotsByRow).map((rowNum) => (
            <div key={rowNum} className="flex justify-center gap-2">
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
          ))}
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Parking Information</p>
            <p className="text-muted-foreground mt-1">
              You may select multiple parking spots per booking. Parking spots are
              non-refundable after purchase. Please arrive at least 30 minutes before
              your booked time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityParkingLayout;
