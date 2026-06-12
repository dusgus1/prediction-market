'use client'

import { useState } from 'react'
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface VirtualTradingCardProps {
  market: {
    id: string
    slug: string
    question: string
    description?: string
    yes_price: number
    no_price: number
    probability_yes: number
    probability_no: number
    volume?: number
    image_url?: string
  }
  className?: string
}

export default function VirtualTradingCard({ market, className }: VirtualTradingCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No' | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleBuy = async (outcome: 'Yes' | 'No') => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      const priceAtBuy = outcome === 'Yes' ? market.yes_price : market.no_price
      const cost = parseFloat(amount) * priceAtBuy

      // First check if user has enough balance
      const balanceResponse = await fetch('/api/virtual-balance')
      if (!balanceResponse.ok) {
        throw new Error('Failed to check balance')
      }

      const balanceData = await balanceResponse.json()
      if (balanceData.balance < cost) {
        alert(`Insufficient balance! You need $${cost.toFixed(2)} but only have $${balanceData.balance.toFixed(2)}`)
        setLoading(false)
        return
      }

      // Deduct from balance
      const balanceUpdateResponse = await fetch('/api/virtual-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cost,
          action: 'subtract',
        }),
      })

      if (!balanceUpdateResponse.ok) {
        throw new Error('Failed to update balance')
      }

      // Create position
      const positionResponse = await fetch('/api/virtual-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market_id: market.id,
          market_slug: market.slug,
          market_question: market.question,
          outcome,
          amount: parseFloat(amount),
          price_at_buy: priceAtBuy,
        }),
      })

      if (!positionResponse.ok) {
        throw new Error('Failed to create position')
      }

      const positionData = await positionResponse.json()

      alert(`Successfully bought ${amount} shares of "${outcome}" for $${cost.toFixed(2)}!`)
      setAmount('')
      setSelectedOutcome(null)

    } catch (error: any) {
      console.error('Trade error:', error)
      alert('Failed to place trade: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('border rounded-lg p-6 bg-white shadow-sm', className)}>
      {/* Market Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">
          {market.question}
        </h3>
        {market.image_url && (
          <img
            src={market.image_url}
            alt={market.question}
            className="w-full h-32 object-cover rounded mb-3"
          />
        )}
        {market.volume && (
          <p className="text-sm text-gray-600">
            Volume: ${market.volume.toLocaleString()}
          </p>
        )}
      </div>

      {/* Outcome Prices */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={cn(
            'p-3 rounded border cursor-pointer transition-colors',
            selectedOutcome === 'Yes'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          )}
          onClick={() => setSelectedOutcome('Yes')}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-green-700">Yes</span>
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold">{(market.probability_yes * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-600">${market.yes_price.toFixed(2)}</div>
        </div>

        <div
          className={cn(
            'p-3 rounded border cursor-pointer transition-colors',
            selectedOutcome === 'No'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-red-300'
          )}
          onClick={() => setSelectedOutcome('No')}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-red-700">No</span>
            <TrendingDownIcon className="size-4 text-red-600" />
          </div>
          <div className="text-lg font-semibold">{(market.probability_no * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-600">${market.no_price.toFixed(2)}</div>
        </div>
      </div>

      {/* Trading Input */}
      {selectedOutcome && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount to spend (USD)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
            {amount && (
              <p className="text-xs text-gray-600 mt-1">
                You'll receive ~{(parseFloat(amount) / (selectedOutcome === 'Yes' ? market.yes_price : market.no_price)).toFixed(2)} shares
              </p>
            )}
          </div>

          <Button
            onClick={() => handleBuy(selectedOutcome)}
            disabled={!amount || parseFloat(amount) <= 0 || loading}
            className={cn(
              'w-full',
              selectedOutcome === 'Yes' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            )}
          >
            <DollarSignIcon className="size-4 mr-2" />
            {loading ? 'Processing...' : `Buy ${selectedOutcome} for $${amount || '0'}`}
          </Button>
        </div>
      )}

      {!selectedOutcome && (
        <p className="text-center text-gray-500 py-4">
          Click on Yes or No to start trading
        </p>
      )}
    </div>
  )
}