'use client'

import { useState, useMemo } from 'react'
import type { Listing, ListingType, ContractType } from '@/types'
import ListingGrid from '@/components/listings/ListingGrid'

const TYPE_OPTS: { value: ListingType | 'all'; label: string }[] = [
  { value: 'all',  label: 'All Types' },
  { value: '월세', label: 'Monthly Rent' },
  { value: '전세', label: 'Jeonse' },
  { value: '매매', label: 'For Sale' },
]

const CONTRACT_OPTS: { value: ContractType | 'all'; label: string }[] = [
  { value: 'all',  label: 'Any Duration' },
  { value: '단기', label: 'Short-term' },
  { value: '장기', label: 'Long-term' },
]

const selectClass =
  'w-full appearance-none text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2.5 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors hover:border-gray-300'

export default function HomeContent({ listings }: { listings: Listing[] }) {
  const [district, setDistrict] = useState('all')
  const [type, setType] = useState<ListingType | 'all'>('all')
  const [contract, setContract] = useState<ContractType | 'all'>('all')

  const districts = useMemo(
    () => [...new Set(listings.map(l => l.district).filter(Boolean))].sort(),
    [listings]
  )

  const filtered = useMemo(
    () =>
      listings.filter(l => {
        if (district !== 'all' && l.district !== district) return false
        if (type !== 'all' && l.type !== type) return false
        if (contract !== 'all' && l.contract !== contract) return false
        return true
      }),
    [listings, district, type, contract]
  )

  const activeCount = [type !== 'all', contract !== 'all', district !== 'all'].filter(Boolean).length

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Filter bar */}
      <div id="listings" className="mb-10 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-2.5">

          {/* Type */}
          <div className="relative">
            <select
              value={type}
              onChange={e => setType(e.target.value as ListingType | 'all')}
              className={selectClass}
            >
              {TYPE_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>

          {/* Contract */}
          <div className="relative">
            <select
              value={contract}
              onChange={e => setContract(e.target.value as ContractType | 'all')}
              className={selectClass}
            >
              {CONTRACT_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>

          {/* District */}
          <div className="relative">
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>

        </div>

        {/* Active filter reset */}
        {activeCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">{activeCount} filter{activeCount > 1 ? 's' : ''} active</span>
            <button
              onClick={() => { setType('all'); setContract('all'); setDistrict('all') }}
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
