/**
 * ==============================================================================
 * THEIRS (theirs.page) — DOMAIN TYPE DEFINITIONS
 * ==============================================================================
 * Strictly maps to database schema in supabase/theirs_migrations/01_core_schema.sql.
 * Used across server queries, server actions, API routes, and UI components.
 */

// ------------------------------------------------------------------------------
// Enums & Literal Types
// ------------------------------------------------------------------------------

export type PrivacyMode = 'public' | 'unlisted' | 'private'

export type MemorialStatus = 'draft' | 'published' | 'archived'

export type CollaboratorRole = 'co_admin' | 'contributor'

export type MemoryStatus = 'pending_approval' | 'approved' | 'rejected'

export type MemoryVisibility = 'everyone' | 'family_only'

export type MediaType = 'image' | 'audio' | 'video'

export type GuestbookStatus = 'pending_approval' | 'approved' | 'rejected'

export type ReportTargetType = 'memorial' | 'memory' | 'media' | 'guestbook'

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

// ------------------------------------------------------------------------------
// Core Database Entities
// ------------------------------------------------------------------------------

export interface UserProfile {
  id: string
  user_id: string
  email: string | null
  full_name: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Memorial {
  id: string
  owner_id: string
  slug: string
  full_name: string
  preferred_name: string | null
  birth_year: number | null
  death_year: number | null
  headline: string | null
  biography: string | null
  location: string | null
  portrait_photo_url: string | null
  privacy: PrivacyMode
  access_pin_hash: string | null
  successor_name: string | null
  successor_email: string | null
  status: MemorialStatus
  is_paid: boolean
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Collaborator {
  id: string
  memorial_id: string
  user_id: string | null
  email: string
  role: CollaboratorRole
  invitation_accepted: boolean
  created_at: string
}

export interface Memory {
  id: string
  memorial_id: string
  author_name: string
  author_email: string | null
  author_relationship: string | null
  story: string
  approx_year: number | null
  location: string | null
  photo_url: string | null
  tribute_type?: 'flower' | 'note' | 'photo' | 'candle'
  status: MemoryStatus
  visibility: MemoryVisibility
  created_at: string
  approved_at: string | null
}

export interface MediaItem {
  id: string
  memorial_id: string
  media_type: MediaType
  url: string
  caption: string | null
  approx_year: number | null
  location: string | null
  order_index: number
  created_at: string
}

export interface TimelineEvent {
  id: string
  memorial_id: string
  year: number
  title: string
  description: string | null
  photo_url: string | null
  location: string | null
  order_index: number
  created_at: string
}

export interface GuestbookEntry {
  id: string
  memorial_id: string
  author_name: string
  author_email: string | null
  message: string
  status: GuestbookStatus
  created_at: string
}

export interface ContentReport {
  id: string
  target_type: ReportTargetType
  target_id: string
  reason: string
  reporter_email: string | null
  status: ReportStatus
  created_at: string
}

export interface PaymentRecord {
  id: string
  user_id: string | null
  memorial_id: string | null
  payment_id: string
  amount: number
  currency: string
  status: PaymentStatus
  customer_email: string | null
  payment_method: string | null
  metadata: Record<string, any>
  created_at: string
}

// ------------------------------------------------------------------------------
// Aggregate & View Models
// ------------------------------------------------------------------------------

export interface MemorialSummaryStats {
  memories_count: number
  photos_count: number
  contributors_count: number
}

export interface MemorialWithDetails extends Memorial {
  stats: MemorialSummaryStats
  memories?: Memory[]
  timeline_events?: TimelineEvent[]
  media_items?: MediaItem[]
  guestbook_entries?: GuestbookEntry[]
}

// ------------------------------------------------------------------------------
// Input DTOs
// ------------------------------------------------------------------------------

export interface CreateMemorialInput {
  full_name: string
  preferred_name?: string | null
  portrait_photo_url?: string | null
  headline?: string | null
  birth_year?: number | null
  death_year?: number | null
  location?: string | null
  successor_name?: string | null
  successor_email?: string | null
  slug?: string
}

export interface UpdateMemorialInput {
  full_name?: string
  preferred_name?: string | null
  birth_year?: number | null
  death_year?: number | null
  headline?: string | null
  biography?: string | null
  location?: string | null
  portrait_photo_url?: string | null
  privacy?: PrivacyMode
  status?: MemorialStatus
  successor_name?: string | null
  successor_email?: string | null
}

export interface SubmitMemoryInput {
  memorial_id: string
  author_name: string
  author_email?: string | null
  author_relationship?: string | null
  story: string
  approx_year?: number | null
  location?: string | null
  photo_url?: string | null
  tribute_type?: 'flower' | 'note' | 'photo' | 'candle'
  visibility?: MemoryVisibility
  turnstile_token?: string
}

export interface SubmitGuestbookInput {
  memorial_id: string
  author_name: string
  author_email?: string | null
  message: string
  turnstile_token?: string
}

export interface SubmitReportInput {
  memorial_id: string
  target_type: ReportTargetType
  target_id: string
  reporter_email?: string | null
  reason: string
}
