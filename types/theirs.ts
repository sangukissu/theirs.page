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

export type MemorialTheme = 'quiet' | 'warm' | 'garden' | 'classic' | 'dusk' | 'light'

export type MemorialStatus = 'draft' | 'published' | 'archived'

export type CollaboratorRole = 'co_admin' | 'contributor'

export type MemoryStatus = 'pending_approval' | 'approved' | 'rejected' | 'blocked'

export type SafetyDecision = 'safe' | 'review' | 'blocked'

export type ContributorRole = 'anonymous' | 'invited' | 'trusted' | 'co_admin' | 'owner'

export type MemoryVisibility = 'everyone' | 'family_only'

export type MediaType = 'image' | 'audio' | 'video'

export type CaretakerMessageStatus = 'unread' | 'read' | 'archived'

export type ReportTargetType = 'memorial' | 'memory' | 'media'

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

export interface SectionSettings {
  story?: boolean
  tributes?: boolean
  timeline?: boolean
  gallery?: boolean
  stories?: boolean
}

export interface ContributionSettings {
  accept_contributions?: boolean
  tributes?: boolean
  memories?: boolean
  photos?: boolean
  voice?: boolean
  videos?: boolean
}

export type HeroCoverType = 'clean' | 'pattern' | 'their_world'

export type HeroPatternStyle =
  | 'soft_aura'
  | 'dither'
  | 'heritage_lines'
  | 'sanctuary_arch'
  | 'eternal_crest'
  | 'cadence'
  | 'glow'
  | 'botanical_veil'
  | 'harmonic_ripples'
  | 'fluted_colonnade'
  | 'paper_grain'
  | 'starlight'

export interface MemorialCoverSettings {
  type: HeroCoverType
  pattern_style?: HeroPatternStyle | null
  cover_url?: string | null
  focal_y?: number | null
  focal_x?: number | null
  source_type?: 'uploaded' | 'memorial_media' | 'curated' | null
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
  creator_relationship?: string | null
  birth_month?: number | null
  birth_day?: number | null
  death_month?: number | null
  death_day?: number | null
  portrait_photo_url: string | null
  privacy: PrivacyMode
  access_pin_hash: string | null
  successor_name: string | null
  successor_email: string | null
  status: MemorialStatus
  language?: string
  is_paid: boolean
  paid_at: string | null
  published_at?: string | null
  review_eligible_at?: string | null
  review_invite_sent_at?: string | null
  review_invite_clicked_at?: string | null
  review_reminder_sent_at?: string | null
  section_settings?: SectionSettings | null
  contribution_settings?: ContributionSettings | null
  theme?: MemorialTheme | null
  cover_settings?: MemorialCoverSettings | null
  slug_change_count?: number
  created_at: string
  updated_at: string
}

export interface MemorialSlugRedirect {
  id: string
  memorial_id: string
  old_slug: string
  created_at: string
}

export interface Collaborator {
  id: string
  memorial_id: string
  user_id: string | null
  email: string
  role: CollaboratorRole
  relationship?: string | null
  invitation_accepted: boolean
  is_trusted: boolean
  created_at: string
}

export interface MemorySafetyDetails {
  decision?: SafetyDecision
  sexual?: boolean
  threat?: boolean
  hate?: boolean
  harassment?: boolean
  spam?: boolean
  scam?: boolean
  personal_data?: boolean
  garbage?: boolean
  reason?: string
  confidence?: number
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
  photo_urls?: string[] | null
  tribute_type?: 'flower' | 'note' | 'photo' | 'candle'
  contribution_type?: 'tribute' | 'story'
  status: MemoryStatus
  safety_decision?: SafetyDecision
  safety_details?: MemorySafetyDetails | Record<string, any> | null
  contributor_role?: ContributorRole
  receipt_token?: string | null
  is_quarantined?: boolean
  media_source_type?: 'none' | 'uploaded' | 'youtube'
  external_provider?: 'youtube' | null
  external_id?: string | null
  external_url?: string | null
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
  album?: string | null
  is_pinned?: boolean
  source_memory_id?: string | null
  source_restoration_id?: string | null
  source_type?: 'uploaded' | 'youtube'
  external_provider?: 'youtube' | null
  external_id?: string | null
  external_url?: string | null
  created_at: string
}

export interface MemorialImageRestoration {
  id: string
  memorial_id: string
  user_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  original_image_url: string | null
  restored_image_url: string | null
  error_message?: string | null
  fal_request_id?: string | null
  created_at: string
  updated_at: string
  in_gallery?: boolean
  gallery_media_id?: string | null
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

export interface CaretakerMessage {
  id: string
  memorial_id: string
  sender_name: string
  sender_email: string
  message: string
  status: CaretakerMessageStatus
  created_at: string
  read_at: string | null
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
  caretaker_messages?: CaretakerMessage[]
}

// ------------------------------------------------------------------------------
// Input DTOs
// ------------------------------------------------------------------------------

export interface CreateMemorialInput {
  full_name: string
  preferred_name?: string | null
  creator_name?: string | null
  creator_relationship?: string | null
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
  creator_relationship?: string | null
  birth_year?: number | null
  birth_month?: number | null
  birth_day?: number | null
  death_year?: number | null
  death_month?: number | null
  death_day?: number | null
  headline?: string | null
  biography?: string | null
  location?: string | null
  portrait_photo_url?: string | null
  privacy?: PrivacyMode
  status?: MemorialStatus
  successor_name?: string | null
  successor_email?: string | null
  section_settings?: SectionSettings | null
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
  photo_urls?: string[] | null
  tribute_type?: 'flower' | 'note' | 'photo' | 'candle'
  contribution_type?: 'tribute' | 'story'
  visibility?: MemoryVisibility
  turnstile_token?: string
}

export interface SubmitCaretakerMessageInput {
  memorial_id: string
  sender_name: string
  sender_email: string
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

export type SupportCategory = 'General' | 'Billing' | 'Memorial' | 'Technical'

export interface UserFeedback {
  id: string
  user_id: string
  memorial_id?: string | null
  rating?: number | null
  feedback_text?: string | null
  working_well?: string | null
  could_be_better?: string | null
  page_path?: string | null
  created_at: string
}

export interface SupportRequest {
  id: string
  user_id: string
  email: string
  memorial_id?: string | null
  category: SupportCategory
  subject: string
  message: string
  page_path?: string | null
  created_at: string
}
