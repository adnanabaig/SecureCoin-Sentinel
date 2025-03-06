import React from "react";

interface StatsBoxProps {
  title: string;
  description: string;
}

const StatsBox = ({ title, description }: StatsBoxProps) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-400 mt-2">
        {description}
      </p>
    </div>
  );
};

export default StatsBox;
