
import React from 'react';
import { useTheme } from '@/context/ThemeProvider';

const ParkingSlotLegend = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-sm mr-2 ${
          theme === 'dark' ? 'bg-parking-available' : 'bg-parking-available'
        }`}></div>
        <span>Available</span>
      </div>
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-sm mr-2 ${
          theme === 'dark' ? 'bg-parking-reserved' : 'bg-parking-reserved'
        }`}></div>
        <span>Reserved</span>
      </div>
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-sm mr-2 ${
          theme === 'dark' ? 'bg-parking-selected' : 'bg-parking-selected'
        }`}></div>
        <span>Selected</span>
      </div>
    </div>
  );
};

export default ParkingSlotLegend;
