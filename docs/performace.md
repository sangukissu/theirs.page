
> ## Cloudflare Workers production optimization pass
>
> We are now running Theirs on **Cloudflare Workers Paid**. Do **not** redesign the product or change memorial UX. This task is strictly about reducing unnecessary Worker CPU/memory usage and removing the two future Worker memory hazards: large uploads and archive generation.
>
> The goal is not extreme micro-optimization. Keep the architecture simple and maintainable.
>
> ---
>
> ### 1. Optimize the public memorial hot path — highest priority
>
> Current public memorial loading does too much work for every visitor.
>
> Refactor `getMemorialViewContext(slug)` and the public memorial loaders so that a normal published memorial visit is as cheap as possible.
>
> #### A. Do not authenticate every ordinary public visitor
>
> First resolve the memorial.
>
> If:
>
> * `status === published`
> * privacy is `public` or `unlisted`
>
> then load the public memorial without calling `supabase.auth.getUser()` or doing owner/session work.
>
> Only resolve the authenticated user when actually necessary:
>
> * private memorial
> * draft/non-published memorial
> * owner/editor preview
> * another operation explicitly requiring authentication
>
> Preserve all current private/draft/owner access rules.
>
> **Do not weaken authorization to gain performance.**
>
> ---
>
> #### B. Remove `select("*")` from hot public queries
>
> Select only the columns each public view actually uses.
>
> Do this for:
>
> * memorial identity
> * media preview
> * memories/stories preview
> * tributes preview
> * timeline preview
>
> Avoid pulling payment fields, hashes, caretaker settings, internal metadata, etc. into the normal public render when they are not required.
>
> ---
>
> #### C. Remove the redundant photo-count query
>
> `getMemorialViewContext()` currently performs an extra `media_items` count query for photos.
>
> The home/gallery loader already returns collection totals.
>
> Derive the displayed photo count from the gallery/home result instead of performing a separate database request.
>
> Make the smallest type/component adjustment necessary.
>
> ---
>
> #### D. Do NOT calculate gallery facets on Overview
>
> The full Photos/Gallery page needs:
>
> * photo count
> * audio count
> * video count
> * albums
>
> The memorial Overview preview does not.
>
> Add something such as:
>
> `includeFacets?: boolean`
>
> to the gallery loader.
>
> Full gallery:
>
> `includeFacets: true`
>
> Overview:
>
> `includeFacets: false`
>
> Overview should fetch approximately:
>
> * 6 media
> * 2 memories/stories
> * 5 timeline entries
> * 2 tributes
>
> and their required totals only.
>
> Do not run the current extra photo/audio/video/all/album facet queries just to render Overview.
>
> Keep these preview requests parallel with `Promise.all()`.
>
> ---
>
> #### E. Reduce serialization/mapping work
>
> Do not fetch large unused DB objects and then trim them in TypeScript.
>
> Select the exact columns required by:
>
> * `mapMedia`
> * `mapStory`
> * `mapTribute`
> * `mapTimeline`
>
> Preserve the existing output types and UI.
>
> ---
>
> ### 2. Caching — only if it remains simple
>
> Published **public/unlisted** memorial content is a good candidate for short caching because hundreds of visitors may see identical data.
>
> If the currently installed Next.js/OpenNext Cloudflare setup already supports persistent/tagged caching cleanly, add a short cache such as **30–60 seconds** for public published memorial data and invalidate it when the caretaker modifies/publishes content.
>
> However:
>
> **Do not introduce KV, Durable Objects, D1, a custom caching subsystem, or a large architecture change just for this optimization.**
>
> If correct cache invalidation is not straightforward with the existing stack, skip caching in this pass. The Paid Worker removes the immediate 10 ms problem; query/SSR cleanup is more important than risky caching.
>
> Never cache:
>
> * private memorial responses
> * PIN-unlocked responses
> * owner/editor previews
> * admin data
>
> ---
>
> ## 3. Stop large caretaker uploads from passing through Worker memory
>
> Currently the upload route accepts the whole file, calls `arrayBuffer()`, creates a Buffer, and then uploads it to R2.
>
> That is fine for tiny files but unnecessary and risky for 20–50 MB video/audio uploads on Workers.
>
> Change **authenticated caretaker/admin uploads** to direct browser → R2 upload using presigned PUT URLs.
>
> We already have R2 signing helpers in the codebase; reuse the existing R2 client rather than inventing another storage layer.
>
> Flow:
>
> `browser requests upload authorization`
>
> → authenticate user
>
> → verify memorial admin permission
>
> → enforce Free/Complete quota
>
> → validate declared MIME + file size
>
> → server generates safe R2 object key
>
> → server returns short-lived presigned PUT URL
>
> → browser uploads file directly to private R2
>
> → browser calls existing media API to create the `media_items` record
>
> The large binary must **not travel through the Next.js Worker**.
>
> Configure/document R2 CORS as needed for:
>
> * `https://theirs.page`
> * local development
>
> Keep the R2 bucket private.
>
> Store the R2 **object key**, not a permanent `r2.dev` public URL.
>
> Existing `resolveMediaUrl()` / `/api/media` remains responsible for delivery.
>
> Do not weaken the existing:
>
> * ownership checks
> * media quota
> * MIME restrictions
> * Complete-plan restrictions
>
> Guest/anonymous contribution uploads can remain on the current limited path for now if changing them would substantially expand this task. They are capped much lower and will be handled separately by the contribution moderation/quarantine work.
>
> ---
>
> ## 4. Fix archive export memory usage
>
> This one is worth fixing now because the current implementation will eventually hit Workers' memory ceiling.
>
> Current export behavior effectively does:
>
> `download every media file into Buffer`
>
> → hold them in JSZip
>
> → generate the entire ZIP into another `nodebuffer`
>
> → return it
>
> That means a 200 MB memorial can require far more than 200 MB of process memory.
>
> **Do not build an asynchronous archive-job system yet.** That would be unnecessary complexity for the current stage.
>
> Instead replace the current buffered ZIP generation with a **streaming ZIP response** compatible with Cloudflare Workers/Web Streams.
>
> Requirements:
>
> * stream files sequentially from R2 into the ZIP
> * do not load all memorial media into RAM
> * do not create the final ZIP as one giant Buffer
> * continue including:
>
>   * `archive-manifest.json`
>   * `README.txt`
>   * `/photos`
>   * `/audio`
>   * `/video`
> * preserve sensible filenames
> * continue requiring Theirs Complete
> * continue requiring memorial admin authorization
> * use the private R2 object directly where possible
>
> Use **STORE/no compression for photos, audio and video** rather than recompressing JPEG/MP4/etc. They are already compressed and DEFLATE wastes Worker CPU for almost no benefit.
>
> Small JSON/TXT files may be compressed if the chosen streaming ZIP library handles that cheaply, but it is not important.
>
> Choose a lightweight ZIP library that supports Web Streams / Cloudflare Workers rather than trying to manually implement ZIP internals.
>
> If the existing JSZip cannot genuinely stream the entire archive without buffering it, replace it for this route only.
>
> **Do not implement background jobs, Queues, Durable Objects, cron-generated ZIPs or temporary archive objects in R2 at this stage.**
>
> A streaming on-demand archive is the best complexity/reliability tradeoff for now.
>
> ---
>
> ## 5. Keep media delivery streaming
>
> `/api/media` already streams R2 objects and supports Range requests.
>
> Preserve that architecture.
>
> Do not turn media delivery back into `arrayBuffer()`/Buffer-based responses.
>
> Preserve:
>
> * Range support for audio/video
> * private memorial access checks
> * no-store/private caching for private memorials
> * long public caching for public immutable media
>
> ---
>
> ## 6. Do not “solve” the Worker issue with bad changes
>
> Do NOT:
>
> * convert the whole app to static HTML
> * move Supabase logic to the browser
> * remove private memorial checks
> * weaken authentication
> * duplicate memorial data into another DB
> * introduce Redis/KV just for this
> * replace OpenNext
> * migrate away from Cloudflare
> * add arbitrary loading screens to hide server work
> * prematurely rebuild the archive as a background-job system
>
> We are staying on:
>
> **Next.js + OpenNext + Cloudflare Workers Paid + Supabase + private R2**
>
> ---
>
> ## 7. Observability
>
> Cloudflare observability is already enabled.
>
> Keep logging lightweight.
>
> If useful, add temporary structured timings around the major public loader phases:
>
> * memorial resolution
> * public home data
> * gallery
> * memories
> * timeline
> * tributes
>
> Do not log every individual DB object or media payload.
>
> These timings are wall-clock diagnostic timings, not a replacement for Cloudflare's actual CPU metrics.
>
> ---
>
> ## 8. Required regression tests
>
> After implementing, verify all of these:
>
> **Public memorial**
>
> * loads normally while logged out
> * no unnecessary auth lookup
> * Overview data/counts remain correct
> * full Photos page still has filters/facets/albums
>
> **Unlisted memorial**
>
> * works normally
> * remains excluded from indexing as before
>
> **Private memorial**
>
> * still requires PIN
> * private media cannot be accessed without authorization
>
> **Draft memorial**
>
> * public visitor gets no access
> * owner can still preview
>
> **Gallery**
>
> * Free still stops at 5 photos
> * Complete allows paid media features
> * photos/audio/video upload correctly through direct R2 upload
> * deletion still removes R2 object
>
> **Archive**
>
> * ZIP contains real media binaries
> * JSON manifest and README included
> * photos/audio/video open correctly after extraction
> * archive generation does not accumulate all files in memory
>
> Finally run the complete production/OpenNext build and fix any TypeScript or Worker compatibility issues.
>
> ---
>
> ## Definition of done
>
> The work is finished when:
>
> 1. A normal published memorial visit no longer performs authentication/session work unnecessarily.
> 2. Public hot-path queries no longer use `select("*")`.
> 3. Overview does not compute full gallery facets.
> 4. The duplicate photo-count request is gone.
> 5. Large caretaker uploads go directly browser → R2 rather than through Worker memory.
> 6. Family archive ZIP is streamed rather than assembled entirely in RAM.
> 7. Private/draft/security behavior remains unchanged.
> 8. Existing visual UX remains unchanged.
> 9. `npm run build` / OpenNext Cloudflare production build succeeds.
