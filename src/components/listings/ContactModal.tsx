'use client'

import { useState } from 'react'
import type { Listing } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ContactModalProps {
  listing: Listing
  onClose: () => void
}

export default function ContactModal({ listing, onClose }: ContactModalProps) {
  const [form, setForm] = useState({ sender_name: '', sender_contact: '', content_en: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id, ...form }),
      })
      if (!res.ok) throw new Error('Failed to send message')
      setSent(true)
    } catch {
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Contact Agent</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm text-gray-600">
            <span className="font-medium text-gray-900">{listing.title_en || listing.title_kr}</span>
            <br />
            <span>{listing.district} · {listing.subway_station}</span>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold text-gray-900">Message Sent!</p>
              <p className="text-sm text-gray-500 mt-1">The agent will reply to your contact. Your message has been translated to Korean automatically.</p>
              <Button className="mt-6" onClick={onClose}>Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="sender_name"
                label="Your Name"
                placeholder="John Smith"
                value={form.sender_name}
                onChange={e => setForm(f => ({ ...f, sender_name: e.target.value }))}
                required
              />
              <Input
                id="sender_contact"
                label="Email or Phone"
                placeholder="john@example.com"
                value={form.sender_contact}
                onChange={e => setForm(f => ({ ...f, sender_contact: e.target.value }))}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-medium text-gray-700">Message (English)</label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Hi, I'm interested in this property. When can I schedule a viewing?"
                  value={form.content_en}
                  onChange={e => setForm(f => ({ ...f, content_en: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 resize-none"
                />
                <p className="text-xs text-gray-400">Your message will be automatically translated to Korean for the agent.</p>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Message'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
