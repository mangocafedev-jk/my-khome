export type UserRole = 'user' | 'agent'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  name: string
  created_at: string
}

export interface Agent {
  id: string
  user_id: string
  company: string
  phone: string
  district: string
}

export type ListingType = '월세' | '전세' | '매매'
export type ContractType = '단기' | '장기'
export type ListingStatus = 'active' | 'inactive'

export interface Listing {
  id: string
  agent_id: string
  title_kr: string
  title_en: string
  type: ListingType
  price: number
  deposit: number
  size: number
  district: string
  subway_station: string
  subway_minutes: number
  contract: ContractType
  duration: number
  status: ListingStatus
  created_at: string
  image_urls?: string[]
  agents?: Agent
}

export interface Message {
  id: string
  listing_id: string
  sender_name: string
  sender_contact: string
  content_en: string
  content_kr: string
  reply_kr: string | null
  reply_en: string | null
  is_read: boolean
  created_at: string
  listings?: Listing
}
