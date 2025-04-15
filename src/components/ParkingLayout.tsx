
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowRight, Car, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the state type for a parking slot
type SlotState = "available" | "reserved" | "selected";

// Define the type for a parking slot
interface ParkingSlot {
  id: string;
  state: SlotState;
  row: number;
  column: number;
  price: number;
}

interface ParkingLayoutProps {
  eventId: number;
  onSlotSelect: (selectedSlots: ParkingSlot[]) => void;
}

const ParkingLayout = ({ eventId, onSlotSelect }: ParkingLayoutProps) => {
  const { toast } = useToast();
  
  // Generate mock parking data
  const generateParkingData = (): ParkingSlot[] => {
    const rows = 5;
    const columns = 8;
    const result: ParkingSlot[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Randomly mark some slots as reserved (about 20%)
        const isReserved = Math.random() < 0.2;
        const price = 15 + Math.floor(Math.random() * 10); // Random price between $15-$24
        
        result.push({
          id: `R${row + 1}C${col + 1}`,
          state: isReserved ? "reserved" : "available",
          row: row + 1,
          column: col + 1,
          price,
        });
      }
    }
    
    return result;
  };
  
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(generateParkingData());
  const [selectedSlots, setSelectedSlots] = useState<ParkingSlot[]>([]);
  
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
      
      onSlotSelect([...selectedSlots, updatedSlots[slotIndex]]);
    } else {
      // Deselect
      updatedSlots[slotIndex].state = "available";
      setParkingSlots(updatedSlots);
      setSelectedSlots(selectedSlots.filter((s) => s.id !== slot.id));
      
      onSlotSelect(selectedSlots.filter((s) => s.id !== slot.id));
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
  
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Select Your Parking Spot</h3>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-parking-available rounded-sm mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-parking-reserved rounded-sm mr-2"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-parking-selected rounded-sm mr-2"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
      
      <div className="relative mb-8">
        <div className="bg-gray-200 w-full h-10 flex items-center justify-center font-semibold rounded-t-lg mb-6">
          ENTRANCE / EXIT
        </div>
        
        <div className="space-y-2">
          {Object.keys(slotsByRow).map((rowNum) => (
            <div key={rowNum} className="flex justify-center gap-2">
              {slotsByRow[Number(rowNum)]
                .sort((a, b) => a.column - b.column)
                .map((slot) => (
                  <TooltipProvider key={slot.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`parking-slot ${
                            slot.state === "available"
                              ? "parking-slot-available"
                              : slot.state === "reserved"
                              ? "parking-slot-reserved"
                              : "parking-slot-selected"
                          }`}
                          onClick={() => handleSlotClick(slot)}
                          disabled={slot.state === "reserved"}
                          aria-label={`Parking slot ${slot.id}`}
                        >
                          <Car className="h-5 w-5 mr-1" />{slot.id}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-semibold">{slot.id}</p>
                          <p>Price: ${slot.price}</p>
                          <p>
                            Status:{" "}
                            {slot.state === "available"
                              ? "Available"
                              : slot.state === "reserved"
                              ? "Reserved"
                              : "Selected"}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
              You may select up to 1 parking spot per booking. Parking spots are
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
