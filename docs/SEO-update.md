# Technical SEO + Structured Data + AEO Implementation Checklist & Audit for Theirs.page

> **Implementation Status**: COMPLETED  
> **Audited Date**: September 2026  
> **Handbook**: [`docs/SEO.md`](./SEO.md)  
> **Test Suite**: `tests/seo/seo.test.ts` (16/16 tests passing, 0 errors, 0 warnings)

---

## GOAL & PRINCIPLES AUDIT

- [x] **[COMPLETED] Site identity/config defined once**: Centralized in `lib/seo/config.ts` (`SEO_CONFIG`).
- [x] **[COMPLETED] Static page titles/descriptions/canonicals/robots managed centrally**: Centralized in `lib/seo/pages.ts` (`STATIC_PAGES`) and `lib/seo/metadata.ts` (`buildStaticMetadata`).
- [x] **[COMPLETED] Schemas generated through reusable builders**: Created connected `@graph` builders in `lib/seo/schema.ts` with stable `@id` anchors.
- [x] **[COMPLETED] Dynamic memorial metadata generated consistently**: Implemented `buildMemorialMetadata()` adhering to the `{FullName} Memorial ({years}) | Theirs` formula and indexation rules.
- [x] **[COMPLETED] Blog metadata/schema generated consistently**: Implemented `buildBlogMetadata()` and `buildBlogArticleSchemaGraph()` with real author extraction and clean Theirs publisher.
- [x] **[COMPLETED] Sitemap contains only real indexable canonical URLs**: Rebuilt `app/sitemap.ts` using static registry + published public memorials; strictly excludes `/login`, private memorials, drafts, and subpages.
- [x] **[COMPLETED] Private/unlisted/draft/admin/auth pages cannot accidentally enter search**: All non-public surfaces use `buildNoIndexMetadata()` setting `robots: { index: false, follow: false }` and are excluded from sitemaps.
- [x] **[COMPLETED] FAQ UI and FAQ schema cannot drift apart**: Single source of truth array defined in `content/faq.ts`, consumed by both `components/theirs/faq.tsx` and `lib/seo/schema.ts`.
- [x] **[COMPLETED] AEO relies on strong crawlable content and normal SEO**: Documented writing principles in `docs/SEO.md`; removed speculative `llms.txt` and fake AI schema hacks.

---

## 1. FIRST AUDIT THE CURRENT REPO

- [x] **[COMPLETED] Every app/ route audited**: All 25 routes cataloged and updated with centralized metadata.
- [x] **[COMPLETED] All generateMetadata / metadata exports audited**: Unified through `lib/seo/metadata.ts`.
- [x] **[COMPLETED] All JSON-LD scripts audited**: Removed all ad-hoc `<script type="application/ld+json">` tags across components; all JSON-LD now routes through `<JsonLd />`.
- [x] **[COMPLETED] robots.ts audited & refactored**: Search discovery bots separated from blocked model-training scrapers.
- [x] **[COMPLETED] sitemap.ts audited & rebuilt**: Removed `/login`, removed static `new Date()` timestamp generation, added dynamic public memorials.
- [x] **[COMPLETED] Public memorial routes & privacy rules audited**: Strict enforcement of public published = indexable; private/unlisted/draft = noindex.
- [x] **[COMPLETED] Blog routes & WordPress data audited**: Identified legacy BringBack restoration content.
- [x] **[COMPLETED] Homepage FAQ data audited**: Extracted to `content/faq.ts`, answers verified against actual product capabilities.
- [x] **[COMPLETED] Redirects/duplicate memorial routes audited**: Subpages point to self-canonicals with `robots: { index: false, follow: true }`.
- [x] **[COMPLETED] OG/Twitter handling audited**: Standardized via central builders with absolute URLs and dynamic OG generation.
- [x] **[COMPLETED] Canonical URLs audited**: Single self-canonical per indexable page.
- [x] **[COMPLETED] Noindex rules audited**: Applied across login, auth, dashboard, admin, error, invitations, and private memorials.
- [x] **[COMPLETED] Flag stale BringBack branding or restoration-era SEO**: Removed BringBack references from `/blog` metadata, `/dashboard/account/delete`, and JSON-LD schemas.
- [x] **[COMPLETED] Legacy Blog Decision**: Set `/blog` and `/blog/[slug]` to `robots: { index: false, follow: false }` and excluded from `sitemap.ts` until content migration to Theirs is completed.

