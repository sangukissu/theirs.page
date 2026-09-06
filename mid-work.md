## The plan i gave to agent:

"1. Text limits — current system is inconsistent

Contributor input currently has:

- name 100
- relationship 80
- location 120
- **all contribution content = 4,000 characters**

The UI also caps story/memory text at 4,000.

That's wrong for the product. A condolence and someone's detailed 40-year memory should not have identical limits.

I would standardize these server-side:

| Field                    |      Limit |
| ------------------------ | ---------: |
| Person full name         |        120 |
| Preferred/nickname       |         60 |
| Contributor name         |        100 |
| Relationship             |         80 |
| Location                 |        120 |
| Epitaph/headline         |        240 |
| Tribute/message          |  **3,000** |
| Memory/story             | **30,000** |
| Main caretaker biography | **30,000** |
| Timeline title           |        140 |
| Timeline description     |      3,000 |
| Photo caption            |      1,000 |
| Album name               |         80 |
| Successor name           |        100 |
| Email                    |        254 |

There should be:

**UI maxLength → server schema → optionally DB constraint**

not merely HTML attributes.

For the 30k rich text fields, limit **visible/plain text length**, and separately cap serialized HTML size.

### Important thing I caught

Your Gemini text safety code currently screens only:
```ts
trimmed.slice(0, 4000)
```

So you **cannot just raise Memory to 30,000** and leave moderation as-is. Someone could put clean content in the first 4,000 characters and malicious content afterward.

When long stories are enabled, moderation must inspect the **entire sanitized plain-text story**.

Also your contribution request body is currently capped at 64KB. Rich HTML may require raising that modestly, perhaps to 128KB.

---

# 14b. HEIC

**Not supported currently.**

Your allowlists include JPEG, PNG, WebP and sometimes GIF, but not HEIC/HEIF.

This is worth adding. iPhone families will absolutely have HEIC photos.

Conveniently, Cloudflare Images now supports **HEIC input**, and your Worker already has an Images binding configured. The Images binding can take raw bytes—including from private R2—and output WebP/JPEG; it accepts source images up to 20MB. ([Cloudflare Docs][4])

I'd use:

> Upload original `.heic` → private R2
> validate actual HEIC signature
> Images binding → WebP display copy
> Gemini screens WebP display copy
> retain untouched HEIC as archive original

Your existing **15MB image limit fits nicely under the Images binding's 20MB input ceiling**. ([Cloudflare Docs][5])

That is much better than trying to make every browser display HEIC natively.

---



2. Portrait/photo limit

   This is already architecturally correct.

   The deceased person's primary portrait:
   - lives in `memorials.portrait_photo_url`
   - **does not live in&#x20;****`media_items`**
   - therefore does **not consume one of the Free 5 gallery photographs**.
   The portrait uploader also has its own 15MB path and doesn't run through the 5-photo quota.

   And replacement cleanup is now good:
   > upload new portrait to staging
   > → copy new portrait
   > → successfully update DB
   > → delete staging
   > → delete previous portrait
   If DB update fails, it removes the newly promoted file instead.

   So:

   **Portrait excluded from 5 ✅**
   **Can replace anytime ✅**
   **Old one cleaned up ✅**

   Only change here is the fake grandfather placeholder and adding HEIC.
   ---
   3. Should Story photos automatically appear in Gallery?

      **Yes. Absolutely.**

      And interestingly, your backend **already does this.**

      After an uploaded contribution becomes approved, its media is inserted into `media_items` under:

      `Community Memories`

      so the same photograph appears in:
      > Anita's actual story
      > **and**
      > the deceased person's Photos/Gallery
      I think that is the right model.

      A photo isn't somehow “only a story attachment.” It's now part of that person's family archive.

      But don't duplicate the actual media file just because it appears in two UI surfaces.

      I'd make one improvement eventually:

      Add something like:
      ```text
      media_items.source_memory_id
      ```
      So Gallery can know:
      > “From Anita's memory →”
      and story deletion/unpublishing can manage the relationship reliably instead of correlating objects by URL.
      ---
3.
   ## There is one extra media issue I found
   For public contributor media, the current upload route writes both:

   `originalKey`

   and

   `displayKey`

   to R2.

   For images that's understandable because the display copy has metadata stripped.

   For **audio/video**, however, there currently isn't a real derivative—the same bytes are effectively stored twice.

   So a 50MB contributed video can cost approximately **100MB of R2 storage**.

   I would stop duplicating unchanged audio/video. Keep separate original/display files only when the display asset is actually transformed/transcoded.

   That's important before implementing your 10GB quota."



   ## and this is what i could copy frmo its logs and though process which you can utlize along with local chnages


   "The audit confirms the key coupling: contributed audio/video is duplicated during “completion” and then promoted twice again. I’m fixing that as a single canonical object through quarantine, approval, unpublish, export, and deletion—not just removing one copy call. I also found the existing Images binding helper, so HEIC can use the project’s established Cloudflare runtime path.
   
   established Cloudflare runtime path.Edited files, read files, ran commandsRan $p='app/api/memorials/[id]/moderation/route.ts'; $l=Get-Content -LiteralPath $p; $l[120..210]; $l[300..520]; '---UI UPLOADS---'; $p='components/memorial/contribute-modal.tsx'; $l=Get-Content -LiteralPath $p; $l[240..430]; $p='components/memorial/memory-composer.tsx'; $l=Get-Content -LiteralPath $p; $l[0..190]Ran $p='app/api/memorials/[id]/moderation/route.ts'; $l=Get-Content -LiteralPath $p; $l[500..680]Created text-limits.ts+31-0

