'use client'

import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import type { Listing } from '@/types'

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (div: HTMLElement, opts: object) => object
        Marker: new (opts: object) => object
        Size: new (w: number, h: number) => unknown
        Point: new (x: number, y: number) => unknown
      }
    }
  }
}

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  '강남구': { lat: 37.5172, lng: 127.0473 },
  '서초구': { lat: 37.4837, lng: 127.0324 },
  '마포구': { lat: 37.5636, lng: 126.9089 },
  '용산구': { lat: 37.5324, lng: 126.9946 },
  '이태원': { lat: 37.5340, lng: 126.9943 },
  '송파구': { lat: 37.5145, lng: 127.1059 },
  '종로구': { lat: 37.5740, lng: 126.9790 },
  '중구':   { lat: 37.5641, lng: 126.9979 },
  '노원구': { lat: 37.6542, lng: 127.0568 },
  '은평구': { lat: 37.6029, lng: 126.9292 },
  '성북구': { lat: 37.5894, lng: 127.0167 },
  '광진구': { lat: 37.5386, lng: 127.0824 },
  '동대문구': { lat: 37.5744, lng: 127.0396 },
  '성동구': { lat: 37.5511, lng: 127.0410 },
  '영등포구': { lat: 37.5263, lng: 126.8961 },
  '구로구': { lat: 37.4955, lng: 126.8876 },
  '서대문구': { lat: 37.5794, lng: 126.9368 },
  '동작구': { lat: 37.5124, lng: 126.9393 },
  '관악구': { lat: 37.4784, lng: 126.9516 },
  '강서구': { lat: 37.5509, lng: 126.8496 },
}

const LANDMARKS = [
  { name: 'Hongdae', lat: 37.5560, lng: 126.9237 },
  { name: 'Itaewon', lat: 37.5340, lng: 126.9943 },
  { name: 'Gangnam', lat: 37.4979, lng: 127.0276 },
]

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#FFD600' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#FFD600' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#262650' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a38' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#607080' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a6a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0a060' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1b2e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d5470' }] },
]

type AnimStep = 0 | 1 | 2 | 3 | 4

function priceSvg(text: string): string {
  const w = Math.max(80, text.length * 9 + 24)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="30">
    <rect x="1" y="1" width="${w - 2}" height="22" rx="11" fill="#FFD600" stroke="rgba(0,0,0,0.18)" stroke-width="1.5"/>
    <text x="${w / 2}" y="15.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="10.5" font-weight="700" fill="#111111">${text}</text>
    <polygon points="${w / 2 - 5},23 ${w / 2 + 5},23 ${w / 2},30" fill="#FFD600"/>
  </svg>`
}

function landmarkSvg(name: string): string {
  const w = name.length * 8 + 24
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="24">
    <rect x="0" y="0" width="${w}" height="22" rx="4" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.30)" stroke-width="1"/>
    <text x="${w / 2}" y="15" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="600" fill="rgba(255,255,255,0.85)">${name}</text>
  </svg>`
}

