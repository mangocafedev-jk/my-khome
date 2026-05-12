'use client'

import { useState } from 'react'
import type { Listing } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ContactFormProps {
  listing: Listing
}

export default function ContactForm({ listing }: ContactFormProps) {
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

  if (sent) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">✅</div>
        <p className="font-semibold text-gray-900 text-lg">Message Sent!</p>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          The agent will reply to your contact.<br />
          Your message has been translated to Korean automatically.
        </p>
      </div>
    )
  }

  return (
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
        <label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
          Message <span className="text-gray-400 font-normal">(English)</span>
        </label>
        <textarea
          id="contact-message"
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending…' : 'Send Message'}
      </Button>
    </form>
  )
}
