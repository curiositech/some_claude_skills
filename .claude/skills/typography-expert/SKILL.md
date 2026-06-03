---
name: typography-expert
description: Working type director's reference for selecting, pairing, and shipping typefaces with real taste. Covers a broad, opinionated catalog of typefaces and foundries (libre through commercial), a mood/era/register-driven selection framework that never collapses to one answer, font pairing as logic, fluid type scales, variable-font axes (incl. opsz/GRAD), OpenType features, web-font performance (subsetting, font-display, size-adjust fallback metrics), and licensing literacy (SIL OFL vs commercial EULA, desktop/web/app, trials). Explicitly retires the overused AI-design defaults (Inter, Roboto, Montserrat, Poppins, Fraunces, Geist, Söhne, the Fontshare/ITF starter pack) and names fresher alternatives in every role. Use for font selection, pairing, type scales, web-font optimization, variable fonts, OpenType, and typographic systems. NOT for logo/wordmark design, icon fonts, general CSS, or image-based/raster typography.
allowed-tools: Read,Write,Edit,WebFetch
metadata:
  category: Design & Creative
  pairs-with:
  - skill: design-system-creator
    reason: Typography tokens in design systems
  - skill: web-design-expert
    reason: Typography for web projects
  tags:
  - typography
  - fonts
  - type-scale
  - variable-fonts
  - opentype
  - foundries
  - libre-fonts
  - licensing
---

# Typography Expert

Written by someone who picks type for a living. The goal of this skill is **breadth and taste**, not a blessed shortlist. There is never one right typeface — there is a right *register*, and several good faces that hit it at different budgets. If you reach for the same four fonts every time, you are not choosing; you are defaulting. Stop defaulting.

## When to Use This Skill

✅ **Use for:**
- Font selection and pairing driven by mood / era / industry / register, not by habit
- Typographic hierarchy and tokens for design systems
- Type scales (modular ratios, fluid `clamp()`)
- Variable-font integration and axis control (`wght`, `wdth`, `opsz`, `slnt`, `GRAD`)
- Web-font performance (subsetting, `font-display`, self-host vs CDN, `size-adjust` fallback metrics to kill CLS)
- OpenType feature implementation (ligatures, small caps, numerals, stylistic sets)
- Licensing decisions (OFL vs commercial EULA; desktop/web/app; trial fonts)
- Accessibility for type (WCAG contrast, minimum sizes, zoom, line/letter spacing)
- Dark-mode typographic compensation
- Multilingual support (RTL, CJK, diacritics, character-set coverage)

❌ **Do NOT use for:**
- Logo or wordmark creation → design-system-creator
- Icon fonts / icon systems → web-design-expert (use SVG, not icon fonts)
- General CSS unrelated to type
- Image-based or rasterized lettering → different domain
- Brand naming or strategy → this is visual implementation
- Kinetic/motion typography → native-app-designer

---

## 0. Retire the Defaults (read this first)

These faces are not *bad*. They are *exhausted* — reached for reflexively, so they signal "a machine or a hurried human picked this," not "someone chose this." If a brief has no reason to use one of these, don't. For each: one sentence on why it's a cliché, then two fresher faces that fill the same role.

