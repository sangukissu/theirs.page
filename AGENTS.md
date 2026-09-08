# AGENTS.md — Developer & AI Agent Handbook for Theirs (`theirs.page`)

> **"It should feel like visiting someone’s life, not visiting their obituary."**  
> We are building **Theirs** (`theirs.page`), an online memorial website where families create a memorial for someone they love. Before writing screens, flows, copy, queries, or features, read and adhere to [`docs/positioning-and-seo.md`](./docs/positioning-and-seo.md), [`docs/the-idea.md`](./docs/the-idea.md), and [`docs/the-plan.md`](./docs/the-plan.md).

---

## 0. Category, Positioning & Vocabulary Rules (MANDATORY)

### The Category: Online Memorial Website
- Our public category is **Online memorial website**.
- It is **not** "life archive", **not** "digital legacy", and **not** "a place on the internet dedicated to a human life" (internally descriptive phrases must not define the category publicly).
- Search engines and users anchor around: *online memorial*, *memorial website*, *memorial page*, and *loved one* (ForeverMissed, CreateMemorial, Remembr, Keeper).
- Digital memorial search demand is focused (~5,610 US searches/month cluster). Do not dilute the category signal with invented terminology.

### Locked Positioning Statement
> **"Theirs is an online memorial website where families create a memorial for someone they love, bring together their photos, stories and tributes, and invite family and friends to contribute their own memories."**

### Vocabulary Rules for the Entire Site
From now on, use these terms consistently across UI, copy, meta, and code:
- **Primary Category**: Online memorial / Online memorial website
- **Product Object**: Memorial / memorial website / memorial page
- **Action**: Create a memorial
- **Audience**: Loved one / family and friends
- **Content**: Photos, stories, memories, tributes, voice and video
- **Collaboration**: Invite family and friends to contribute
- **Paid Outcome**: Complete memorial / family archive

#### Avoid leading with:
- ❌ `life archive`
- ❌ `digital legacy`
- ❌ `legacy platform`
- ❌ `memory platform`
- ❌ `virtual memorial`
- ❌ `digital remembrance space`  
*(These may appear naturally in deep supporting copy or SEO articles, but should never compete with "online memorial website" for homepage meaning.)*

### Homepage Metadata & Hero Specifications
- **SEO Title**: `Online Memorial Website for Loved Ones | Theirs`
- **Meta Description**: `Create a beautiful online memorial website for someone you love. Share photos, stories and tributes, and invite family and friends to add their memories.`
- **Eyebrow**: `Online memorials`
- **H1**: `Create a beautiful online memorial for someone you love.`
- **Hero Supporting Copy**: `Bring their photos, stories and tributes together in one place, and invite family and friends to add their memories.`

### Critical SEO Architecture: Memorial vs. Obituary
- **Do not chase "obituary" on the homepage**: Even though obituary search volume is massively larger (~616,900 monthly US searches vs ~5,610 for digital memorials), obituary search intent is distinct. Distorting the homepage hurts conversion and search engine clarity.
- **Dedicated Content Strategy**: Capture obituary demand through dedicated pages (e.g. `Online Obituary vs Online Memorial`, `How to Write an Obituary for a Loved One`, `Create an Online Obituary and Memorial`) that introduce Theirs without diluting homepage category relevance.

---

## 1. Core Product Principles (Non-Negotiable)

1. **Life Dominates, Death Only Explains Why**: The visitor should experience **a person**, not a database. Never begin with government forms, funeral dates, or death certificates.
2. **Memories Are the Heart**: The most valuable unit is the **memory** contributed by people who knew them (*"I remember when Dad spent half of Christmas Day fixing the neighbour's washing machine..."*).
3. **Collaborative by Design**: One grieving creator should not carry the burden of assembling a life alone. Family and friends contribute without mandatory account sign-up.
4. **Authenticity is Sacred**: AI remains in the background as a thoughtful editor. **Never** invent memories, fake historical facts, or fabricate fake chatbots pretending to be someone who died.
5. **Preservation Over Lock-in**: *"Your family will never be trapped inside Theirs."* Always preserve original high-resolution media.
6. **Design Aesthetics**: Warm, calm, intimate, and editorial. Generous leading, serif headlines, warm cream/slate palette. **No gloomy funeral-black, no angel wings, no candles, no grief clichés.**

---

## 2. Preserved Infrastructure (DO NOT DELETE / HIGH REUSE)

This repository carries high-value infrastructure from BringBack that is **actively preserved and repurposed for `theirs.page`**:

