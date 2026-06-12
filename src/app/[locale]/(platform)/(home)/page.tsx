import { setRequestLocale } from 'next-intl/server'
import SimpleMarketsPage from './SimpleMarketsPage'

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SimpleMarketsPage />
}