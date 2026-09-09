import assert from "node:assert/strict"
import test from "node:test"
import { safeJsonLdReplacer } from "../../components/seo/json-ld"
import { SEO_CONFIG } from "../../lib/seo/config"
import { STATIC_PAGES, getSitemapStaticPages } from "../../lib/seo/pages"
import {
  buildStaticMetadata,
  buildMemorialMetadata,
  buildBlogMetadata,
  buildNoIndexMetadata,
} from "../../lib/seo/metadata"
import {
  buildHomeSchemaGraph,
  buildMemorialSchemaGraph,
  buildLegalPageSchemaGraph,
  buildBlogArticleSchemaGraph,
  SCHEMA_IDS,
} from "../../lib/seo/schema"
import { FAQS } from "../../content/faq"
import type { MemorialIdentity } from "../../types/memorial-view"
import type { WordPressPost } from "../../lib/wordpress"

// ==========================================
// 1. SECURITY & JSON-LD INJECTION TESTS
// ==========================================

test("SECURITY: safeJsonLdReplacer neutralizes script breakout attacks", () => {
  const maliciousInput = {
    fullName: "Robert Carter</script><script>alert('pwned')</script>",
    epitaph: "Beloved father & grandfather <img src=x onerror=alert(1)>",
  }

  const serialized = safeJsonLdReplacer(maliciousInput)

  // Critical assertion: Literal closing script tag MUST NOT exist in serialized output
  assert.equal(serialized.includes("</script>"), false)
  assert.equal(serialized.includes("<script>"), false)

  // Must contain unicode escaped representations
  assert.ok(serialized.includes("\\u003c/script\\u003e"))
  assert.ok(serialized.includes("\\u003cscript\\u003e"))
  assert.ok(serialized.includes("\\u0026"))

  // Verify that standard JSON.parse correctly parses the escaped output back to original string values
  const parsed = JSON.parse(serialized)
  assert.equal(parsed.fullName, maliciousInput.fullName)
  assert.equal(parsed.epitaph, maliciousInput.epitaph)
})

test("SECURITY: safeJsonLdReplacer escapes U+2028 and U+2029 line separators", () => {
  const input = {
    story: "Line 1\u2028Line 2\u2029Paragraph 2",
  }
  const serialized = safeJsonLdReplacer(input)
  assert.equal(serialized.includes("\u2028"), false)
  assert.equal(serialized.includes("\u2029"), false)
  assert.ok(serialized.includes("\\u2028"))
  assert.ok(serialized.includes("\\u2029"))
})

// ==========================================
// 2. METADATA BUILDER TESTS
// ==========================================

test("buildStaticMetadata creates valid homepage metadata without duplicated '| Theirs'", () => {
  const meta = buildStaticMetadata("/")

  assert.deepEqual(meta.title, { absolute: SEO_CONFIG.defaultTitle })
  assert.equal(meta.description, SEO_CONFIG.defaultDescription)
  assert.deepEqual(meta.alternates?.canonical, `${SEO_CONFIG.canonicalOrigin}/`)
  assert.deepEqual(meta.robots, { index: true, follow: true })
  assert.equal((meta.openGraph as any)?.type, "website")
  assert.equal(meta.openGraph?.title, SEO_CONFIG.defaultTitle)
  assert.equal(meta.openGraph?.url, `${SEO_CONFIG.canonicalOrigin}/`)
  assert.equal((meta.twitter as any)?.card, "summary_large_image")
})

test("buildStaticMetadata creates valid legal page metadata", () => {
  const privacyMeta = buildStaticMetadata("/privacy")
  assert.equal(privacyMeta.title, "Privacy Policy")
  assert.deepEqual(privacyMeta.alternates?.canonical, `${SEO_CONFIG.canonicalOrigin}/privacy`)
  assert.deepEqual(privacyMeta.robots, { index: true, follow: true })

  const termsMeta = buildStaticMetadata("/terms")
  assert.equal(termsMeta.title, "Terms of Service")
  assert.deepEqual(termsMeta.alternates?.canonical, `${SEO_CONFIG.canonicalOrigin}/terms`)
})

