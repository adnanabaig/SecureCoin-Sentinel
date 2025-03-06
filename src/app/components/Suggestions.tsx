import React from "react";

type Coin = {
  id: string;
  name: string;
};

const Suggestions = ({
  filteredCoins,
  handleCoinSelect,
}: {
  filteredCoins: Coin[];
  handleCoinSelect: (coinID: string) => void;
}) => {
  return (
    <div className="flex items-center justify-center ">
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
  );
};

export default Suggestions;
