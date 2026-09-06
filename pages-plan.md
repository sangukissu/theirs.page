Yes. And I would **not start by asking an agent to “write 4 legal pages.”** That usually produces generic garbage that neither matches the product nor protects you.

For Theirs, these documents need to encode the decisions we already made about **family disputes, user-generated content, moderation, privacy, one-time payment, storage, succession, public memorials and the fact that you cannot promise eternal hosting**.

There are also real regulatory reasons to do this properly. India’s final DPDP Rules were published in November 2025 and require privacy notices to clearly describe the personal data collected, its purposes, and ways to exercise rights; EU/UK rules similarly require clear purposes, retention, recipients and rights. ([MeitY][1])

Here is the structure I would lock before anybody writes the final prose.

---

# 1. Privacy Policy

This page should answer one question:

> **What information does Theirs receive, why do we need it, where can it go, and what control does the person have over it?**

The dangerous mistake would be writing a generic SaaS privacy policy about name/email/cookies while ignoring that you're storing **family photos, voices, videos, relationships, stories and information about living people inside memorials**.

### What your Privacy Policy should cover

| Area                    | What Theirs should say                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account data            | Name, email, authentication identifiers, profile information                                                                                       |
| Memorial data           | Deceased person's name, dates, biography, location, portrait, timeline etc.                                                                        |
| User content            | Photos, videos, audio, stories, tributes, captions and other contributions                                                                         |
| Contributor data        | Name, relationship and whatever information they voluntarily provide                                                                               |
| Technical/security data | IP address, device/browser information, security events, Turnstile/rate-limit data                                                                 |
| Payments                | Purchase amount/status, payment/customer identifiers; **Theirs should say it does not receive/store complete card details if that's true of Dodo** |
| Communications          | Support requests, emails, caretaker messages                                                                                                       |
| Moderation              | Automated safety results, moderation decisions and possibly transcripts/derived media when those systems exist                                     |
| Cookies                 | Authentication/security cookies and whatever analytics cookies you actually use                                                                    |
| Service providers       | Hosting/database/storage, payments, email, security, AI moderation etc.                                                                            |
| International transfers | Data may be processed outside the user's country through infrastructure/service providers                                                          |
| Retention               | Explain how long various categories stay and what happens after deletion                                                                           |
| User rights             | Access, correction, deletion, export, withdrawal/objection where applicable                                                                        |
| Children                | Account/service age rules and handling information involving children                                                                              |
| Contact                 | A real privacy contact email and legal/business identity                                                                                           |