export default function Hero({ listings = [] }: { listings?: Listing[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapReady = useRef(false)
  const [step, setStep] = useState<AnimStep>(0)

  // Translation demo animation loop
  useEffect(() => {
    const durations: number[] = [1800, 700, 2000, 700, 2400]
    let current = 0
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      current = (current + 1) % 5
      setStep(current as AnimStep)
      timer = setTimeout(tick, durations[current])
    }

    timer = setTimeout(tick, durations[0])
    return () => clearTimeout(timer)
  }, [])

  // Google Maps initialization
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !mapRef.current || mapReady.current) return

    function initMap() {
      if (!mapRef.current || !window.google?.maps) return
      mapReady.current = true

      const { maps } = window.google
      const map = new maps.Map(mapRef.current, {
        center: { lat: 37.5665, lng: 126.9780 },
        zoom: 12,
        disableDefaultUI: true,
        gestureHandling: 'none',
        clickableIcons: false,
        styles: MAP_STYLES,
      })

      // Price pins
      const seen: Record<string, number> = {}
      listings.forEach(listing => {
        const base = DISTRICT_COORDS[listing.district]
        if (!base) return
        seen[listing.district] = (seen[listing.district] ?? 0) + 1
        const angle = seen[listing.district] * 1.9
        const r = seen[listing.district] > 1 ? 0.006 : 0
        const pos = { lat: base.lat + r * Math.sin(angle), lng: base.lng + r * Math.cos(angle) }
        const text = formatPrice(listing.price)
        const w = Math.max(80, text.length * 9 + 24)
        new maps.Marker({
          position: pos,
          map,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(priceSvg(text))}`,
            scaledSize: new maps.Size(w, 30),
            anchor: new maps.Point(w / 2, 30),
          },
        })
      })

      // Landmark labels
      LANDMARKS.forEach(lm => {
        const w = lm.name.length * 8 + 24
        new maps.Marker({
          position: { lat: lm.lat, lng: lm.lng },
          map,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(landmarkSvg(lm.name))}`,
            scaledSize: new maps.Size(w, 24),
            anchor: new maps.Point(w / 2, 11),
          },
        })
      })
    }

    if (window.google?.maps) {
      initMap()
    } else {
      const existing = document.getElementById('gmaps-script')
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'gmaps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=en&region=US`
        script.async = true
        script.defer = true
        script.onload = initMap
        document.head.appendChild(script)
      } else {
        existing.addEventListener('load', initMap)
      }
    }
  }, [listings])

  return (
    <section className="relative overflow-hidden" style={{ height: '90vh', minHeight: 580 }}>
      {/* Map background */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(8,8,28,0.45) 0%, rgba(8,8,28,0.32) 60%, rgba(8,8,28,0.52) 100%)' }}
      />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-5 sm:px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium mb-5 sm:mb-6"
          style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.88)' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          English-friendly real estate in Seoul
        </div>

        {/* Title */}
        <h1
          className="text-[1.75rem] sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-3 sm:mb-4 max-w-3xl w-full break-words"
          style={{ color: 'white' }}
        >
          Find Your K-Home
          <br />
          <span style={{ color: '#FF6B35' }}>in Your Language.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl font-bold mb-7 sm:mb-10 text-cyan-400">
          The language barrier stops here.
        </p>

        {/* Translation demo */}
        <TranslationDemo step={step} />

      </div>
    </section>
  )
}

function TranslationDemo({ step }: { step: AnimStep }) {
  return (
    <div
      className="w-full max-w-xs sm:max-w-sm text-left rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3"
      style={{
        background: 'rgba(8,8,28,0.72)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(14px)',
      }}
    >
      {/* User message */}
      <div>
        <div className="text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.42)' }}>
          Renter (English)
        </div>
        <div
          className="rounded-xl px-3 py-2 text-xs sm:text-sm text-white flex items-center"
          style={{ background: 'rgba(59,130,246,0.22)', border: '1px solid rgba(59,130,246,0.30)' }}
        >
          Is this apartment still available?
          {step === 0 && (
            <span
              className="ml-1 inline-block w-0.5 h-3.5 animate-pulse"
              style={{ background: 'rgba(255,255,255,0.7)' }}
            />
          )}
        </div>
      </div>

      {/* → Auto-translated to Korean */}
      <div style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.35s' }}>
        <div className="text-xs flex items-start gap-1.5 font-medium" style={{ color: 'rgba(52,211,153,0.85)' }}>
          <span className="flex-shrink-0 mt-px">→</span>
          <span>Auto-translated to Korean</span>
        </div>
      </div>

      {/* Agent Korean reply */}
      <div style={{ opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.35s' }}>
        <div className="text-xs mb-1.5 font-medium" style={{ color: 'rgba(255,255,255,0.42)' }}>
          에이전트 (한국어)
        </div>
        <div
          className="rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          네, 아직 가능합니다! 이번 주 방문 어떠세요?
        </div>
      </div>

      {/* → Agent replies in Korean → Auto-translated to English */}
      <div style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.35s' }}>
        <div className="text-xs flex items-start gap-1.5 font-medium" style={{ color: 'rgba(52,211,153,0.85)' }}>
          <span className="flex-shrink-0 mt-px">→</span>
          <span>Agent replies in Korean → Auto-translated to English</span>
        </div>
      </div>

      {/* English translation */}
      <div style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.35s' }}>
        <div
          className="rounded-xl px-3 py-2 text-xs sm:text-sm text-white"
          style={{ background: 'rgba(59,130,246,0.22)', border: '1px solid rgba(59,130,246,0.30)' }}
        >
          Yes, still available! How about a visit this week?
        </div>
      </div>
    </div>
  )
}
