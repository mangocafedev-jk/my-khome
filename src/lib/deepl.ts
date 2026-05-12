const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate'

type DeepLLang = 'EN' | 'KO'

async function translate(text: string, targetLang: DeepLLang): Promise<string> {
  const res = await fetch(DEEPL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: [text], target_lang: targetLang }),
  })

  if (!res.ok) throw new Error(`DeepL error: ${res.status}`)
  const data = await res.json()
  return data.translations[0].text as string
}

export const translateToEnglish = (text: string) => translate(text, 'EN')
export const translateToKorean = (text: string) => translate(text, 'KO')
