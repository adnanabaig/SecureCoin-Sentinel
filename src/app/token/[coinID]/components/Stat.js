import React from "react";

const Stat = ({ coinData }) => {
  const coinDetails = {
    name: "Coin Name",
    symbol: "COIN",
    id: "coin-id",
    price: "$500.00",
    marketCap: "$1,000,000,000",
    volume: "$50,000,000",
    chain: "Ethereum",
    category: "DeFi",
    typeOfIssue: "Smart Contract Bug",
    fundsLost: "$200,000",
    date: "2025-03-04",
    contractChain: "Ethereum Mainnet",
    contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 rounded-lg bg-gray-900 text-white mb-10">
      <div className="flex items-end justify-between mb-6  px-4">
        <h1 className="text-3xl font-bold mb-6">
          {coinDetails.name} ({coinDetails.symbol})
        </h1>
        <img src={coinData.image.large} className="w-24 rounded-full " alt="logo" />
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p>
              <strong>Coin ID:</strong> {coinDetails.id}
            </p>
            <p>
              <strong>Price:</strong> {coinDetails.price}
            </p>
            <p>
              <strong>Market Cap:</strong> {coinDetails.marketCap}
            </p>
            <p>
              <strong>Volume:</strong> {coinDetails.volume}
            </p>
            <p>
              <strong>Category:</strong> {coinDetails.category}
            </p>
            <p>
              <strong>Chain:</strong> {coinDetails.chain}
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong>Type of Issue:</strong> {coinDetails.typeOfIssue}
            </p>
            <p>
              <strong>Funds Lost:</strong> {coinDetails.fundsLost}
            </p>
            <p>
              <strong>Date:</strong> {coinDetails.date}
            </p>

            <p>
              <strong>Contract Chain:</strong> {coinDetails.contractChain}
            </p>
            <p>
              <strong>Contract Address:</strong> {coinDetails.contractAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stat;
