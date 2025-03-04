import React from "react";

const ScamMeter = ({ value }) => {
  // Ensure value is between 0 and 1
  const normalizedValue = Math.min(1, Math.max(0, value)) * 100;

  return (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-white text-sm">Scam Rating:</p>
      <div className="w-48 h-5 bg-gray-700 rounded-full relative overflow-hidden">
        <div
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${normalizedValue}%` }}
        ></div>
      </div>
      <p className="text-white font-bold">{value.toFixed(2)}</p>
    </div>
  );
};

export default ScamMeter;
