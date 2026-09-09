# SEO & Structured Data Architecture Handbook for Theirs (`theirs.page`)

> **"One person. One memorial. One indexable URL."**  
> This document defines the unified, maintainable SEO, structured data, canonical, crawler, and security architecture for `theirs.page`. All future developers and AI agents must follow this system rather than scattering ad-hoc metadata or JSON-LD scripts across individual components.

---

## 1. Architectural Principles

1. **Single Source of Truth**: All domain identities, URLs, category positioning, crawler lists, and pricing are configured in [`lib/seo/config.ts`](../lib/seo/config.ts).
2. **Centralized Static Registry**: Every static public page is registered in [`lib/seo/pages.ts`](../lib/seo/pages.ts), which drives both `generateMetadata` / `metadata` and [`app/sitemap.ts`](../app/sitemap.ts).
3. **Reusable Builders**: Page metadata is constructed using builder functions in [`lib/seo/metadata.ts`](../lib/seo/metadata.ts) (`buildStaticMetadata`, `buildMemorialMetadata`, `buildBlogMetadata`, `buildNoIndexMetadata`).
4. **Connected Schema Graphs**: Structured data is constructed as a connected JSON-LD `@graph` with stable `@id` references in [`lib/seo/schema.ts`](../lib/seo/schema.ts).
5. **Secure Serialization**: Never inject raw `JSON.stringify(userContent)` directly into `<script>` tags. All JSON-LD must pass through [`components/seo/json-ld.tsx`](../components/seo/json-ld.tsx) which neutralizes script-breakout vectors (`<`, `>`, `&`, U+2028, U+2029).
6. **Zero "AI SEO" Gimmicks**: AEO (Answer Engine Optimization) is achieved via clear, crawlable HTML headings, factual information, and standard SEO crawlability. No `llms.txt`, no fake ratings, and no keyword-stuffed schemas.

---

## 2. Directory Layout

```
lib/seo/
  ├── config.ts       # Canonical origin, site identity, category, crawler groups, pricing
  ├── pages.ts        # Static page registry (paths, titles, descriptions, indexability, sitemap)
  ├── metadata.ts     # Reusable Metadata builders
  └── schema.ts       # Connected JSON-LD Schema.org graph builders

components/seo/
  └── json-ld.tsx     # Secure, sanitized JSON-LD script component

content/
  └── faq.ts          # Audited single source of truth for both FAQ UI and FAQPage schema

docs/
  ├── SEO.md          # This handbook
  └── SEO-update.md   # Implementation checklist and launch readiness audit
```

---

## 3. Crawler Policy & Search vs. AI Training Separation

Theirs maintains a clear trust and privacy stance regarding family memorials:

### A. Allowed: Search & Discovery Bots
Live query engines and traditional search engines that index public pages and fetch query-time answers for users are permitted on public indexable pages:
- `Googlebot`, `Bingbot`, `Applebot`
- `OAI-SearchBot` (ChatGPT Search)
- `PerplexityBot`, `Perplexity-User`
- `ChatGPT-User`
- `Claude-Web`, `ClaudeBot`

*Rule*: Allowed on `/`, disallowed on private paths (`/api/`, `/dashboard/`, `/admin/`, `/auth/`, `/invitation/`, `/_next/`, `/private/`).

### B. Blocked: AI Model-Training Scrapers
Bots that scrape content into foundation training corpora are blocked site-wide to protect family memories from being absorbed into generative models:
- `GPTBot` (OpenAI model training)
- `CCBot` (Common Crawl open datasets)
- `anthropic-ai` (Anthropic model training)
- `Google-Extended` (Gemini model training)
- `Applebot-Extended` (Apple Intelligence training)
- `meta-externalagent` (Meta model training)
- `Amazonbot` (Amazon Titan training)
- `cohere-ai` (Cohere training)

### C. Blocked: Aggressive Commercial Scrapers
- `Bytespider`, `Diffbot`, `ImagesiftBot` are blocked site-wide.

---

## 4. Memorial Indexation & Canonical Rules

