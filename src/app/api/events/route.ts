import { NextResponse } from 'next/server'

// Simple proxy to Polymarket API without database dependencies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'

    // Direct fetch from Polymarket
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=${limit}&active=true&order=volume24hr%3ADESC`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch markets' },
        { status: 500 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('Events API Error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
