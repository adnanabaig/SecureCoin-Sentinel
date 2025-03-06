"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import CoinOverview from "./components/CoinOverview";
import Suggestions from "./components/Suggestions";
import StatsBox from "./components/StatsBox";

// Define types for the coin data and component state
type Coin = {
  id: string;
  name: string;
};

type CoinStats = {
  name: string;
  symbol: string;
  marketCap: number;
  price: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  riskScore: number; // Scam risk property
  riskLabel: string; // Scam risk label
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

      console.log("API Response:", data); // Debugging
      console.log("Name:", data?.name);
      console.log("Symbol:", data?.symbol);

      if (!data || !data.market_data) {
        throw new Error("Invalid API response: missing market_data");
      }

      const riskScoreTemp = 80; // Placeholder scam risk (random number for now)

      const stats: CoinStats = {
        name: data.name,
        symbol: data.symbol,
        marketCap: data.market_data?.market_cap?.usd ?? 0,
        price: data.market_data?.current_price?.usd ?? 0,
        volume: data.market_data?.total_volume?.usd ?? 0,
        high_24h: data.market_data?.high_24h?.usd ?? 0,
        low_24h: data.market_data?.low_24h?.usd ?? 0,
        riskScore: riskScoreTemp,
        riskLabel: riskScoreTemp > 50 ? "High Risk" : "Low Risk",
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
      <Navbar />
      <div className="h-full  flex text-white">
        <div className="pt-40 text-center w-full ">
          <h1 className="text-4xl font-bold mb-6 w-full">
            SecureCoin Sentinel
          </h1>
          <p className="text-gray-300"> Enter a token to check for rug pull risks.</p>
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
                ) : filteredCoins.length === 0 && query ? (
                  <p>No tokens found matching "{query}"</p>
                ) : (
                  <Suggestions
                    filteredCoins={filteredCoins}
                    handleCoinSelect={handleCoinSelect}
                  />
                )}
              </div>
            )}
          </div>

          {coinStats && (
            <div className="flex flex-col justify-center items-center">
              <CoinOverview scamData={coinStats} />
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                <StatsBox
                  title="Scam Risk Score"
                  description="   Real-time security analysis of token contracts."
                />
                <StatsBox
                  title="Liquidity & Volume"
                  description="Track the liquidity and volume movement of a token."
                />
                <StatsBox
                  title="Community Trust"
                  description="Analyze social media signals and community sentiment."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
