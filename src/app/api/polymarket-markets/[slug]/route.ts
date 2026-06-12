import { NextResponse } from 'next/server'

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  try {
    // First try to get the market by slug
    const response = await fetch(`${POLYMARKET_API_BASE}/markets?slug=${slug}`, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`)
    }

    const markets = await response.json()

    if (!markets || markets.length === 0) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 })
    }

    const market = markets[0]
    const outcomes = JSON.parse(market.outcomes || '["Yes", "No"]')
    const prices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]')

    // Transform to our format
    const transformedMarket = {
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
      status: market.active && !market.closed ? 'active' : 'closed',
      // Additional metadata
      yes_price: prices[0] ? parseFloat(prices[0]) : 0.5,
      no_price: prices[1] ? parseFloat(prices[1]) : 0.5,
      probability_yes: prices[0] ? parseFloat(prices[0]) : 0.5,
      probability_no: prices[1] ? parseFloat(prices[1]) : 0.5,
      // Market trading info
      condition_id: market.conditionId,
      best_bid: market.bestBid || 0,
      best_ask: market.bestAsk || 0,
      last_trade_price: market.lastTradePrice || 0,
      spread: market.spread || 0,
      // Price changes
      one_day_price_change: market.oneDayPriceChange || 0,
      one_week_price_change: market.oneWeekPriceChange || 0,
      one_month_price_change: market.oneMonthPriceChange || 0,
    }

    return NextResponse.json(transformedMarket)

  } catch (error: any) {
    console.error('Polymarket Market API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch market from Polymarket',
        details: error.message
      },
      { status: 500 }
    )
  }
}