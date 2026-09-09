import "server-only"

import { cache } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"
import { getSupabaseAdminSafe } from "@/utils/supabase/admin"
import { resolveMediaUrl } from "@/lib/r2"
import { RESERVED_MEMORIAL_SLUGS } from "@/lib/memorial-slug"
import type { GalleryItem } from "@/components/memorial/memorial-gallery"
import type { TimelineMilestone } from "@/components/memorial/life-timeline"
import type { StoryItem } from "@/components/memorial/life-stories"
import type { MemoryItem } from "@/components/memorial/memories-stream"
import type {
  BrowseCollection,
  GalleryFacets,
  GalleryFilter,
  MemorialHomeData,
  MemorialIdentity,
  PagedCollection,
} from "@/types/memorial-view"
import type { SectionSettings } from "@/types/theirs"
import { getMemorialPinCookieName, verifyPinAccessToken } from "@/lib/security/pin"
import { sanitizeContributionHtml } from "@/lib/safety/contribution-html"
import { getMemorialAccess } from "@/lib/memorial-auth"

const DEFAULT_SECTIONS: Required<SectionSettings> = {
  story: true,
  tributes: true,
  timeline: true,
  gallery: true,
  stories: true,
}

export const COLLECTION_PAGE_SIZES: Record<BrowseCollection, number> = {
  gallery: 24,
  memories: 6,
  timeline: 20,
  tributes: 12,
}

const DEMO_GALLERY: GalleryItem[] = [
  {
    id: "g1",
    title: "Christmas Day Washing Machine Repair",
    mediaType: "photo",
    year: "1984",
    location: "Mrs. Higgins' Kitchen, Devon",
    album: "Community Memories",
    isPinned: true,
    mediaUrl: "/landing/example-image-of-robert.webp",
    aspectRatio: "square",
    people: ["Robert Carter"],
    story: "Dad couldn’t walk past a broken appliance without pulling out a screwdriver. He spent half of Christmas Day fixing Mrs. Higgins' washing machine while everyone waited for dinner.",
    addedBy: "Anita Carter",
    sourceMemoryId: "story-1",
  },
  {
    id: "g2",
    title: "Tuning the Engine in the Old Garage",
    mediaType: "photo",
    year: "1974",
    location: "Clerkenwell Workshop, London",
    album: "Workshop",
    mediaUrl: "/landing/robert-hero-image2.png",
    aspectRatio: "portrait",
    people: ["Robert Carter"],
    story: "Working through the weekend on the Morris Minor engine. Robert believed every ping and rattle was just the car talking to him if you listened closely enough.",
    addedBy: "Meena Carter",
  },
  {
    id: "g3",
    title: "Checking Tyre Pressure Voicemail",
    mediaType: "audio",
    year: "2014",
    location: "Devon Cottage",
    album: "Recordings",
    mediaUrl: "/music/Beloved(chosic.com).mp3",
    duration: "0:24",
    story: "A voicemail Dad left before Anita drove back up to London: 'Check your tyres love, the motorway will be slick in the rain.'",
    addedBy: "Anita Carter",
  },
  {
    id: "g4",
    title: "Wedding Day at St. Jude’s",
    mediaType: "photo",
    year: "1974",
    location: "St. Jude’s Church, Oxford",
    album: "Family",
    mediaUrl: "/landing/demo/robert-wedding-1974.jpg",
    aspectRatio: "landscape",
    people: ["Robert Carter", "Meena Carter"],
    story: "Meena in vintage lace holding wild meadow flowers and Robert trying so hard to look solemn in his suit. Within five minutes they were both in stitches.",
    addedBy: "Meena Carter",
  },
  {
    id: "g5",
    title: "Tailgate Laughs with Brother David",
    mediaType: "photo",
    year: "1979",
    location: "Carter Clocks Yard, Devon",
    album: "Family",
    mediaUrl: "/landing/robert-with-david.webp",
    aspectRatio: "square",
    people: ["Robert Carter", "David Carter"],
    story: "Bob and his older brother David after hauling oak planks across Dartmoor. Covered in sawdust and motor grease, sharing a cold beer on the truck tailgate.",
    addedBy: "David Carter",
  },
  {
    id: "g6",
    title: "Fixing the Bicycle Chain",
    mediaType: "photo",
    year: "1958",
    location: "Exeter, Devon",
    album: "Early Years",
    mediaUrl: "/landing/robert-hero-image1.png",
    aspectRatio: "portrait",
    people: ["Robert Carter"],
    story: "Even at ten years old, Robert couldn’t bear to see a mechanism that didn't run smoothly. He spent Saturday mornings oiling every bicycle on the lane.",
    addedBy: "Anita Carter",
  },
  {
    id: "g7",
    title: "The Morris Minor Trip across Dartmoor",
    mediaType: "audio",
    year: "2019",
    location: "Carter Workshop",
    album: "Recordings",
    mediaUrl: "/music/Awakening-Dew(chosic.com).mp3",
    duration: "0:36",
    story: "Robert chuckling as he remembered getting caught in a sudden Dartmoor fog storm back in '78.",
    addedBy: "Sarah Jenkins",
  },
  {
    id: "g8",
    title: "Wiping Grease at the Car Window",
    mediaType: "photo",
    year: "1976",
    location: "Devon Cottage Driveway",
    album: "Workshop",
    mediaUrl: "/landing/robert-young.webp",
    aspectRatio: "square",
    people: ["Robert Carter"],
    story: "He wouldn't step foot inside the house until his hands were scrubbed with Swarfega. Meena caught him grinning through the car window after the engine purred.",
    addedBy: "Meena Carter",
  },
  {
    id: "g9",
    title: "Summer Barbecue in the Garden",
    mediaType: "photo",
    year: "1998",
    location: "Dartmoor Cottage Garden",
    album: "Family",
    mediaUrl: "/landing/robert-hero-image3.png",
    aspectRatio: "portrait",
    people: ["Robert Carter"],
    story: "Watching the grandchildren chase grasshoppers on a warm July afternoon, plate in hand, surrounded by the family he loved.",
    addedBy: "Anita Carter",
  },
  {
    id: "g10",
    title: "Morning Tea and the Daily Paper",
    mediaType: "photo",
    year: "2021",
    location: "Devon Cottage Kitchen",
    album: "Family",
    mediaUrl: "/landing/robert-hero-image4.png",
    aspectRatio: "portrait",
    people: ["Robert Carter"],
    story: "8:00 AM sharp. Hot pot of Earl Grey, the crossword puzzle, and his favorite mug: 'Same Guy Still Curious :)'.",
    addedBy: "Anita Carter",
  },
  {
    id: "g11",
    title: "Tea in the Rose Garden",
    mediaType: "video",
    year: "1989",
    location: "Dartmoor Cottage",
    album: "Family Films",
    mediaUrl: "/videos/speaking.mp4",
    posterUrl: "/landing/demo/robert-with-granddaughter-anita-2004.jpg",
    aspectRatio: "landscape",
    duration: "0:12",
    story: "A digitized 8mm family video clip from a summer afternoon in the cottage garden.",
    addedBy: "Anita Carter",
  },
  {
    id: "g12",
    title: "Quiet Moment in the Workshop",
    mediaType: "video",
    year: "1995",
    location: "High Street Workshop",
    album: "Workshop",
    mediaUrl: "/videos/gentle-smile.mp4",
    posterUrl: "/landing/demo/robert-workshop-tea-apprentice.jpg",
    aspectRatio: "portrait",
    duration: "0:08",
    story: "Bob looking up from the workbench and offering his gentle, trademark nod.",
    addedBy: "Sarah Jenkins",
  },
  {
    id: "g13",
    title: "Teaching Anita About Garden Birds",
    mediaType: "photo",
    year: "2004",
    location: "Dartmoor Cottage Garden",
    album: "Family",
    mediaUrl: "/landing/demo/robert-with-granddaughter-anita-2004.jpg",
    aspectRatio: "landscape",
    people: ["Robert Carter", "Anita Carter"],
    story: "Grandpa Bob carved a little robin out of scrap pine and gave it to me on the garden bench. That morning he taught me the call of three different songbirds.",
    addedBy: "Anita Carter",
  },
  {
    id: "g14",
    title: "Sunday Afternoon on Dartmoor",
    mediaType: "video",
    year: "2016",
    location: "Dartmoor National Park",
    album: "Family Films",
    mediaUrl: "/videos/warm-gaze.mp4",
    posterUrl: "/theirs/rose-garden.webp",
    aspectRatio: "landscape",
    duration: "0:06",
    story: "A short home video of Robert smiling warmly in the afternoon sun.",
    addedBy: "Anita Carter",
  },
  {
    id: "g15",
    title: "The Workshop Bench at Dawn",
    mediaType: "photo",
    year: "2002",
    location: "Carter Clocks, Devon",
    album: "Workshop",
    mediaUrl: "/theirs/wooden-work.webp",
    aspectRatio: "landscape",
    story: "The morning light hitting Dad's chisels and wood shavings. That bench smelled of cedar, linseed oil, and forty years of honest patience.",
    addedBy: "Anita Carter",
  },
]

