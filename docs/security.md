Yes. I’d lock the product around **mandatory approval for anonymous visitors**, plus **trusted contributors who can bypass human approval but never bypass automated safety**.

That gives you the best balance of participation, family control, and platform safety.

The one thing I would change from your idea: **don’t create a fake local-only tribute that pretends it is publicly live.** That can become misleading. Do an **optimistic contribution receipt** instead: the real contribution is created on the backend immediately, and the contributor sees it instantly in their own browser as though it has been added, while it is still awaiting publication.

## Final contribution model for Theirs

Every contribution, regardless of who sends it, goes through the same first layer:

**Submit**
→ validate request/file  
→ rate limit + Turnstile where applicable  
→ automated safety screening  
→ safe / suspicious / blocked  
→ then apply the contributor's permission level.

After automated screening:

| Contributor | Safety passed | What happens |
|---|---|---|
| Anonymous visitor | ✅ | **Caretaker approval required** |
| Invited contributor | ✅ | Approval required by default |
| Trusted contributor | ✅ | **Auto-publish** |
| Co-admin | ✅ | Direct publish |
| Owner | ✅ | Direct publish |
| Anyone | 🚨 Safety flagged | **Quarantine — never auto-publish** |

So even a trusted sister cannot accidentally publish malware, porn, scam links, etc. Trust bypasses **family approval**, not **platform safety**.

---

# 1. Anonymous visitors: no login, mandatory approval

This should be the core Theirs experience.

Someone opens:

`theirs.page/robert`

Clicks:

**Share a memory**

They provide only what is necessary:

- Name
- Relationship — optional
- Tribute/story
- Photos/video/audio if that contribution type allows it
- Turnstile runs unobtrusively

No account.

No password.

No mandatory email.

They submit.

But it **does not immediately become publicly visible**.

This directly solves the ForeverMissed problem without opening your memorials to vandalism.

---

# 2. The optimistic UX — this is where your idea is excellent

After submission, don't hit them with:

> Your contribution is pending moderation.

That feels bureaucratic.

Instead return a successful submission ID from the backend and immediately render their contribution in the memorial **for that visitor only**.

For example:

**Added. Thank you for sharing this memory of Robert.**

Then their exact memory appears naturally in the Memories section.

Add only a tiny private indicator:

**Sent to Robert's family**

Not:

❌ Pending moderation  
❌ Awaiting approval  
❌ Under review

The contributor gets the emotional satisfaction:

> I wrote something → I can see it → done.

But nobody else can see it until approved.

### Don't make it a pure LocalStorage dummy

Backend should create the real pending record first:

```text
POST contribution
↓
DB contribution created
status = screening
↓
returns:
contribution_id
receipt_token
display_payload
```

Then browser stores:

```text
receipt_token
contribution_id
```

in LocalStorage.

That lets you show the real submitted contribution on refresh.

You can even provide:

```text
GET /contributions/receipt/:token
```

which exposes only:

`screening | sent_to_family | published | not_published`

No authentication required because the receipt token itself is random/signed.

When the contribution eventually becomes public, remove the local optimistic copy and let the real public version replace it.

**Much cleaner than creating a fake contribution.**

---

# 3. Automated safety pipeline

Everything goes through automated screening **before the caretaker receives it**.

## Text

Use your lightweight Gemini model — **Gemini 3.1 Flash Lite** — with a strict classifier prompt returning structured JSON only.

Check for:

- explicit sexual material
- threats / encouragement of violence
- hate / abusive targeting
- obvious spam
- scam/phishing URLs
- advertisements
- repeated garbage
- harassment
- personal information/doxxing
- obviously malicious content

Do not ask Gemini:

> Is this appropriate?

Make it return deterministic categories:

```json
{
  "decision": "allow | review | block",
  "sexual": false,
  "threat": false,
  "hate": false,
  "harassment": false,
  "spam": false,
  "scam": false,
  "personal_data": false,
  "garbage": false,
  "reason": "..."
}
```

And importantly:

**Gemini does not publish anything.**

It only decides which moderation path it enters.

---

# 4. Photos

Uploaded photo initially goes into a **private quarantine location**, not directly into public memorial storage.

Flow:

**Upload**
→ verify actual magic bytes/MIME  
→ verify extension  
→ maximum size/dimensions  
→ malware/file validation  
→ decode image successfully  
→ strip EXIF  
→ specifically remove GPS/location metadata  
→ image safety classification  
→ produce safe display derivative if useful  
→ moderation decision

Then:

**Safe**
→ contribution proceeds.

**Uncertain**
→ caretaker review, blurred initially.

**Clearly unsafe**
→ blocked safety area.

Never expose the original public URL before approval.

---

# 5. Audio / voice notes

Same model:

**Upload**
→ validate actual file type  
→ size/duration limits  
→ malware/file validation  
→ private quarantine  
→ transcribe  
→ run transcript through Gemini moderation  
→ safety result

You don't need to understand every sound perfectly at launch.

The transcript catches the highest-value risks.

---

# 6. Video

Video needs slightly more care:

**Upload**
→ real file validation  
→ size/duration limits  
→ malware validation  
→ quarantine privately  
→ extract audio/transcript  
→ sample key frames  
→ moderate transcript  
→ moderate sampled frames  
→ combined verdict

You don't need to analyze every frame.

For example, sample:

`start + several evenly distributed frames + end`

with a sane maximum.

If either visual or transcript screening produces a serious flag:

→ quarantine.

---

# 7. Safety decisions

Keep three states rather than trying to make AI perfectly binary.

