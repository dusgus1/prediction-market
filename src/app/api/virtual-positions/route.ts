import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { virtual_positions } from '@/lib/db/schema'
import { db } from '@/lib/drizzle'
import { UserRepository } from '@/lib/db/queries/user'

export async function GET() {
  try {
    const user = await UserRepository.getCurrentUser()

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const positions = await db
      .select()
      .from(virtual_positions)
      .where(eq(virtual_positions.user_id, user.id))

    const formattedPositions = positions.map(position => ({
      id: position.id,
      market_id: position.market_id,
      market_slug: position.market_slug,
      market_question: position.market_question,
      outcome: position.outcome,
      amount: parseFloat(position.amount),
      price_at_buy: parseFloat(position.price_at_buy),
      created_at: position.created_at,
    }))

    return NextResponse.json(formattedPositions)

  } catch (error: any) {
    console.error('Virtual positions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await UserRepository.getCurrentUser()

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      market_id,
      market_slug,
      market_question,
      outcome,
      amount,
      price_at_buy
    } = body

    // Validate required fields
    if (!market_id || !market_slug || !market_question || !outcome || !amount || !price_at_buy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (outcome !== 'Yes' && outcome !== 'No') {
      return NextResponse.json({ error: 'Invalid outcome' }, { status: 400 })
    }

    // Create new position
    const newPosition = await db
      .insert(virtual_positions)
      .values({
        user_id: user.id,
        market_id,
        market_slug,
        market_question,
        outcome,
        amount: amount.toFixed(2),
        price_at_buy: price_at_buy.toFixed(6),
      })
      .returning()

    return NextResponse.json({
      position: {
        id: newPosition[0].id,
        market_id: newPosition[0].market_id,
        market_slug: newPosition[0].market_slug,
        market_question: newPosition[0].market_question,
        outcome: newPosition[0].outcome,
        amount: parseFloat(newPosition[0].amount),
        price_at_buy: parseFloat(newPosition[0].price_at_buy),
        created_at: newPosition[0].created_at,
      },
      message: `Successfully bought ${amount.toFixed(2)} shares of "${outcome}" for $${amount.toFixed(2)}`,
    })

  } catch (error: any) {
    console.error('Virtual position creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    )
  }
}