import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateToKorean } from '@/lib/deepl'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('messages')
    .select('*, listings(title_kr, title_en)')
    .in(
      'listing_id',
      (await supabase.from('listings').select('id').eq('agent_id', agent.id)).data?.map(l => l.id) ?? []
    )
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { listing_id, sender_name, sender_contact, content_en } = body

  if (!listing_id || !sender_name || !sender_contact || !content_en) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Translate user message to Korean for the agent
  const content_kr = await translateToKorean(content_en)

  const { data, error } = await supabase
    .from('messages')
    .insert({ listing_id, sender_name, sender_contact, content_en, content_kr })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
