// app/api/crypto/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract the token query parameter from the URL
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch data from CoinGecko API using the token
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${token}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data from CoinGecko' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the fetched data
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching data' },
      { status: 500 }
    );
  }
}
