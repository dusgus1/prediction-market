'use client'

import { useState, useEffect } from 'react'
import { PlusIcon, DollarSignIcon, TrendingUpIcon } from 'lucide-react'

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

function getVirtualPositions(): any[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEYS.POSITIONS)
  return stored ? JSON.parse(stored) : []
}

function clearAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.BALANCE)
  localStorage.removeItem(STORAGE_KEYS.POSITIONS)
}

export default function SimplePortfolioPage() {
  const [balance, setBalance] = useState<number>(DEFAULT_BALANCE)
  const [positions, setPositions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setBalance(getVirtualBalance())
    setPositions(getVirtualPositions())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const addMoney = (amount: number) => {
    const newBalance = balance + amount
    setVirtualBalance(newBalance)
    setBalance(newBalance)
  }

  const resetAccount = () => {
    if (confirm('Are you sure you want to reset your account? This will clear all positions and reset balance to $10,000.')) {
      clearAllData()
      setBalance(DEFAULT_BALANCE)
      setPositions([])
      setVirtualBalance(DEFAULT_BALANCE)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading portfolio...</div>
      </div>
    )
  }

  const totalPositionValue = positions.reduce((sum, pos) => sum + (pos.amount || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Virtual Portfolio</h1>
        <p className="text-gray-600">Manage your virtual trading account</p>
      </div>

      {/* Balance Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-green-600 mb-2">
            ${balance.toFixed(2)}
          </div>
          <div className="text-gray-600">Virtual Cash Balance</div>
        </div>

        {/* Add Money Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => addMoney(100)}
            className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="size-4 mr-1" />
            $100
          </button>
          <button
            onClick={() => addMoney(1000)}
            className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="size-4 mr-1" />
            $1,000
          </button>
          <button
            onClick={() => addMoney(10000)}
            className="flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="size-4 mr-1" />
            $10,000
          </button>
          <button
            onClick={resetAccount}
            className="flex items-center justify-center py-3 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reset Account
          </button>
        </div>
      </div>

      {/* Positions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <TrendingUpIcon className="size-5 mr-2" />
          <h2 className="text-xl font-semibold">Your Positions</h2>
          <span className="ml-2 text-gray-500">({positions.length})</span>
        </div>

        {positions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No positions yet</p>
            <p className="text-sm mt-1">Start trading to see your positions here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium line-clamp-2 mb-1">
                      {position.question}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded ${
                        position.outcome === 'Yes'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {position.outcome}
                      </span>
                      <span>{position.shares.toFixed(2)} shares</span>
                      <span>@{(position.priceAtBuy * 100).toFixed(0)}¢</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${position.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(position.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Invested:</span>
                <span>${totalPositionValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold text-lg mt-2">
                <span>Total Portfolio Value:</span>
                <span className="text-green-600">${(balance + totalPositionValue).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}