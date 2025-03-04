"use client";
import React from "react";
import GaugeComponent from "react-gauge-component";

const Gauge = ({scamRatingValue}) => {
  return (
    <div className=" h-full">
      <GaugeComponent
        type="radial"
        value={scamRatingValue}
        minValue={0}
        maxValue={100}
        style={{ width: "300px"}} // Adjust size
        labels={{
          tickLabels: {
            type: "inner",
            defaultTickValueConfig: {
              formatTextValue: (value) => {
                if (value === 0) return "LEGIT";
                if (value === 100) return "SCAM";
                return value + "ºC"; // Fix missing return statement
              },
              style: { fontSize: 8, fill: "white" }, // Increase font size
            },
          },
        }}
      />
    </div>
  );
};

export default Gauge;
