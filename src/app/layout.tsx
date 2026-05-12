import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyKHome — Korean Real Estate for Foreigners',
  description: 'Find your perfect home in Korea. Browse apartments, officetels and houses with English support.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
