'use client'

import { useEffect, useRef } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onPlaceSelect: (address: string) => void
  placeholder?: string
  className?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder,
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onPlaceSelectRef = useRef(onPlaceSelect)

  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect })

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !inputRef.current) return

    function init() {
      if (!inputRef.current || !window.google?.maps?.places) return
      const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'kr' },
        fields: ['formatted_address'],
        types: ['address'],
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        const addr = place.formatted_address ?? ''
        if (addr) onPlaceSelectRef.current(addr)
      })
    }

    if (window.google?.maps?.places) {
      init()
    } else {
      const existing = document.getElementById('gmaps-script')
      if (!existing) {
        const script = document.createElement('script')
        script.id = 'gmaps-script'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ko&region=KR`
        script.async = true
        script.defer = true
        script.onload = init
        document.head.appendChild(script)
      } else {
        existing.addEventListener('load', init)
      }
    }
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