That matches what regulators expect a real privacy notice to disclose: purposes, lawful basis where relevant, retention, recipients, international transfers and rights. ([Information Commissioner's Office][2])

## Theirs-specific privacy language you need

### Public, Unlisted and Private must be explained brutally clearly

This belongs prominently in the privacy policy:

**Public:** anyone can view it and search engines may index it.

**Unlisted:** it isn't intentionally listed publicly by Theirs, but **anyone with the link can access it and the link can be reshared**. Never call this private.

**Private:** protected using your private-access system, but authorized visitors can still copy/download/screenshot information.

And:

> Changing or deleting a public memorial cannot guarantee immediate removal of copies previously indexed, cached, downloaded or shared by third parties.

That protects you from the impossible promise that switching a page private magically removes every copy of it from the internet.

---

### Content can contain information about living people

This is unusually important for your product.

Someone might write:

> “His daughter Anita lives at XYZ...”

or upload wedding photos containing 30 living people.

Therefore say:

> Memorial creators and contributors are responsible for ensuring they have an appropriate right or lawful basis to share personal information about living people.

You should also provide a way for a **living person shown or described in content to contact Theirs about privacy concerns**.

---

### Do not make the deceased-person privacy issue your loophole

Some privacy regimes primarily protect living individuals, but Theirs operates globally and the content very often contains living relatives.

So don't write:

> “Privacy laws don't apply to dead people.”

That's unnecessary and ugly.

Your policy can simply say Theirs respects memorial privacy and also recognizes that memorial content may contain personal information about living people.

---

## A powerful commitment I would make

Assuming you actually want the business to work this way:

> **Theirs does not sell personal information or memorial content.**

And separately:

> **We do not use private memorials, family photographs, stories, recordings or videos to train public generative-AI models.**

That second sentence is an excellent trust promise for this category.

But once you put it in the policy, **don't later casually connect the database to some AI provider that uses customer material for training.**

California privacy law specifically focuses on disclosure of collection/use/sharing and sale/sharing opt-outs where applicable. ([California Attorney General][3])

---

## AI needs to be disclosed

You use Gemini for safety screening.

Don't make it scary. Something like the eventual policy should explain:

> We may use automated systems and trusted service providers to detect spam, fraud, abusive material and unsafe uploads, and to provide optional features such as transcription or writing assistance.

And:

> Automated screening does not determine which personal family memories are worthy of publication; caretakers retain control over ordinary contribution approval.

That's also truthful to the product architecture.

---

## Retention: decide it before writing the policy

Do **not** let your agent invent “we delete everything within 30 days” unless the code actually does that.

I would eventually standardize something around:

| Data                     | Product policy                                          |
| ------------------------ | ------------------------------------------------------- |
| Abandoned upload staging | short automatic expiry                                  |
| Rejected/blocked media   | limited quarantine period                               |
| Active memorial          | while memorial/account remains active                   |
| Deleted memorial         | removed from active service promptly                    |
| Backups                  | removed according to backup rotation                    |
| Security logs            | limited security/abuse retention                        |
| Payments                 | retained where accounting/tax/legal obligations require |
| Legal disputes           | retain only what is necessary                           |

Once the code implements exact periods, put exact numbers in the policy.

India's DPDP framework explicitly emphasizes clear, standalone notices describing the specific data and specific purposes, so vague “we may retain information as necessary forever” language isn't where I'd go. ([MeitY][1])

---

# 2. Terms of Service

This is the page that protects **the relationship between Theirs and the creator/contributor**.

This is where most of your “save my ass” clauses live.

## First major clause: Theirs doesn't certify family authority

Anyone being allowed to create a memorial creates a nasty edge case:

Brother creates Dad's memorial.
Sister hates it.
Ex-wife wants it removed.
Current wife wants control.
Random person creates a celebrity memorial.

Your Terms should establish:

> Creating a memorial does not make the creator the deceased person's legal representative, estate representative, next of kin or official spokesperson.

And:

> Theirs generally does not independently verify family relationships or authority unless verification becomes necessary in connection with a dispute, safety issue, legal request or ownership/control request.

Very important.

---

## Memorial creator's responsibility

When someone creates a memorial, they should represent that:

> the memorial is being created in good faith;

> information they provide is not knowingly false or impersonating another person;

> they have the rights necessary to upload the content they contribute;

> their use of the service will not violate another person's privacy, copyright or other rights.

Don't make them warrant:

> “I own every photograph.”

People almost never technically own every 50-year-old family photograph.

Use something more realistic:

> **You own the content or have sufficient permission/right to use it.**

---

# Who owns uploaded material?

**The user should.**

Do not do the creepy SaaS clause:

> “Uploading gives Theirs ownership.”

Instead:

> Users retain their rights in content.

Then you need a **limited platform license** allowing Theirs to actually operate.

Essentially:

> By uploading content, you grant Theirs a non-exclusive license to host, store, copy, process, resize, transcode, back up and display the content solely as reasonably necessary to provide, secure and operate the service.

For public memorials, obviously this includes serving the content publicly according to the chosen privacy setting.

The license should end when content is deleted except for reasonable backup periods, legal retention and material retained to resolve disputes.

---

# The family dispute clause

We've already made a product decision here, and it belongs in Terms.

Theirs **should not become a family court.**

Conceptually:

> The primary memorial owner controls the memorial and may appoint co-admins or successors.

> Contributors do not obtain ownership or administrative rights merely because they contribute.

> Theirs does not normally arbitrate disagreements about biography wording, which relatives should be mentioned, which photos are flattering, who loved the deceased most, etc.

But:

> Theirs may intervene where there are credible allegations of impersonation, harassment, privacy violations, fraud, copyright infringement, illegality or other violations of the Terms.

And:

> During a serious ownership or legal dispute, Theirs may temporarily restrict editing, contribution or public access while the issue is reviewed.

That clause can save you from an awful situation later.

---

# Successor caretaker

Your Complete plan includes a successor concept.

Terms need to make it clear:

> A successor designation concerns control of the Theirs memorial account/page. It does not make the successor the legal owner of copyright belonging to third parties, executor of an estate or owner of other family members' contributions.

Also reserve the right to request verification before transferring control.

---

# Content moderation

Your Terms should expressly authorize you to:

> screen content automatically;

> hold contributions for review;

> let memorial caretakers approve/reject safe contributions;

> remove content violating platform rules;

> restrict abusive accounts;

> remove illegal material;

> act on valid legal/copyright requests.

And do **not** promise that moderation catches everything.

Use the opposite:

> Automated and human moderation cannot guarantee detection of every harmful, unlawful or inaccurate contribution.

Under the EU DSA, hosting providers can have duties around explaining restrictions and notice/action systems, so having a proper removal reason and appeal/contact path is sensible architecture even while you're small. ([Digital Strategy][4])

---

# The clause I consider essential for Theirs

### No “forever”

Terms should explicitly counter the emotional assumption that one payment literally binds your company for eternity.

Something along the lines of:

> Theirs is designed for long-term preservation, but no online service can guarantee perpetual availability. We may evolve, replace or discontinue parts of the service. Where reasonably possible, we will provide notice of material discontinuation and an opportunity to export memorial content.

That is dramatically better than claiming “lifetime storage.”

Your **downloadable archive** is what makes this fair rather than defensive.

---

# Service availability and loss

You also need the normal but important protection:

> outages can happen;

> third-party infrastructure can fail;

> users should maintain copies of irreplaceable originals;

> Theirs is not the sole backup for priceless media.

That doesn't mean “we don't care if your photos disappear.”

It means:

> We take preservation seriously, but **don't make one indie SaaS the only copy of someone's only wedding photograph.**

---

# Copyright / DMCA

This is one thing I would actually set up rather than just put words in Terms.

You host user-generated images/videos. The U.S. DMCA safe-harbor regime can protect qualifying hosting providers, but it requires things including a repeat-infringer policy, notice/takedown compliance, and for relevant providers a registered **DMCA designated agent**, whose contact information is also publicly posted. ([Copyright Office][5])

So eventually:

**[copyright@theirs.page](mailto:copyright@theirs.page)**

plus a proper copyright notice procedure.

Don't wait until a photographer sends you the first threat letter.

---

# Liability language

Your lawyer should finish this section, but strategically it should cover:

**No warranty of absolute uptime, preservation, accuracy of user content or suitability of user-submitted memorial information.**

Then a reasonable limitation of liability.

Usually the cap would relate to amounts the particular user paid to Theirs during some period / for the affected memorial, subject to rights that legally cannot be excluded.

Do **not** ask AI to invent a wildly aggressive:

> “Our liability is always $0 under every law.”

Those clauses are often unenforceable and just make you look amateur.

---

# Governing law

Before final Terms exist, you need one missing business fact:

**Which legal entity actually operates Theirs?**

The Terms must name the actual contracting party, address/contact details and governing jurisdiction.

Do not ship:

> “Theirs Inc., Delaware”

unless such a company actually exists.

If you're operating it through an Indian entity/sole proprietorship, the document must reflect reality.

---

# 3. Memorial & Content Guidelines

This should **not** read like Terms Part II.

Terms = legal agreement.

Guidelines = **“What is and isn't okay on a memorial?”**

It should be human-readable enough that a grieving family member can actually understand it.

## The philosophy

I would open with something similar to:

> Theirs exists to preserve people's lives honestly and respectfully. Memorials don't need to portray someone as perfect, but they must not be used to abuse, exploit, impersonate or endanger other people.

That's important.

You don't want a ridiculous rule saying:

> “Only positive memories are allowed.”

Real lives aren't perfect.

Someone can write:

> “Dad was stubborn as hell.”

That's a legitimate memory.

Different thing:

> “He was a worthless bastard and his daughter lives at 14 XYZ Road; go harass her.”

Not acceptable.

---

## Content categories

Your Guidelines should distinguish these clearly:

| Content                                                | Approach                                               |
| ------------------------------------------------------ | ------------------------------------------------------ |
| Honest memories, including difficult ones              | Generally allowed                                      |
| Family disagreement                                    | Caretaker decides ordinary editorial disputes          |
| Harassment/targeted abuse                              | Remove/block                                           |
| Hate/slurs/dehumanizing attacks                        | Remove                                                 |
| Threats/self-harm encouragement                        | Remove                                                 |
| Pornographic/explicit sexual material                  | Remove                                                 |
| Graphic death imagery                                  | Strong restriction/review                              |
| Doxxing/private addresses/account numbers etc.         | Remove                                                 |
| Spam/scams/commercial promotion                        | Remove                                                 |
| False impersonation                                    | Remove                                                 |
| Copyright infringement                                 | Takedown process                                       |
| Malware/malicious uploads                              | Block                                                  |
| Synthetic/deepfake content presented as authentic      | Restrict/remove                                        |
| Illegal content                                        | Remove and cooperate as legally required               |
| Images/info about living children                      | Extra care; complaint/removal path                     |
| Ordinary religious/political views in genuine memories | Don't over-moderate merely because they're contentious |

I would explicitly add **synthetic media**.

Someone eventually will upload:

> “Here is grandpa saying goodbye”

when it's an AI-generated voice clone.

That is a nightmare category for a memorial product.

My rule:

> AI-restored/enhanced media can be allowed.

But:

> Materially AI-generated speech, video or imagery that portrays the deceased doing or saying something they did not actually do must not be presented as authentic archival material.

If you later allow it, require clear labeling.

---

# Who may create a memorial?

I wouldn't require legal next-of-kin status.

That would murder product growth and excludes friends, colleagues, communities etc.

Instead:

> A person may create a memorial in good faith for someone they genuinely intend to remember.

But prohibit:

> deceptive impersonation;

> memorials created to harass;

> spam/SEO memorials;

> fake deaths;

> fraudulent fundraising;

> commercial exploitation pretending to represent the family.

---

# Contributions

This page should explain your actual model:

> Visitors can contribute certain permitted content without needing an account.

> Contributions may be automatically screened.

> Anonymous and ordinary contributions require caretaker approval before becoming public.

> Caretakers may reject a contribution even when it does not violate platform safety rules.

> A rejected contribution is not necessarily a finding that the contributor did anything wrong.

That's important because it separates:

**Theirs safety judgement**

from:

**the family's editorial judgement.**

---

# Reporting flow

You need a visible **Report** path eventually.

The report categories should roughly include:

Privacy concern
Harassment/abuse
False or impersonating memorial
Copyright
Illegal content
Safety concern
Other

Then tell users:

> Reporting something doesn't guarantee removal; Theirs reviews the applicable policy, context and legal obligations.

Also:

> We may ask for identity/relationship/rightsholder verification.

---

# 4. Refund Policy

This one should be **short**.

Nobody needs a 2,000-word refund policy.

You have an advantage:

**People can try Theirs free before paying $179.**

That means you don't need a sketchy “all purchases final, no exceptions” position.

## What I would actually offer

### **14-day refund window for Theirs Complete.**

Simple.

> If Complete isn't right for you, contact us within 14 days of purchase for a refund.

That's commercially better than fighting angry grieving customers over $179, reduces chargebacks, and also puts you in a much cleaner position for jurisdictions with mandatory consumer withdrawal rights.

EU consumer rules can provide a 14-day withdrawal period for distance purchases, with specific rules around immediate performance/digital services and explicit consumer consent. Your own policy cannot override mandatory consumer rights. ([EUR-Lex][6])

So I would not try to be clever with:

> “By clicking Pay you waive every refund right.”

Not worth it.

---

## What happens after refund?

This needs a product decision.

I recommend:

> Complete features end.

But don't suddenly delete grandma's archive the second Stripe/Dodo refunds somebody.

Instead:

> memorial reverts to the Free plan;

> existing paid-only content becomes read-only/unavailable as appropriate;

> owner gets a reasonable period to export or reduce content to Free limits;

> then normal Free limits apply.

Exactly how this behaves should be coded before the policy states a specific grace period.

---

## Other refund cases

Your policy should clearly cover **duplicate payment = refund it**, fraudulent/unauthorized transaction = contact payment provider/support promptly, and inability to deliver the paid service due to a Theirs fault = refund or other appropriate remedy.

It should also say:

> refunds return to the original payment method;

> banks/payment providers control posting times;

> foreign exchange differences or third-party bank fees may be outside Theirs' control;

> statutory consumer rights remain unaffected.

And if someone files a chargeback while keeping Complete:

> Theirs may suspend the related paid entitlement while the dispute is resolved.

Reasonable.

---

# One thing tying all four pages together

Do **not** repeat the same clauses four times with slightly different wording.

I would architect it like this:

**Privacy Policy** → what happens to data.

**Terms of Service** → contractual relationship, ownership, liability, payments, platform powers.

**Memorial & Content Guidelines** → what people can publish and how disputes/moderation work.

**Refund Policy** → money only.

Then cross-link them.

That makes updates vastly easier.

---

## And there are 7 product decisions I would lock before writing the actual documents

1. **Legal operator:** exact individual/company name + contact/business address.

2. **Privacy contact:** e.g. `privacy@theirs.page`.

3. **Legal/content contact:** e.g. `legal@theirs.page` or `support@theirs.page`.

4. **Copyright/DMCA contact:** ideally `copyright@theirs.page`, plus actual DMCA-agent registration if you want the U.S. safe-harbor protection available to qualifying providers. ([Copyright Office][5])

5. **Actual deletion/retention periods:** code and policy must agree.

6. **14-day refund:** I strongly recommend committing to this.

7. **No-sale / no-AI-training commitment:** I would make both core Theirs promises, assuming we ensure every processor/workflow respects them.

Once those are locked, **then** we can write the four actual pages. And when we do, I wouldn't generate legal-template sludge. I'd write them specifically around Theirs—plain English, proper clauses, the family-control model we designed, UGC/copyright handling, your $179 one-time purchase, export model, privacy modes, moderation pipeline and the deliberate refusal to promise “forever.” A lawyer should still review the finished documents before public launch, particularly the contracting entity, governing law, liability language, consumer cancellation rights and international privacy coverage.

[1]: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf "https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf"
[2]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/ "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/"
[3]: https://oag.ca.gov/privacy/ccpa "https://oag.ca.gov/privacy/ccpa"
[4]: https://digital-strategy.ec.europa.eu/en/faqs/dsa-transparency-database-questions-and-answers "https://digital-strategy.ec.europa.eu/en/faqs/dsa-transparency-database-questions-and-answers"
[5]: https://www.copyright.gov/512/ "https://www.copyright.gov/512/"
[6]: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083 "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32011L0083"
