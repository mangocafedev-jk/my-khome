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

  // Translate to Korean; fall back to original English if DeepL is unavailable
  let content_kr = content_en
  try {
    content_kr = await translateToKorean(content_en)
  } catch (err) {
    console.error('[messages POST] DeepL translation failed, storing English as fallback:', err)
  }

  const { error } = await supabase
    .from('messages')
    .insert({ listing_id, sender_name, sender_contact, content_en, content_kr, is_read: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
