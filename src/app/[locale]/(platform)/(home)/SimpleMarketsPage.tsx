'use client'

import { useState, useEffect } from 'react'
import SimpleVirtualTradingCard from './SimpleVirtualTradingCard'

interface PolymarketMarket {
  id: string
  question: string
  slug: string
  image: string
  description: string
  outcomePrices: string
  volume: string
  active: boolean
}

export default function SimpleMarketsPage() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true)

        // Fetch directly from Polymarket API (client-side)
        const response = await fetch(
          'https://gamma-api.polymarket.com/markets?limit=20&active=true&order=volume24hr%3ADESC'
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setMarkets(data)
        setError(null)
      } catch (err: any) {
        console.error('Error fetching markets:', err)
        setError('Failed to load markets: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Polymarket Simulator</h1>
          <p className="text-gray-600">Loading live markets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Polymarket Simulator</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-primary">Polymarket Simulator</h1>
        <p className="text-gray-600 text-lg">
          Trade on real prediction markets with virtual money
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Live data from Polymarket • Virtual balance: $10,000
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <SimpleVirtualTradingCard
            key={market.id}
            market={market}
          />
        ))}
      </div>

      {markets.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No active markets found</p>
        </div>
      )}
    </div>
  )
}