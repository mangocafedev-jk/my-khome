'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// ---------------------------------------------------------------------------
// Slideshow
// ---------------------------------------------------------------------------

const HERO_IMAGES = [
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-1.jpg',
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-2.jpg',
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-3.jpg',
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-4.jpg',
]

function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % HERO_IMAGES.length)
        setFading(false)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Images — stack all, show active via opacity */}
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current && !fading ? 1 : i === current ? 0 : 0 }}
        >
          <Image
            src={src}
            alt={`Seoul hero ${i + 1}`}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Dot navigation */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 25 }}>
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFading(false); setCurrent(i) }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 20 : 7,
              height: 7,
              background: i === current ? 'white' : 'rgba(255,255,255,0.45)',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Floating emojis
// ---------------------------------------------------------------------------

const FLOAT_EMOJIS = ['🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🔑']

interface FloatItem {
  id: number; emoji: string; size: number; left: number; duration: number; delay: number
}

function FloatingEmojis() {
  const [items, setItems] = useState<FloatItem[] | null>(null)

  useEffect(() => {
    setItems(
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        emoji: FLOAT_EMOJIS[i % FLOAT_EMOJIS.length],
        size: 24 + Math.random() * 24,
        left: 5 + Math.random() * 90,
        duration: 6 + Math.random() * 8,
        delay: -(Math.random() * 14),
      }))
    )
  }, [])

  if (!items) return null

  return (
    <>
      <style>{`
        @keyframes floatUpEmoji {
          0%   { transform: translateY(0);      opacity: 0;    }
          8%   { opacity: 0.45; }
          75%  { opacity: 0.45; }
          100% { transform: translateY(-100vh); opacity: 0;    }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        {items.map(item => (
          <span
            key={item.id}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${item.left}%`,
              fontSize: `${item.size}px`,
              lineHeight: 1,
              userSelect: 'none',
              animation: `floatUpEmoji ${item.duration}s linear ${item.delay}s infinite`,
            }}
          >
            {item.emoji}
          </span>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Typing subtitle
// ---------------------------------------------------------------------------

const TYPING_TEXT = 'The language barrier stops here.'

function TypingSubtitle() {
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < TYPING_TEXT.length) {
      timer = setTimeout(() => setDisplayed(TYPING_TEXT.slice(0, displayed.length + 1)), 55)
    } else if (!deleting && displayed.length === TYPING_TEXT.length) {
      timer = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(TYPING_TEXT.slice(0, displayed.length - 1)), 30)
    } else if (deleting && displayed.length === 0) {
      timer = setTimeout(() => setDeleting(false), 500)
    }

    return () => clearTimeout(timer)
  }, [displayed, deleting])

  return (
    <p className="text-base sm:text-xl font-bold mb-7 sm:mb-10 text-white">
      {displayed}
      <span className="animate-pulse">|</span>
    </p>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export default function Hero() {
  return (
    <section className="relative overflow-hidden h-[70vh] sm:h-[90vh] min-h-[480px] sm:min-h-[580px]">
      {/* Slideshow background + overlay + dots */}
      <HeroSlideshow />

      {/* Floating emoji layer */}
      <FloatingEmojis />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-start sm:justify-center pt-[16px] sm:pt-0 px-5 sm:px-8 text-center">
        <h1
          className="text-[1.75rem] sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-3 sm:mb-4 max-w-3xl w-full break-words"
          style={{ color: 'white' }}
        >
          Find Your K-Home
          <br />
          <span style={{ color: '#FF6B35' }}>in Your Language.</span>
        </h1>

        <TypingSubtitle />

        <TranslationDemo />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// iMessage translation demo
// ---------------------------------------------------------------------------

type DemoStep = 0 | 1 | 2 | 3 | 4 | 5

function TranslationDemo() {
  const [step, setStep] = useState<DemoStep>(0)

  useEffect(() => {
    const durations = [1200, 600, 1300, 700, 700, 3000]
    let current = 0
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      current = (current + 1) % 6
      setStep(current as DemoStep)
      timer = setTimeout(tick, durations[current])
    }

    timer = setTimeout(tick, durations[0])
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
      `}</style>
      <div
        className="w-full max-w-[272px] sm:max-w-xs text-left"
        style={{
          background: '#1c1c1e',
          borderRadius: '32px',
          border: '1px solid rgba(255,255,255,0.15)',
          padding: '16px',
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col items-center mb-3 pb-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-base mb-1">🏢</div>
          <p className="text-white font-semibold text-sm leading-tight">Korean Agent</p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>via MyKHome</p>
        </div>

        {/* Messages */}
        <div className="space-y-1">

          {/* Renter → right, blue */}
          <div className="flex justify-end">
            <div
              className="text-white text-sm px-3 py-2"
              style={{ background: '#0a84ff', borderRadius: '18px 18px 4px 18px', maxWidth: '85%' }}
            >
              Is this still available?
              {step === 0 && <span className="ml-0.5 animate-pulse">|</span>}
            </div>
          </div>

          {/* Auto-translated to Korean */}
          <div className="flex justify-end" style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.3s' }}>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(52,199,89,0.9)' }}>
              🌐 Auto-translated to Korean
            </span>
          </div>

          {/* Agent typing dots or message */}
          <div className="flex justify-start" style={{ minHeight: 36 }}>
            {step === 2 && (
              <div
                className="flex items-center gap-1 px-4 py-3"
                style={{ background: '#2c2c2e', borderRadius: '18px 18px 18px 4px' }}
              >
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{
                      background: 'rgba(255,255,255,0.45)',
                      animation: `dotBounce 0.9s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            {step >= 3 && (
              <div
                className="text-white text-sm px-3 py-2"
                style={{ background: '#2c2c2e', borderRadius: '18px 18px 18px 4px', maxWidth: '85%' }}
              >
                네, 가능합니다! 이번 주 방문 어떠세요?
              </div>
            )}
          </div>

          {/* Auto-translated to English */}
          <div className="flex justify-start" style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.3s' }}>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(52,199,89,0.9)' }}>
              🌐 Auto-translated to English
            </span>
          </div>

          {/* English reply → right, blue */}
          <div className="flex justify-end" style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.3s' }}>
            <div
              className="text-white text-sm px-3 py-2"
              style={{ background: '#0a84ff', borderRadius: '18px 18px 4px 18px', maxWidth: '85%' }}
            >
              Yes! How about a visit this week?
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
