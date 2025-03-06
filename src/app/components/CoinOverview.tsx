import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface ScamData {
  name: string;
  symbol: string;
  riskScore: number;
  riskLabel: string;
  price: number;
  marketCap: number;
  volume: number;
}

const CoinOverview = ({ scamData }: { scamData: ScamData }) => {
  const scamRiskChartData = scamData
    ? [
        {
          name: "Risk Score",
          value: scamData.riskScore,
          fill:
            scamData.riskScore > 60
              ? "#ff4d4d"
              : scamData.riskScore > 30
              ? "#ffcc00"
              : "#4caf50",
        },
      ]
    : [];
  return (
    <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg w-1/2 transition-all duration-500 opacity-100 scale-100 flex flex-col md:flex-row items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">
          {scamData.name} ({scamData.symbol})
        </h2>
        <div className="mt-4">
          <p className="text-xl font-semibold">
            Scam Risk Score: {scamData.riskScore}%
          </p>
          <p className="text-gray-400">Risk Level: {scamData.riskLabel}</p>
        </div>
        <div className="mt-4 text-left">
          <p>
            <strong>Price:</strong> ${scamData.price}
          </p>
          <p>
            <strong>Market Cap:</strong> ${scamData.marketCap}
          </p>
          <p>
            <strong>24h Volume:</strong> ${scamData.volume}
          </p>
        </div>
      </div>
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={scamRiskChartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CoinOverview;
