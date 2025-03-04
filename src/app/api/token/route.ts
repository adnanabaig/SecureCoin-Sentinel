import { NextResponse } from "next/server";
import tokensData from "@/data/tokens.json";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: "Token symbol is required" }, { status: 400 });
    }

    const token = tokensData.find((t) => t.Symbol.toUpperCase() === symbol);
    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    // Clean and format response
    const formattedToken = {
      name: token.Name || "Unknown",
      symbol: token.Symbol,
      price: token.price || 0,
      market_cap: token.market_cap ? Number(token.market_cap).toLocaleString() : "N/A",
      volume: token.volume ? Number(token.volume).toLocaleString() : "N/A",
      wasRekt: Boolean(token.wasRekt),
      category: token.Category || "N/A",
      type_of_issue: token["Type of Issue"] || "N/A",
      funds_lost: token["Funds Lost"] || "N/A",
      contract_address: token.contract_address || "N/A",
      contract_chain: token.contract_chain || "N/A",
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(formattedToken, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}