const DEMO_TIMELINE: TimelineMilestone[] = [
  {
    year: 1948,
    chapter: "Chapter I",
    title: "Born in Exeter, Devon",
    description: "Born on an October morning, the younger of two brothers raised on the edge of the wild Devon moors.",
    location: "Exeter, Devon",
    photoUrl: "/landing/robert-hero-image1.png",
  },
  {
    year: 1968,
    chapter: "Chapter II",
    title: "Horological Apprenticeship in London",
    description: "Moved to Clerkenwell to study under master clockmakers, learning to turn brass pinions and balance delicate hairsprings.",
    location: "Clerkenwell, London",
    photoUrl: "/landing/demo/robert-apprenticeship-1968.jpg",
  },
  {
    year: 1974,
    chapter: "Chapter III",
    title: "Married Meena at St. Jude’s",
    description: "Married Meena surrounded by wildflower confetti. They bought a small stone cottage near Dartmoor and began fifty years together.",
    location: "St. Jude’s Church, Oxford",
    photoUrl: "/landing/demo/robert-wedding-1974.jpg",
  },
  {
    year: 1983,
    chapter: "Chapter IV",
    title: "Founded Carter Clocks & Woodworking",
    description: "Opened his independent workshop on the Devon high street, repairing church clocks, grandfather clocks, and neighborhood appliances.",
    location: "Devon High Street",
    photoUrl: "/theirs/wooden-work.webp",
  },
  {
    year: 2004,
    chapter: "Chapter V",
    title: "Welcomed Granddaughter Anita",
    description: "Spent weekends teaching her about native songbirds, whittling wooden robins, and making sawdust piles in the workshop.",
    location: "Dartmoor Cottage",
    photoUrl: "/landing/demo/robert-with-granddaughter-anita-2004.jpg",
  },
  {
    year: 2018,
    chapter: "Chapter VI",
    title: "Retirement & The Rose Garden",
    description: "Handed over the workshop keys to his apprentice Sarah and spent unhurried days cultivating heritage roses.",
    location: "Dartmoor Cottage",
    photoUrl: "/theirs/rose-garden.webp",
  },
  {
    year: 2024,
    chapter: "Chapter VII",
    title: "A life remembered",
    description: "Robert died peacefully at home with his family beside him, his garden roses visible through the bedroom window.",
    location: "Dartmoor, Devon",
    photoUrl: "/theirs/still-waters.webp",
  },
]

