"use client";

import { SetStateAction, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Coin {
  id: string;
  name: string;
  symbol: string;
}

export default function HomePage() {
  const [search, setSearch] = useState<string>("");
  const [allCoins, setAllCoins] = useState<Coin[]>([]); // Store all coins
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]); // Store filtered coins
  const router = useRouter();

  // useEffect to fetch the coins list when the component is mounted
  useEffect(() => {
    fetchCoinsList();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredCoins(filterCoins().slice(0, 15)); // Apply the filter and limit to top 5 matches
    } else {
      setFilteredCoins([]); // Clear filtered coins when search is empty
    }
  }, [search]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      router.push(`/token/${search}`);
    }
  };

  // Function to fetch coins list from CoinGecko
  const fetchCoinsList = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/list"
      );
      const coins = await response.json();
      setAllCoins(coins); // Store the full list of coins (unfiltered)
    } catch (error) {
      console.error("Error fetching coin list:", error);
    }
  };

  const escapeSpecialChars = (str: String) => {
    // Escape backslashes, square brackets, and other special regex characters
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
  };

  // Filter coins based on the query and regex pattern
  const filterCoins = () => {
    try {
      const sanitizedQuery = escapeSpecialChars(search); // Escape special characters in the query
      const regex = new RegExp(`^${sanitizedQuery}`, "i"); // Regex pattern to match tokens (case-insensitive)
      return allCoins.filter((coin) => regex.test(coin.id)); // Filter the coins list
    } catch (error) {
      console.error("Invalid regex pattern:", error);
      return []; // Return empty array if regex is invalid
    }
  };

  const handleCoinSelect = (coinID: string) => {
    setSearch(coinID); // Set the selected coin id as the query
    console.log("Selected coin:", coinID);
    router.push(`/coinProfile/${coinID}`); // Navigate to the coin profile page
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">SecureCoin Sentinel</h1>
      <p className="mb-4 text-gray-400">
        Enter a token symbol to check for rug pull risks.
      </p>
      <input
        type="text"
        className="w-80 p-4 text-lg text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter Token Symbol (e.g., SHIB, PEPE, DOGE)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
      />
      <div className="mt-1 w-80 min-h-[250px] ">
        {filteredCoins.length === 0 && search ? (
          <p>No tokens found matching "{search}"</p>
        ) : (
          <div className="flex items-center justify-center ">
            <ul className=" bg-gray-700 text-white  mt-2 rounded-lg shadow-md max-h-[200px] overflow-y-auto">
              {filteredCoins.map((coin) => (
                <li
                  key={coin.id}
                  className="p-2 hover:bg-gray-500 cursor-pointer text-left"
                  onClick={() => handleCoinSelect(coin.id)} // Select a coin when clicked
                >
                  {coin.name} ({coin.id})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