test("buildMemorialMetadata: Public published memorial gets index: true and correct title formula", () => {
  const identity: MemorialIdentity = {
    slug: "robert-carter",
    fullName: "Robert Edward Carter",
    birthYear: 1948,
    deathYear: 2024,
    epitaph: "Master clockmaker and devoted grandfather.",
    location: "Devon, UK",
    portraitUrl: "https://theirs.page/portrait.jpg",
    status: "published",
    privacy: "public",
    isDemo: false,
    isPaid: true,
    isOwner: false,
    sectionSettings: { story: true, gallery: true, timeline: true, tributes: true, stories: true },
  }

  const meta = buildMemorialMetadata({ identity, slug: "robert-carter" })

  assert.deepEqual(meta.title, {
    absolute: "Robert Edward Carter Memorial (1948–2024) | Theirs",
  })
  assert.deepEqual(meta.robots, { index: true, follow: true })
  assert.deepEqual(meta.alternates?.canonical, "https://theirs.page/robert-carter")
  assert.equal((meta.openGraph as any)?.type, "website") // Must NOT be 'profile'
  assert.equal(meta.openGraph?.title, "Robert Edward Carter Memorial (1948–2024) | Theirs")
  assert.ok((meta.openGraph as any)?.images && (meta.openGraph as any).images.length > 0)
})

test("buildMemorialMetadata: Memorial subpages get robots: { index: false, follow: true }", () => {
  const identity: MemorialIdentity = {
    slug: "robert-carter",
    fullName: "Robert Edward Carter",
    birthYear: 1948,
    deathYear: 2024,
    status: "published",
    privacy: "public",
    isDemo: false,
    isPaid: true,
    isOwner: false,
    sectionSettings: {},
  }

  const galleryMeta = buildMemorialMetadata({
    identity,
    slug: "robert-carter",
    isSubpage: true,
    subpageTitle: "Photographs & Media Gallery",
    subpagePath: "gallery",
  })

  // Subpage MUST be noindex, follow
  assert.deepEqual(galleryMeta.robots, { index: false, follow: true })
  assert.deepEqual(galleryMeta.title, {
    absolute: "Photographs & Media Gallery — Robert Edward Carter Memorial (1948–2024) | Theirs",
  })
  assert.deepEqual(galleryMeta.alternates?.canonical, "https://theirs.page/robert-carter/gallery")
})

test("buildMemorialMetadata: Private memorial strictly blocks indexing and leaks no private data", () => {
  const privateIdentity: MemorialIdentity = {
    slug: "secret-family",
    fullName: "Secret Person",
    birthYear: 1950,
    deathYear: 2020,
    epitaph: "Super secret private epitaph",
    portraitUrl: "https://theirs.page/private-portrait.jpg",
    status: "published",
    privacy: "private",
    isDemo: false,
    isPaid: true,
    isOwner: false,
    sectionSettings: {},
  }

  const meta = buildMemorialMetadata({ identity: privateIdentity, slug: "secret-family" })

  assert.deepEqual(meta.robots, { index: false, follow: false })
  assert.deepEqual(meta.title, { absolute: "Private Memorial | Theirs" })
  assert.equal(meta.description, "A private family memorial.")
  assert.equal(meta.openGraph?.title, "Private Memorial | Theirs")
  // Must NOT leak private portrait
  assert.equal(meta.openGraph?.images, undefined)
  assert.equal(meta.twitter?.images, undefined)
})

test("buildMemorialMetadata: Unlisted and draft memorials get index: false", () => {
  const unlistedIdentity: MemorialIdentity = {
    slug: "unlisted-memorial",
    fullName: "Unlisted Person",
    status: "published",
    privacy: "unlisted",
    isDemo: false,
    isPaid: true,
    isOwner: false,
    sectionSettings: {},
  }
  const unlistedMeta = buildMemorialMetadata({ identity: unlistedIdentity, slug: "unlisted-memorial" })
  assert.deepEqual(unlistedMeta.robots, { index: false, follow: false })

  const draftIdentity: MemorialIdentity = {
    ...unlistedIdentity,
    status: "draft",
    privacy: "public",
  }
  const draftMeta = buildMemorialMetadata({ identity: draftIdentity, slug: "draft-memorial" })
  assert.deepEqual(draftMeta.robots, { index: false, follow: false })
})

test("buildNoIndexMetadata generates strict noindex, nofollow", () => {
  const loginMeta = buildNoIndexMetadata("Sign In", "Sign in to Theirs")
  assert.deepEqual(loginMeta.robots, { index: false, follow: false })
  assert.deepEqual(loginMeta.title, { absolute: "Sign In | Theirs" })
})

// ==========================================
// 3. SCHEMA & STRUCTURED DATA TESTS
// ==========================================

