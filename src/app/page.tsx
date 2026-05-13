export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/shared/Navbar'
import Hero from '@/components/shared/Hero'
import HomeContent from '@/components/home/HomeContent'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, agents(company, district, phone)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const allListings = listings ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <HomeContent listings={allListings} />
    </div>
  )
}