### SAFE

Normal contribution.

For anonymous:

→ **Waiting for caretaker**

Trusted:

→ publish.

### REVIEW

Something ambiguous.

Examples:

- potentially offensive language
- unclear image
- possible spam
- strange URL
- aggressive family dispute

Put into a separate caretaker queue.

### BLOCKED

Strong evidence of:

- pornographic content
- serious threats
- obvious scam
- malicious file
- hateful attack
- obvious spam attack

Do **not** put it beside normal family memories.

Caretaker sees:

> **Blocked by safety checks — 2**

Opening that area should be deliberate.

Images/video blurred.

Potentially don't render highly explicit content at all until caretaker explicitly chooses **View blocked content**.

A grieving widow shouldn't casually open the dashboard and suddenly see something disgusting.

---

# 8. Caretaker dashboard

I'd give them three very simple buckets.

### Waiting for you

> 4 family contributions

Each:

**Approve**  
**Decline**

Perhaps:

**Edit before publishing**

Useful for fixing a typo with contributor consent assumptions? I'd be careful—probably allow editing metadata, but not materially rewriting their story.

### Published

Everything currently visible.

### Blocked by safety checks

Separated and collapsed.

No disturbing thumbnails by default.

---

# 9. Trusted contributors

Absolutely build this.

When caretaker invites someone:

**Anita · Daughter**

Setting:

**Trust Anita's contributions**

Description:

> Her contributions can appear without waiting for your approval. Theirs will still run automatic safety checks.

OFF by default.

Then:

### Ordinary invited contributor

`submit → automated safety → caretaker`

### Trusted invited contributor

`submit → automated safety → publish`

This is perfect for:

wife  
brother  
daughter  
close family member helping build the memorial.

And crucially, **only an authenticated/accepted invitation can become trusted**.

Never trust somebody merely because they typed:

> Anita  
> Daughter

on an anonymous form.

---

# 10. Co-admin vs trusted contributor

Keep them different.

**Trusted contributor**
can contribute without family approval.

They cannot:

- approve other people's submissions
- change memorial privacy
- delete the memorial
- change billing
- manage caretakers
- change ownership

**Co-admin**
can actually help manage content/moderation.

**Owner**
controls everything.

So:

```text
Anonymous
↓
Contributor
↓
Trusted Contributor
↓
Co-admin
↓
Owner
```

Very understandable permission ladder.

---

# 11. Give caretaker control over what visitors may submit

This connects directly to the ForeverMissed reviews.

Inside:

**Settings → Contributions**

Caretaker gets:

**Accept contributions** ON

Then:

```text
Tributes / messages        ON
Memories / stories         ON
Photos                     ON
Voice recordings           OFF
Videos                     OFF
Life moments               ON
```

If they don't want Tributes:

**OFF means actually gone.**

No button.

No form.

No notification.

No confusing disabled section.

That directly fixes the complaint you found.

---

# 12. Notifications

After a safe anonymous contribution reaches caretaker:

> **Anita shared a memory of Robert**

Email/dashboard notification.

Not one email for every bot attempt.

Safety-blocked content should probably be summarized:

> 2 submissions were automatically blocked this week.

rather than sending panic emails.

---

# 13. One important product distinction

There are now **two moderation systems**.

### Platform moderation

Controlled by Theirs.

Cannot be disabled.

Protects against illegal/unsafe/abusive material.

### Family approval

Controlled by memorial caretaker.

Decides whether an otherwise-safe memory belongs on **their** memorial.

These are very different things.

For example:

> “Robert and I stopped speaking for ten years after an argument.”

Gemini should probably say:

**SAFE.**

But Robert's family may say:

**We don't want this on Dad's memorial.**

That's their editorial decision.

AI should never try to determine whether a memory is emotionally flattering enough.

---

# The final architecture :{NOte: do not fall abck to old turnstile modal, keep it hidden in this plan too, but it sould be there}

```text
                    CONTRIBUTION
                         │
                         ▼
                 Input/file validation
                         │
                         ▼
               Turnstile + rate limit
                         │
                         ▼
              Automated safety screening
               /          |          \
              /           |           \
           SAFE         REVIEW        BLOCK
             │             │             │
             │             │             └──▶ Safety quarantine
             │             │                  hidden/blurred
             │             │
             │             └──▶ Caretaker review
             │
             ▼
       Who submitted it?
      /       |       |       \
 Anonymous Invited  Trusted  Admin
    │         │       │        │
    ▼         ▼       ▼        ▼
 Pending    Pending  Publish  Publish
 caretaker caretaker
```

Meanwhile, immediately after an anonymous person presses Submit:

```text
Real pending record created
        ↓
signed receipt returned
        ↓
contribution appears instantly
in THEIR browser
        ↓
"Sent to Robert's family"
```

Nobody else sees it until approval.

---

## This is the decision I would ship

**Anonymous contribution:** YES  
**Mandatory anonymous login:** NO  
**Mandatory anonymous email:** NO  
**Anonymous instant public publishing:** **NEVER**  
**Anonymous caretaker approval:** **ALWAYS**  
**Automated safety screening:** **ALWAYS**  
**Trusted contributor auto-publish:** YES  
**Co-admin/owner direct publishing:** YES, after automated safety/file checks  
**Optimistic local display after submitting:** **YES — tied to a real backend submission receipt, not a fake record**

That gives Theirs the exact thing ForeverMissed appears to struggle with:

> **Extremely easy for family and friends to contribute. Extremely hard for strangers to damage the memorial.**

That's the model I'd lock and stop debating.