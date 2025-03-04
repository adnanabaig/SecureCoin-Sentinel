// app/api/coins/route.ts

// Example: Store data in-memory for 5 minutes
let cachedData: any = null;
let lastFetched = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const currentTime = Date.now();

  // If the data is cached and it's not expired, return it
  if (cachedData && currentTime - lastFetched < CACHE_DURATION) {
    return new Response(JSON.stringify(cachedData), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Fetch data if it's expired or not cached
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
    const coins = await response.json();
    cachedData = coins; // Cache the data
    lastFetched = currentTime; // Update the timestamp

    return new Response(JSON.stringify(coins), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching coin data:", error);
    return new Response(JSON.stringify({ error: "Unable to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
