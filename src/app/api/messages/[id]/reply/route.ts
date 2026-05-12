import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { translateToEnglish } from '@/lib/deepl'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { reply_kr } = await request.json()

  if (!reply_kr) return NextResponse.json({ error: 'Missing reply' }, { status: 400 })

  // Translate agent's Korean reply to English for the user
  const reply_en = await translateToEnglish(reply_kr)

  const { data, error } = await supabase
    .from('messages')
    .update({ reply_kr, reply_en, is_read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
