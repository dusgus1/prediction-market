import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'

    // Direct proxy to Polymarket API without any database dependencies
    const polymarketUrl = `https://gamma-api.polymarket.com/markets?limit=${limit}&active=true&order=volume24hr%3ADESC`

    const response = await fetch(polymarketUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polymarket-Simulator/1.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      console.error(`Polymarket API error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch from Polymarket API' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}