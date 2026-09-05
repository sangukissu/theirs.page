# Theirs (`theirs.page`) — Database Setup & Migrations

This folder contains the complete, clean SQL schema for **Theirs** (`theirs.page`), built specifically for a fresh Supabase project. It is completely isolated from the legacy BringBack migrations in `../migrations/`.

---

## Migration Sequence

Run these SQL scripts in numerical order in your new Supabase project's **SQL Editor**:

1. **`01_core_schema.sql`**
   - Enables `uuid-ossp` and `pgcrypto`.
   - Creates the `user_profiles` table and the automatic trigger on `auth.users`.
   - Creates the core tables:
     - `memorials`: The permanent home for someone's life (`theirs.page/[slug]`).
     - `collaborators`: Co-admins and family stewards.
     - `memories`: Stories contributed by family & friends (the heart of the product).
     - `media_items`: Photos, audio voicemails, clips with captions & metadata.
     - `timeline_events`: Milestone moments (*"1952: Born in Jaipur"*, *"1974: Married Meena"*).
     - `caretaker_messages`: Private visitor messages for memorial administrators.
     - `payments`: Clean transaction records for Dodo Payments.
   - Creates performance indexes on slugs, foreign keys, and status flags.

2. **`02_security_and_rls.sql`**
   - Enables PostgreSQL Row Level Security (RLS) across all tables.
   - Defines `is_memorial_admin()` and `can_view_memorial()` security definer functions.
   - **Public Access**: Visitors can view published memorials and approved memories/photos.
   - **Frictionless Contributions**: Anyone (including unauthenticated guests) can submit a memory, forced to `status = 'pending_approval'`.
   - **Private Messaging**: Caretaker messages are written through the guarded server endpoint and visible only to memorial administrators.
   - **Admin Moderation**: Only the owner or accepted co-admins can approve, reject, or edit content.
   - **Payment Protection**: Only service-role (`SUPABASE_SECRET_KEY`) can insert/update payment webhook logs.

3. **`03_storage_setup.sql`**
   - Configures the `theirs-media` public storage bucket in Supabase.
   - Sets MIME type limits (images, audio notes, video clips up to 50MB).
   - Establishes RLS policies for uploads and public reads.
   - *(Note: Can be used alongside Cloudflare R2 for zero-egress large media archival).*

4. **`06_drop_people_in_life.sql`**
   - Safely drops the `people_in_life` table, foreign keys, and RLS policies.
   - Relationships now emerge organically in memories, captions, and timeline stories rather than a rigid list.

5. **`10_caretaker_messages.sql`**
   - Drops the unused pre-launch `guestbook_entries` table.
   - Creates the private caretaker inbox and admin-only read, update, and delete policies.

---

## Environment Variables Mapping

In your `.env.local` for the new project, connect these keys:

```env
# Supabase (New Project Credentials)
NEXT_PUBLIC_SUPABASE_URL=https://<your-new-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudflare R2 Storage (Optional / Presigned upload pipeline)
R2_ACCOUNT_ID=
R2_BUCKET_NAME=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# Payments & Email
DODO_PAYMENTS_API_KEY=
DODO_WEBHOOK_SECRET=
RESEND_API_KEY=
```

---

## Schema Highlights from `the-idea.md`

| Feature | Database Representation |
| :--- | :--- |
| **"Every person gets a place"** | `memorials.slug` (`theirs.page/john-smith`) |
| **"Memories are the heart"** | `memories` table with `story`, `approx_year`, `location`, `people_involved`, `photo_url`, `status` |
| **"Collaborative by design"** | Open insert policy with `status = 'pending_approval'` for family contributions |
| **"Life Timeline"** | `timeline_events` sorted by `year`, `month`, `order_index` |
| **"Albums rather than one giant gallery"** | `albums` and `media_items` structure |
| **"Long-term Stewardship"** | `memorials.successor_name` and `successor_email` |
| **"3 Privacy Modes"** | `memorials.privacy` (`'public'`, `'unlisted'`, `'private'`) + `access_pin_hash` |