> **Rule: One person. One memorial. One indexable URL.**

1. **Overview Page (`/[slug]`)**:
   - The **only** indexable URL for a public, published memorial.
   - Metadata title formula: `{Full Name} Memorial ({years if available}) | Theirs`
   - Canonical: `https://theirs.page/${slug}`
   - Robots: `index: true, follow: true`
   - OpenGraph: `type: "website"` (not `profile`), portrait as primary image.
   - Schema: Connected `@graph` with Organization, WebSite, WebPage, and Person.
2. **Memorial Subpages (`/[slug]/gallery`, `/[slug]/timeline`, `/[slug]/memories`, `/[slug]/tributes`, `/[slug]/life`)**:
   - Navigation subpages for visitors, not competing SEO landing pages.
   - Robots: `index: false, follow: true`
   - Canonical: Self-canonical (`https://theirs.page/${slug}/${subpage}`)
   - Excluded from `sitemap.xml`.
3. **Private / PIN-Protected Memorials**:
   - Robots: `index: false, follow: false`
   - Title: `Private Memorial | Theirs`
   - Description: `A private family memorial.`
   - No private portrait, deceased name, or epitaph leaked in OpenGraph or Twitter meta tags.
   - Excluded from `sitemap.xml`.
   - No Person JSON-LD emitted.
4. **Unlisted / Draft / Archived Memorials**:
   - Robots: `index: false, follow: false`
   - Excluded from `sitemap.xml`.
   - No Person JSON-LD emitted.

---

## 5. Structured Data & Stable `@id` Graph Architecture

All schemas use stable `@id` URIs so search engines understand entities in context:

| Entity | Stable `@id` URI |
| :--- | :--- |
| Organization | `https://theirs.page/#organization` |
| WebSite | `https://theirs.page/#website` |
| WebApplication | `https://theirs.page/#webapp` |
| FAQPage | `https://theirs.page/#faq` |
| WebPage | `{PAGE_URL}#webpage` |
| Person | `{MEMORIAL_URL}#person` |
| Article | `{ARTICLE_URL}#article` |

### Key Schema Guidelines:
- **No Fake Ratings**: WebApplication includes accurate pricing ($0 Free tier and $179 Complete one-time), but omits fake `aggregateRating` or reviews.
- **Strict FAQ Alignment**: The visible FAQ component (`components/theirs/faq.tsx`) and `FAQPage` schema consume the exact same data array in `content/faq.ts`.
- **Person Schema**: Exclusively factual visible data: `name`, `birthDate`, `deathDate`, `image`, `description`, `url`.

---

## 6. Security: Safe JSON-LD Serialization

Memorial names, stories, and tributes are user-controlled input. Directly interpolating user data into `<script>` elements creates Cross-Site Scripting (XSS) risks if a user submits strings like `</script><script>alert(1)</script>`.

[`safeJsonLdReplacer()`](../components/seo/json-ld.tsx) neutralizes this by replacing:
- `<` with `\u003c`
- `>` with `\u003e`
- `&` with `\u0026`
- `\u2028` with `\\u2028`
- `\u2029` with `\\u2029`

Standard JSON parsers and Schema.org crawlers correctly decode these unicode escapes back into standard characters, but HTML parsers will never misinterpret them as closing script tags.

---

## 7. Legacy Blog Migration Status

The current `/blog` section contains legacy photo-restoration articles from the BringBack era.
- **Current SEO Stance**: All blog index and article pages are marked `robots: { index: false, follow: false }` and excluded from `sitemap.ts`.
- **Future Migration**: When new memorial-specific articles are published, update `indexable: true` and `sitemap: true` in `lib/seo/pages.ts` and set `isTemporarilyNoIndex = false` in `lib/seo/metadata.ts`.

---

## 8. Verification & Test Commands

Automated SEO tests are located in `tests/seo/seo.test.ts`:

```bash
# Run SEO unit tests (security escaping, metadata builders, schema graphs, sitemap logic)
npx tsx --test tests/seo/seo.test.ts

# Run complete TypeScript compilation check
npx tsc --noEmit
```