---

## 2. CREATE ONE SEO LAYER

- [x] **[COMPLETED] lib/seo/config.ts**:
  - `canonicalOrigin`: `https://theirs.page`
  - `siteName`: `Theirs`
  - `siteCategory`: `Online memorial website`
  - `defaultTitle`: `Online Memorial Website for Loved Ones | Theirs`
  - `defaultDescription`: `Create a beautiful online memorial website for someone you love. Share photos, stories and tributes, and invite family and friends to add their memories.`
  - `logoUrl`: `https://theirs.page/theirs-logo.svg`
  - `defaultOgImage`: `https://theirs.page/opengraph-image`
  - `locale`: `en_US`
  - `supportEmail`: `suport@theirs.page`
  - Factual pricing: Free ($0) and Complete ($179 one-time, no subscription)
  - No fake social accounts, reviews, founding dates, or addresses added.
- [x] **[COMPLETED] lib/seo/pages.ts**:
  - Static page registry driving metadata and sitemap for `/`, `/privacy`, `/terms`, `/guidelines`, `/refunds`, and `/blog`.
- [x] **[COMPLETED] lib/seo/metadata.ts**:
  - `buildStaticMetadata()`, `buildMemorialMetadata()`, `buildBlogMetadata()`, `buildNoIndexMetadata()`.
  - Consistent title templates without duplicating `| Theirs`.
  - No meta keywords.
- [x] **[COMPLETED] lib/seo/schema.ts**:
  - Reusable connected `@graph` builders with stable `@id` anchors:
    - `https://theirs.page/#organization`
    - `https://theirs.page/#website`
    - `https://theirs.page/#webapp`
    - `https://theirs.page/#faq`
    - `{PAGE_URL}#webpage`
    - `{MEMORIAL_URL}#person`
    - `{ARTICLE_URL}#article`
- [x] **[COMPLETED] components/seo/json-ld.tsx**:
  - Secure renderer implementing `safeJsonLdReplacer()`.
  - Escapes `<`, `>`, `&`, `\u2028`, and `\u2029`.
  - Automated security tests verify `</script><script>alert(1)</script>` cannot break out of the script tag.

---

## 3. PAGE → SCHEMA MATRIX AUDIT

### HOME `/`
- [x] **[COMPLETED] Metadata**:
  - Title: `Online Memorial Website for Loved Ones | Theirs`
  - Meta description: Locked positioning statement
  - Self canonical: `https://theirs.page/`
  - Robots: `index: true, follow: true`
- [x] **[COMPLETED] Schema Graph**:
  - `Organization` with logo, description, support email
  - `WebSite` referencing Organization
  - `WebApplication` with factual Free ($0) and Complete ($179) pricing, no fake reviews/ratings
  - `WebPage` referencing WebSite
  - `FAQPage` consuming visible homepage FAQs
  - No BreadcrumbList on homepage

### LEGAL PAGES (`/privacy`, `/terms`, `/guidelines`, `/refunds`)
- [x] **[COMPLETED] Metadata**: Unique descriptive title, description, self-canonical, `index: true, follow: true`.
- [x] **[COMPLETED] Schema**: `WebPage` connected to Organization and WebSite; no pointless FAQ or Product schemas.

### BLOG INDEX `/blog`
- [x] **[COMPLETED] Policy & Metadata**:
  - Flagged as `indexable: false` and `sitemap: false` in `pages.ts` while articles contain legacy photo-restoration topics.
  - Generates clean Theirs branding with `robots: { index: false, follow: false }`.

### BLOG ARTICLE `/blog/[slug]`
- [x] **[COMPLETED] Metadata & Schema**:
  - Clean plain-text excerpt and absolute OG images.
  - `BlogPosting` with real WordPress author name and Theirs organization publisher.
  - Temporarily `robots: { index: false, follow: false }` until content migration to Theirs.

### PUBLIC MEMORIAL OVERVIEW `/[slug]`
- [x] **[COMPLETED] Indexability**: Only `public` + `published` memorials are indexable.
- [x] **[COMPLETED] Title Formula**: `{Full Name} Memorial ({years if available}) | Theirs`.
- [x] **[COMPLETED] Description**: Natural summary built from name, dates, location, and epitaph.
- [x] **[COMPLETED] Schema Graph**:
  - `WebPage` with `about` referencing Person
  - `Person` with factual visible fields (`name`, `birthDate`, `deathDate`, `image`, `description`, `url`)
  - Does NOT use `ProfilePage`.

