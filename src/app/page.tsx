"use client";
import React, { useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

// Define the type for the scam data
interface ScamData {
  name: string;
  symbol: string;
  riskScore: number;
  riskLabel: string;
  price: string;
  marketCap: string;
  volume: string;
}

const Homepage: React.FC = () => {
  const [token, setToken] = useState<string>(""); // token is a string
  const [scamData, setScamData] = useState<ScamData | null>(null); // scamData can be null or ScamData object

  const fetchTokenData = async () => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${token.toLowerCase()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`
      );
      const data = await response.json();

      if (!data[token.toLowerCase()]) {
        alert("Token not found. Please enter a valid token symbol.");
        return;
      }

      const riskScore = Math.floor(Math.random() * 100); // Placeholder for scam score, replace with actual API
      const riskLabel =
        riskScore > 60
          ? "High Risk"
          : riskScore > 30
          ? "Medium Risk"
          : "Low Risk";

      const tokenData: ScamData = {
        name: token.toUpperCase(),
        symbol: token.toUpperCase(),
        riskScore,
        riskLabel,
        price: `$${data[token.toLowerCase()].usd.toLocaleString()}`,
        marketCap: `$${data[
          token.toLowerCase()
        ].usd_market_cap.toLocaleString()}`,
        volume: `$${data[token.toLowerCase()].usd_24h_vol.toLocaleString()}`,
      };

      setScamData(tokenData);
    } catch (error) {
      console.error("Error fetching token data:", error);
      alert("Failed to fetch token data. Please try again later.");
    }
  };

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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Main Content */}
      <main className="flex flex-col items-center text-center p-6">
        <h1 className="text-4xl font-bold mb-4">SecureCoin Sentinel</h1>
        <p className="text-lg text-gray-400 mb-6">
          Enter a token symbol to check for rug pull risks.
        </p>

        {/* Search Bar */}
        <div className="relative w-96 flex">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter Token Symbol (e.g., SHIB, PE)"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchTokenData}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Search
          </button>
        </div>

        {/* Scam Data Module Appears Directly Below Search Bar */}
        {scamData && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl transition-all duration-500 opacity-100 scale-100 flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {scamData.name} ({scamData.symbol})
              </h2>
              <div className="mt-4">
                <p className="text-xl font-semibold">
                  Scam Risk Score: {scamData.riskScore}%
                </p>
                <p className="text-gray-400">
                  Risk Level: {scamData.riskLabel}
                </p>
              </div>
              <div className="mt-4 text-left">
                <p>
                  <strong>Price:</strong> {scamData.price}
                </p>
                <p>
                  <strong>Market Cap:</strong> {scamData.marketCap}
                </p>
                <p>
                  <strong>24h Volume:</strong> {scamData.volume}
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
        )}

        {/* Risk Score and Insights - Moves Below Scam Data Module */}
        <div
          className={`mt-10 w-full max-w-5xl transition-all duration-500 ${
            scamData ? "translate-y-8" : ""
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold">Scam Risk Score</h3>
              <p className="text-gray-400 mt-2">
                Real-time security analysis of token contracts.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold">Liquidity & Volume</h3>
              <p className="text-gray-400 mt-2">
                Track the liquidity and volume movement of a token.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold">Community Trust</h3>
              <p className="text-gray-400 mt-2">
                Analyze social media signals and community sentiment.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Homepage;