const DEMO_STORIES: StoryItem[] = [
  {
    id: "story-1",
    authorName: "Anita Carter",
    authorRelationship: "Daughter",
    dateOrYear: "1984",
    chronologicalYear: 1984,
    location: "Mrs. Higgins' Cottage, Devon",
    story: "It was Christmas Day 1984. Mum had taken the turkey out of the oven, the table was set for twelve people, paper crowns were on our heads... and Dad was nowhere to be found.\n\nWe went down the lane in our slippers and found him squeezed behind poor eighty-year-old Mrs. Higgins' washing machine in his good Sunday trousers, covered in pump sludge and humming 'O Little Town of Bethlehem'. Her main drum seal had blown that morning with three loads of laundry trapped inside.\n\nWhen Mum scolded him that the roast potatoes were going cold, he just wiped his forehead with his forearm, leaving a big smear of grease, and said: 'Love, you can warm potatoes up in five minutes, but you can’t leave an elderly neighbor without clean towels on Christmas.' That was Dad all over. Dinner was forty minutes late, the potatoes were a bit leathery, and nobody cared one bit.",
    photoUrl: "/landing/example-image-of-robert.webp",
    createdAt: "2024-04-08T10:00:00.000Z",
  },
  {
    id: "story-2",
    authorName: "Sarah Jenkins",
    authorRelationship: "Senior Apprentice & Shop Successor",
    dateOrYear: "1996",
    chronologicalYear: 1996,
    location: "Carter Clocks Workshop",
    story: "My second week at the workshop I was terrified of him. Not because he was harsh — quite the opposite, his quietness felt massive. I was working on an 1820s English fusee bracket clock, slipped with my tweezers, and snapped a mainspring with a sound like a pistol shot. I burst into tears right there at the bench.\n\nBob didn't flinch. He didn't swear or sigh. He just walked over to the electric kettle, filled it from the little copper jug, and made two very strong mugs of PG Tips with evaporated milk. He slid one across to me and said: 'Well now, Sarah. That spring was already sixty years tired. You just gave it permission to retire. Let's make a new one from piano wire.'\n\nThirty years later, whenever an apprentice in my own shop breaks something and panics, I put the kettle on. That was Bob's whole philosophy of life.",
    photoUrl: "/landing/demo/robert-workshop-tea-apprentice.jpg",
    createdAt: "2024-04-07T10:00:00.000Z",
  },
  {
    id: "story-3",
    authorName: "Rahul Carter",
    authorRelationship: "Grandson",
    dateOrYear: "2012",
    chronologicalYear: 2012,
    location: "Back Porch, Devon",
    story: "For my tenth birthday I asked him for a Game Boy. I was a silly kid, completely obsessed with screens. On my birthday he handed me an old shoebox wrapped in brown parcel paper and butcher's twine.\n\nInside was a complete 32-piece chess set he'd whittled by hand out of scrap cherry and walnut over three winter months. Each piece had tiny chisel marks on the collar. At ten, I didn't appreciate the hundred hours that took. I think I even made a disappointed face.\n\nBut as I grew up, it became the most sacred thing I owned. I took the King with me to university in Bristol — he lived right next to my textbook pile. Every time I was stressed before an exam, I’d turn that little cherry-wood crown in my fingers and remember his steady, calm hands.",
    photoUrl: "/landing/demo/robert-carved-chess-king.jpg",
    createdAt: "2024-04-06T10:00:00.000Z",
  },
  {
    id: "story-4",
    authorName: "Meena Carter",
    authorRelationship: "Wife of 50 years",
    dateOrYear: "1974",
    chronologicalYear: 1974,
    location: "St. Jude’s Church, Oxford",
    story: "The night before we married at St. Jude's in Oxford, the old church organist took ill and there was no one to play the wedding march. I was in tears in my room. Robert showed up at my window at midnight on a borrowed bicycle with a portable cassette player he'd rigged up with four D-cell batteries and an old car speaker.\n\nHe had spent five hours cycling between three Oxford colleges until he found a choir student who let him record a Handel recessional onto a blank tape. He held that speaker above his head outside the church while we walked down the stone path under a storm of wildflower confetti. Everyone was laughing so hard their sides hurt. Fifty years passed in a blink, Bob. I miss the sound of your work boots in the hallway.",
    photoUrl: "/landing/demo/robert-wedding-1974.jpg",
    createdAt: "2024-04-05T10:00:00.000Z",
  },
]

