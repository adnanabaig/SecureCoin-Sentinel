"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      router.push(`/token/${search}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">SecureCoin Sentinel</h1>
      <p className="mb-4 text-gray-400">Enter a token symbol to check for rug pull risks.</p>
      <input
        type="text"
        className="w-80 p-4 text-lg text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter Token Symbol (e.g., SHIB, PEPE, DOGE)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
      />
    </div>
  );
}
