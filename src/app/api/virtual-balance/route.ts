import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { users } from '@/lib/db/schema'
import { db } from '@/lib/drizzle'
import { UserRepository } from '@/lib/db/queries/user'

export async function GET() {
  try {
    const user = await UserRepository.getCurrentUser()

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRecord = await db
      .select({ virtual_balance: users.virtual_balance })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (userRecord.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      balance: parseFloat(userRecord[0].virtual_balance || '10000.00'),
    })

  } catch (error: any) {
    console.error('Virtual balance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
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
    const { amount, action } = body

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (action !== 'add' && action !== 'subtract') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get current balance
    const currentUser = await db
      .select({ virtual_balance: users.virtual_balance })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (currentUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentBalance = parseFloat(currentUser[0].virtual_balance || '10000.00')
    let newBalance: number

    if (action === 'add') {
      newBalance = currentBalance + amount
    } else {
      newBalance = currentBalance - amount
      // Prevent negative balance
      if (newBalance < 0) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }
    }

    // Update balance
    await db
      .update(users)
      .set({ virtual_balance: newBalance.toFixed(2) })
      .where(eq(users.id, user.id))

    return NextResponse.json({
      balance: newBalance,
      message: `Successfully ${action === 'add' ? 'added' : 'subtracted'} $${amount.toFixed(2)}`,
    })

  } catch (error: any) {
    console.error('Virtual balance update error:', error)
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    )
  }
}