### PUBLIC MEMORIAL SUBPAGES (`/[slug]/gallery`, `/[slug]/timeline`, `/[slug]/memories`, `/[slug]/tributes`, `/[slug]/life`)
- [x] **[COMPLETED] Indexability**: All subpages serve `robots: { index: false, follow: true }`.
- [x] **[COMPLETED] Canonicals**: Clean self-canonicals; not competing with overview.
- [x] **[COMPLETED] Sitemaps**: Excluded from `sitemap.xml`.

### UNLISTED MEMORIALS
- [x] **[COMPLETED] Robots**: `robots: { index: false, follow: false }`.
- [x] **[COMPLETED] Sitemap**: Excluded from `sitemap.xml`.
- [x] **[COMPLETED] Schema**: No Person schema emitted.

### PRIVATE / PIN MEMORIALS
- [x] **[COMPLETED] Robots**: `robots: { index: false, follow: false }`.
- [x] **[COMPLETED] Data Protection**: No private portrait, deceased name, or epitaph leaked in page title, description, OG, Twitter, or HTML payload.
- [x] **[COMPLETED] Sitemap**: Excluded from `sitemap.xml`.
- [x] **[COMPLETED] Schema**: No Person schema emitted.

### DRAFT / ARCHIVED MEMORIALS
- [x] **[COMPLETED] Robots**: `robots: { index: false, follow: false }`.
- [x] **[COMPLETED] Sitemap**: Excluded from `sitemap.xml`.

### LOGIN / DASHBOARD / ADMIN / AUTH / API / INVITATIONS / ERROR ROUTES
- [x] **[COMPLETED] Robots**: All marked `robots: { index: false, follow: false }`.
- [x] **[COMPLETED] Schema**: Zero SEO JSON-LD scripts emitted.
- [x] **[COMPLETED] Sitemap**: Strictly excluded from `sitemap.xml`.

---

## 4. SITEMAP REBUILD

- [x] **[COMPLETED] Rebuild from real data**: Implemented in `app/sitemap.ts`.
- [x] **[COMPLETED] Inclusions**:
  - Homepage `/`
  - Public legal pages (`/privacy`, `/terms`, `/guidelines`, `/refunds`)
  - Dynamic `public` + `published` memorials from Supabase.
- [x] **[COMPLETED] Exclusions**:
  - `/login`, `/dashboard`, `/admin`, `/auth`, `/invitation`, `/api`
  - Private, unlisted, draft, and archived memorials
  - Memorial subpages (`/gallery`, `/timeline`, `/memories`, `/tributes`, `/life`)
  - `/blog` and blog posts while legacy.
- [x] **[COMPLETED] Real timestamps**: Uses `updatedAt` / `updated_at`; eliminated blanket `new Date()` freshness spam.

---

## 5. ROBOTS / SEARCH VS AI CRAWLERS

- [x] **[COMPLETED] Search & Discovery Crawlers**:
  - `Googlebot`, `Bingbot`, `Applebot`, `OAI-SearchBot`, `PerplexityBot`, `Claude-Web` permitted on `/` (except `privatePaths`).
- [x] **[COMPLETED] AI Model-Training Scrapers Blocked**:
  - `GPTBot`, `CCBot`, `anthropic-ai`, `Google-Extended`, `Applebot-Extended`, `meta-externalagent`, `Amazonbot`, `cohere-ai` blocked on `/`.
- [x] **[COMPLETED] Commercial Scrapers Blocked**:
  - `Bytespider`, `Diffbot`, `ImagesiftBot` blocked on `/`.
- [x] **[COMPLETED] Disallowed Private Paths**:
  - `/api/`, `/dashboard/`, `/admin/`, `/auth/`, `/invitation/`, `/_next/`, `/private/`.

---

## 6. CANONICAL RULES

- [x] **[COMPLETED] Single self-canonical per indexable page**:
  - Homepage: `https://theirs.page/`
  - Legal: `https://theirs.page/{path}`
  - Memorial overview: `https://theirs.page/{slug}`
  - Query parameters stripped from canonical declarations.

---

## 7. AEO / ANSWER-ENGINE FOUNDATION

- [x] **[COMPLETED] Content guidelines established in docs/SEO.md**:
  - Documented semantic H1/H2/H3 hierarchy, question headings, concise definition answers, and visible HTML text.
  - Zero "AI SEO" hacks or doorway pages.