const DEMO_BIOGRAPHY = `
  <h2>The Boy with the Pocketknife (1948–1967)</h2>
  <p><strong>Robert Edward Carter</strong> was born on a gusty October morning in 1948 in Exeter, Devon — the younger son of Arthur, a railway signalman, and Margaret, who tended schoolhouse hearths. From the time he could toddle across the kitchen flagstones, Bob was possessed by what his brother David called <em>“an incurable mechanical stubbornness.”</em></p>
  <p>Where other boys chased footballs across the common, Robert collected discarded clock springs, bicycle bearings, and broken umbrella ribs. By age twelve, he had dismantled his father’s pocket watch four separate times — not out of mischief, but because he was convinced he could make the ticking <em>“a hair softer.”</em></p>

  <blockquote>“If something doesn’t run true, don’t curse the metal. Metal only remembers the pressure someone put into it. Give it patience and heat, and it will settle.”</blockquote>

  <h2>Clerkenwell, Brass Gears &amp; Meena (1968–1982)</h2>
  <p>In the autumn of 1968, nineteen-year-old Robert packed a cardboard suitcase and boarded a steam train for London. He had secured a coveted horological apprenticeship in the historic clockmaking quarter of <a href="https://en.wikipedia.org/wiki/Clerkenwell">Clerkenwell</a>. For five years, under the exacting eye of master horologist George Davies, Bob learned to turn brass pinions on a foot-treadle lathe and balance hairsprings thin as horsehair.</p>
  <p>It was during a rainy winter lunch at a tea stall on Rosebery Avenue that he spilled sugar into the saucer of a young mathematics student named <strong>Meena Patel</strong>. She corrected his grammar; he offered to mend the clasp on her leather handbag. They married in the summer of 1974 at <a href="#timeline">St. Jude’s Parish</a>, surrounded by wild heather and twenty-two members of Meena’s family who immediately adopted the shy Devon boy into their vibrant Sunday curries.</p>

  <hr />

  <h2>Carter Clocks &amp; The Open Door (1983–2017)</h2>
  <p>In 1983, Robert returned home to Devon and opened <em>Carter Clocks &amp; Woodworking</em> on the High Street. Over thirty-four years, that narrow workshop became an unofficial town sanctuary. The brass bell over the door chimed constantly — not just for grandfather clocks needing repair, but for neighbours carrying broken lawnmowers, schoolgirls with jammed violin pegs, and old friends needing an unhurried listener.</p>

  <h3>The Four Unwritten Bench Rules</h3>
  <p>Taped with yellowing masking tape to his workbench were four guidelines he taught every apprentice:</p>
  <ul>
    <li><strong>Never strike cold brass:</strong> <em>“Take the time to warm the metal, or prepare to apologise to it.”</em></li>
    <li><strong>The kettle is part of the toolkit:</strong> <em>“No panic ever survived a fresh pot of hot tea.”</em></li>
    <li><strong>Keep the original scratches:</strong> <em>“A grandfather clock without dings is just furniture with no memories.”</em></li>
    <li><strong>No clock leaves until it purrs:</strong> <em>“If it limps out of the shop, your name limps with it.”</em></li>
  </ul>

  <p>You can explore original photographs and workshop recordings in Robert's <a href="#gallery">Life Gallery</a>, including his beloved <a href="#gallery">1974 Morris Minor engine</a>.</p>

  <h2>The Rose Garden &amp; The Last Chapter (2018–2024)</h2>
  <p>When Robert retired in the spring of 2018, he handed his workshop keys to his senior apprentice Sarah Jenkins, keeping only a pocket set of whittling knives and an oilstone. He turned his attention to the garden behind his stone cottage on the rim of <a href="https://www.dartmoor.gov.uk">Dartmoor National Park</a>.</p>
  <p>He spent his final years cultivating heirloom heritage roses — particularly <em>Rosa mundi</em> and sweetbriar — and teaching his granddaughter <a href="#memories">Anita</a> how to identify every native songbird of Devon by its morning trill. He died peacefully at home on a bright April afternoon in 2024, surrounded by family, with his beloved garden roses visible through the bedroom window.</p>
`

const DEMO_TRIBUTES: MemoryItem[] = [
  {
    id: "m1",
    authorName: "Meena Carter",
    authorRelationship: "Wife of 50 years",
    dateOrYear: "Yesterday",
    location: "Our kitchen in Devon",
    story: "Still made two cups of tea this morning by habit. The kitchen is far too quiet without you tapping your spoon against the saucer. Thank you for fifty years of gentleness, my darling Bob. The garden roses are just opening for you.",
    tributeType: "flower",
    createdAt: "2024-04-08T12:00:00.000Z",
  },
  {
    id: "m2",
    authorName: "David Carter",
    authorRelationship: "Older Brother",
    dateOrYear: "2 days ago",
    location: "Exeter",
    story: "Lighting a candle for you little brother. God knows we fought like cats when we were lads over bicycle wrenches and fishhooks, but there was never a better man on this earth. Give Mum a kiss from me. Save me a seat by the river.",
    tributeType: "candle",
    createdAt: "2024-04-07T12:00:00.000Z",
  },
  {
    id: "m3",
    authorName: "Anita Carter",
    authorRelationship: "Granddaughter",
    dateOrYear: "3 days ago",
    location: "London",
    story: "Grandpa, I found that wooden robin you carved for me in 2004 tucked inside my jewelry box yesterday. I sat on the floor and cried until I was laughing thinking about you yelling at the crows for stealing your tomato seedlings. You taught me how to listen to the world. I love you forever.",
    tributeType: "flower",
    createdAt: "2024-04-06T12:00:00.000Z",
  },
  {
    id: "m4",
    authorName: "Thomas Bradley",
    authorRelationship: "Lifelong Friend",
    dateOrYear: "4 days ago",
    location: "The Plume of Feathers, Princetown",
    story: "Left a half pint of bitter on the corner table where Bob used to sit every third Thursday. Sixty years of arguing about cricket, carburetor timing, and why Devon cider beats Somerset every day of the week. Miss you terribly mate. The moors won't be the same without your Morris Minor rattling down the lane.",
    tributeType: "note",
    createdAt: "2024-04-05T12:00:00.000Z",
  },
  {
    id: "m5",
    authorName: "Eleanor Vance",
    authorRelationship: "Family Neighbour",
    dateOrYear: "5 days ago",
    location: "High Street, Devon",
    story: "When my late husband Arthur had his stroke in 2011, Robert came over every single Tuesday at 7am to take our rubbish bins down the long gravel drive so I wouldn't have to struggle. He did it for four years straight and never once mentioned it or accepted a penny. He just left a little bunch of sweet peas on our gatepost every June.",
    tributeType: "flower",
    createdAt: "2024-04-04T12:00:00.000Z",
  },
  {
    id: "m6",
    authorName: "Marcus Thorne",
    authorRelationship: "Former Apprentice",
    dateOrYear: "6 days ago",
    location: "Bristol",
    story: "Lighting a candle for the master who taught me how to work with my hands and my heart. 'Measure three times, cut once, and forgive the wood when it moves on you.' I still hear your voice every morning when I open the workshop shutters, Bob.",
    tributeType: "candle",
    createdAt: "2024-04-03T12:00:00.000Z",
  },
]

