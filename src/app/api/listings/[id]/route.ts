import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateToEnglish } from '@/lib/deepl'

export async function GET(_req: Request, { params }: RouteContext<'/api/listings/[id]'>) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('*, agents(company, district, phone)')
    .eq('id', id)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function PATCH(req: Request, { params }: RouteContext<'/api/listings/[id]'>) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents').select('id').eq('user_id', user.id).single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { data: existing } = await supabase
    .from('listings').select('agent_id, title_kr').eq('id', id).single()
  if (!existing || existing.agent_id !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { agent_id: _drop, ...body } = await req.json()

  let title_en: string | undefined
  if (body.title_kr && body.title_kr !== existing.title_kr) {
    try {
      title_en = await translateToEnglish(body.title_kr)
    } catch {
      title_en = body.title_kr
    }
  }

  const { data, error } = await supabase
    .from('listings')
    .update({ ...body, ...(title_en !== undefined && { title_en }) })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: RouteContext<'/api/listings/[id]'>) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: agent } = await supabase
    .from('agents').select('id').eq('user_id', user.id).single()
  if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

  const { data: existing } = await supabase
    .from('listings').select('agent_id').eq('id', id).single()
  if (!existing || existing.agent_id !== agent.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('listings').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
