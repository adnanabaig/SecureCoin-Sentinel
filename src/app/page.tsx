"use client";
import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import CoinOverview from "./components/CoinOverview";
import Suggestions from "./components/Suggestions";
import StatsBox from "./components/StatsBox";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

import { useSearchParams } from "next/navigation"; // Import useSearchParams for query parameters

// Define types for the coin data and component state
type Coin = {
  id: string;
  name: string;
  symbol: string; // Added symbol to Coin type
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
  const searchParams = useSearchParams(); // Initialize searchParams

  const [query, setQuery] = useState<string>(""); // State to store the query (symbol)
  const [allCoins, setAllCoins] = useState<Coin[]>([]); // State to store all coins (unfiltered)
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]); // State to store filtered coins
  const [loading, setLoading] = useState<boolean>(false); // State to manage loading state
  const [coinStats, setCoinStats] = useState<CoinStats | null>(null); // State to store selected coin stats

  useEffect(() => {
    const fetchData = async () => {
      await fetchCoinsList();
      // Extract coinSymbol from the query string when the component mounts
      const coinSymbol = searchParams.get("coinSymbol");
      if (coinSymbol) {
        setQuery(coinSymbol);
      }
    };

    fetchData();
  }, [searchParams]); // Re-run effect when query changes

  // Function to fetch the coins list from CoinGecko
  const fetchCoinsList = async () => {
    try {
      setLoading(true); // Set loading to true before fetching data
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd"
      );
      const coins: Coin[] = await response.json();
      setAllCoins(coins); // Store the full list of coins (unfiltered)
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching coin list:", error);
      setLoading(false); // Set loading to false if there is an error
    }
  };

  // Function to fetch the statistics of a specific coin using the symbol
  const fetchCoinStats = async (coinId: string) => {
    try {
      coinId = coinId.toLowerCase();
      console.log("calling api with coinId", coinId);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}`
      );
      const data = await response.json();

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

  const filterCoins = useCallback((): Coin[] => {
    try {
      const sanitizedQuery = escapeSpecialChars(query);
      const regex = new RegExp(sanitizedQuery, "i");
      return allCoins.filter(
        (coin) => regex.test(coin.symbol) || regex.test(coin.name)
      );
    } catch (error) {
      console.error("Invalid regex pattern:", error);
      return []; // Optionally, show an error message or fallback UI here
    }
  }, [query, allCoins]);

  // useEffect to filter coins and reset stats when the query changes
  useEffect(() => {
    setCoinStats(null); // Reset coin stats when query changes
    if (query) {
      setFilteredCoins(filterCoins().slice(0, 5)); // Filter coins based on the query (symbol)
    } else {
      setFilteredCoins([]); // Clear filtered coins when query is empty
    }
  }, [query, filterCoins]);

  // Handle selection of a coin from the dropdown
  const handleCoinSelect = (coinId: string) => {
    setFilteredCoins([]); // Clear the filtered coins list after selecting a coin
    setQuery(coinId); // Set the selected coin ID as the query (not the symbol)
    fetchCoinStats(coinId); // Fetch and display the stats of the selected coin
  };

  const handleSearch = () => {
    if (query) {
      fetchCoinStats(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(); // Call the same search function when Enter is pressed
    }
  };

  return (
    <div>
      <Navbar />
      <div className="h-full flex text-white">
        <div className="pt-40 text-center w-full ">
          <h1 className="text-4xl font-bold mb-6 w-full">
            SecureCoin Sentinel
          </h1>
          <p className="text-gray-300">
            Enter a token symbol to check for rug pull risks.
          </p>
          <div className="relative mt-12 flex items-center justify-center bg-gray-600 p-4 rounded-full max-w-3xl mx-auto">
            <input
              type="text"
              className="w-full border-none outline-none text-white placeholder-gray-500"
              placeholder="Enter coin symbol or name"
              value={query}
              onKeyDown={handleKeyPress} // Listen for Enter key press
              onChange={(e) => setQuery(e.target.value)} // Update query state
            />

            {/* Round Enter Button */}
            <button onClick={handleSearch} className="cursor-pointer">
              <ArrowCircleRightIcon
                className="text-white-500"
                style={{ fontSize: "2rem" }}
              />
            </button>

            {!coinStats && (
              <div className="absolute top-18 w-1/2 h-24 mt-1">
                {loading ? (
                  <p>Loading...</p>
                ) : filteredCoins.length === 0 && query ? (
                  <p>No tokens found matching &quot;{query}&quot;</p>
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
