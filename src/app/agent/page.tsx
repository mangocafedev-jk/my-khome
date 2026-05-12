export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgentDashboard from '@/components/agent/AgentDashboard'

export default async function AgentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'agent') redirect('/')

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('agent_id', agent?.id ?? '')
    .order('created_at', { ascending: false })

  const listingIds = listings?.map(l => l.id) ?? []
  const { data: messages } = listingIds.length > 0
    ? await supabase
        .from('messages')
        .select('*, listings(title_kr, title_en)')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <AgentDashboard
      profile={profile}
      agent={agent}
      listings={listings ?? []}
      messages={messages ?? []}
    />
  )
}
