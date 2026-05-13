'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import AddressAutocomplete from '@/components/shared/AddressAutocomplete'
import { createClient } from '@/lib/supabase/client'
import type { Listing } from '@/types'

interface AgentEditListingProps {
  listing: Listing
  onClose: () => void
  onSuccess: () => void
}

const DISTRICTS = ['강남구', '마포구', '용산구', '서초구', '송파구', '종로구', '중구', '성동구', '광진구', '동대문구', '기타']

export default function AgentEditListing({ listing, onClose, onSuccess }: AgentEditListingProps) {
  const [form, setForm] = useState({
    title_kr: listing.title_kr,
    type: listing.type,
    price: String(listing.price),
    deposit: String(listing.deposit),
    size: String(listing.size),
    district: listing.district,
    subway_station: listing.subway_station,
    subway_minutes: String(listing.subway_minutes),
    contract: listing.contract,
    duration: String(listing.duration),
    status: listing.status,
    address: listing.address ?? '',
    lat: listing.lat ? String(listing.lat) : '',
    lng: listing.lng ? String(listing.lng) : '',
    station_lat: listing.station_lat ? String(listing.station_lat) : '',
    station_lng: listing.station_lng ? String(listing.station_lng) : '',
  })
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')
  const [geocodeDone, setGeocodeDone] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>(listing.image_urls ?? [])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleGeocode = async (addressOverride?: string) => {
    const addr = addressOverride ?? form.address
    if (!addr.trim()) return
    setGeocoding(true)
    setGeocodeError('')
    setGeocodeDone(false)
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '검색 실패')
      setForm(f => ({
        ...f,
        lat: String(data.lat),
        lng: String(data.lng),
        subway_station: data.stationName,
        subway_minutes: String(data.walkingMinutes),
        station_lat: String(data.stationLat),
        station_lng: String(data.stationLng),
      }))
      setGeocodeDone(true)
    } catch (err: unknown) {
      setGeocodeError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const uploaded: string[] = []
      for (const file of files) {
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
      setImageUrls(prev => [...prev, ...uploaded])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price) || 0,
          deposit: parseInt(form.deposit) || 0,
          size: parseFloat(form.size) || 0,
          subway_minutes: parseInt(form.subway_minutes) || 0,
          duration: parseInt(form.duration) || 12,
          lat: form.lat ? parseFloat(form.lat) : null,
          lng: form.lng ? parseFloat(form.lng) : null,
          station_lat: form.station_lat ? parseFloat(form.station_lat) : null,
          station_lng: form.station_lng ? parseFloat(form.station_lng) : null,
          image_urls: imageUrls,
        }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || '수정에 실패했습니다.')
      }
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-8"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-sm"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">매물 수정</h2>
        <p className="text-sm text-gray-500 mb-6">제목을 변경하면 영어로 자동 재번역됩니다.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address + geocode */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">매물 주소</label>
            <div className="flex gap-2">
              <AddressAutocomplete
                value={form.address}
                onChange={v => { set('address', v); setGeocodeDone(false) }}
                onPlaceSelect={(addr, district) => {
                set('address', addr)
                if (district) set('district', DISTRICTS.includes(district) ? district : '기타')
                handleGeocode(addr)
              }}
                placeholder="예: 서울 강남구 삼성동 123-45"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
              />
              <button
                type="button"
                onClick={() => handleGeocode()}
                disabled={geocoding || !form.address.trim()}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#0071e3] text-white text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 transition-colors"
              >
                {geocoding ? '검색 중…' : '자동 입력'}
              </button>
            </div>
            {geocodeError && <p className="text-xs text-red-500 mt-1">{geocodeError}</p>}
            {geocodeDone && (
              <p className="text-xs text-green-600 mt-1">
                ✓ 지하철역 자동 입력 완료 — {form.subway_station} ({form.subway_minutes}분)
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">매물 제목 (한국어)</label>
            <input
              type="text"
              value={form.title_kr}
              onChange={e => set('title_kr', e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">게시 상태</label>
            <div className="flex gap-2">
              {(['active', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                    form.status === s
                      ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s === 'active' ? '게시 중' : '게시 중지'}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">매물 사진</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imageUrls.map(url => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image src={url} alt="매물 사진" fill className="object-cover" sizes="200px" />
                    <button
                      type="button"
                      onClick={() => setImageUrls(prev => prev.filter(u => u !== url))}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-xl border-2 border-dashed border-gray-200 py-5 text-sm text-gray-400 hover:border-[#0071e3] hover:text-[#0071e3] transition-colors disabled:opacity-50"
            >
              {uploading ? '업로드 중…' : '+ 사진 추가 (여러 장 선택 가능)'}
            </button>
          </div>

          {/* Type */}
          <div className="grid grid-cols-3 gap-3">
            {(['월세', '전세', '매매'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.type === t
                    ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Price / Deposit */}
          <div className="grid grid-cols-2 gap-4">
            {form.type !== '매매' && (
              <Input
                id="edit-deposit"
                label="보증금 (만원)"
                type="number"
                value={form.deposit}
                onChange={e => set('deposit', e.target.value)}
              />
            )}
            <Input
              id="edit-price"
              label={form.type === '매매' ? '매매가 (만원)' : form.type === '전세' ? '전세금 (만원)' : '월세 (만원)'}
              type="number"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              required
            />
          </div>

          {/* Size / District */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="edit-size"
              label="면적 (㎡)"
              type="number"
              value={form.size}
              onChange={e => set('size', e.target.value)}
              required
            />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">지역구</label>
              <select
                value={form.district}
                onChange={e => set('district', e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Subway */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="edit-subway"
              label="인근 지하철역"
              value={form.subway_station}
              onChange={e => set('subway_station', e.target.value)}
              required
            />
            <Input
              id="edit-subway-min"
              label="도보 소요 시간 (분)"
              type="number"
              value={form.subway_minutes}
              onChange={e => set('subway_minutes', e.target.value)}
              required
            />
          </div>

          {/* Contract */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">계약 유형</label>
              <div className="flex gap-2">
                {(['단기', '장기'] as const).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('contract', c)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${
                      form.contract === c
                        ? 'border-[#0071e3] bg-[#0071e3]/5 text-[#0071e3]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <Input
              id="edit-duration"
              label="계약 기간 (개월)"
              type="number"
              value={form.duration}
              onChange={e => set('duration', e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || uploading}>
              {loading ? '저장 중…' : '저장하기'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
