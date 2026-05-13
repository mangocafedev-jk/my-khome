'use client'

import { useEffect, useRef } from 'react'

interface ListingMapProps {
  lat: number
  lng: number
  stationName: string
  stationLat: number
  stationLng: number
  walkingMinutes: number
  address?: string
}

// Light map style — less visual noise than the dark hero style
const LIGHT_STYLES = [
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

function circleSvg(emoji: string, border: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
    <circle cx="22" cy="22" r="20" fill="white" stroke="${border}" stroke-width="2.5"/>
    <text x="22" y="29" text-anchor="middle" font-size="20">${emoji}</text>
  </svg>`
}

function walkLabelSvg(minutes: number): string {
  const text = `Walk ${minutes} min`
  const w = text.length * 7 + 24
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="26">
    <rect x="1" y="1" width="${w - 2}" height="22" rx="11" fill="white" stroke="#0071e3" stroke-width="1.5"/>
    <text x="${w / 2}" y="15.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="600" fill="#0071e3">${text}</text>
  </svg>`
}

export default function ListingMap({
  lat, lng, stationName, stationLat, stationLng, walkingMinutes, address,
}: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !mapRef.current || initialized.current) return

    function initMap() {
      if (!mapRef.current || !window.google?.maps) return
      initialized.current = true

      const { maps } = window.google

      const map = new maps.Map(mapRef.current, {
        center: { lat: (lat + stationLat) / 2, lng: (lng + stationLng) / 2 },
        zoom: 15,
        gestureHandling: 'cooperative',
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: LIGHT_STYLES,
      })

      // 🏠 listing marker
      const homeW = 44
      new maps.Marker({
        position: { lat, lng },
        map,
        title: '매물 위치',
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(circleSvg('🏠', '#0071e3'))}`,
          scaledSize: new maps.Size(homeW, homeW),
          anchor: new maps.Point(homeW / 2, homeW / 2),
        },
      })

      // 🚇 station marker
      const stationW = 44
      new maps.Marker({
        position: { lat: stationLat, lng: stationLng },
        map,
        title: stationName,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(circleSvg('🚇', '#FF6B35'))}`,
          scaledSize: new maps.Size(stationW, stationW),
          anchor: new maps.Point(stationW / 2, stationW / 2),
        },
      })

      // Dashed polyline
      new maps.Polyline({
        path: [{ lat, lng }, { lat: stationLat, lng: stationLng }],
        geodesic: true,
        strokeColor: '#0071e3',
        strokeOpacity: 0,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.8,
            scale: 3,
            strokeColor: '#0071e3',
          },
          offset: '0',
          repeat: '14px',
        }],
        map,
      })

      // Walk time label at midpoint
      const midLat = (lat + stationLat) / 2
      const midLng = (lng + stationLng) / 2
      const labelSvg = walkLabelSvg(walkingMinutes)
      const labelW = walkingMinutes.toString().length * 7 + ('Walk  min'.length * 7) + 24
      new maps.Marker({
        position: { lat: midLat, lng: midLng },
        map,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(labelSvg)}`,
          scaledSize: new maps.Size(labelW, 26),
          anchor: new maps.Point(labelW / 2, 13),
        },
      })
    }

    if (window.google?.maps) {
      initMap()
    } else {
      const existing = document.getElementById('gmaps-script')
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'gmaps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&region=US`
        script.async = true
        script.defer = true
        script.onload = initMap
        document.head.appendChild(script)
      } else {
        existing.addEventListener('load', initMap)
      }
    }
  }, [lat, lng, stationLat, stationLng, walkingMinutes])

  const destination = address ?? `${lat},${lng}`
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${encodeURIComponent(stationName)}` +
    `&destination=${encodeURIComponent(destination)}` +
    `&travelmode=walking`

  return (
    <div>
      <div ref={mapRef} className="w-full rounded-2xl overflow-hidden" style={{ height: 280 }} />
      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-gray-400">
          🏠 Property &nbsp;·&nbsp; 🚇 {stationName} &nbsp;·&nbsp; {walkingMinutes} min walk
        </p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0071e3] text-white text-xs font-medium hover:bg-[#0077ed] transition-colors shrink-0"
        >
          Get Directions
        </a>
      </div>
    </div>
  )
}
