export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import Navbar from '@/components/shared/Navbar'
import ListingGallery from '@/components/listings/ListingGallery'
import ListingMap from '@/components/listings/ListingMap'
import ContactForm from '@/components/listings/ContactForm'

const TYPE_LABELS: Record<string, string> = {
  '월세': 'Monthly Rent',
  '전세': 'Jeonse (Lease)',
  '매매': 'For Sale',
}

export default async function ListingDetailPage({ params }: PageProps<'/listings/[id]'>) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, agents(company, district, phone)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (!listing) notFound()

  const agent = listing.agents as { company: string; district: string; phone: string } | null

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
        >
          ← Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-8">
            <ListingGallery
              images={listing.image_urls ?? []}
              title={listing.title_en || listing.title_kr}
            />

            {/* Title & type */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium bg-blue-50 text-[#0071e3] px-2.5 py-1 rounded-full">
                  {TYPE_LABELS[listing.type] ?? listing.type}
                </span>
                <span className="text-xs text-gray-400">{listing.district}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {listing.title_en || listing.title_kr}
              </h1>
              {listing.title_en && listing.title_kr !== listing.title_en && (
                <p className="text-sm text-gray-400 mt-1">{listing.title_kr}</p>
              )}

              {listing.description && (
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{listing.description}</p>
              )}

              {(listing.landmarks || listing.address) && (
                <div className="mt-3 space-y-1.5">
                  {listing.address && (
                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                      <span>📍</span>
                      <span>{listing.address}</span>
                    </p>
                  )}
                  {listing.landmarks && (
                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                      <span>🗺️</span>
                      <span>Near: {listing.landmarks}</span>
                    </p>
                  )}
                </div>
              )}

              {(listing.parking || listing.furnished || listing.pets_allowed) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.parking && (
                    <span className="inline-flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-gray-700">
                      🚗 Parking
                    </span>
                  )}
                  {listing.furnished && (
                    <span className="inline-flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-gray-700">
                      🛋️ Furnished
                    </span>
                  )}
                  {listing.pets_allowed && (
                    <span className="inline-flex items-center gap-1 text-sm bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-gray-700">
                      🐾 Pets Allowed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4">
              {listing.deposit > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Deposit</p>
                  <p className="font-semibold text-gray-900">{formatPrice(listing.deposit)}</p>
                </div>
              )}
              {listing.price > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {listing.type === '매매' ? 'Sale Price' : 'Monthly Rent'}
                  </p>
                  <p className="font-semibold text-gray-900">{formatPrice(listing.price)}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Size</p>
                <p className="font-semibold text-gray-900">{listing.size} ㎡</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Subway</p>
                <p className="font-semibold text-gray-900 text-sm">
                  🚇 {listing.subway_station}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Contract</p>
                <p className="font-semibold text-gray-900">
                  {listing.contract === '단기' ? 'Short-term' : 'Long-term'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <p className="font-semibold text-gray-900">{listing.duration} months</p>
              </div>
            </div>

            {/* Map */}
            {listing.lat && listing.lng && listing.station_lat && listing.station_lng && (
              <ListingMap
                lat={listing.lat}
                lng={listing.lng}
                stationName={listing.subway_station}
                stationLat={listing.station_lat}
                stationLng={listing.station_lng}
                address={listing.address}
              />
            )}

            {/* Agent info */}
            {agent && (agent.company || agent.phone) && (
              <div className="border border-gray-100 rounded-xl p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Listed by</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3] font-semibold text-sm">
                    {agent.company?.[0] ?? '?'}
                  </div>
                  <div>
                    {agent.company && <p className="font-medium text-gray-900">{agent.company}</p>}
                    {agent.phone && <p className="text-sm text-gray-500">{agent.phone}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column — contact form */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact Agent</h2>
              <p className="text-sm text-gray-500 mb-6">Send a message in English — the agent will receive it in Korean.</p>
              <ContactForm listing={listing} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
