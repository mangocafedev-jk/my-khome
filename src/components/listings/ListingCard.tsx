'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { Listing } from '@/types'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import ContactModal from './ContactModal'

interface ListingCardProps {
  listing: Listing
}

const TYPE_LABELS: Record<string, string> = {
  '월세': 'Monthly Rent',
  '전세': 'Jeonse (Lease)',
  '매매': 'For Sale',
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [showContact, setShowContact] = useState(false)

  return (
    <>
      <article className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden">
          {listing.image_urls?.[0] ? (
            <Image
              src={listing.image_urls[0]}
              alt={listing.title_en || listing.title_kr}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <span className="text-5xl">🏠</span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-xs font-medium bg-blue-50 text-[#0071e3] px-2.5 py-1 rounded-full">
              {TYPE_LABELS[listing.type] ?? listing.type}
            </span>
            <span className="text-xs text-gray-400">{listing.district}</span>
          </div>

          <h3 className="font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
            {listing.title_en || listing.title_kr}
          </h3>

          <div className="mt-3 space-y-1">
            {listing.deposit > 0 && (
              <p className="text-sm text-gray-500">
                Deposit: <span className="font-medium text-gray-800">{formatPrice(listing.deposit)}</span>
              </p>
            )}
            {listing.price > 0 && (
              <p className="text-sm text-gray-500">
                {listing.type === '매매' ? 'Price' : 'Monthly'}: <span className="font-medium text-gray-800">{formatPrice(listing.price)}</span>
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
            <span>{listing.size}㎡</span>
            <span>·</span>
            <span>🚇 {listing.subway_station} ({listing.subway_minutes} min)</span>
          </div>

          <Button
            className="w-full mt-4"
            size="sm"
            onClick={() => setShowContact(true)}
          >
            Contact Agent
          </Button>
        </div>
      </article>

      {showContact && (
        <ContactModal listing={listing} onClose={() => setShowContact(false)} />
      )}
    </>
  )
}