Edited route.ts+30-1Edited contribution-input.ts+7-4Edited moderation.ts+3-1

Ran rg -n "maxPlainTextLength|lastAcceptedHtmlRef|TEXT_LIMITS" components/editor/rich-story-editor.tsx components/editor/tabs/story-tab.tsx components/memorial/memory-composer.tsxEdited rich-story-editor.tsx+29-2Edited story-tab.tsx+2-0

Edited memory-composer.tsx+5-4

Ran $l=Get-Content -LiteralPath 'components/memorial/contribute-modal.tsx'; $l[0..45]Edited contribute-modal.tsx+12-5

Ran rg -n "accept=|JPEG, PNG|maxLength=\{4000\}|maxLength=\{100\}|maxLength=\{80\}|maxLength=\{120\}" components/memorial components/editor components/dashboardRan $l=Get-Content -LiteralPath 'components/memorial/contribute-modal.tsx'; $l[824..930]Ran foreach($p in @('components/editor/tabs/identity-tab.tsx','components/editor/tabs/timeline-tab.tsx','components/editor/tabs/gallery-tab.tsx','components/editor/tabs/settings-tab.tsx')){"---$p"; Get-Content -LiteralPath $p -TotalCount 25}Edited gallery-tab.tsx+4-0Edited identity-tab.tsx+5-0Edited timeline-tab.tsx+4-0Edited contribute-modal.tsx+2-2

Ran Get-Content -LiteralPath 'components/editor/tabs/settings-tab.tsx' -TotalCount 40Edited settings-tab.tsx+5-0

Created server-text.ts+52-0

Ran $l=Get-Content -LiteralPath 'app/api/memorials/route.ts'; $l[70..180]; Get-Content -LiteralPath 'app/api/profile/route.ts'Edited route.ts+14-0Edited route.ts+20-0Edited route.ts+8-0Edited route.ts+5-1

Ran Get-Content -LiteralPath 'app/api/memorials/[id]/transfer-ownership/route.ts' -TotalCount 70Edited route.ts+6-1

Ran Get-ChildItem -LiteralPath 'supabase/theirs_migrations' -File | Sort-Object Name | Select-Object -ExpandProperty NameCreated 17_text_limits.sql+70-0

Read 07_contribution_type.sql



Edited route.ts+4-0Edited route.ts+26-14Edited cloudflare-images.ts+5-5Edited moderation.ts+23-6Edited upload-intent.ts+2-0

Created memorial-image-promotion.ts+75-0

Ran rg -n "copyR2Object" 'app/api/memorials/[id]/route.ts' 'app/api/memorials/[id]/media/route.ts' 'app/api/memorials/[id]/timeline/route.ts'Edited route.ts+27-8Edited route.ts+21-6

Edited route.ts+30-6

Ran $p='app/api/r2/upload/route.ts'; $l=Get-Content -LiteralPath $p; $l[500..590]Edited route.ts+4-9Edited upload-intent.ts+2-1

Edited route.ts+17-7

Ran rg -n "finalDisplayKeys, \.\.\.finalOriginalKeys|map\(deleteR2Object\)" 'app/api/memorials/[id]/contribute/route.ts'Edited route.ts+82-13

Ran $p='app/api/memorials/[id]/moderation/route.ts'; $l=Get-Content -LiteralPath $p; $l[350..610]Ran Get-Content -LiteralPath 'app/api/story/polish/route.ts'; rg -n "biography|maxLength|full_name|preferred_name|headline|successor_name|timeline_events|media_items" app/api --glob 'route.ts' | Select-Object -First 300Edited route.ts+16-5

Ran $l=Get-Content -LiteralPath 'components/editor/tabs/identity-tab.tsx'; $l[35..160]; $l=Get-Content -LiteralPath 'components/editor/tabs/gallery-tab.tsx'; $l[180..280]; $l=Get-Content -LiteralPath 'components/editor/tabs/timeline-tab.tsx'; $l[75..185]Ran rg -n "removeManagedContributionMedia\(" 'app/api/memorials/[id]/moderation/route.ts'; $l=Get-Content -LiteralPath 'types/theirs.ts'; $l[130..160]Edited route.ts+1-0Created 18_media_source_memory.sql+13-0Edited theirs.ts+1-0

Ran $p='app/api/memorials/[id]/moderation/route.ts'; $l=Get-Content -LiteralPath $p; $l[188..225]; $l[275..318]Edited route.ts+4-1

Edited route.ts+2-1

Ran Get-Content -LiteralPath 'app/api/memorials/[id]/export/route.ts' -TotalCount 25; $l=Get-Content -LiteralPath 'app/api/memorials/[id]/export/route.ts'; $l[295..330]Edited route.ts+13-5

Edited route.ts+1-1

Ran rg -n -A 30 "deleteR2MemorialFolder" lib/r2.ts" left midwork here..