import { NextResponse } from 'next/server'
import { DEFAULT_ERROR_MESSAGE } from '@/lib/constants'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = searchParams.get('offset') || '0'
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20 // Max 100 markets
  const search = searchParams.get('search') || ''

  try {
    // Proxy request to our Polymarket API endpoint
    const baseUrl = new URL(request.url).origin
    const polymarketApiUrl = `${baseUrl}/api/polymarket-markets?limit=${limit}&offset=${offset}`

    const response = await fetch(polymarketApiUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch from Polymarket API: ${response.status}`)
    }

    let markets = await response.json()

    // Apply search filter if provided
    if (search.trim()) {
      const searchTerm = search.toLowerCase()
      markets = markets.filter((market: any) =>
        market.question.toLowerCase().includes(searchTerm) ||
        market.description.toLowerCase().includes(searchTerm)
      )
    }

    // Transform to match expected event format
    const events = markets.map((market: any) => ({
      id: market.id,
      slug: market.slug,
      title: market.question,
      description: market.description,
      icon_url: market.icon_url,
      image_url: market.image_url,
      status: market.active ? 'active' : 'closed',
      end_date: market.end_date,
      start_date: market.start_date,
      created_at: market.created_at,
      updated_at: market.updated_at,
      // Additional data for UI
      volume: market.volume,
      volume24hr: market.volume24hr,
      liquidity: market.liquidity,
      probability_yes: market.probability_yes,
      probability_no: market.probability_no,
      prices: market.prices,
      outcomes: market.outcomes,
    }))

    return NextResponse.json(events)

  } catch (error: any) {
    console.error('Events API Error:', error)
    return NextResponse.json({ error: DEFAULT_ERROR_MESSAGE }, { status: 500 })
  }
}