type MemorialRow = Record<string, any>

export interface MemorialViewContext {
  identity: MemorialIdentity
  memorial: MemorialRow | null
  db: SupabaseClient | null
  requiresPin: boolean
  canSeeFamilyOnly: boolean
}

function displayDate(value?: string | null) {
  if (!value) return ""
  const date = new Date(value)
  const diffHours = Math.floor((Date.now() - date.getTime()) / 3_600_000)
  const diffDays = Math.floor(diffHours / 24)
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function mapMedia(row: MemorialRow, publicDelivery = false): GalleryItem {
  const isCommunity = row.album === "Community Memories" || Boolean(row.source_memory_id)
  let addedBy: string | undefined = undefined
  if (isCommunity && typeof row.caption === "string" && row.caption.startsWith("Shared by ")) {
    addedBy = row.caption.replace("Shared by ", "").trim()
  }

  return {
    id: row.id,
    title: row.caption || (row.media_type === "video" ? "Video Clip" : row.media_type === "audio" ? "Voice Note" : "Photograph"),
    mediaType: row.media_type === "image" ? "photo" : row.media_type,
    year: row.approx_year ? String(row.approx_year) : "",
    location: row.location || undefined,
    album: row.album || undefined,
    isPinned: Boolean(row.is_pinned),
    mediaUrl: resolveMediaUrl(row.url, { publicDelivery }),
    externalVideoId: row.source_type === "youtube" ? row.external_id || undefined : undefined,
    addedBy,
    sourceMemoryId: row.source_memory_id || undefined,
  }
}

const MEMORIAL_PUBLIC_COLUMNS =
  "id, slug, owner_id, full_name, preferred_name, creator_relationship, birth_year, birth_month, birth_day, death_year, death_month, death_day, location, headline, biography, portrait_photo_url, status, privacy, is_paid, section_settings, contribution_settings, access_pin_hash, theme, cover_settings"

const MEDIA_COLUMNS =
  "id, caption, media_type, approx_year, location, album, is_pinned, url, order_index, created_at, source_memory_id, source_type, external_provider, external_id, external_url"

const STORY_COLUMNS =
  "id, author_name, author_relationship, approx_year, created_at, location, story, photo_url, photo_urls"

const TIMELINE_COLUMNS =
  "id, year, title, description, location, photo_url, order_index, created_at"

const TRIBUTE_COLUMNS =
  "id, author_name, author_relationship, approx_year, location, story, tribute_type, created_at"

export async function loadGalleryItem(context: MemorialViewContext, mediaId?: string): Promise<GalleryItem | null> {
  if (!mediaId || context.requiresPin) return null
  if (context.identity.isDemo) return DEMO_GALLERY.find((item) => item.id === mediaId) || null
  if (!context.db || !context.memorial?.id) return null
  const result = await context.db.from("media_items").select(MEDIA_COLUMNS).eq("memorial_id", context.memorial.id).eq("id", mediaId).maybeSingle()
  if (result.error) {
    console.error("Load gallery item failed:", result.error)
    throw result.error
  }
  const publicDelivery = context.memorial?.status === "published" && context.memorial?.privacy !== "private"
  return result.data ? mapMedia(result.data, publicDelivery) : null
}

function mapStory(row: MemorialRow, publicDelivery = false): StoryItem {
  const rawUrls = Array.isArray(row.photo_urls) && row.photo_urls.length ? row.photo_urls : row.photo_url ? [row.photo_url] : []
  const photoUrls = rawUrls.map((url: string) => resolveMediaUrl(url, { publicDelivery }))
  return {
    id: row.id,
    authorName: row.author_name,
    authorRelationship: row.author_relationship || "",
    dateOrYear: row.approx_year ? String(row.approx_year) : displayDate(row.created_at),
    chronologicalYear: row.approx_year || undefined,
    location: row.location || undefined,
    story: sanitizeContributionHtml(row.story || ""),
    contentFormat: "html",
    photoUrl: photoUrls[0],
    photoUrls: photoUrls.length ? photoUrls : undefined,
    createdAt: row.created_at,
  }
}

function mapTribute(row: MemorialRow): MemoryItem {
  return {
    id: row.id,
    authorName: row.author_name,
    authorRelationship: row.author_relationship || "",
    dateOrYear: displayDate(row.created_at),
    chronologicalYear: row.approx_year || undefined,
    location: row.location || undefined,
    story: row.story,
    tributeType: row.tribute_type || "note",
    createdAt: row.created_at,
  }
}

function mapTimeline(row: MemorialRow, publicDelivery = false): TimelineMilestone {
  return {
    year: row.year,
    chapter: `Year ${row.year}`,
    title: row.title,
    description: row.description || "",
    location: row.location || undefined,
    photoUrl: row.photo_url ? resolveMediaUrl(row.photo_url, { publicDelivery }) : undefined,
  }
}

export const getMemorialViewContext = cache(async (slug: string): Promise<MemorialViewContext | null> => {
  if (RESERVED_MEMORIAL_SLUGS.has(slug.toLowerCase())) return null
  const isDemo = slug === "robert-carter"
  const admin = getSupabaseAdminSafe()
  let memorial: MemorialRow | null = null
  let db: SupabaseClient | null = admin

  if (admin) {
    const result = await admin.from("memorials").select(MEMORIAL_PUBLIC_COLUMNS).eq("slug", slug).maybeSingle()
    if (result.data) {
      memorial = result.data
    }
  }

  let serverClient: SupabaseClient | null = null
  if (!memorial && !admin) {
    serverClient = await createClient()
    const result = await serverClient.from("memorials").select(MEMORIAL_PUBLIC_COLUMNS).eq("slug", slug).maybeSingle()
    if (result.data) {
      memorial = result.data
      db = serverClient
    }
  }

  if (!memorial && !isDemo) return null

  const cookieStore = await cookies()
  const hasAuthCookie = cookieStore.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"))

  // Hot path: Truly anonymous visitors (no Supabase session cookie) on published
  // public/unlisted memorials skip auth completely. If a session cookie exists,
  // we resolve the user to preserve caretaker/owner permissions.
  let isOwner = false
  let hasMemberAccess = false
  let viewerUserId: string | null = null
  let accessRole: MemorialIdentity["accessRole"] = null
  const isPublishedPublicOrUnlisted = memorial?.status === "published" && memorial?.privacy !== "private"

  if (memorial && (hasAuthCookie || !isPublishedPublicOrUnlisted)) {
    if (!serverClient) serverClient = await createClient()
    const { data: { user } } = await serverClient.auth.getUser().catch(() => ({ data: { user: null } }))
    viewerUserId = user?.id || null
    const access = user?.id ? await getMemorialAccess(memorial.id, user.id) : null
    isOwner = Boolean(access?.isOwner)
    hasMemberAccess = Boolean(access)
    accessRole = access?.role || null
    if (memorial.status !== "published" && !hasMemberAccess) return null
  }
  const pinUnlocked = Boolean(
    memorial?.privacy === "private" &&
    verifyPinAccessToken(
      cookieStore.get(getMemorialPinCookieName(slug))?.value,
      memorial.id,
      memorial.access_pin_hash
    )
  )
  const requiresPin = Boolean(memorial?.privacy === "private" && !hasMemberAccess && !pinUnlocked)
  const sections = { ...DEFAULT_SECTIONS, ...(memorial?.section_settings || {}) }

  let caretakerName: string | null = isDemo ? "Anita Carter" : null
  if (memorial?.owner_id && db) {
    const profileResult = await (admin || db)
      .from("user_profiles")
      .select("full_name")
      .eq("user_id", memorial.owner_id)
      .maybeSingle()
    caretakerName = profileResult.data?.full_name?.trim() || null
  }

  return {
    memorial,
    db,
    requiresPin,
    canSeeFamilyOnly: Boolean(hasMemberAccess || pinUnlocked),
    identity: {
      id: memorial?.id,
      slug,
      fullName: memorial?.full_name || "Robert Edward Carter",
      preferredName: memorial?.preferred_name || (isDemo ? "Bob" : null),
      birthYear: memorial?.birth_year || (isDemo ? 1948 : null),
      deathYear: memorial?.death_year || (isDemo ? 2024 : null),
      location: memorial?.location || (isDemo ? "Devon, England" : null),
      epitaph: memorial?.headline || (isDemo ? "Watchmaker, master woodworker, and an unhurried listener. Built grandfather clocks by day, fixed bicycles for neighborhood children by evening." : null),
      biography: memorial?.biography
        ? sanitizeContributionHtml(memorial.biography)
        : isDemo
          ? DEMO_BIOGRAPHY
          : null,
      portraitUrl: memorial?.portrait_photo_url
        ? resolveMediaUrl(memorial.portrait_photo_url, {
          publicDelivery: memorial.status === "published" && memorial.privacy !== "private",
        })
        : isDemo
          ? "/landing/robert-hero-image1.png"
          : null,
      isDemo,
      isPaid: isDemo || Boolean(memorial?.is_paid),
      isOwner,
      viewerUserId,
      accessRole,
      caretakerName,
      caretakerRelationship: memorial?.creator_relationship || (isDemo ? "Granddaughter" : null),
      birthMonth: memorial?.birth_month ?? null,
      birthDay: memorial?.birth_day ?? null,
      deathMonth: memorial?.death_month ?? null,
      deathDay: memorial?.death_day ?? null,
      status: memorial?.status,
      privacy: memorial?.privacy,
      sectionSettings: sections,
      contributionSettings: memorial?.contribution_settings || null,
      theme: (memorial?.theme as MemorialIdentity["theme"]) || "quiet",
      coverSettings: (() => {
        const raw = memorial?.cover_settings as MemorialIdentity["coverSettings"]
        if (raw) {
          return {
            ...raw,
            cover_url: raw.cover_url
              ? resolveMediaUrl(raw.cover_url, {
                publicDelivery: memorial?.status === "published" && memorial?.privacy !== "private",
              })
              : null,
          }
        }
        return isDemo ? { type: "pattern", pattern_style: "soft_aura" } : null
      })(),
    },
  }
})

interface CursorState {
  snapshot: string
  offset?: number
}

function encodeCursor(state: CursorState | null) {
  return state ? Buffer.from(JSON.stringify(state)).toString("base64url") : null
}

function decodeCursor(cursor?: string | null): CursorState {
  if (!cursor) return { snapshot: new Date().toISOString(), offset: 0 }
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as CursorState
    return {
      snapshot: typeof parsed.snapshot === "string" ? parsed.snapshot : new Date().toISOString(),
      offset: Math.max(0, Math.min(Number(parsed.offset) || 0, 10_000)),
    }
  } catch {
    return { snapshot: new Date().toISOString(), offset: 0 }
  }
}

