import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://www.sdhl.se/api/statistics-v2/stats-info/teams_result?count=25&ssgtUuid=n5mqrxbg0g&provider=impleo', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.sdhl.se/',
        'Origin': 'https://www.sdhl.se'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SDHL standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}
