'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Listing } from '@/types'
import { formatPrice } from '@/lib/utils'
import AgentEditListing from './AgentEditListing'

const STATUS_LABELS: Record<string, string> = {
  active: '게시 중',
  inactive: '게시 중지',
}

export default function AgentListings({ listings }: { listings: Listing[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Listing | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async (id: string) => {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || '삭제에 실패했습니다.')
      }
      setConfirmDeleteId(null)
      router.refresh()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">등록된 매물이 없습니다.</p>
        <p className="text-sm mt-1">새 매물 등록 탭에서 매물을 추가하세요.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {listings.map(listing => (
          <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            {/* Listing info row */}
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    listing.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
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

            {/* Action row */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {confirmDeleteId === listing.id ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">정말 삭제하시겠습니까?</p>
                    {deleteError && (
                      <p className="text-xs text-red-500 mt-0.5">{deleteError}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setConfirmDeleteId(null); setDeleteError('') }}
                      className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleting}
                      className="text-sm px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleting ? '삭제 중…' : '삭제 확인'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditing(listing)}
                    className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => { setConfirmDeleteId(listing.id); setDeleteError('') }}
                    className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors font-medium"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <AgentEditListing
          listing={editing}
          onClose={() => setEditing(null)}
          onSuccess={() => {
            setEditing(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
