"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [error, setError] = useState("");
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (!tokenSymbol.trim()) {
      setError("Please enter a valid token symbol.");
      return;
    }
    setError("");
    router.push(`/token/${tokenSymbol.toLowerCase()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">SecureCoin Sentinel</h1>
      <p className="text-lg mb-6 text-gray-400">Enter a token symbol to check for rug pull risks.</p>
      <form onSubmit={handleSearch} className="w-full max-w-md flex flex-col items-center">
        <div className="w-full flex">
          <input
            type="text"
            className="w-full p-3 rounded-l-lg bg-gray-800 text-white border-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter Token Symbol (e.g., SHIB, PEPE)"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-r-lg font-bold transition"
          >
            🔍 Search
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Home;
