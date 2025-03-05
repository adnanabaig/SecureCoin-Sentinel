"use client";
import React from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

const Dashboard = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold mb-4">SecureCoin Sentinel</h1>
        <p className="text-lg text-gray-400 mb-6">
          Enter a token symbol to check for rug pull risks.
        </p>
        
        {/* Search Bar */}
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Enter Token Symbol (e.g., SHIB, PE)"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
          <button className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Search
          </button>
        </div>
        
        {/* Risk Score and Insights */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Scam Risk Score</h3>
            <p className="text-gray-400 mt-2">Real-time security analysis of token contracts.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Liquidity & Volume</h3>
            <p className="text-gray-400 mt-2">Track the liquidity and volume movement of a token.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Community Trust</h3>
            <p className="text-gray-400 mt-2">Analyze social media signals and community sentiment.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
