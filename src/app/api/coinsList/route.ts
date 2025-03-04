// app/api/coins/route.ts

export async function GET(request: Request) {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/list");
    const coins = await response.json();
    return new Response(JSON.stringify(coins), {
      headers: { "Content-Type": "application/json" },
    });
  }
  