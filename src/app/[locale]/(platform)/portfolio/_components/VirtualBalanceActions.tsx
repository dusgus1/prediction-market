'use client'

import { PlusIcon, MinusIcon, DollarSignIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VirtualBalanceActionsProps {
  className?: string
}

export default function VirtualBalanceActions({ className }: VirtualBalanceActionsProps) {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  // Fetch current balance
  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/virtual-balance')
      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  // Add money to balance
  const addMoney = async (amount: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/virtual-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          action: 'add',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBalance(data.balance)
      } else {
        console.error('Failed to add money')
      }
    } catch (error) {
      console.error('Error adding money:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load balance on component mount
  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Balance Display */}
      <div className="flex items-center justify-center space-x-2 text-lg font-semibold">
        <DollarSignIcon className="size-5 text-primary" />
        <span>Virtual Balance: ${balance.toFixed(2)}</span>
      </div>

      {/* Add Money Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-11"
          onClick={() => addMoney(100)}
          disabled={loading}
        >
          <PlusIcon className="size-4 mr-1" />
          $100
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={() => addMoney(1000)}
          disabled={loading}
        >
          <PlusIcon className="size-4 mr-1" />
          $1,000
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={() => addMoney(10000)}
          disabled={loading}
        >
          <PlusIcon className="size-4 mr-1" />
          $10,000
        </Button>
      </div>

      {/* Reset Balance Button */}
      <Button
        variant="secondary"
        className="w-full h-11"
        onClick={() => {
          setBalance(10000)
          // You could add an API call here to reset balance to $10,000
          addMoney(10000 - balance)
        }}
        disabled={loading}
      >
        Reset to $10,000
      </Button>
    </div>
  )
}