function demoPage<T>(items: T[], cursor: CursorState, pageSize: number): PagedCollection<T> {
  const offset = cursor.offset || 0
  const pageItems = items.slice(offset, offset + pageSize)
  const nextOffset = offset + pageItems.length
  return {
    items: pageItems,
    total: items.length,
    hasMore: nextOffset < items.length,
    nextCursor: nextOffset < items.length ? encodeCursor({ ...cursor, offset: nextOffset }) : null,
  }
}

export interface BrowseOptions {
  cursor?: string | null
  filter?: GalleryFilter
  album?: string
  decade?: number
  pageSize?: number
  includeFacets?: boolean
}

export async function loadBrowsePage<T>(context: MemorialViewContext, collection: BrowseCollection, options: BrowseOptions = {}): Promise<PagedCollection<T>> {
  const cursor = decodeCursor(options.cursor)
  const pageSize = Math.max(1, Math.min(options.pageSize || COLLECTION_PAGE_SIZES[collection], COLLECTION_PAGE_SIZES[collection]))

  if (context.identity.isDemo) {
    if (collection === "gallery") {
      const filter = options.filter || "all"
      const albums = Array.from(new Set(DEMO_GALLERY.map((item) => item.album).filter(Boolean))) as string[]
      const filtered = DEMO_GALLERY.filter((item) => (filter === "all" || item.mediaType === filter) && (!options.album || options.album === "all" || item.album === options.album))
      const facets = options.includeFacets
        ? { all: DEMO_GALLERY.length, photo: DEMO_GALLERY.filter((item) => item.mediaType === "photo").length, audio: DEMO_GALLERY.filter((item) => item.mediaType === "audio").length, video: DEMO_GALLERY.filter((item) => item.mediaType === "video").length, albums }
        : undefined
      return { ...demoPage(filtered, cursor, pageSize), ...(facets ? { facets } : {}) } as PagedCollection<T>
    }
    if (collection === "memories") return demoPage(DEMO_STORIES, cursor, pageSize) as PagedCollection<T>
    if (collection === "tributes") return demoPage(DEMO_TRIBUTES, cursor, pageSize) as PagedCollection<T>
    const timeline = options.decade ? DEMO_TIMELINE.filter((item) => Math.floor(item.year / 10) * 10 === options.decade) : DEMO_TIMELINE
    return demoPage(timeline, cursor, pageSize) as PagedCollection<T>
  }

  const db = context.db
  const memorialId = context.memorial?.id
  if (!db || !memorialId || context.requiresPin) return { items: [], total: 0, hasMore: false, nextCursor: null }
  const publicDelivery = context.memorial?.status === "published" && context.memorial?.privacy !== "private"

  if (collection === "gallery") {
    const offset = cursor.offset || 0
    const filter = options.filter || "all"
    const applyFilters = (query: any) => {
      let next = query.eq("memorial_id", memorialId).lte("created_at", cursor.snapshot)
      if (filter !== "all") next = next.eq("media_type", filter === "photo" ? "image" : filter)
      if (options.album && options.album !== "all") next = next.eq("album", options.album)
      return next
    }
    let query = applyFilters(db.from("media_items").select(MEDIA_COLUMNS, { count: "exact" }))
      .order("is_pinned", { ascending: false })
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1)
    const result = await query
    if (result.error) {
      console.error("Public gallery query failed:", result.error)
      throw result.error
    }
    const items = (result.data || []).map((row: MemorialRow) => mapMedia(row, publicDelivery))
    const total = result.count || 0
    const nextOffset = offset + items.length
    let facets: GalleryFacets | undefined
    if (options.includeFacets && offset === 0) {
      const countType = (mediaType?: string) => {
        let countQuery = db.from("media_items").select("id", { count: "exact", head: true }).eq("memorial_id", memorialId).lte("created_at", cursor.snapshot)
        if (mediaType) countQuery = countQuery.eq("media_type", mediaType)
        return countQuery
      }
      const [allResult, photoResult, audioResult, videoResult, albumResult] = await Promise.all([
        countType(), countType("image"), countType("audio"), countType("video"),
        db.from("media_items").select("album").eq("memorial_id", memorialId).lte("created_at", cursor.snapshot).not("album", "is", null),
      ])
      facets = {
        all: allResult.count || 0,
        photo: photoResult.count || 0,
        audio: audioResult.count || 0,
        video: videoResult.count || 0,
        albums: Array.from(new Set((albumResult.data || []).map((row: any) => row.album?.trim()).filter(Boolean))) as string[],
      }
    }
    return { items, total, hasMore: nextOffset < total, nextCursor: nextOffset < total ? encodeCursor({ ...cursor, offset: nextOffset }) : null, ...(facets ? { facets } : {}) } as PagedCollection<T>
  }

  if (collection === "memories") {
    const offset = cursor.offset || 0
    let query = db.from("memories").select(STORY_COLUMNS, { count: "exact" })
      .eq("memorial_id", memorialId).eq("status", "approved").eq("contribution_type", "story")
      .lte("created_at", cursor.snapshot).order("created_at", { ascending: false }).order("id", { ascending: false })
      .range(offset, offset + pageSize - 1)
    if (!context.canSeeFamilyOnly) query = query.eq("visibility", "everyone")
    const result = await query
    if (result.error) {
      console.error("Public memories query failed:", result.error)
      throw result.error
    }
    const items = (result.data || []).map((row: MemorialRow) => mapStory(row, publicDelivery))
    const total = result.count || 0
    const nextOffset = offset + items.length
    return { items, total, hasMore: nextOffset < total, nextCursor: nextOffset < total ? encodeCursor({ ...cursor, offset: nextOffset }) : null } as PagedCollection<T>
  }

  if (collection === "timeline") {
    const offset = cursor.offset || 0
    let query = db.from("timeline_events").select(TIMELINE_COLUMNS, { count: "exact" }).eq("memorial_id", memorialId).lte("created_at", cursor.snapshot)
    if (options.decade) query = query.gte("year", options.decade).lt("year", options.decade + 10)
    const result = await query.order("year", { ascending: true }).order("order_index", { ascending: true }).order("id", { ascending: true }).range(offset, offset + pageSize - 1)
    if (result.error) {
      console.error("Public timeline query failed:", result.error)
      throw result.error
    }
    const items = (result.data || []).map((row: MemorialRow) => mapTimeline(row, publicDelivery))
    const total = result.count || 0
    const nextOffset = offset + items.length
    return { items, total, hasMore: nextOffset < total, nextCursor: nextOffset < total ? encodeCursor({ ...cursor, offset: nextOffset }) : null } as PagedCollection<T>
  }

  const offset = cursor.offset || 0
  let memoryQuery = db.from("memories").select(TRIBUTE_COLUMNS, { count: "exact" })
    .eq("memorial_id", memorialId).eq("status", "approved").eq("contribution_type", "tribute")
    .lte("created_at", cursor.snapshot).order("created_at", { ascending: false }).order("id", { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (!context.canSeeFamilyOnly) memoryQuery = memoryQuery.eq("visibility", "everyone")
  const memoryResult = await memoryQuery
  if (memoryResult.error) {
    console.error("Public tributes query failed:", memoryResult.error)
    throw memoryResult.error
  }
  const items = (memoryResult.data || []).map(mapTribute)
  const total = memoryResult.count || 0
  const nextOffset = offset + items.length
  return {
    items,
    total,
    hasMore: nextOffset < total,
    nextCursor: nextOffset < total ? encodeCursor({ snapshot: cursor.snapshot, offset: nextOffset }) : null,
  } as PagedCollection<T>
}

export async function loadMemorialHome(context: MemorialViewContext): Promise<MemorialHomeData> {
  const sections = context.identity.sectionSettings
  const empty = <T,>(): PagedCollection<T> => ({ items: [], total: 0, hasMore: false, nextCursor: null })
  const [media, memories, timeline, tributes] = await Promise.all([
    sections.gallery === false ? empty<GalleryItem>() : loadBrowsePage<GalleryItem>(context, "gallery", { pageSize: 6, includeFacets: true, filter: "photo" }),
    sections.stories === false ? empty<StoryItem>() : loadBrowsePage<StoryItem>(context, "memories", { pageSize: 5 }),
    sections.timeline === false ? empty<TimelineMilestone>() : loadBrowsePage<TimelineMilestone>(context, "timeline", { pageSize: context.identity.isDemo ? 3 : 6 }),
    sections.tributes === false ? empty<MemoryItem>() : loadBrowsePage<MemoryItem>(context, "tributes", { pageSize: 6 }),
  ])
  if (context.identity.photoCount === undefined) {
    context.identity.photoCount = media.facets?.photo ?? 0
  }
  return { media, memories, timeline, tributes }
}

export async function loadTimelineDecades(context: MemorialViewContext): Promise<number[]> {
  if (context.identity.isDemo) return Array.from(new Set(DEMO_TIMELINE.map((item) => Math.floor(item.year / 10) * 10)))
  if (!context.db || !context.memorial?.id || context.requiresPin) return []
  const result = await context.db.from("timeline_events").select("year").eq("memorial_id", context.memorial.id).order("year", { ascending: true })
  return Array.from(new Set((result.data || []).map((row: any) => Math.floor(row.year / 10) * 10)))
}
