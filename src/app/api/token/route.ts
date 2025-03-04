import { NextResponse } from "next/server";
import tokens from "@/data/tokens.json"; // ✅ Ensure path is correct

export async function GET(req: Request) {
  try {
    // Parse the URL search parameters
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.toUpperCase(); // Convert to uppercase for uniformity

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    // Find token data
    const tokenData = tokens.find((t) => t.Symbol.toUpperCase() === symbol);

    if (!tokenData) {
      return NextResponse.json({ error: `Token ${symbol} not found` }, { status: 404 });
    }

    return NextResponse.json(tokenData, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
