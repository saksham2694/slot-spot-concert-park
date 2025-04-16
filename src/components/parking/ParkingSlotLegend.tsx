
import React from 'react';

const ParkingSlotLegend = () => {
  return (
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
  );
};

export default ParkingSlotLegend;
