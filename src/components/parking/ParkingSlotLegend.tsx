
import React from 'react';
import { useTheme } from '@/context/ThemeProvider';

const ParkingSlotLegend = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-sm mr-2 ${
          theme === 'dark' ? 'bg-slate-700' : 'bg-blue-100'
        }`}></div>
        <span>Available</span>
      </div>
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-sm mr-2 ${
          theme === 'dark' ? 'bg-red-900' : 'bg-red-200'
        }`}></div>
        <span>Reserved</span>
      </div>
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-sm mr-2 ${
          theme === 'dark' ? 'bg-green-800' : 'bg-green-200'
        }`}></div>
        <span>Selected</span>
      </div>
    </div>
  );
};

export default ParkingSlotLegend;
