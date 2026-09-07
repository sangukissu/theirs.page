There is a real market signal here, but I would interpret it differently:

**The market needs personalization. It does not necessarily need “vintage memorial website design.”**

That distinction matters.

Keeper explicitly lets families change theme color, banner image and icon, and calls that part of making the memorial reflect the person. ([Keeper Memorials][1]) Ever Loved also exposes color-scheme personalization. ([Ever Loved][2]) MuchLoved goes much further: flowers, military, pets, religion, sports, seasons, landscapes, hobbies, plain themes, etc. ([Funeral Director Support][3])

But MuchLoved also **redesigned its tribute pages in 2025 specifically to make them more modern, intuitive and usable across devices**. ([MuchLoved News][4])

So the signal is not:

> “Old-looking pages convert because grief requires flowers.”

It's:

> **People creating memorials want the page to feel like *their person*, rather than like the SaaS that generated it.**

And I think Theirs currently risks exactly that second problem.

Your design is much better than most of these competitors visually. **Do not destroy that advantage by building 20 wildly different templates.**

## What I would build

Keep **one Theirs layout system which we have currently exactly as it is.**

Add a layer called something like:

### Appearance

Not “Templates”.

The user chooses an **atmosphere**, while structure, spacing, navigation, responsive behavior and features remain identical.

I would launch with only **6**:

| Atmosphere  | Feeling                                                  |
| ----------- | -------------------------------------------------------- |
| **Quiet**   | Your current clean, minimal design. Default.             |
| **Warm**    | Ivory, warm neutrals, softer photography treatment       |
| **Garden**  | Sage/cream with extremely restrained botanical detail    |
| **Classic** | Traditional serif, stone/parchment tones, subtle borders |
| **Dusk**    | Deep charcoal/navy, elegant light typography             |
| **Light**   | Airy whites, pale sky/stone tones, gentle and optimistic |

Not six completely different websites.

The same:

```text
Hero
About
Story
Gallery
Timeline
Tributes
Footer
```

remains.

The atmosphere can change only:

```text
background
surface colors
text palette
accent
display typography
hero treatment
divider treatment
very subtle decorative motif
```

That's enough.

---

## Why your current pure-modern approach can become a problem

Think about three memorials:

**72-year-old grandmother who loved gardening**

**28-year-old musician**

**retired military officer**

If all three have:

```text
white background
same blue accent
same serif
same hero
same card treatment
```

The product is beautifully designed, but eventually visitors notice:

> This is a Theirs.page page.

What you want is:

> This is **Robert's place**.

The interface should disappear.

That is what the competitors are trying to solve with their giant theme libraries, even if many of them solve it rather badly.

---

## But don't overcorrect into this

I would absolutely **not** build:

```text
Theme #1 → different nav
Theme #2 → circular photos
Theme #3 → flower border everywhere
Theme #4 → completely different gallery
Theme #5 → different timeline
...
```

You'll recreate the exact consistency nightmare you've spent months avoiding.

Ten themes can quietly become ten products.

Instead:

```ts
theme = {
  id: "garden",

  colors: {
    page: ...,
    surface: ...,
    text: ...,
    muted: ...,
    accent: ...,
  },

  typography: {
    display: ...,
  },
  decoration: "botanical-subtle"
}
```

The **DOM/layout remains the same**.

This keeps your premium quality under control.

---

# One very important UX decision

Don't ask people to choose an atmosphere during initial onboarding.

That becomes:

> Select template.

which feels like website-building software.

Create the page first using **Quiet**.

Then after they've added the portrait, show something like:

**Make this feel like them**

`Choose the mood, cover and colors for their memorial.`

And show six **actual miniature previews using their portrait/name**.

Not generic thumbnails.

That moment would probably feel fantastic:

```text
        Quiet        Garden        Dusk
      [Aachal]      [Aachal]      [Aachal]

        Warm         Classic       Light
      [Aachal]      [Aachal]      [Aachal]
```

Click one → entire preview changes instantly.

---


## So I would change your roadmap

Not:

> Competitors have 40 themes → Theirs needs 40 themes.

Do:

**V1**

```text
One excellent layout which we have currently
+
6 visual atmospheres
+
custom memorial cover (we will build it later, leave it for now, its little hard one)
+
memorial-specific accent
```

### My recommendation for Theirs

**Do not abandon the modern design. That is one of the product's strongest differentiators.**

But I would no longer ship the public memorial as one immutable visual identity either.

The winning middle ground is:

> **Modern framework, personal atmosphere.**

Competitors are telling you personalization matters. They are **not** telling you that Theirs needs to look like them.

So Lets build this system