test("buildHomeSchemaGraph generates valid connected @graph with stable IDs", () => {
  const graph = buildHomeSchemaGraph()
  assert.equal(graph["@context"], "https://schema.org")
  assert.ok(Array.isArray(graph["@graph"]))

  const types = graph["@graph"].map((item) => item["@type"])
  assert.ok(types.includes("Organization"))
  assert.ok(types.includes("WebSite"))
  assert.ok(types.includes("WebApplication"))
  assert.ok(types.includes("WebPage"))
  assert.ok(types.includes("FAQPage"))

  // Organization check
  const org = graph["@graph"].find((i) => i["@type"] === "Organization")
  assert.equal((org as any)?.["@id"], SCHEMA_IDS.organization)
  assert.equal((org as any)?.name, "Theirs")

  // WebApplication check (accurate pricing, no fake ratings)
  const webApp = graph["@graph"].find((i) => i["@type"] === "WebApplication") as any
  assert.equal(webApp["@id"], SCHEMA_IDS.webapp)
  assert.equal(webApp.aggregateRating, undefined)
  assert.equal(webApp.review, undefined)
  assert.equal(webApp.offers.length, 2)
  assert.equal(webApp.offers[0].price, "0")
  assert.equal(webApp.offers[1].price, "179")

  // FAQPage check: exactly matches FAQS in content/faq.ts
  const faqSchema = graph["@graph"].find((i) => i["@type"] === "FAQPage") as any
  assert.equal(faqSchema.mainEntity.length, FAQS.length)
  assert.equal(faqSchema.mainEntity[0].name, FAQS[0].question)
  assert.equal(faqSchema.mainEntity[0].acceptedAnswer.text, FAQS[0].answer)
})

test("buildMemorialSchemaGraph: Public published memorial links WebPage to Person", () => {
  const identity: MemorialIdentity = {
    slug: "robert-carter",
    fullName: "Robert Edward Carter",
    birthYear: 1948,
    deathYear: 2024,
    epitaph: "Master clockmaker.",
    status: "published",
    privacy: "public",
    isDemo: false,
    isPaid: true,
    isOwner: false,
    sectionSettings: {},
  }

  const schema = buildMemorialSchemaGraph(identity, "robert-carter")
  assert.ok(schema)
  assert.ok(Array.isArray(schema["@graph"]))

  const person = schema["@graph"].find((i) => i["@type"] === "Person") as any
  assert.ok(person)
  assert.equal(person.name, "Robert Edward Carter")
  assert.equal(person.birthDate, "1948")
  assert.equal(person.deathDate, "2024")
  assert.equal(person.description, "Master clockmaker.")

  const webPage = schema["@graph"].find((i) => i["@type"] === "WebPage") as any
  assert.ok(webPage)
  assert.deepEqual(webPage.about, { "@id": SCHEMA_IDS.person("https://theirs.page/robert-carter") })

  // Verify ProfilePage is NOT used
  const hasProfilePage = schema["@graph"].some((i) => i["@type"] === "ProfilePage")
  assert.equal(hasProfilePage, false)
})

test("buildMemorialSchemaGraph returns null for private and unlisted memorials", () => {
  const privateIdentity: MemorialIdentity = {
    slug: "private-one",
    fullName: "Private One",
    status: "published",
    privacy: "private",
    isDemo: false,
    isPaid: true,
    isOwner: false,
    sectionSettings: {},
  }
  assert.equal(buildMemorialSchemaGraph(privateIdentity, "private-one"), null)

  const unlistedIdentity: MemorialIdentity = {
    ...privateIdentity,
    privacy: "unlisted",
  }
  assert.equal(buildMemorialSchemaGraph(unlistedIdentity, "unlisted-one"), null)
})

test("buildLegalPageSchemaGraph contains WebPage and WebSite, but NO FAQ or WebApp", () => {
  const legalGraph = buildLegalPageSchemaGraph("/privacy", "Privacy Policy", "Description")
  const types = legalGraph["@graph"].map((i) => i["@type"])
  assert.ok(types.includes("WebPage"))
  assert.ok(types.includes("WebSite"))
  assert.ok(types.includes("Organization"))
  assert.equal(types.includes("FAQPage"), false)
  assert.equal(types.includes("WebApplication"), false)
})

