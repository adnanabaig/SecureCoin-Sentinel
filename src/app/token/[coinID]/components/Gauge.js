"use client";
import React from "react";
import GaugeComponent from "react-gauge-component";

const Gauge = () => {
  return (
    <div className="bg-blue-400 w-full flex justify-center items-center">
      <GaugeComponent
        type="radial"
        value={30}
        minValue={0}
        maxValue={100}
        style={{ width: "80px", height: "50px" }} // Adjust size
        labels={{
          tickLabels: {
            type: "outer",
            defaultTickValueConfig: {
              formatTextValue: (value) => {
                if (value === 0) return "NOT A SCAM";
                if (value === 100) return "SCAM";
                return value + "ºC"; // Fix missing return statement
              },
              style: { fontSize: 10, fill: "white" }, // Increase font size
            },
          },
        }}
      />
    </div>
  );
};

export default Gauge;
