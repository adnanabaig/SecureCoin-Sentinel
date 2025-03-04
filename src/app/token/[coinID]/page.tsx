import { redirect } from "next/navigation";
import Gauge from "./components/Gauge";
import Stat from "./components/Stat";

const CoinPage = async ({ params }: { params: { coinID: string } }) => {
  const coinID = params.coinID;
  let coinData;
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinID}`
    );
    if (!response.ok) throw new Error("Failed to fetch coin coinData");
    coinData = await response.json();
  } catch (error) {
    console.error("Error fetching coin data:", error);
    redirect("/"); // Redirect if there's an error. task redirect to not found page instead of home page. need to create not found page
  }

  const { name, coinSymbol, image } = coinData;

  return (
    <div className="bg-black h-screen w-screen">
      <div className="h-40 bg-yellow-300 relative">
        <img
          alt="coinlogo"
          className=" p-8 h-full absolute top-0 left-0  bg-amber-950"
          src={image.large}
        />
        <div className="bg-red-500 h-full justify-center items-center flex flex-col">
          <h1 className="text-6xl">{name}</h1>
          <p className="text-4xl">{coinSymbol}</p>
        </div>
        <span className="absolute top-0 right-0 h-full bg-green-400">
          <Gauge />
        </span>
      </div>
      <div className="statistic mt-12 flex flex-col items-center">
        <Stat />
      </div>
    </div>
  );
};

export default CoinPage;
