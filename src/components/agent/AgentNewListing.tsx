'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface AgentNewListingProps {
  agentId: string
  onSuccess: () => void
}

const DISTRICTS = ['강남구', '마포구', '용산구', '서초구', '송파구', '종로구', '중구', '성동구', '광진구', '동대문구', '기타']

export default function AgentNewListing({ onSuccess }: AgentNewListingProps) {
  const [form, setForm] = useState({
    title_kr: '',
    type: '월세' as '월세' | '전세' | '매매',
    price: '',
    deposit: '',
    size: '',
    district: '강남구',
    subway_station: '',
    subway_minutes: '',
    contract: '장기' as '단기' | '장기',
    duration: '12',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, value: string) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price) || 0,
          deposit: parseInt(form.deposit) || 0,
          size: parseFloat(form.size) || 0,
          subway_minutes: parseInt(form.subway_minutes) || 0,
          duration: parseInt(form.duration) || 12,
        }),
      })
      if (!res.ok) throw new Error('등록에 실패했습니다.')
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">새 매물 등록</h2>
      <p className="text-sm text-gray-500 mb-8">한국어로 입력하시면 영어로 자동 번역되어 외국인 고객에게 표시됩니다.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">매물 제목 (한국어)</label>
          <input
            type="text"
            placeholder="예: 강남구 삼성동 원룸, 풀옵션, 역 5분"
            value={form.title_kr}
            onChange={e => set('title_kr', e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          {form.type !== '매매' && (
            <Input
              id="deposit"
              label="보증금 (만원)"
              type="number"
              placeholder="5000"
              value={form.deposit}
              onChange={e => set('deposit', e.target.value)}
            />
          )}
          <Input
            id="price"
            label={form.type === '매매' ? '매매가 (만원)' : form.type === '전세' ? '전세금 (만원)' : '월세 (만원)'}
            type="number"
            placeholder={form.type === '월세' ? '80' : '30000'}
            value={form.price}
            onChange={e => set('price', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="size"
            label="면적 (㎡)"
            type="number"
            placeholder="33.5"
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="subway_station"
            label="인근 지하철역"
            placeholder="삼성역"
            value={form.subway_station}
            onChange={e => set('subway_station', e.target.value)}
            required
          />
          <Input
            id="subway_minutes"
            label="도보 소요 시간 (분)"
            type="number"
            placeholder="5"
            value={form.subway_minutes}
            onChange={e => set('subway_minutes', e.target.value)}
            required
          />
        </div>

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
            id="duration"
            label="계약 기간 (개월)"
            type="number"
            placeholder="12"
            value={form.duration}
            onChange={e => set('duration', e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '등록 중… (영어 번역 포함)' : '매물 등록하기'}
        </Button>
      </form>
    </div>
  )
}
