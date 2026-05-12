import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