test("buildBlogArticleSchemaGraph contains real author and clean publisher", () => {
  const dummyPost: WordPressPost = {
    id: "p1",
    title: "Preserving Family Memories",
    excerpt: "Tips on keeping stories alive.",
    content: "<p>Full content</p>",
    slug: "preserving-family-memories",
    date: "2026-01-01T00:00:00Z",
    modified: "2026-01-02T00:00:00Z",
    author: {
      node: {
        name: "Jane Doe",
        avatar: { url: "" },
      },
    },
    featuredImage: null,
    categories: { nodes: [{ name: "Guides", slug: "guides" }] },
  }

  const blogGraph = buildBlogArticleSchemaGraph(dummyPost)
  const posting = blogGraph["@graph"].find((i) => i["@type"] === "BlogPosting") as any
  assert.ok(posting)
  assert.equal(posting.headline, "Preserving Family Memories")
  assert.equal(posting.author.name, "Jane Doe")
  assert.deepEqual(posting.publisher, { "@id": SCHEMA_IDS.organization })
})

// ==========================================
// 4. SITEMAP & CRAWLER POLICY TESTS
// ==========================================

test("Sitemap static pages exclude /login and /blog (while legacy)", () => {
  const sitemapPages = getSitemapStaticPages()
  const paths = sitemapPages.map((p) => p.path)

  // Must include:
  assert.ok(paths.includes("/"))
  assert.ok(paths.includes("/privacy"))
  assert.ok(paths.includes("/terms"))
  assert.ok(paths.includes("/guidelines"))
  assert.ok(paths.includes("/refunds"))

  // Must EXCLUDE:
  assert.equal(paths.includes("/login"), false)
  assert.equal(paths.includes("/dashboard"), false)
  assert.equal(paths.includes("/admin"), false)
  assert.equal(paths.includes("/blog"), false) // while legacy
})

test("Crawler configuration cleanly separates search discovery from AI model training", () => {
  const { searchDiscoveryBots, blockedAiTrainingBots, blockedScraperBots } = SEO_CONFIG.crawlers

  // Search discovery includes OAI-SearchBot and PerplexityBot
  assert.ok(searchDiscoveryBots.includes("OAI-SearchBot"))
  assert.ok(searchDiscoveryBots.includes("PerplexityBot"))
  assert.ok(searchDiscoveryBots.includes("Googlebot"))

  // AI model training explicitly blocks GPTBot and CCBot
  assert.ok(blockedAiTrainingBots.includes("GPTBot"))
  assert.ok(blockedAiTrainingBots.includes("CCBot"))
  assert.ok(blockedAiTrainingBots.includes("Google-Extended"))
  assert.ok(blockedAiTrainingBots.includes("anthropic-ai"))

  // Zero overlap between search discovery and blocked training
  for (const bot of searchDiscoveryBots) {
    assert.equal(blockedAiTrainingBots.includes(bot as any), false, `Bot ${bot} is in both lists!`)
  }

  // Scrapers blocked
  assert.ok(blockedScraperBots.includes("Bytespider"))
})

test("buildBlogMetadata produces clean absolute titles and strips duplicated brand suffixes", () => {
  // 1. Blog index
  const indexMeta = buildBlogMetadata()
  assert.deepEqual(indexMeta.title, { absolute: "Blog | Theirs" })

  // 2. Blog article with clean title
  const cleanPost: WordPressPost = {
    id: "p1",
    title: "How to Create an Online Memorial",
    excerpt: "Step by step guide.",
    content: "Content",
    slug: "how-to-create-online-memorial",
    date: "2026-01-01T00:00:00Z",
    modified: "2026-01-02T00:00:00Z",
    author: { node: { name: "Author", avatar: { url: "" } } },
    featuredImage: null,
    categories: { nodes: [] },
  }
  const cleanMeta = buildBlogMetadata({ post: cleanPost, isArticle: true })
  assert.deepEqual(cleanMeta.title, { absolute: "How to Create an Online Memorial | Theirs Blog" })

  // 3. Blog article with messy title containing existing suffix
  const messyPost: WordPressPost = {
    ...cleanPost,
    title: "How to Create an Online Memorial - BringBack",
  }
  const messyMeta = buildBlogMetadata({ post: messyPost, isArticle: true })
  assert.deepEqual(messyMeta.title, { absolute: "How to Create an Online Memorial | Theirs Blog" })

  const alreadySuffixedPost: WordPressPost = {
    ...cleanPost,
    title: "How to Create an Online Memorial | Theirs Blog",
  }
  const alreadySuffixedMeta = buildBlogMetadata({ post: alreadySuffixedPost, isArticle: true })
  assert.deepEqual(alreadySuffixedMeta.title, { absolute: "How to Create an Online Memorial | Theirs Blog" })
})

