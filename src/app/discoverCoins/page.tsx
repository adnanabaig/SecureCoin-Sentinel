"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Navbar from "../components/Navbar";
import Image from "next/image";

// Define the types for the API response data
interface Coin {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_active: boolean;
}

const Page = () => {
  const router = useRouter(); // Initialize the router

  const [trendingCoins, setTrendingCoins] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]); // Store all the fetched coins
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(0); // Track total pages
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // Track sorting order (ascending or descending)

  const handleCoinSelect = (symbol: string) => {
    // Navigate to the homepage and pass the coin's symbol in the query string
    router.push(`/?coinSymbol=${symbol}`); // Pass the coin's symbol as a query parameter
  };

  useEffect(() => {
    // Fetch the trending coins from CoinPaprika API only once
    const fetchPaprika = async () => {
      try {
        const response = await fetch(`https://api.coinpaprika.com/v1/coins`);
        const data = await response.json();

        // Filter out coins with rank 0
        const filteredCoins = data.filter((coin: Coin) => coin.rank !== 0);

        // Store all the filtered coins
        setAllCoins(filteredCoins);

        // Calculate total pages based on filtered data
        const pageSize = 10;
        const totalCoins = filteredCoins.length;
        setTotalPages(Math.ceil(totalCoins / pageSize));

        // Set the initial coins to display (based on current page)
        setTrendingCoins(
          filteredCoins.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )
        );
      } catch (error) {
        console.error("Error fetching CoinPaprika data:", error);
      }
    };

    fetchPaprika();
  }, [currentPage]); // Only fetch data once when the component mounts

  // Apply sorting based on the selected sort order
  useEffect(() => {
    const sortedCoins = [...allCoins].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.rank - b.rank; // Sort in ascending order
      } else {
        return b.rank - a.rank; // Sort in descending order
      }
    });

    // Set the trending coins based on sorted data
    const pageSize = 10;
    const totalCoins = sortedCoins.length;
    setTotalPages(Math.ceil(totalCoins / pageSize));

    setTrendingCoins(
      sortedCoins.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    );
  }, [sortOrder, allCoins, currentPage]); // Re-sort when sortOrder, currentPage, or allCoins change

  // Handle page change (previous and next)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="h-screen ">
      <Navbar />
      <h1 className="text-4xl md:text-6xl pl-10 pt-20">Trending Coins</h1>
      <div className="h-full flex flex-col justify-center items-center ">
        {/* Sorting controls */}
        <div className="flex  w-2/3 justify-end mb-4">
          <select
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            value={sortOrder}
            className="p-2 bg-gray-400 rounded-lg"
          >
            <option value="asc">Rank: Low to High</option>
            <option value="desc">Rank: High to Low</option>
          </select>
        </div>
        <div className="bg-white w-2/3  rounded-4xl p-4 overflow-auto">
          {/* Display trending coins */}
          <ul className="space-y-1">
            {trendingCoins.map((coin) => (
              <li
                key={coin.id}
                className="flex items-center justify-between p-2 border-b border-gray-200 cursor-pointer"
                onClick={() => handleCoinSelect(coin.symbol)} // Select a coin when clicked
              >
                <div className="flex items-center space-x-4 text-black">
                  {/* Optionally, display a logo if available */}
                  {/* Assuming CoinPaprika provides an image or logo URL for each coin */}
                  <Image
                    src={`https://cryptocurrencyliveprices.com/img/${coin.id}.png`} // Adjust if CoinPaprika provides logos differently
                    alt={coin.name}
                    className=" rounded-full h-6 w-6"
                    width={100} // width in pixels
                    height={100} // height in pixels
                  />
                  <span className="font-semibold text-lg">{coin.name}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {coin.symbol.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4 space-x-4 pb-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-gray-400 rounded-lg hover:bg-gray-500"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-lg font-semibold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-gray-400 rounded-lg hover:bg-gray-500"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
