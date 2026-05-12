import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm text-[#0071e3] font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
          English-friendly real estate in Korea
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Find your home <br />
          <span className="text-[#0071e3]">in Korea</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          Browse verified listings across Seoul and beyond. All listings translated to English.
          Contact agents directly — no Korean required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#listings">
            <Button size="lg">Browse Listings</Button>
          </a>
          <Link href="/login">
            <Button variant="secondary" size="lg">I&apos;m an Agent</Button>
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto text-center">
          {[
            { value: '500+', label: 'Listings' },
            { value: '50+', label: 'Districts' },
            { value: '100%', label: 'English' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
