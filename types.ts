export type Tab = 'chat' | 'offers' | 'store' | 'credits'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  whop_store_url: string | null
  plan: 'free' | 'starter' | 'pro' | 'scale'
  credits_used: number
  credits_limit: number
  created_at: string
}
