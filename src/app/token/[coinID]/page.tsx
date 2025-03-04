//  task: create new pages like discover trending tokens, recently looked at
import { redirect } from "next/navigation";
import Gauge from "./components/Gauge";
import Stat from "./components/Stat";
import Navbar from "@/app/components/Navbar";

const CoinPage = async ({ params }: { params: { coinID: string } }) => {
  const { coinID } = await params;
  let coinData;
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinID}`
    );
    if (!response.ok) throw new Error("Failed to fetch coin coinData");
    coinData = await response.json();
  } catch (error) {
    console.error("Error fetching coin data:", error);
    redirect("/TokenNotFound"); // Redirect if there's an error. task redirect to not found page instead of home page. need to create not found page
  }

  const { name, symbol, image } = coinData;
  console.log(coinData);

  return (
    <>
      <Navbar />
      <div className="bg-gray-900">
        <div className="h-40 relative">
          <div className="h-full justify-center items-center flex flex-col text-white">
            <h1 className="text-6xl font-bold ">{name}</h1>
            <p className="text-4xl">{symbol}</p>
          </div>
        </div>
        <div className="flex justify-center items-center ">
          <Gauge scamRatingValue={10} />
        </div>
        <div className="statistic mt-12 flex flex-col items-center">
          <Stat coinData={coinData} />
        </div>
      </div>
    </>
  );
};

export default CoinPage;
