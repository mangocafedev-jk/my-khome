'use client'

import { useEffect, useRef } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onPlaceSelect: (address: string, district?: string) => void
  placeholder?: string
  className?: string
}

// Global callback registry so multiple components can share one script load
declare global {
  interface Window {
    __gmapsCallbacks?: (() => void)[]
    __gmapsReady?: () => void
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onChangeRef = useRef(onChange)
  const onPlaceSelectRef = useRef(onPlaceSelect)

  useEffect(() => { onChangeRef.current = onChange })
  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect })

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !inputRef.current) return

    function initAutocomplete() {
      if (!inputRef.current || !window.google?.maps?.places) return
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'kr' },
        fields: ['name', 'formatted_address', 'address_components'],
        // No types restriction: 'address' excludes many Korean address formats;
        // letting Google return all geocode results gives best coverage.
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()

        console.log('[AddressAutocomplete] place.name:', place.name)
        console.log('[AddressAutocomplete] place.formatted_address:', place.formatted_address)
        console.log('[AddressAutocomplete] place.address_components:', place.address_components)

        const addr = place.formatted_address ?? ''
        if (!addr) {
          console.warn('[AddressAutocomplete] formatted_address is empty — place may not have loaded correctly')
          return
        }

        // Extract 구 name: prefer address_components, fall back to regex on formatted_address
        const districtComponent = place.address_components?.find(c =>
          c.long_name.endsWith('구') &&
          c.types.some(t => t.startsWith('sublocality') || t.startsWith('administrative_area'))
        )
        const district =
          districtComponent?.long_name ??
          (/([가-힣]+구)/.exec(addr)?.[1])

        console.log('[AddressAutocomplete] → setting input to:', addr, '| district:', district)

        if (inputRef.current) inputRef.current.value = addr
        onChangeRef.current(addr)
        onPlaceSelectRef.current(addr, district)
      })
    }

    // Already loaded
    if (window.google?.maps?.places) {
      initAutocomplete()
      return
    }

    // Queue callback — supports multiple components waiting on same script
    if (!window.__gmapsCallbacks) window.__gmapsCallbacks = []
    window.__gmapsCallbacks.push(initAutocomplete)

    if (!window.__gmapsReady) {
      window.__gmapsReady = () => {
        window.__gmapsCallbacks?.forEach(cb => cb())
        window.__gmapsCallbacks = []
      }
    }

    if (!document.getElementById('gmaps-script')) {
      const script = document.createElement('script')
      script.id = 'gmaps-script'
      // callback= is the reliable trigger; async without defer lets it run immediately
      script.src =
        `https://maps.googleapis.com/maps/api/js` +
        `?key=${apiKey}&libraries=places&language=ko&region=KR&callback=__gmapsReady`
      script.async = true
      document.head.appendChild(script)
    }
    // If script tag exists but Places not ready yet, our callback is already queued above
  }, [])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  )
}