---

## 8. ORGANIZATION / SITE ENTITY CONSISTENCY

- [x] **[COMPLETED] Uniform entity references**:
  - Organization `@id`: `https://theirs.page/#organization`
  - WebSite `@id`: `https://theirs.page/#website`
  - WebApplication `@id`: `https://theirs.page/#webapp`
  - Consistent across homepage, legal pages, memorials, and blog articles.

---

## 9. SOCIAL / OPENGRAPH

- [x] **[COMPLETED] Dynamic 1200x630 OG image generation**:
  - Created `app/opengraph-image.tsx` with editorial styling, Theirs typography, positioning eyebrow, and brand mark.
- [x] **[COMPLETED] Memorial OG images**:
  - Public portrait when available; private memorials do not leak portrait.
- [x] **[COMPLETED] Absolute URLs**: All OG and Twitter URLs are absolute.

---

## 10. IMPORTANT CLEANUPS

- [x] **[COMPLETED] Old homepage "life archive" metadata**: Replaced with "Online memorial website".
- [x] **[COMPLETED] BringBack branding in /blog metadata**: Cleaned up to Theirs.
- [x] **[COMPLETED] BringBack publisher/author schema**: Updated to real author and Theirs Organization publisher.
- [x] **[COMPLETED] Duplicated "| Theirs" title behavior**: Fixed across all metadata builders.
- [x] **[COMPLETED] Hard-coded schema scattered across pages**: Centralized into `lib/seo/schema.ts` and `components/seo/json-ld.tsx`.
- [x] **[COMPLETED] Sitemap containing /login**: Removed.
- [x] **[COMPLETED] Sitemap missing dynamic pages**: Added public published memorials.
- [x] **[COMPLETED] All-static lastModified = current time**: Replaced with actual modified timestamps.
- [x] **[COMPLETED] FAQ schema/data duplication**: Unified via `content/faq.ts`.
- [x] **[COMPLETED] Memorial JSON-LD unsafe serialization**: Sanitized via `safeJsonLdReplacer`.
- [x] **[COMPLETED] Private/unlisted indexing leakage**: Blocked with strict noindex/nofollow and zero private data in metadata.
- [x] **[COMPLETED] Stale robots crawler assumptions**: Replaced permissive AI training rules with strict blocking of model training bots.

---

## 11. VALIDATION & TESTS

- [x] **[COMPLETED] Automated Unit Tests (`tests/seo/seo.test.ts`)**:
  - 16 passing tests validating security escaping, metadata builders, privacy boundaries, schema graphs, sitemap exclusions, and crawler separation.
- [x] **[COMPLETED] Security Test**:
  - `safeJsonLdReplacer` verified to neutralize `</script><script>alert(1)</script>`.
- [x] **[COMPLETED] TypeScript Check**:
  - `npx tsc --noEmit` passing with 0 errors.
- [x] **[COMPLETED] Upload Tests Regression Check**:
  - `npm run test:uploads` (23 passing tests).

---

## 12. DELIVERABLES SUMMARY

| Deliverable | Status | Location |
| :--- | :--- | :--- |
| SEO Configuration | COMPLETED | [`lib/seo/config.ts`](../lib/seo/config.ts) |
| Static Page Registry | COMPLETED | [`lib/seo/pages.ts`](../lib/seo/pages.ts) |
| Metadata Builders | COMPLETED | [`lib/seo/metadata.ts`](../lib/seo/metadata.ts) |
| Schema Graph Builders | COMPLETED | [`lib/seo/schema.ts`](../lib/seo/schema.ts) |
| Secure JSON-LD Component | COMPLETED | [`components/seo/json-ld.tsx`](../components/seo/json-ld.tsx) |
| Single Source FAQ Data | COMPLETED | [`content/faq.ts`](../content/faq.ts) |
| Dynamic OG Generator | COMPLETED | [`app/opengraph-image.tsx`](../app/opengraph-image.tsx) |
| Robots Configuration | COMPLETED | [`app/robots.ts`](../app/robots.ts) |
| Sitemap Rebuilder | COMPLETED | [`app/sitemap.ts`](../app/sitemap.ts) |
| Handbook Documentation | COMPLETED | [`docs/SEO.md`](./SEO.md) |
| Implementation Audit | COMPLETED | [`docs/SEO-update.md`](./SEO-update.md) |