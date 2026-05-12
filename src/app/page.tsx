export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import ListingGrid from '@/components/listings/ListingGrid'
import Navbar from '@/components/shared/Navbar'
import Hero from '@/components/shared/Hero'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from('listings')
    .select('*, agents(company, district, phone)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Available Listings</h2>
        <p className="text-gray-500 mb-10">All prices in Korean Won (KRW). Contact agents directly in English.</p>
        <ListingGrid listings={listings ?? []} />
      </main>
    </div>
  )
}
