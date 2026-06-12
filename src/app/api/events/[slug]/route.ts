import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    // Proxy to our Polymarket market API
    const baseUrl = new URL(request.url).origin
    const response = await fetch(`${baseUrl}/api/polymarket-markets/${slug}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      throw new Error(`Failed to fetch market: ${response.status}`)
    }

    const market = await response.json()

    // Transform to event format
    const event = {
      id: market.id,
      slug: market.slug,
      title: market.question,
      description: market.description,
      icon_url: market.icon_url,
      image_url: market.image_url,
      status: market.status,
      end_date: market.end_date,
      start_date: market.start_date,
      created_at: market.created_at,
      updated_at: market.updated_at,
      volume: market.volume,
      volume24hr: market.volume24hr,
      liquidity: market.liquidity,

      // Market specific data
      outcomes: market.outcomes,
      prices: market.prices,
      probability_yes: market.probability_yes,
      probability_no: market.probability_no,
      yes_price: market.yes_price,
      no_price: market.no_price,

      // Trading data
      condition_id: market.condition_id,
      best_bid: market.best_bid,
      best_ask: market.best_ask,
      last_trade_price: market.last_trade_price,
      spread: market.spread,

      // Price changes
      one_day_price_change: market.one_day_price_change,
      one_week_price_change: market.one_week_price_change,
      one_month_price_change: market.one_month_price_change,
    }

    return NextResponse.json(event)

  } catch (error: any) {
    console.error('Event API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}