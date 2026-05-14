'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

// ---------------------------------------------------------------------------
// Slideshow (presentational)
// ---------------------------------------------------------------------------

const HERO_IMAGES = [
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-1.jpg',
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-2.jpg',
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-3.jpg',
  'https://ofegfzioxecawoyeucbo.supabase.co/storage/v1/object/public/hero-images/khome-hero-4.jpg',
]

function HeroSlideshow({
  current,
  fading,
  onDotClick,
}: {
  current: number
  fading: boolean
  onDotClick: (i: number) => void
}) {
  return (
    <>
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current && !fading ? 1 : 0 }}
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
            onClick={() => onDotClick(i)}
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
    } else {
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
  const [current, setCurrent] = useState(0)
  const [fading, setFading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const advanceCount = useRef(0)

  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 640px)').matches
    if (isDesktop) setShowDemo(true)

    let timerId: ReturnType<typeof setTimeout>

    function advance() {
      setFading(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % HERO_IMAGES.length)
        setFading(false)
      }, 600)
    }

    function next() {
      advance()
      advanceCount.current += 1

      // Mobile: after cycling through all images once, reveal the demo
      if (!isDesktop && advanceCount.current === HERO_IMAGES.length) {
        setShowDemo(true)
      }

      const stillIntro = !isDesktop && advanceCount.current < HERO_IMAGES.length
      timerId = setTimeout(next, stillIntro ? 3000 : 5000)
    }

    // First advance: 3s on mobile intro, 5s on desktop
    timerId = setTimeout(next, isDesktop ? 5000 : 3000)
    return () => clearTimeout(timerId)
  }, [])

  return (
    <section className="relative overflow-hidden h-[70vh] sm:h-[90vh] min-h-[480px] sm:min-h-[580px]">
      {/* Slideshow background + overlay + dots */}
      <HeroSlideshow current={current} fading={fading} onDotClick={setCurrent} />

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

        {/* Chat demo — hidden on mobile until intro done */}
        <div
          style={{
            opacity: showDemo ? 1 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: showDemo ? 'auto' : 'none',
          }}
        >
          <TranslationDemo />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// iMessage translation demo
// ---------------------------------------------------------------------------

const DEMO_MSGS = [
  {
    side: 'right' as const,
    text: 'Is this apartment still available?',
    transLabel: '🌐 Korean',
    translation: '이 아파트 아직 가능한가요?',
  },
  {
    side: 'left' as const,
    text: '네, 가능합니다! 이번 주말 2시 보러 오실래요?',
    transLabel: '🌐 English',
    translation: 'Yes! Would you like to come see it this weekend at 2pm?',
  },
  {
    side: 'right' as const,
    text: 'Perfect! See you at 2pm! 🙌',
    transLabel: '🌐 Korean',
    translation: '완벽해요! 2시에 봬요! 🙌',
  },
]

type MsgState = { typedLen: number; showTrans: boolean }
const blank = (): MsgState[] => DEMO_MSGS.map(() => ({ typedLen: 0, showTrans: false }))
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function TranslationDemo() {
  const [visible, setVisible] = useState(0)          // how many bubbles are rendered
  const [states, setStates] = useState<MsgState[]>(blank)

  useEffect(() => {
    let cancelled = false

    async function run() {
      while (!cancelled) {
        setVisible(0)
        setStates(blank())
        await wait(500)

        for (let i = 0; i < DEMO_MSGS.length; i++) {
          if (cancelled) return
          setVisible(i + 1)

          // char-by-char typing (handle multi-byte chars / emoji with Array.from)
          const chars = Array.from(DEMO_MSGS[i].text)
          for (let c = 1; c <= chars.length; c++) {
            if (cancelled) return
            await wait(42)
            setStates(prev => prev.map((s, j) => j === i ? { ...s, typedLen: c } : s))
          }

          await wait(320)
          if (cancelled) return

          // fade in translation
          setStates(prev => prev.map((s, j) => j === i ? { ...s, showTrans: true } : s))
          await wait(950)
        }

        // pause with all messages visible
        await wait(3000)
      }
    }

    run()
    return () => { cancelled = true }
  }, [])

  return (
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
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-lg mb-1"
          style={{ background: 'rgba(10,132,255,0.25)', border: '1px solid rgba(10,132,255,0.4)' }}
        >
          🌐
        </div>
        <p className="text-white font-semibold text-sm leading-tight">Auto Translation</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Korean ↔ English · Powered by MyKHome
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-1.5">
        {DEMO_MSGS.map((msg, i) => {
          if (i >= visible) return null
          const s = states[i]
          const chars = Array.from(msg.text)
          const displayed = chars.slice(0, s.typedLen).join('')
          const typing = s.typedLen < chars.length
          const isRight = msg.side === 'right'

          return (
            <div key={i} className="space-y-0.5">
              {/* Bubble */}
              <div className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="text-white text-sm px-3 py-2 leading-snug"
                  style={{
                    background: isRight ? '#0a84ff' : '#2c2c2e',
                    borderRadius: isRight ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    maxWidth: '88%',
                  }}
                >
                  {displayed}
                  {typing && <span className="animate-pulse ml-0.5">|</span>}
                </div>
              </div>

              {/* Translation tag */}
              <div
                className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}
                style={{ opacity: s.showTrans ? 1 : 0, transition: 'opacity 0.4s ease' }}
              >
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    color: 'rgba(52,199,89,1)',
                    background: 'rgba(52,199,89,0.12)',
                  }}
                >
                  {msg.transLabel}: {msg.translation}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
