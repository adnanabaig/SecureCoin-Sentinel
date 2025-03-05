"use client";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Define types for the coin data and component state
type Coin = {
  id: string;
  name: string;
};

type CoinStats = {
  market_cap: number;
  current_price: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  scam_risk: number; // Scam risk property
};

export default function Home() {
  const [query, setQuery] = useState<string>(""); // State to store the query
  const [allCoins, setAllCoins] = useState<Coin[]>([]); // State to store all coins (unfiltered)
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]); // State to store filtered coins
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading state
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null); // State to store selected coin stats

  // Function to fetch coins list from CoinGecko
  const fetchCoinsList = async () => {
    try {
      setLoading(true); // Set loading to true before fetching data
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/list"
      );
      const coins: Coin[] = await response.json();
      setAllCoins(coins); // Store the full list of coins (unfiltered)
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching coin list:", error);
      setLoading(false); // Set loading to false if there is an error
    }
  };

  // Function to fetch the statistics of a specific coin
  const fetchCoinStats = async (coinID: string) => {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinID}`
      );
      const data = await response.json();
      const stats: CoinStats = {
        market_cap: data.market_data.market_cap.usd,
        current_price: data.market_data.current_price.usd,
        volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        scam_risk: 75, // Filler scam risk (random number for now)
      };
      setCoinStats(stats); // Set coin stats state
    } catch (error) {
      console.error("Error fetching coin stats:", error);
    }
  };

  const escapeSpecialChars = (str: string): string => {
    // Escape backslashes, square brackets, and other special regex characters
    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");
  };

  // Filter coins based on the query and regex pattern
  const filterCoins = (): Coin[] => {
    try {
      const sanitizedQuery = escapeSpecialChars(query); // Escape special characters in the query
      const regex = new RegExp(`^${sanitizedQuery}`, "i"); // Regex pattern to match tokens (case-insensitive)
      return allCoins.filter((coin) => regex.test(coin.id)); // Filter the coins list
    } catch (error) {
      console.error("Invalid regex pattern:", error);
      return []; // Return empty array if regex is invalid
    }
  };

  // useEffect to fetch the coins list when the component is mounted
  useEffect(() => {
    fetchCoinsList();
  }, []);

  // useEffect to filter coins and reset stats when the query changes
  useEffect(() => {
    setCoinStats(null); // Reset coin stats when query changes
    if (query) {
      setFilteredCoins(filterCoins().slice(0, 5)); // Filter coins based on the query
    } else {
      setFilteredCoins([]); // Clear filtered coins when query is empty
    }
  }, [query]);

  // Handle selection of a coin from the dropdown
  const handleCoinSelect = (coinID: string) => {
    setFilteredCoins([]); // Clear the filtered coins list after selecting a coin
    setQuery(coinID); // Set the selected coin id as the query
    fetchCoinStats(coinID); // Fetch and display the stats of the selected coin
  };

  return (
    <div>
      <div className="h-full pb-32 flex text-white">
        <div className="pt-40 text-center w-full ">
          <h1 className="text-4xl font-bold mb-6 w-full">
            Find Tokens Matching Your Query
          </h1>
          <div className="relative mt-12 flex items-center justify-center bg-gray-600 p-4 rounded-full max-w-3xl mx-auto">
            <input
              type="text"
              className="w-full border-none outline-none text-white placeholder-gray-500"
              placeholder="Enter token query (e.g., dog)"
              value={query}
              onChange={(e) => setQuery(e.target.value)} // Update query state
            />
            {!coinStats && (
              <div className="absolute top-18 w-1/2 h-24 mt-1">
                {loading ? (
                  <p>Loading...</p>
                ) : filteredCoins.length === 0 && !coinStats && query ? (
                  <p>No tokens found matching "{query}"</p>
                ) : (
                  <div className="flex items-center justify-center">
                    <ul className="bg-gray-700 text-white w-full mt-2 rounded-lg shadow-md max-h-[200px] overflow-y-auto">
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
            )}
          </div>

          {coinStats ? (
            <div className="flex justify-center space-x-4 mt-6">
              {/* Coin Stats Section */}
              <div className="bg-gray-800 p-4 rounded-lg text-white w-96">
                <h2 className="text-2xl font-semibold">Coin Statistics</h2>
                <ul className="mt-4 text-left">
                  <li>
                    <strong>Price:</strong> $
                    {coinStats.current_price
                      ? coinStats.current_price.toString()
                      : "N/A"}
                  </li>
                  <li>
                    <strong>Market Cap:</strong> $
                    {coinStats.market_cap
                      ? coinStats.market_cap.toString()
                      : "N/A"}
                  </li>
                  <li>
                    <strong>24h Volume:</strong> $$
                    {coinStats.volume
                      ? coinStats.volume.toLocaleString()
                      : "N/A"}
                  </li>
                  <li>
                    <strong>24h High:</strong> $
                    {coinStats.high_24h ? coinStats.high_24h.toString() : "N/A"}
                  </li>
                  <li>
                    <strong>24h Low:</strong> $
                    {coinStats.low_24h ? coinStats.low_24h.toString() : "N/A"}
                  </li>
                </ul>
              </div>

              {/* Scam Risk Pie Chart Section */}
              <div className="bg-gray-800 p-4 rounded-lg text-white w-96">
                <h2 className="text-2xl font-semibold">Scam Risk</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Risk", value: coinStats.scam_risk },
                        { name: "Safe", value: 100 - coinStats.scam_risk },
                      ]}
                      cx="50%" cy="50%" // Center of the pie chart
                      outerRadius="80%" // Ensures a seamless circle
                      dataKey="value"
                      paddingAngle={0} // No padding between segments
                    >
                      <Cell fill="#ff0000" />
                      <Cell fill="#00ff1e" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
