import type { Listing } from '@/types'
import { formatPrice } from '@/lib/utils'

interface AgentListingsProps {
  listings: Listing[]
}

const STATUS_LABELS: Record<string, string> = {
  active: '게시 중',
  inactive: '게시 중지',
}

export default function AgentListings({ listings }: AgentListingsProps) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">등록된 매물이 없습니다.</p>
        <p className="text-sm mt-1">새 매물 등록 탭에서 매물을 추가하세요.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {listings.map(listing => (
        <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                listing.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {STATUS_LABELS[listing.status]}
              </span>
              <span className="text-xs text-gray-400">{listing.type}</span>
            </div>
            <p className="font-semibold text-gray-900 truncate">{listing.title_kr}</p>
            <p className="text-sm text-gray-400 truncate">{listing.title_en}</p>
          </div>
          <div className="text-right shrink-0">
            {listing.deposit > 0 && (
              <p className="text-sm text-gray-500">보증금 {formatPrice(listing.deposit)}</p>
            )}
            {listing.price > 0 && (
              <p className="text-sm font-medium text-gray-900">
                {listing.type === '매매' ? '' : '월세 '}{formatPrice(listing.price)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5">{listing.district} · {listing.size}㎡</p>
          </div>
        </div>
      ))}
    </div>
  )
}
