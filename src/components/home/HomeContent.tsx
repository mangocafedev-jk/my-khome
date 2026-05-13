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

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Filter bar */}
      <div
        id="listings"
        className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
      >
        {/* District dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">District</span>
          <select
            value={district}
            onChange={e => setDistrict(e.target.value)}
            className="w-full sm:w-auto text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
          >
            <option value="all">All Districts</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Type pills */}
        <div className="grid grid-cols-4 sm:flex items-center gap-1.5 w-full sm:w-auto">
          {TYPE_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`w-full sm:w-auto text-sm px-3 py-2 rounded-xl font-medium transition-colors text-center ${
                type === opt.value
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Contract pills */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto">
          {CONTRACT_OPTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setContract(opt.value)}
              className={`w-full sm:w-auto text-sm px-3 py-2 rounded-xl font-medium transition-colors text-center ${
                contract === opt.value
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Available Listings</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} · Prices in Korean Won (KRW). Contact agents directly in English.
        </p>
      </div>

      <ListingGrid listings={filtered} />
    </main>
  )
}
