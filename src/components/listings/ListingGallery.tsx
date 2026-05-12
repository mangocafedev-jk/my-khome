'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ListingGalleryProps {
  images: string[]
  title: string
}

export default function ListingGallery({ images, title }: ListingGalleryProps) {
  const [current, setCurrent] = useState(0)

  if (!images.length) {
    return (
      <div className="w-full h-72 sm:h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center">
        <span className="text-7xl">🏠</span>
      </div>
    )
  }

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length)
  const next = () => setCurrent(i => (i + 1) % images.length)

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
        <Image
          src={images[current]}
          alt={`${title} — photo ${current + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="Next photo"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === current ? 'border-[#0071e3]' : 'border-transparent'
              }`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
