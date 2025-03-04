"use client";  // ✅ Ensures this runs only on the client side

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const TokenProfile = () => {
  const params = useParams();
  const [mounted, setMounted] = useState(false);  // ✅ Fix hydration issue
  const [tokenData, setTokenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);  // ✅ Ensures client-side rendering only
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.symbol || !mounted) return;  // ✅ Prevent fetching too early
      try {
        const res = await fetch(`/api/token?symbol=${params.symbol.toUpperCase()}`);
        if (!res.ok) {
          throw new Error("Token not found");
        }
        const data = await res.json();
        setTokenData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.symbol, mounted]);

  if (!mounted) return <div className="text-center text-gray-300">Loading...</div>;  // ✅ Prevents hydration mismatch
  if (loading) return <div className="text-center text-gray-300">Loading...</div>;
  if (error) return (
    <div className="text-center text-red-500">
      Error: {error}
      <div className="mt-6">
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          🔙 Back to Search
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">{tokenData.name} ({tokenData.symbol})</h1>
      <p className="text-lg">💰 <strong>Price:</strong> <span className="font-mono">${tokenData.price}</span></p>
      <p className="text-lg">📊 <strong>Market Cap:</strong> <span className="font-mono">${tokenData.market_cap}</span></p>
      <p className="text-lg">📈 <strong>Volume:</strong> <span className="font-mono">${tokenData.volume}</span></p>
      
      {tokenData.wasRekt ? (
        <div className="mt-4 p-3 text-white rounded-md bg-red-600">
          🚨 This token has been flagged as a rug pull!
        </div>
      ) : (
        <div className="mt-4 p-3 text-white rounded-md bg-green-600">
          ✅ This token appears safe.
        </div>
      )}

      {/* 🔹 Back Button to Search */}
      <div className="mt-6">
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
          🔙 Back to Search
        </Link>
      </div>
    </div>
  );
};

export default TokenProfile;
