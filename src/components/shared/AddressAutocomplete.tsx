'use client'

import { useEffect, useRef } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onPlaceSelect: (address: string) => void
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
        fields: ['formatted_address'],
        // No types restriction: 'address' excludes many Korean address formats;
        // letting Google return all geocode results gives best coverage.
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        const addr = place.formatted_address ?? ''
        if (!addr) return
        if (inputRef.current) inputRef.current.value = addr
        onChangeRef.current(addr)
        onPlaceSelectRef.current(addr)
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
