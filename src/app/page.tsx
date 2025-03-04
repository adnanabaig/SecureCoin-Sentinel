"use client";

import { SetStateAction, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Coin {
  id: string;
  name: string;
  symbol: string;
}

const Home = () => {
  const [search, setSearch] = useState("");
  const [allCoins, setAllCoins] = useState<Coin[]>([]); // Store all coins
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]); // Store filtered coins
  const [error, setError] = useState("");
  const router = useRouter();

  // Fetch the list of all coins when the component mounts
  useEffect(() => {
    fetchCoinsList();
  }, []);

  // Filter coins when the search query changes
  useEffect(() => {
    if (search) {
      setFilteredCoins(filterCoins().slice(0, 5)); // Apply the filter and limit to top 15 matches
    } else {
      setFilteredCoins([]); // Clear filtered coins when search is empty
    }
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission behavior
    if (!search.trim()) {
      setError("Please enter a valid token symbol.");
      return;
    }
    setError("");
    router.push(`/token/${search.toLowerCase()}`);
  };

  // Fetch coins list from CoinGecko
  const fetchCoinsList = async () => {
    try {
      const response = await fetch("/api/coinsList");
      const coins = await response.json();
      setAllCoins(coins); // Store the full list of coins (unfiltered)
    } catch (error) {
      console.error("Error fetching coin list:", error);
    }
  };

  // Escape special regex characters in the search query
  const escapeSpecialChars = (str: string) => {
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
  };

  // Filter coins based on the query
  const filterCoins = () => {
    try {
      const sanitizedQuery = escapeSpecialChars(search); // Escape special characters in the query
      const regex = new RegExp(`^${sanitizedQuery}`, "i"); // Regex pattern to match tokens (case-insensitive)
      return allCoins.filter((coin) => regex.test(coin.id)); // Filter the coins list
    } catch (error) {
      console.error("Invalid regex pattern:", error);
      return [];
    }
  };

  const handleCoinSelect = (coinID: string) => {
    setSearch(coinID); // Set the selected coin id as the query
    router.push(`/token/${coinID}`); // Navigate to the coin profile page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">SecureCoin Sentinel</h1>
      <p className="mb-4 text-gray-400">
        Enter a token symbol to check for rug pull risks.
      </p>

      {/* Token Search Form */}
      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          className="w-80 p-4 text-lg text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Token Symbol (e.g., SHIB, PEPE, DOGE)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
      <div className="min-h-[300px]">
        {/* Coin List */}
        {filteredCoins.length > 0 && (
          <ul className="w-80 space-y-2">
            {filteredCoins.map((coin) => (
              <li
                key={coin.id}
                onClick={() => handleCoinSelect(coin.id)}
                className="p-2 cursor-pointer hover:bg-gray-700 rounded-md"
              >
                {coin.name} ({coin.symbol.toUpperCase()})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
