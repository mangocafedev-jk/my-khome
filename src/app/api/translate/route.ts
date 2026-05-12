import { NextRequest, NextResponse } from 'next/server'
import { translateToEnglish, translateToKorean } from '@/lib/deepl'

export async function POST(request: NextRequest) {
  const { text, target } = await request.json()

  if (!text || !target) {
    return NextResponse.json({ error: 'Missing text or target' }, { status: 400 })
  }

  try {
    const translated =
      target === 'en'
        ? await translateToEnglish(text)
        : await translateToKorean(text)

    return NextResponse.json({ translated })
  } catch {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
