import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateToEnglish } from '@/lib/deepl'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('*, agents(company, district, phone)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    console.log('[listings POST] start')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[listings POST] auth -', user?.id ?? 'no user', authError?.message ?? 'ok')

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    console.log('[listings POST] body -', JSON.stringify({ ...body, image_urls: `[${body.image_urls?.length ?? 0} urls]` }))

    let title_en = body.title_kr
    if (process.env.DEEPL_API_KEY) {
      try {
        title_en = await translateToEnglish(body.title_kr)
        console.log('[listings POST] translated ok')
      } catch (e) {
        console.error('[listings POST] DeepL failed:', e)
      }
    } else {
      console.log('[listings POST] no DEEPL_API_KEY, skipping translation')
    }

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', user.id)
      .single()
    console.log('[listings POST] agent -', agent?.id ?? 'not found', agentError?.message ?? 'ok')

    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const insertPayload = { ...body, title_en, agent_id: agent.id }
    console.log('[listings POST] inserting with keys:', Object.keys(insertPayload).join(', '))

    const { data, error } = await supabase
      .from('listings')
      .insert(insertPayload)
      .select()
      .single()

    console.log('[listings POST] insert result -', data?.id ?? 'null', error?.message ?? 'ok', error?.details ?? '')

    if (error) return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('[listings POST] caught exception:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
