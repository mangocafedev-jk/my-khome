import type { Listing } from '@/types'
import ListingCard from './ListingCard'

export default function ListingGrid({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No listings available yet.</p>
        <p className="text-sm mt-1">Check back soon — agents are adding properties.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