### A. Cloudflare R2 Storage Pipeline
- **Files**: [`lib/r2.ts`](./lib/r2.ts), [`app/api/r2/`](./app/api/r2/)
- **Capability**: AWS S3 compatible client configured for Cloudflare R2. Generates presigned upload URLs so large photos, audio notes, and videos upload directly from the browser without hitting server bandwidth limits or paying egress fees.
- **Usage**: Use `getR2PresignedUploadUrl()` for original photo uploads and memory attachments.

### B. Memory Book & Media Derivatives Engine
- **Files**: [`lib/memory-book/`](./lib/memory-book/), [`app/m/`](./app/m/), [`app/family-memory-book/`](./app/family-memory-book/), [`app/api/memory-books/`](./app/api/memory-books/)
- **Capability**:
  - **Original vs. Runtime Compressed Media**: Preserves the original file untouched while generating optimized web-ready derivatives (`memory_book_media_derivatives` pattern).
  - **Token Signing & Security**: HMAC-SHA256 signature verification for friendly share links (`lib/memory-book/security.ts`).
  - **Pagination & Layout**: Visual page composition and asset layout.

### C. Dodo Payments Engine
- **Files**: [`app/api/webhooks/dodopayments/route.ts`](./app/api/webhooks/dodopayments/route.ts), [`app/api/checkout/`](./app/api/checkout/)
- **Capability**: Fully functional Standard Webhook listener, HMAC signature verification, checkout session generation, and payment state synchronization for paid/lifetime memorial activations.

### D. Google Gemini AI Engine
- **Files**: `@google/genai` integration in [`lib/memory-book/jobs.ts`](./lib/memory-book/jobs.ts) and [`app/api/analyze-image/`](./app/api/analyze-image/)
- **Capability**: Structured prompt helpers to turn messy fragments into a coherent life story, clean up contributor grammar while preserving their voice, and suggest timeline groupings.

### E. Photo Restoration & Polling Pipeline
- **Files**: [`app/api/restore/`](./app/api/restore/), [`app/api/rerestore/`](./app/api/rerestore/), [`app/api/fal/`](./app/api/fal/), [`lib/restore-helpers.ts`](./lib/restore-helpers.ts)
- **Capability**: Asynchronous Fal.ai photo restoration with background polling. Retained for optional family photo album restoration (scratch removal, colorization, clarity enhancement).

### F. Supabase Modern Auth & Client Layer
- **Files**: [`utils/supabase/client.ts`](./utils/supabase/client.ts), [`utils/supabase/server.ts`](./utils/supabase/server.ts), [`utils/supabase/admin.ts`](./utils/supabase/admin.ts), [`utils/supabase/middleware.ts`](./utils/supabase/middleware.ts), [`proxy.ts`](./proxy.ts)
- **Capability**: Modern Supabase SDK using `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` with SSR cookie management and RLS enforcement.

---

## 3. Database Architecture & Migrations

All database migrations for `theirs.page` live in **[`supabase/theirs_migrations/`](./supabase/theirs_migrations/)**. They are 100% idempotent (safe to re-run):

| File | Description |
| :--- | :--- |
| `01_core_schema.sql` | `user_profiles`, `memorials`, `collaborators`, `memories`, `albums`, `media_items`, `timeline_events`, `guestbook_entries`, `reports`, `payments` |
| `02_security_and_rls.sql` | Row Level Security policies with guest submission (`pending_approval`) and admin moderation |
| `03_storage_setup.sql` | `theirs-media` public storage bucket and upload policies |

**TypeScript Definitions**:
All schema tables and DTOs are strongly typed in **[`types/theirs.ts`](./types/theirs.ts)**.

---

## 4. Engineering Rules for Agents

1. **Zero Schema Bloat**: Do not randomly add tables or columns. Everything must be strategic, lean, and directly required by V1.
2. **Unified Media**: Keep all photos, voice notes, and videos in `media_items` with `media_type`. Do not create separate tables for each media format.
3. **Protect Core Infrastructure**: When modifying routes, never delete or break R2 storage, Dodo payment webhooks, or the Memory Book media pipeline.
4. **Idempotency Always**: Any future SQL migrations must be idempotent (`create table if not exists`, `drop policy if exists ... before create policy`).
5. **Always Type-Check**: Run `npx tsc --noEmit` before finishing any task to guarantee zero type regressions.

## NOte : never remove   "keep_vars": true from wrangler.jsonc file. never add secrets in this file


### Strict Privacy & Secrets Policy
- **FORBIDDEN FILES**: Do not under any circumstance use `view_file`, `grep_search`, or command tools to inspect `.env`, `.env.local`, or any `.env*` files.
- If an environment variable is missing or failing, provide the variable name and ask the user to verify it manually.
- Never output, log, or execute commands containing API keys, private tokens, or database passwords.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
