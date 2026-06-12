'use client'

import { useState, useEffect } from 'react'
import AppLink from '@/components/AppLink'
import { Button } from '@/components/ui/button'

function getVirtualBalance(): number {
  if (typeof window === 'undefined') return 10000
  const stored = localStorage.getItem('polymarket_virtual_balance')
  return stored ? parseFloat(stored) : 10000
}

function getVirtualPositions(): any[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('polymarket_virtual_positions')
  return stored ? JSON.parse(stored) : []
}

export default function HeaderPortfolio() {
  const [balance, setBalance] = useState(10000)
  const [totalPositionsValue, setTotalPositionsValue] = useState(0)

  useEffect(() => {
    const currentBalance = getVirtualBalance()
    const positions = getVirtualPositions()
    const positionsValue = positions.reduce((sum: number, pos: any) => sum + (pos.amount || 0), 0)

    setBalance(currentBalance)
    setTotalPositionsValue(positionsValue)
  }, [])

  const totalPortfolioValue = balance + totalPositionsValue

  return (
    <div className="grid grid-cols-3 gap-x-1">
      <Button
        variant="ghost"
        size="header"
        className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-[6px] px-2.5 py-1"
        asChild
      >
        <AppLink intentPrefetch href="/portfolio">
          <div className="translate-y-px text-xs/tight font-medium text-muted-foreground">Portfolio</div>
          <div className="-translate-y-px text-base/tight font-semibold text-primary">
            ${totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </AppLink>
      </Button>

      <Button
        variant="ghost"
        size="header"
        className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-[6px] px-2.5 py-1"
        asChild
      >
        <AppLink intentPrefetch href="/portfolio">
          <div className="translate-y-px text-xs/tight font-medium text-muted-foreground">
            Cash
          </div>
          <div className="-translate-y-px text-base/tight font-semibold text-green-600">
            ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </AppLink>
      </Button>

      <Button
        variant="ghost"
        size="header"
        className="flex h-11 flex-col items-center justify-center gap-0.5 rounded-[6px] px-2.5 py-1"
        asChild
      >
        <AppLink intentPrefetch href="/markets">
          <div className="translate-y-px text-xs/tight font-medium text-muted-foreground">Markets</div>
          <div className="-translate-y-px text-base/tight font-semibold text-blue-600">
            Live
          </div>
        </AppLink>
      </Button>
    </div>
  )
}
