
import React from 'react';
import { Car, IndianRupee } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParkingSlot } from '@/types/parking';

interface ParkingSlotProps {
  slot: ParkingSlot;
  onClick: (slot: ParkingSlot) => void;
}

const ParkingSlotButton = ({ slot, onClick }: ParkingSlotProps) => {
  return (
    <TooltipProvider>
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
            onClick={() => onClick(slot)}
            disabled={slot.state === "reserved"}
            aria-label={`Parking slot ${slot.id}`}
          >
            <Car className="h-5 w-5 mr-1" />{slot.id}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold">{slot.id}</p>
            <p className="flex items-center">Price: <IndianRupee className="h-3 w-3 mx-1" />{slot.price}</p>
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
  );
};

export default ParkingSlotButton;
