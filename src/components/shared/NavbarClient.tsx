'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import type { User } from '@supabase/supabase-js'

interface NavbarClientProps {
  user: User | null
  role: string | null
}

export default function NavbarClient({ user, role }: NavbarClientProps) {
  const router = useRouter()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <nav className="flex items-center gap-3">
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign In</Button>
        </Link>
        <Link href="/login">
          <Button size="sm">Get Started</Button>
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-3">
      {role === 'agent' && (
        <Link href="/agent">
          <Button variant="secondary" size="sm">Dashboard</Button>
        </Link>
      )}
      <Button variant="ghost" size="sm" onClick={signOut}>Sign Out</Button>
    </nav>
  )
}
