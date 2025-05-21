
import React from 'react';
import { Car } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParkingSlot } from '@/types/parking';
import { useTheme } from '@/context/ThemeProvider';

interface ParkingSlotProps {
  slot: ParkingSlot;
  onClick: (slot: ParkingSlot) => void;
}

const ParkingSlotButton = ({ slot, onClick }: ParkingSlotProps) => {
  const { theme } = useTheme();
  
  const getSlotClass = () => {
    const baseClass = "flex items-center justify-center p-2 rounded-md font-medium transition-colors";
    const darkModeClass = theme === 'dark' ? "text-white" : "";
    
    if (slot.state === "available") {
      return `${baseClass} ${darkModeClass} ${theme === 'dark' 
        ? 'bg-slate-700 hover:bg-slate-600' 
        : 'bg-blue-100 hover:bg-blue-200'}`;
    } else if (slot.state === "reserved") {
      return `${baseClass} ${darkModeClass} ${theme === 'dark' 
        ? 'bg-red-900 cursor-not-allowed opacity-70' 
        : 'bg-red-200 cursor-not-allowed opacity-70'}`;
    } else { // selected
      return `${baseClass} ${darkModeClass} ${theme === 'dark' 
        ? 'bg-green-800 hover:bg-green-700' 
        : 'bg-green-200 hover:bg-green-300'}`;
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={getSlotClass()}
            onClick={() => onClick(slot)}
            disabled={slot.state === "reserved"}
            aria-label={`Parking slot ${slot.id}`}
          >
            <Car className="h-5 w-5 mr-1" />{slot.id}
          </button>
        </TooltipTrigger>
        <TooltipContent className={theme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : ''}>
          <div className="text-sm">
            <p className="font-semibold">{slot.id}</p>
            <p className="flex items-center">Price: ₹{slot.price}</p>
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
