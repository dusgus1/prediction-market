import { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import VirtualTradingCard from '@/components/VirtualTradingCard'

export const metadata: Metadata = {
  title: 'Markets - Polymarket Simulator',
}

async function fetchPolymarkets() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/polymarket-markets?limit=20`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      throw new Error('Failed to fetch markets')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching markets:', error)
    return []
  }
}

export default async function MarketsPage({ params }: PageProps<'/[locale]/markets'>) {
  const { locale } = await params
  setRequestLocale(locale)

  const markets = await fetchPolymarkets()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
        <p className="text-gray-600">
          Trade on real markets with virtual money. All data is live from Polymarket.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {markets.map((market: any) => (
          <VirtualTradingCard
            key={market.id}
            market={market}
          />
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No markets available at the moment.</p>
        </div>
      )}
    </div>
  )
}