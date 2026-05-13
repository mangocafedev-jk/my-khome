'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Listing } from '@/types'
import { formatPrice } from '@/lib/utils'

const TYPE_LABELS: Record<string, string> = {
  '월세': 'Monthly',
  '전세': 'Jeonse',
  '매매': 'For Sale',
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const title = listing.title_en || listing.title_kr
  const priceValue = listing.price > 0 ? listing.price : listing.deposit > 0 ? listing.deposit : null

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <article
        className="relative overflow-hidden rounded-2xl bg-gray-900 cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
        style={{ aspectRatio: '4/3' }}
      >
        {/* Photo */}
        {listing.image_urls?.[0] ? (
          <Image
            src={listing.image_urls[0]}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-6xl opacity-25">🏠</span>
          </div>
        )}

        {/* Gradient overlay — dark at top & bottom, transparent in middle */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* Top-left: District */}
        {listing.district && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.22)' }}>
              {listing.district}
            </span>
          </div>
        )}

        {/* Top-right: Subway */}
        {listing.subway_station && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.22)' }}>
              🚇 {listing.subway_station}
            </span>
          </div>
        )}

        {/* Center: Title */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          <h3
            className="text-white font-semibold text-sm sm:text-base leading-snug line-clamp-1"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
          >
            {title}
          </h3>
        </div>

        {/* Bottom-left: Price */}
        <div className="absolute bottom-3 left-3">
          {priceValue && (
            <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,113,227,0.88)', backdropFilter: 'blur(6px)' }}>
              {TYPE_LABELS[listing.type] ?? listing.type} · {formatPrice(priceValue)}
            </span>
          )}
        </div>

        {/* Bottom-right: Furnished */}
        <div className="absolute bottom-3 right-3">
          {listing.furnished && (
            <span className="text-xs font-semibold text-white px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.22)' }}>
              🛋️ Furnished
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
