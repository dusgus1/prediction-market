import { NextResponse } from 'next/server'

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com'

interface PolymarketMarket {
  id: string
  question: string
  slug: string
  image: string
  icon: string
  description: string
  outcomes: string
  outcomePrices: string
  volume: string
  volume24hr: number
  liquidity: string
  active: boolean
  closed: boolean
  endDate: string
  startDate: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '20'
  const offset = searchParams.get('offset') || '0'

  try {
    // Fetch markets from Polymarket API
    const polymarketUrl = `${POLYMARKET_API_BASE}/markets?limit=${limit}&offset=${offset}&active=true&order=volume24hr%3ADESC`

    const response = await fetch(polymarketUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`)
    }

    const polymarkets: PolymarketMarket[] = await response.json()

    // Transform to our format
    const transformedMarkets = polymarkets.map(market => {
      const outcomes = JSON.parse(market.outcomes || '["Yes", "No"]')
      const prices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]')

      return {
        id: market.id,
        slug: market.slug,
        title: market.question,
        question: market.question,
        description: market.description,
        image_url: market.image || market.icon,
        icon_url: market.icon || market.image,
        outcomes,
        prices: prices.map((p: string) => parseFloat(p)),
        volume: parseFloat(market.volume || '0'),
        volume24hr: market.volume24hr || 0,
        liquidity: parseFloat(market.liquidity || '0'),
        active: market.active && !market.closed,
        end_date: market.endDate,
        start_date: market.startDate,
        created_at: market.startDate,
        updated_at: new Date().toISOString(),
        // Additional metadata
        yes_price: prices[0] ? parseFloat(prices[0]) : 0.5,
        no_price: prices[1] ? parseFloat(prices[1]) : 0.5,
        probability_yes: prices[0] ? parseFloat(prices[0]) : 0.5,
        probability_no: prices[1] ? parseFloat(prices[1]) : 0.5,
      }
    })

    return NextResponse.json(transformedMarkets)

  } catch (error: any) {
    console.error('Polymarket API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch markets from Polymarket',
        details: error.message
      },
      { status: 500 }
    )
  }
}