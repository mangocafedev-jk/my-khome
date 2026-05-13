'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type { Message } from '@/types'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

// ─── Thread type ───────────────────────────────────────────────────────────────
type Thread = {
  key: string             // `${listing_id}:${sender_contact}`
  listing_id: string
  listing_title: string
  sender_name: string
  sender_contact: string
  messages: Message[]     // sorted oldest → newest
  last_message: Message
  has_unanswered: boolean
  last_date: string       // YYYY-MM-DD in KST
}

// ─── Date helpers ──────────────────────────────────────────────────────────────
function toKSTDate(utcStr: string): string {
  const d = new Date(new Date(utcStr).getTime() + 9 * 3_600_000)
  return d.toISOString().split('T')[0]
}
function todayKST()     { return toKSTDate(new Date().toISOString()) }
function yesterdayKST() { return toKSTDate(new Date(Date.now() - 86_400_000).toISOString()) }

function formatDateTab(dateStr: string): string {
  if (dateStr === todayKST())     return '오늘'
  if (dateStr === yesterdayKST()) return '어제'
  const [, m, d] = dateStr.split('-')
  return `${parseInt(m)}월 ${parseInt(d)}일`
}

function formatTime(utcStr: string): string {
  const d = new Date(new Date(utcStr).getTime() + 9 * 3_600_000)
  const h = d.getUTCHours()
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${m}`
}

// ─── Thread builder ────────────────────────────────────────────────────────────
function buildThreads(messages: Message[]): Thread[] {
  const map = new Map<string, Thread>()

  for (const msg of messages) {
    const key = `${msg.listing_id}:${msg.sender_contact}`
    const msgDate = toKSTDate(msg.created_at)
    const listing = msg.listings as { title_kr?: string } | undefined

    if (!map.has(key)) {
      map.set(key, {
        key,
        listing_id: msg.listing_id,
        listing_title: listing?.title_kr ?? '',
        sender_name: msg.sender_name,
        sender_contact: msg.sender_contact,
        messages: [],
        last_message: msg,
        has_unanswered: false,
        last_date: msgDate,
      })
    }

    const thread = map.get(key)!
    thread.messages.push(msg)

    if (new Date(msg.created_at) > new Date(thread.last_message.created_at)) {
      thread.last_message = msg
      thread.last_date = msgDate
    }
  }

  for (const thread of map.values()) {
    thread.messages.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    thread.has_unanswered = thread.messages.some(m => !m.reply_kr)
  }

  return Array.from(map.values())
}

// ─── Component ─────────────────────────────────────────────────────────────────
interface AgentMessagesProps {
  messages: Message[]
}

export default function AgentMessages({ messages }: AgentMessagesProps) {
  const router = useRouter()
  const threads = useMemo(() => buildThreads(messages), [messages])

  const dates = useMemo(() => {
    const set = new Set(threads.map(t => t.last_date))
    return Array.from(set).sort().reverse()
  }, [threads])

  const [selectedDate, setSelectedDate] = useState<string>(() => dates[0] ?? todayKST())
  const [activeThread, setActiveThread] = useState<Thread | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep selectedDate pointing to a valid date
  useEffect(() => {
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0])
    }
  }, [dates, selectedDate])

  // Scroll conversation to bottom when modal opens
  useEffect(() => {
    if (activeThread) {
      const t = setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, 60)
      return () => clearTimeout(t)
    }
  }, [activeThread])

  const visibleThreads = useMemo(
    () =>
      threads
        .filter(t => t.last_date === selectedDate)
        .sort((a, b) => a.sender_name.localeCompare(b.sender_name, 'ko')),
    [threads, selectedDate]
  )

  const openThread = useCallback((thread: Thread) => {
    setActiveThread(thread)
    setReplyText('')
  }, [])

  const closeModal = useCallback(() => setActiveThread(null), [])

  const handleReply = async () => {
    if (!activeThread || !replyText.trim() || sending) return

    // Reply to the most recent unanswered message in the thread
    const unanswered = [...activeThread.messages].reverse().find(m => !m.reply_kr)
    if (!unanswered) return

    setSending(true)
    try {
      const res = await fetch(`/api/messages/${unanswered.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply_kr: replyText.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      closeModal()
      router.refresh()
    } catch {
      alert('답장 전송에 실패했습니다.')
    } finally {
      setSending(false)
    }
  }

  // ── Empty state ──
  if (messages.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">문의가 없습니다.</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Date tabs ── */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6">
        {dates.map(date => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedDate === date
                ? 'bg-[#0071e3] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {formatDateTab(date)}
          </button>
        ))}
      </div>

      {/* ── Thread list ── */}
      {visibleThreads.length === 0 ? (
        <p className="text-center py-12 text-sm text-gray-400">해당 날짜의 문의가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {visibleThreads.map(thread => (
            <button
              key={thread.key}
              onClick={() => openThread(thread)}
              className="w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 text-left hover:border-[#0071e3]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="pt-0.5 text-base">
                  {thread.has_unanswered ? '🔴' : '✅'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{thread.sender_name}</p>
                    <p className="text-xs text-gray-400 shrink-0">
                      {formatTime(thread.last_message.created_at)}
                    </p>
                  </div>
                  <p className="text-xs text-[#0071e3] font-medium truncate mb-1">
                    {thread.listing_title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {thread.last_message.content_kr || thread.last_message.content_en}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Conversation modal ── */}
      {activeThread && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-xl"
            style={{ maxHeight: '85vh' }}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100 shrink-0">
              <div>
                <p className="font-semibold text-gray-900">{activeThread.sender_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{activeThread.sender_contact}</p>
                <p className="text-sm text-[#0071e3] font-medium mt-1">
                  {activeThread.listing_title}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="ml-4 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Conversation body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
              {activeThread.messages.map(msg => (
                <div key={msg.id} className="space-y-2">
                  {/* Foreign message — left, blue */}
                  <div className="flex justify-start">
                    <div className="max-w-[78%]">
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl rounded-tl-sm px-4 py-3">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {msg.content_kr || msg.content_en}
                        </p>
                        {msg.content_kr && msg.content_kr !== msg.content_en && (
                          <p className="text-xs text-blue-400 mt-2 pt-2 border-t border-blue-100">
                            {msg.content_en}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Agent reply — right, green */}
                  {msg.reply_kr && (
                    <div className="flex justify-end">
                      <div className="max-w-[78%]">
                        <div className="bg-green-50 border border-green-100 rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-sm text-gray-800 leading-relaxed">{msg.reply_kr}</p>
                          {msg.reply_en && msg.reply_en !== msg.reply_kr && (
                            <p className="text-xs text-green-400 mt-2 pt-2 border-t border-green-100">
                              {msg.reply_en}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-right mr-1">에이전트</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-gray-100 shrink-0">
              {activeThread.has_unanswered ? (
                <>
                  <textarea
                    rows={3}
                    placeholder="한국어로 답장을 작성하세요. 고객에게는 영어로 자동 번역됩니다."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply()
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 resize-none mb-3"
                  />
                  <Button
                    className="w-full"
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                  >
                    {sending ? '전송 중…' : '답장 보내기 (영어로 자동 번역)'}
                  </Button>
                </>
              ) : (
                <p className="text-center text-sm text-gray-400 py-2">
                  모든 문의에 답변 완료되었습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
