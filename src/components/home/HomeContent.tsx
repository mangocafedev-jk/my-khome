'use client'

import { useState, useMemo } from 'react'
import type { Listing } from '@/types'
import ListingGrid from '@/components/listings/ListingGrid'

const PRICE_OPTS = [
  { value: 'all',  label: 'All Prices' },
  { value: 'u500', label: 'Under ₩500K' },
  { value: 'u1m',  label: 'Under ₩1M' },
  { value: 'u2m',  label: 'Under ₩2M' },
  { value: '2m+',  label: '₩2M+' },
]

const selectClass =
  'w-full appearance-none text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors hover:border-gray-300'

function matchesPrice(price: number, filter: string): boolean {
  // price is in 만원 units (e.g. 50 = 50만원, 100 = 100만원)
  switch (filter) {
    case 'u500': return price < 50   // under 50만원 = under ₩500K
    case 'u1m':  return price < 100  // under 100만원 = under ₩1M
    case 'u2m':  return price < 200  // under 200만원 = under ₩2M
    case '2m+':  return price >= 200
    default:     return true
  }
}

export default function HomeContent({ listings }: { listings: Listing[] }) {
  const [district, setDistrict]   = useState('all')
  const [station, setStation]     = useState('all')
  const [price, setPrice]         = useState('all')

  const districts = useMemo(
    () => [...new Set(listings.map(l => l.district).filter(Boolean))].sort(),
    [listings]
  )

  const stations = useMemo(
    () => [...new Set(listings.map(l => l.subway_station).filter(Boolean))].sort(),
    [listings]
  )

  const filtered = useMemo(
    () =>
      listings.filter(l => {
        if (district !== 'all' && l.district !== district) return false
        if (station  !== 'all' && l.subway_station !== station) return false
        if (!matchesPrice(l.price, price)) return false
        return true
      }),
    [listings, district, station, price]
  )

  const activeCount = [district !== 'all', station !== 'all', price !== 'all'].filter(Boolean).length

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Filter bar */}
      <div id="listings" className="mb-10 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-2.5">

          {/* District */}
          <div className="relative">
            <select value={district} onChange={e => setDistrict(e.target.value)} className={selectClass}>
              <option value="all">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronIcon />
          </div>

          {/* Subway Station */}
          <div className="relative">
            <select value={station} onChange={e => setStation(e.target.value)} className={selectClass}>
              <option value="all">All Stations</option>
              {stations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronIcon />
          </div>

          {/* Price */}
          <div className="relative">
            <select value={price} onChange={e => setPrice(e.target.value)} className={selectClass}>
              {PRICE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronIcon />
          </div>

        </div>

        {/* Active filter reset */}
        {activeCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">{activeCount} filter{activeCount > 1 ? 's' : ''} active</span>
            <button
              onClick={() => { setDistrict('all'); setStation('all'); setPrice('all') }}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Available Listings</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Prices in Korean Won (KRW). Contact agents directly in English.
        </p>
      </div>

      <ListingGrid listings={filtered} />
    </main>
  )
}

function ChevronIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      width="14" height="14" viewBox="0 0 14 14" fill="none"
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