| Overused face | Why it reads as a cliché | Reach for instead |
|---|---|---|
| **Inter** (Rasmus Andersson, OFL) | The default UI sans of the entire 2018–2025 web; competent and invisible to the point of anonymity. | **Hanken Grotesk** (Alfredo Marco Pradil, OFL — warmer humanist UI sans) · **Public Sans** (USWDS, OFL — neutral but distinct) · paid: **Söhne is *also* now overused; try Untitled Sans** (Klim) instead. |
| **Roboto** (Christian Robertson, Apache) | Android's system font; "I used whatever was already loaded." | **Schibsted Grotesk** (Bakken & Bæck, OFL) · **Onest** (OFL) |
| **Open Sans** (Steve Matteson, Apache) | The 2013 "safe corporate" sans; reads as a CMS template. | **Source Sans 3** (Paul Hunt / Adobe, OFL) · **IBM Plex Sans** (Bold Monday for IBM, OFL) |
| **Montserrat** (Julieta Ulanovsky, OFL) | Geometric "startup deck" sans, over-set at heavy weights everywhere. | **Hanken Grotesk** · paid: **Aktiv Grotesk** (Dalton Maag) or **GT America** (Grilli Type) |
| **Poppins** (Indian Type Foundry, OFL) | The "friendly app" geometric circle-o sans of a thousand landing pages. | **Gabarito** (OFL, geometric with character) · **Figtree** (OFL) · paid: **Visby** (Connary Fagen) |
| **Lato** (Łukasz Dziedzic, OFL) | 2010s humanist default; pleasant, forgettable. | **Instrument Sans** (Rodrigo Fuenzalida + Jordan Egstad, OFL) · **Mona Sans** (GitHub, OFL) |
| **Helvetica / Helvetica Neue** (Linotype) | "Neutral" became a cliché the moment everyone agreed it was neutral; also a paid license many fake with Arial. | **Neue Haas Grotesk** (the real thing, Linotype/Monotype) if you must; or pivot to a grotesque with grit: **GT America** (Grilli Type), **ABC Diatype** (Dinamo). Libre swap: **Archivo** (Omnibus-Type, OFL). |
| **Fraunces** (Undercase Type, OFL) | The "soft serif with the wonky g and opsz axis" that became *the* indie-SaaS display serif. | **Newsreader** (Production Type, OFL — has opsz too, far less seen) · paid: **Signifier** (Klim) or **Domaine** (Klim) for high-contrast display. |
| **Geist** (Vercel, OFL) | Ships with every Next.js starter; "I scaffolded this an hour ago." | Sans: **Mona Sans** / **Hubot Sans** (GitHub, OFL) or **Hanken Grotesk**. Mono: **Commit Mono** (OFL) or **Martian Mono** (OFL). |
| **Söhne** (Klim) | The premium-newsletter / AI-company house sans of 2021–present (you've seen it on a dozen "we raised a Series A" pages). | Other Klim grotesques: **Untitled Sans** or **National 2**; or off-Klim: **ABC Diatype** (Dinamo), **Aeonik** (CoType). |
| **Fontshare / ITF "starter pack"** — Satoshi, General Sans, Clash Display, Cabinet Grotesk, Switzer, Space Grotesk (Indian Type Foundry, free) | Free + slick + on every dribbble shot since 2021; "Clash Display + Satoshi body" is now a *look*, not a choice. | **Clash Display → Bricolage Grotesque** (Mathieu Triay, OFL) or **Anybody**/**Big Shoulders** (OFL) for display · **Satoshi/General Sans → Hanken Grotesk, Schibsted Grotesk, Instrument Sans** · **Space Grotesk → Departure Mono / Space Mono is fine but tired; try Spline Sans or Familjen Grotesk** (OFL). |

**The meta-rule:** if the only justification for a face is "it's clean and modern," you have not made a decision. *Clean and modern* is the floor, not the brief.

---

## 1. Pick the Register Before the Font

Never name a typeface before you can name the **register**: the mood, era, industry, medium, and voice. The same word ("modern") points at five different faces depending on register. Work the framework below, then choose — and offer options at **three budget tiers** so money is never the excuse for a boring result.

> Budget tiers used throughout: **Libre** = free, OFL/Apache, self-hostable. **PWYW/Trial** = pay-what-you-want or generous free-for-personal trial (commercial use paid). **Commercial** = licensed foundry retail.

### Warm editorial (magazines, long-form, "human and considered")
- **Libre:** Newsreader (Production Type) for text + display; Source Serif 4 (Adobe) for body; Spectral (Production Type) for screen-first reading.
- **PWYW/Trial:** Editorial New (Pangram Pangram) for narrow editorial headlines; Reckless (Displaay, trial).
- **Commercial:** Tiempos Text/Headline (Klim); GT Sectra (Grilli Type) for that scalpel-and-broad-nib warmth; Lyon (Commercial Type).

### Industrial / technical / engineering
- **Libre:** IBM Plex (Sans/Mono/Serif, Bold Monday) — the most credible libre technical superfamily; Space Mono only if you want the retro-NASA wink.
- **PWYW/Trial:** Basier (atipo, PWYW) for a tidy grotesque; Chaney (atipo) for a stencil-tech display edge.
- **Commercial:** GT America (Grilli Type); ABC Monument Grotesk or ABC Diatype Mono (Dinamo); Akkurat (Lineto, Laurenz Brunner) — the original Swiss-spec workhorse.

### Luxury / fashion / beauty
- **Libre:** Cormorant (Christian Thalmann, OFL) — a Garamond-adjacent display with extreme delicacy; Libre Caslon Display (OFL) for high-contrast titling.
- **PWYW/Trial:** Migra (Pangram Pangram) — sculptural sharp serif; Tobias / Reckless (Displaay, trial).
- **Commercial:** Domaine Display (Klim); Canela (Commercial Type); Genath (Optimo, François Rappo) — a serious didone-adjacent revival with bite.

### Civic / institutional / public-sector
- **Libre:** Public Sans (USWDS) — literally built for government; Source Sans 3; Libre Franklin (OFL) as a Franklin Gothic stand-in.
- **PWYW/Trial:** Wotfard (atipo, PWYW) — quiet, legible, institutional.
- **Commercial:** National 2 (Klim); FF Meta or Stratos for signage-grade legibility.

### Literary / bookish
- **Libre:** EB Garamond (OFL) — a faithful Garamond; Cardo (OFL) for scholarly long-form; Newsreader for screen.
- **PWYW/Trial:** Editorial New for the literary-cover register.
- **Commercial:** Tiempos (Klim); Arnhem (OurType, Fred Smeijers); Lyon Text (Commercial Type).

### Brutalist / raw / counterculture
- **Libre:** Velvetyne's catalog is the motherlode — Fivo Sans, Pilowlava, Basteleur, Le Murmure (libre, made for exactly this); Redaction (Titus Kaphar & Forest Young, OFL) for a degraded-newspaper feel.
- **PWYW/Trial:** Uncut.wtf's display section; Collletttivo (Apfel Grotezk, libre) for a deadpan grotesque.
- **Commercial:** ABC Whyte / ABC Gravity (Dinamo); anything from OH no Type Co (Hobeaux, Vulf Mono).

### Retro-future / 70s–80s / sci-fi
- **Libre:** Departure Mono (OFL) for pixel-mono; Orbitron (OFL) sparingly; VTF Redaction for degraded-future.
- **PWYW/Trial:** Cassannet Plus (atipo, art-deco geometric) for a Cassandre-era poster feel; Round 8 (atipo).
- **Commercial:** Druk (Commercial Type) for compressed poster-future; ABC Gravity (Dinamo); Sharp Grotesk (Sharp Type) at its narrow widths.

### Quiet Swiss / neo-grotesque restraint
- **Libre:** Archivo (Omnibus-Type) for a grotesque with a sturdier spine than Inter; Hanken Grotesk for a humanist-Swiss compromise.
- **PWYW/Trial:** Basier (atipo).
- **Commercial:** Akkurat (Lineto); Untitled Sans (Klim); ABC Diatype (Dinamo); the genuine Neue Haas Grotesk (Monotype).

### Playful consumer / lifestyle / DTC
- **Libre:** Bricolage Grotesque (Mathieu Triay) — expressive, has wdth+opsz axes; Gabarito; Fredoka (OFL) only for genuinely childlike.
- **PWYW/Trial:** Sfizia (atipo); Pangram Pangram's PP Mori / PP Neue Montreal (free to try).
- **Commercial:** Covik Sans or Degular (OH no Type Co) — warm, lively, "organic over geometric"; Obviously (OH no Type Co) for a flexible width-axis display.

### Academic / scientific / data-dense
- **Libre:** IBM Plex superfamily (sans + serif + mono share a skeleton — ideal for papers/dashboards); STIX Two (OFL) for math; Source Serif 4 for body.
- **PWYW/Trial:** Wotfard for UI chrome.
- **Commercial:** Lexicon (Bram de Does) for the most refined scholarly serif money can buy; Tiempos for journals.

---

## 2. Pairing as Logic, Not Vibes

Pairing is a small set of rules. Apply them; don't gamble.

1. **One workhorse + one voice.** Pick a neutral, deep-weight workhorse to carry 90% of the words (body, UI, captions) and one expressive "voice" face for display/headlines. Trying to make *two* expressive faces coexist is how decks end up shouting.
2. **Contrast by classification, harmonize by skeleton.** Pair across *categories* (a humanist serif body with a grotesque display) so they're clearly different jobs — but check they share a *skeleton*: similar construction logic, similar proportions. A geometric serif fights a humanist sans.
3. **Match x-heights, not point sizes.** Two faces at the same `font-size` can look like different sizes. Compare lowercase x-heights and adjust with `font-size` or `size-adjust`. Mismatched x-height is the #1 tell of an amateur pairing.
4. **The superfamily shortcut.** When in doubt, use one family that ships sans + serif + mono on a shared skeleton: **IBM Plex** (libre), **Source** (Sans 3 / Serif 4 / Code Pro, libre), **Recursive** (libre, variable), or commercial superfamilies like **Klim's National + a Klim serif**, **Lineto's families**, or **GT America + GT Sectra**. Guaranteed harmony, zero pairing risk.
5. **Same designer / same foundry.** Faces from one hand often share spacing and rhythm. OH no Type Co's catalog inter-pairs; Klim faces inter-pair; Production Type's Newsreader + a Production sans.
6. **Historical compatibility.** Faces from one era share DNA (two didones; a Garalde with a humanist sans both rooted in calligraphic forms). Don't pair a 1490s Garalde with a 1990s techno display unless tension is the *point*.
7. **Limit to two families.** Three only if one is a mono used strictly for code/data. Past that you have chaos, not hierarchy — use **weight, width, opsz, and case** for variety within a family.

**Quick worked pairings (none from the starter pack):**
- *Warm editorial site:* **Newsreader** display + **Hanken Grotesk** body (both libre).
- *Technical product:* **IBM Plex Sans** UI + **IBM Plex Mono** data (one superfamily, libre).
- *Fashion landing:* **Migra** (Pangram Pangram, display) + **Untitled Sans** (Klim, body).
- *Civic app:* **Libre Franklin** display + **Public Sans** body (both libre).
- *Playful DTC:* **Bricolage Grotesque** display + **Schibsted Grotesk** body (both libre).

---

## 3. Catalog by Classification

Genuinely interesting faces per class, with the people/foundries behind them. Mix of libre (L) and commercial (C). Use this to escape your defaults.

### Humanist sans
Calligraphic roots, modulated strokes, open apertures — warm and readable.
- **Hanken Grotesk** (Alfredo Marco Pradil / Hanken Design Co.) — L
- **Source Sans 3** (Paul Hunt, Adobe) — L
- **FF Meta** (Erik Spiekermann) — C, the canonical humanist workhorse
- **Skolar Sans** (David Březina, Rosetta) — C, superb multiscript
- **Whitney** (Tobias Frere-Jones / Frere-Jones Type) — C

### Neo-grotesque
The "neutral" Swiss line (Helvetica/Akzidenz tradition) — but pick a *good* one.
- **Archivo** (Omnibus-Type) — L
- **Neue Haas Grotesk** (Christian Schwartz, after Max Miedinger) — C, the real Helvetica
- **GT America** (Noël Leu + Seb McLauchlan / Grilli Type) — C, American gothic × Swiss
- **ABC Diatype** (Dinamo) — C
- **Aeonik** (CoType) — C

### Geometric sans
Bauhaus circles-and-lines (Futura lineage).
- **Gabarito** (L), **Spline Sans** (L)
- **Visby** (Connary Fagen) — C
- **Cassannet Plus** (atipo) — PWYW, art-deco geometric
- **Avenir Next / Avenir** (Adrian Frutiger) — C, the humane geometric

### Grotesque / industrial
Earlier, grittier grotesques and mechanical gothics.
- **Le Murmure** (Velvetyne) — L, expressive display grotesque
- **Apfel Grotezk** (Collletttivo) — L, deadpan
- **ABC Monument Grotesk** (Dinamo) — C
- **Aperçu** (Colophon, now Monotype) — C
- **Sharp Grotesk** (Lucas Sharp / Sharp Type) — C, 21 widths × 7 weights

### Garalde / old-style serif
1490s–1600s humanist roots, low contrast, bracketed serifs, angled stress.
- **EB Garamond** (L), **Cormorant** (Christian Thalmann) — L
- **Arnhem** (Fred Smeijers / OurType) — C
- **Galaxie Copernicus** (Chester Jenkins + Kris Sowersby) — C
- **Sabon Next** (Jan Tschichold, revived by Jean François Porchez) — C

### Transitional serif
18th-c., higher contrast, more vertical stress (Baskerville/Times lineage).
- **Source Serif 4** (Frank Grießhammer, Adobe) — L
- **Newsreader** (Production Type) — L
- **Tiempos** (Kris Sowersby / Klim) — C, a modernized Plantin/Times
- **Lyon** (Kai Bernau / Commercial Type) — C

### Didone / modern serif
Extreme thick/thin contrast, hairline serifs (Bodoni/Didot lineage).
- **Libre Caslon Display** is *not* didone — for libre didone use **Playfair Display** (Claus Eggers Sørensen) — L (note: itself now common; set it large only)
- **Genath** (François Rappo / Optimo) — C, a rigorous Basel didone revival
- **Canela** (Miguel Reyes / Commercial Type) — C, didone × glyphic
- **Domaine Display** (Klim) — C

### Slab serif
Heavy, often unbracketed rectangular serifs.
- **Roboto Slab** is tired — use **Zilla Slab** (Typotheque for Mozilla) — L, or **Bricolage**'s heavier cuts
- **Rockwell / Archer** lineage commercial: **Archer** (Hoefler&Co) — C
- **Caponi Slab** (OH no Type Co) — C

### Glyphic / incised
Chiseled, flared terminals — stone-cut feel, between serif and sans.
- **Trajan** is a cliché (movie posters) — avoid; instead **Albertus**-adjacent or **Friz Quadrata**
- **Hatton** (Pangram Pangram) — free to try, high-contrast glyphic-display
- **Schnyder** (Commercial Type) — C, contrast-glyphic display

### Humanist serif
Warmer, lower-contrast text serifs built for reading on screen.
- **Spectral** (Production Type) — L
- **Source Serif 4** — L
- **Lexicon** (Bram de Does / TEFF) — C, the gold standard for book text
- **FF Scala** (Martin Majoor) — C

### Display
Big, characterful, headline-only.
- **Bricolage Grotesque** (Mathieu Triay) — L, wdth + opsz
- **Big Shoulders** (Production Type / Chicago) — L
- **Anybody** (Tyler Finck) — L, extreme width axis
- **Druk** (Berton Hasebe / Commercial Type) — C, compressed poster
- **Obviously** (James Edmondson / OH no Type Co) — C
- **Migra**, **Editorial New** (Pangram Pangram) — free to try

### Monospace
For code, data, and the technical register.
- **JetBrains Mono** (L), **IBM Plex Mono** (L), **Commit Mono** (L, "anonymous" by design), **Departure Mono** (L, pixel)
- **Recursive Mono** (Arrow Type) — L, variable with a "casual" axis
- **MD IO** (Mass-Driver) — C
- **Vulf Mono** (OH no Type Co) — C, warm and inky

### Unexpected categories
- **Stencil:** Chaney (atipo, PWYW); Stardom/Velvetyne display stencils — for utility/military/industrial edge.
- **Mechanical / monolinear:** Recursive Mono Casual (L); Space Mono (L) — uniform stroke, technical-but-friendly.
- **Reverse-contrast** (thick horizontals, thin verticals — Western/circus/"Italian"): Le Murmure leans this way; OH no Type Co's display work explores it; commercial **Caslon Doric**-adjacent slab-reverse faces. Use as a deliberate jolt.
- **Blackletter-adjacent / textura without going full Gothic:** rarely right outside metal/heritage/editorial pull-quotes — when you must, prefer a *modern interpretation* over a 1500s textura, and never set body copy in it.

---

## 4. The Libre Tier — No Budget Is No Excuse

### (a) Interesting Google Fonts beyond the defaults
Google Fonts is not just Roboto and Open Sans. Reach for these instead:
- **Serifs:** Newsreader (Production Type), Source Serif 4 (Adobe), Spectral (Production Type), Libre Caslon (Text + Display), EB Garamond, Cormorant, Zilla Slab.
- **Grotesques / sans:** Bricolage Grotesque, Instrument Sans (+ Instrument Serif for the condensed-display partner), Hanken Grotesk, Schibsted Grotesk, Gabarito, Onest, Figtree, Familjen Grotesk, Archivo (+ Archivo Expanded/Narrow), Mona Sans / Hubot Sans (GitHub).
- **Caveat — already overused even though libre:** Fraunces, Space Grotesk, Sora, and Plus Jakarta Sans. Fine faces, but if you use them you're swimming in the same pool as everyone else; treat them as *defaults to beat*, not destinations.

### (b) Non-Google libre & PWYW foundries worth knowing
- **Velvetyne (velvetyne.fr)** — France, since 2010. The most adventurous libre catalog: Le Murmure, Pilowlava, Basteleur, Fivo Sans, Redaction. Genuinely libre (use/modify/redistribute).
- **Collletttivo (collletttivo.it)** — Milan, first Italian open-source foundry. Apfel Grotezk and friends.
- **The League of Moveable Type** — the original open-source foundry (League Gothic, League Spartan, Ostrich Sans).
- **atipo foundry (atipofoundry.com)** — Gijón, Spain. True **pay-what-you-want** (set your own price, including the minimum): Wotfard, Basier, Chaney, Round 8, Cassannet Plus, Sfizia, N27.
- **Uncut.wtf** — curated catalog (~160+) of free/open-source contemporary type by independent designers (by Kasper Nordkvist). Best discovery surface for *current* libre work.
- **Open Foundry (open-foundry.com)** — curated open-source typeface gallery, distraction-free specimens.
- **Fontshare / Indian Type Foundry (fontshare.com)** — free for commercial use, high quality (Satoshi, General Sans, Clash Display, Switzer, Cabinet Grotesk). **Caveat:** several are now badly overused — treat as the AI starter pack and prefer the alternatives in §0.

> **Free-to-try ≠ libre.** Pangram Pangram and Displaay offer generous *trial / free-for-personal* fonts, but **commercial use must be licensed**. Don't ship a client site on a "free" trial weight.

---

## 5. Type Scales

### Modular ratios
| Ratio | Name | Use case |
|---|---|---|
| 1.067 | Minor Second | Dense UIs, dashboards |
| 1.125 | Major Second | General web body content |
| 1.200 | Minor Third | Balanced default hierarchy |
| 1.250 | Major Third | Marketing, headline-forward |
| 1.333 | Perfect Fourth | Hero sections, bold statements |
| 1.414 | Augmented Fourth | Editorial drama |
| 1.618 | Golden Ratio | Classical; too large for most UI — use only for poster/display |

Pick the ratio to match the register: dense tools want a *small* ratio (1.125–1.2); a fashion landing page wants a *large* one (1.333+) so the display face can breathe.

### Fluid type with `clamp()`
```css
:root {
  /* body: 16px @ 320px viewport → 20px @ 1240px */
  --step-0: clamp(1rem, 0.91rem + 0.43vw, 1.25rem);
  /* h2: 28px → 48px */
  --step-3: clamp(1.75rem, 1.32rem + 2.14vw, 3rem);
}
/* Always use rem for the min/max so user zoom is respected (see §8). */
```
Generate the whole scale with a tool like Utopia (utopia.fyi) so the min and max sets share one ratio — don't hand-tune each step and drift out of rhythm.

### Vertical rhythm
Set a baseline unit (e.g. `1.5rem` = 24px), make spacing multiples of it, and let headings snap to integer multiples. Body line-height ~1.5–1.7; headings tighter (1.05–1.2). **Never apply one global `line-height`.**

---

## 6. Variable Fonts & Axes

| Axis | Tag | Typical range | Real use |
|---|---|---|---|
| Weight | `wght` | 100–900 | One file, many weights — animate or theme |
| Width | `wdth` | ~75–125 | Fit headlines to containers without re-tracking |
| Optical size | `opsz` | 8–144 | **Correct contrast for size** — auto via `font-optical-sizing: auto` |
| Slant | `slnt` | -12–0 | Oblique without a second file |
| Grade | `GRAD` | varies | Adjust apparent weight **without reflow** — perfect for dark mode |

**Use `opsz` correctly:** large display sizes want higher contrast, finer serifs, tighter spacing; small text wants the opposite. Faces like Newsreader and Bricolage Grotesque carry a real `opsz` axis — let the browser drive it with `font-optical-sizing: auto`, or set it explicitly per type level. Don't set a display `opsz` on body copy.

**Dark-mode compensation with `GRAD` (no layout shift):**
```css
@media (prefers-color-scheme: dark) {
  body { font-variation-settings: "GRAD" 50; } /* heavier-looking, same metrics */
}
```
If the face has no `GRAD`, nudge weight (`400 → 450`) — but know that *changes metrics* and can shift layout.

**Exotic axes exist** and are worth knowing per-face: Recursive ships a `CASL` (casual) and `MONO` axis; some Dinamo/variable display faces expose custom axes for serif-shape or "energy." Read the foundry's spec — never assume an axis tag.

---

## 7. Performance & Loading

- **Self-host WOFF2** for control and privacy; CDN only when you must. Google Fonts CSS adds a render-blocking round trip — if you use it, `preconnect` and prefer self-hosting the WOFF2.
- **Subset.** Latin-only is ~30KB vs ~150KB+ full. Drop Cyrillic/Greek/Vietnamese you don't ship. Tools: `glyphhanger`, `fonttools subset`.
- **`font-display: swap`** for body (show text immediately); `optional` for non-critical decorative faces to dodge CLS entirely.
- **Preload the one critical face:** `<link rel="preload" as="font" type="font/woff2" crossorigin>`. Don't preload everything — that just competes for bandwidth.
- **Kill CLS with `size-adjust` + fallback metrics.** Match the fallback's x-height/advance to the web font so the swap doesn't reflow:
```css
@font-face {
  font-family: "Hanken Fallback";
  src: local("Arial");
  size-adjust: 97%;     /* tune to match the real face's x-height */
  ascent-override: 92%;
  descent-override: 24%;
  line-gap-override: 0%;
}
body { font-family: "Hanken Grotesk", "Hanken Fallback", sans-serif; }
```
(Next.js `next/font`, Fontaine, and Capsize generate these overrides automatically — use them.)

**Budget guide:** Fast (<100KB, 2–3 WOFF2) · Balanced (100–200KB) · Rich (200–400KB). Prefer one variable file over eight static weights.

**Never use `@import` for fonts** (render-blocking, serialized) and **never** Font Awesome / icon fonts for icons — use inline SVG.

---

## 8. Accessibility — Non-Negotiable

These are hard rules, not suggestions:

- **Body / prose / caption text ≥ 14px (0.875rem). Never smaller.** No `text-xs` on body; no `0.7–0.8rem` on prose, captions, or meta.
- **Eyebrow / label text may sit at 12px ONLY if** weight ≥ 600, uppercase, and letter-spacing ≥ 0.1em — so the *apparent* size reads larger. That's the only exception.
- **Never lock zoom.** No `user-scalable=no`, no `maximum-scale<2` in the viewport meta. Use `<meta name="viewport" content="width=device-width, initial-scale=1">` and nothing that defeats pinch-zoom.
- **Use rem/em for body sizing**, not px, so the user's browser font-size preference and zoom are honored. `clamp()` mins/maxes in rem.
- **WCAG 2.1 AA contrast:** 4.5:1 body, 3:1 for large text (≥24px, or ≥18.66px bold). Never light-on-light or dark-on-dark.
- **Line spacing ≥ 1.5×** body; paragraph spacing ≥ 2× font size; user must be able to override letter-spacing to 0.12em and word-spacing to 0.16em without breaking layout.
- **Measure 45–75 characters** (65ch sweet spot). Cap prose width; don't let it run to the viewport edge on wide screens.

---

## 9. OpenType Features

```css
/* Prefer the high-level properties; fall back to feature-settings only for ssXX/cvXX */
.tabular   { font-variant-numeric: tabular-nums; }      /* align numbers in tables */
.fractions { font-variant-numeric: diagonal-fractions; }/* 1/2 → ½ */
.smallcaps { font-variant-caps: all-small-caps; }       /* acronyms, not faux caps */
.ligatures { font-variant-ligatures: common-ligatures; }
.brand     { font-feature-settings: "ss01" 1, "cv05" 2; }/* stylistic alts — check the spec */
```
Use **tabular numerals** for any column of figures (prices, dashboards). Use the font's **real small caps**, never `text-transform` + smaller size (that's faux small caps — uneven weight). Stylistic sets (`ssXX`) are font-specific — read the foundry's glyph chart; don't blindly enable `ss01`.

---

## 10. Anti-Patterns

### ★ The AI-portfolio starter-pack look (headline anti-pattern)
**What it looks like:** a big soft display serif (Fraunces) + Inter body + acres of whitespace + one purple/teal accent gradient + Clash Display headers. **Why it's wrong:** it's the visual signature of "generated, not designed" — instantly dated, indistinguishable from ten thousand other sites. **Instead:** pick a *register* (§1), beat every default (§0), and let the type carry a point of view.

### Picking a font before knowing the register
Choosing letters before you can name the mood/era/voice. You'll always reach for your habit. Decide the register first; the shortlist follows.

### The system-font cop-out
`font-family: -apple-system, ...` shipped as the *final* brand decision because choosing was hard. Fine for a throwaway tool; a cop-out for anything with identity. (System stacks are a great *fallback*, not a brand.)

### Faux bold / faux italic
Synthesizing weight or slant the family doesn't have (browser smearing the regular). Always load a real bold and real italic, or use a variable `wght`/`slnt` axis.

### Too many families
3+ unrelated families = chaos. Two max (a mono for code can be the third). Get variety from weight/width/opsz/case.

### Centered, long-measure body
Centering paragraphs longer than a couple lines, or letting measure exceed ~75ch. Both wreck readability — the eye loses the next line's start.

### Ignoring x-height matching
Pairing or swapping faces without comparing x-heights → visible size mismatch and CLS. Compare lowercase, tune with `size-adjust`.

### Weight jumps too harsh
400 body → 700 heading at large sizes can clang. For subtle hierarchy try 400/600 or 380/520; reserve the big jump for genuinely loud display.

### Global single line-height & fixed px sizes
One `line-height: 1.5` everywhere, or hardcoded `px` body. Set line-height per level; size in rem with `clamp()`.

### Loading full character sets
Shipping Cyrillic/Greek/Vietnamese to an English-only site. Subset.

---

## 11. Licensing Literacy

Get this right before you ship — a wrong license is a legal and a reputational problem.

- **SIL OFL (Open Font License):** the libre standard (most Google Fonts, Adobe Source family, IBM Plex, Velvetyne, Collletttivo). Use commercially, embed, self-host, **and modify/redistribute** (under the same license, can't sell the font itself alone). Safe default for products.
- **Apache 2.0:** also permissive (Roboto, Inter historically) — fine commercially; fewer redistribution stipulations than OFL.
- **Commercial EULA:** retail foundries (Klim, Commercial Type, Grilli Type, Dinamo, Sharp Type, OH no Type Co, Colophon, Lineto, Optimo, Production Type retail, MCKL, Displaay retail) license by **use type**, often separately:
  - **Desktop** (install + design comps/print) — usually priced by # of workstations.
  - **Web** (`@font-face` self-host) — priced by **monthly pageviews** or flat. Self-host vs foundry-hosted matters: some require their CDN; others let you host the WOFF2.
  - **App / embedded** — apps, ebooks, software UI, broadcast, logos — almost always a *separate, often larger* license. A web license does **not** cover an iOS app.
- **Trial / free-for-personal:** Pangram Pangram, Displaay, and many foundries give free weights for *non-commercial* use (portfolios, pitches). **Commercial use must be paid.** "Free to try" ≠ libre.
- **PWYW:** atipo lets you name a price (incl. their minimum) for full commercial rights — genuinely the best value tier when libre won't do.
- **Foundry-hosted vs self-host:** foundry-hosted webfont services (Adobe Fonts, Monotype, Fontstand) bundle licensing but tie you to their CDN/subscription and can vanish if you lapse. Self-hosting OFL/PWYW/bought-web WOFF2 is the durable choice for products you'll maintain.
- **Always read the specific EULA.** "We saw it on Pinterest" is not a license. Verify desktop/web/app coverage, pageview tier, and modification rights before committing a brand to a face.

---

## 12. Integration with Other Skills
- **design-system-creator** — emit type tokens (scale, line-height, tracking, axis defaults).
- **web-design-expert** — implement the chosen system in layout.
- **vibe-matcher** — translate a brand mood into a §1 register before selecting.

---

## Quick Reference
- **Measure:** 45–75ch (65ch ideal). **Body:** ≥14px/0.875rem, rem units, line-height 1.5–1.7. **Headings:** tighter line-height (1.05–1.2).
- **Default move when stuck:** a superfamily (IBM Plex or Source) — guaranteed harmony, libre, variable, multilingual.
- **Before naming a font:** name the register (§1). **Before shipping a font:** check the license (§11).

---

*The typeface is a decision, not a default. If you can't say why this face and not its three nearest neighbors, you haven't chosen yet.*
