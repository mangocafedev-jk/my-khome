'use client'

import { useState } from 'react'
import type { Message } from '@/types'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface AgentMessagesProps {
  messages: Message[]
}

export default function AgentMessages({ messages }: AgentMessagesProps) {
  const [replyMap, setReplyMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())
  const router = useRouter()

  if (messages.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">문의가 없습니다.</p>
      </div>
    )
  }

  const sendReply = async (messageId: string) => {
    const reply_kr = replyMap[messageId]?.trim()
    if (!reply_kr) return

    setLoading(messageId)
    try {
      const res = await fetch(`/api/messages/${messageId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply_kr }),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(prev => new Set(prev).add(messageId))
      router.refresh()
    } catch {
      alert('답장 전송에 실패했습니다.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {messages.map(msg => (
        <div key={msg.id} className={`bg-white rounded-2xl border p-6 ${!msg.is_read ? 'border-[#0071e3]/30' : 'border-gray-100'}`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{msg.sender_name}</p>
                {!msg.is_read && (
                  <span className="text-xs bg-[#0071e3] text-white px-2 py-0.5 rounded-full">새 문의</span>
                )}
              </div>
              <p className="text-sm text-gray-400">{msg.sender_contact}</p>
            </div>
            <p className="text-xs text-gray-400 shrink-0">
              {new Date(msg.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>

          {/* Korean translation for agent */}
          <div className="bg-blue-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-[#0071e3] font-medium mb-1">고객 문의 (한국어 번역)</p>
            <p className="text-gray-800">{msg.content_kr || msg.content_en}</p>
          </div>

          {/* Original English */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-gray-400 mb-1">원문 (영어)</p>
            <p className="text-sm text-gray-600">{msg.content_en}</p>
          </div>

          {/* Reply section */}
          {msg.reply_kr || sent.has(msg.id) ? (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-medium mb-1">답장 완료 ✓</p>
              <p className="text-gray-800">{msg.reply_kr}</p>
              {msg.reply_en && (
                <p className="text-xs text-gray-400 mt-2">영어 번역: {msg.reply_en}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={3}
                placeholder="한국어로 답장을 작성하세요. 고객에게는 영어로 자동 번역됩니다."
                value={replyMap[msg.id] ?? ''}
                onChange={e => setReplyMap(prev => ({ ...prev, [msg.id]: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 resize-none text-sm"
              />
              <Button
                size="sm"
                onClick={() => sendReply(msg.id)}
                disabled={loading === msg.id || !replyMap[msg.id]?.trim()}
              >
                {loading === msg.id ? '전송 중…' : '답장 보내기 (영어로 자동 번역)'}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
