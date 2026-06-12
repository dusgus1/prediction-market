'use client'

import { useState, useEffect } from 'react'
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from 'lucide-react'

interface SimpleVirtualTradingCardProps {
  market: {
    id: string
    question: string
    slug: string
    image: string
    description: string
    outcomePrices: string
    volume: string
  }
}

// Simple localStorage-based virtual balance system
const STORAGE_KEYS = {
  BALANCE: 'polymarket_virtual_balance',
  POSITIONS: 'polymarket_virtual_positions'
}

const DEFAULT_BALANCE = 10000

function getVirtualBalance(): number {
  if (typeof window === 'undefined') return DEFAULT_BALANCE
  const stored = localStorage.getItem(STORAGE_KEYS.BALANCE)
  return stored ? parseFloat(stored) : DEFAULT_BALANCE
}

function setVirtualBalance(balance: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString())
}

function addVirtualPosition(position: any): void {
  if (typeof window === 'undefined') return
  const positions = getVirtualPositions()
  positions.push(position)
  localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions))
}

function getVirtualPositions(): any[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEYS.POSITIONS)
  return stored ? JSON.parse(stored) : []
}

export default function SimpleVirtualTradingCard({ market }: SimpleVirtualTradingCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<'Yes' | 'No' | null>(null)
  const [amount, setAmount] = useState<string>('')
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE)

  // Parse prices from API
  const prices = JSON.parse(market.outcomePrices || '["0.5", "0.5"]')
  const yesPrice = parseFloat(prices[0] || '0.5')
  const noPrice = parseFloat(prices[1] || '0.5')

  useEffect(() => {
    setBalance(getVirtualBalance())
  }, [])

  const handleBuy = async (outcome: 'Yes' | 'No') => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const cost = parseFloat(amount)
    const currentBalance = getVirtualBalance()

    if (currentBalance < cost) {
      alert(`Insufficient balance! You need $${cost.toFixed(2)} but only have $${currentBalance.toFixed(2)}`)
      return
    }

    const priceAtBuy = outcome === 'Yes' ? yesPrice : noPrice
    const shares = cost / priceAtBuy

    // Update balance
    const newBalance = currentBalance - cost
    setVirtualBalance(newBalance)
    setBalance(newBalance)

    // Add position
    const position = {
      id: Date.now().toString(),
      marketId: market.id,
      question: market.question,
      outcome,
      amount: cost,
      shares: shares,
      priceAtBuy: priceAtBuy,
      timestamp: new Date().toISOString(),
    }

    addVirtualPosition(position)

    alert(`Successfully bought ${shares.toFixed(2)} shares of "${outcome}" for $${cost.toFixed(2)}!`)
    setAmount('')
    setSelectedOutcome(null)
  }

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Market Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[56px]">
          {market.question}
        </h3>
        {market.image && (
          <img
            src={market.image}
            alt={market.question}
            className="w-full h-32 object-cover rounded mb-3"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        {market.volume && (
          <p className="text-sm text-gray-600 mb-3">
            Volume: ${parseFloat(market.volume).toLocaleString()}
          </p>
        )}

        {/* Current Balance Display */}
        <div className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
          💰 Your Balance: ${balance.toFixed(2)}
        </div>
      </div>

      {/* Outcome Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          className={`p-3 rounded border transition-colors ${
            selectedOutcome === 'Yes'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
          }`}
          onClick={() => setSelectedOutcome('Yes')}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-green-700">Yes</span>
            <TrendingUpIcon className="size-4 text-green-600" />
          </div>
          <div className="text-lg font-semibold">{(yesPrice * 100).toFixed(0)}¢</div>
          <div className="text-xs text-gray-600">{(yesPrice * 100).toFixed(1)}% chance</div>
        </button>

        <button
          className={`p-3 rounded border transition-colors ${
            selectedOutcome === 'No'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 hover:border-red-300'
          }`}
          onClick={() => setSelectedOutcome('No')}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-red-700">No</span>
            <TrendingDownIcon className="size-4 text-red-600" />
          </div>
          <div className="text-lg font-semibold">{(noPrice * 100).toFixed(0)}¢</div>
          <div className="text-xs text-gray-600">{(noPrice * 100).toFixed(1)}% chance</div>
        </button>
      </div>

      {/* Trading Input */}
      {selectedOutcome && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount to spend (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {amount && (
              <p className="text-xs text-gray-600 mt-1">
                You'll get ~{(parseFloat(amount) / (selectedOutcome === 'Yes' ? yesPrice : noPrice)).toFixed(1)} shares
              </p>
            )}
          </div>

          <button
            onClick={() => handleBuy(selectedOutcome)}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
            className={`w-full py-2 px-4 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedOutcome === 'Yes'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            <DollarSignIcon className="size-4 inline mr-2" />
            Buy {selectedOutcome} for ${amount || '0'}
          </button>
        </div>
      )}

      {!selectedOutcome && (
        <p className="text-center text-gray-500 py-3 text-sm">
          Click Yes or No to start trading
        </p>
      )}
    </div>
  )
}