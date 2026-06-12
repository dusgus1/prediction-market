import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'
    const offset = searchParams.get('offset') || '0'

    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=${limit}&offset=${offset}&active=true&order=volume24hr%3ADESC`,
      { headers: { 'Accept': 'application/json' }, next: { revalidate: 60 } }
    )

    if (!response.ok) throw new Error('Polymarket API error')

    const markets = await response.json()
    const arr = Array.isArray(markets) ? markets : []

    const events = arr.map((m: any) => {
      let prices: string[] = ['0.5', '0.5']
      let outcomeNames: string[] = ['Yes', 'No']
      try { prices = JSON.parse(m.outcomePrices || '["0.5","0.5"]') } catch {}
      try { outcomeNames = JSON.parse(m.outcomes || '["Yes","No"]') } catch {}

      const outcomes = outcomeNames.map((text: string, i: number) => ({
        condition_id: m.conditionId || m.id || '',
        outcome_text: text,
        outcome_index: i,
        token_id: String(i),
        is_winning_outcome: false,
        buy_price: parseFloat(prices[i] || '0.5'),
        sell_price: parseFloat(prices[i] || '0.5'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const market = {
        condition_id: m.conditionId || m.id || '',
        question_id: m.questionId || m.conditionId || '',
        event_id: m.conditionId || m.id || '',
        title: m.question || '',
        slug: m.conditionId || m.id || '',
        icon_url: m.image || '',
        is_active: true,
        is_resolved: false,
        block_number: 0,
        block_timestamp: new Date().toISOString(),
        volume_24h: parseFloat(m.volume24hr || '0'),
        volume: parseFloat(m.volume || '0'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        price: parseFloat(prices[0] || '0.5'),
        probability: parseFloat(prices[0] || '0.5'),
        outcomes,
        condition: {
          id: m.conditionId || '',
          oracle: '',
          question_id: m.questionId || '',
          outcome_slot_count: outcomeNames.length,
          resolved: false,
          volume: parseFloat(m.volume || '0'),
          open_interest: 0,
          active_positions_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      return {
        id: m.conditionId || m.id || String(Math.random()),
        slug: m.conditionId || m.id || '',
        title: m.question || '',
        creator: 'polymarket',
        icon_url: m.image || '',
        show_market_icons: true,
        status: 'active' as const,
        active_markets_count: 1,
        total_markets_count: 1,
        volume: parseFloat(m.volume || '0'),
        end_date: m.endDate || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        markets: [market],
        tags: [],
        main_tag: 'trending',
        is_bookmarked: false,
        is_trending: true,
      }
    })

    return NextResponse.json(events)
  } catch (error: any) {
    console.error('Events API Error:', error)
    return NextResponse.json([])
  }
}