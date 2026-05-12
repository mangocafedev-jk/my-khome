'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { UserProfile, Agent, Listing, Message } from '@/types'
import AgentListings from './AgentListings'
import AgentMessages from './AgentMessages'
import AgentNewListing from './AgentNewListing'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

type Tab = '매물 관리' | '문의 관리' | '새 매물 등록'

interface AgentDashboardProps {
  profile: UserProfile
  agent: Agent | null
  listings: Listing[]
  messages: Message[]
}

export default function AgentDashboard({ profile, agent, listings, messages }: AgentDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('매물 관리')
  const router = useRouter()

  const unreadCount = messages.filter(m => !m.is_read).length

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const tabs: Tab[] = ['매물 관리', '문의 관리', '새 매물 등록']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-[#0071e3] hover:opacity-80 transition-opacity">MyKHome</Link>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">공인중개사 대시보드</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{profile.name} 님</span>
              <Button variant="ghost" size="sm" onClick={signOut}>로그아웃</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: '등록 매물', value: listings.length, suffix: '건' },
            { label: '총 문의', value: messages.length, suffix: '건' },
            { label: '미확인 문의', value: unreadCount, suffix: '건', highlight: unreadCount > 0 },
          ].map(stat => (
            <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.highlight ? 'border-[#0071e3]/30 bg-blue-50' : 'border-gray-100'}`}>
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.highlight ? 'text-[#0071e3]' : 'text-gray-900'}`}>
                {stat.value}<span className="text-base font-normal text-gray-400 ml-1">{stat.suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === '문의 관리' && unreadCount > 0 && (
                <span className="ml-2 bg-[#0071e3] text-white text-xs rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === '매물 관리' && <AgentListings listings={listings} />}
        {activeTab === '문의 관리' && <AgentMessages messages={messages} />}
        {activeTab === '새 매물 등록' && (
          <AgentNewListing
            agentId={agent?.id ?? ''}
            onSuccess={() => {
              setActiveTab('매물 관리')
              router.refresh()
            }}
          />
        )}
      </div>
    </div>
  )
}
