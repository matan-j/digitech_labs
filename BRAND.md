# DigiTech HUB — Brandbook & Build Guide

> **What this is:** the design contract for the **DigiTech HUB** product — DigiTech's
> practical-learning hub (courses, guides, playbooks). Read this before generating or
> editing any UI. Pair it with `app/globals.css` (the canonical token source — never
> hardcode hexes it already defines) and `public/brand-book/assets/digitech-swoosh-white.png`.
>
> **Golden rule:** match the live product and the DigiTech brand. Light lavender
> surfaces, **deep-purple brand**, the DigiTech **wing mark**, a brand **teal** accent
> bridging to a **mint-green** progress signal, **pill-shaped CTAs**, RTL Hebrew,
> purple-tinted shadows.

---

## 0. Product in one line
DigiTech HUB — *השכלה פרקטית* ("practical education"). A learning hub for business
builders: courses, guides, playbooks. **Hebrew-first, RTL by default.**
The feeling: *clear, calm, modern* — "easy to learn in" before it feels "designed."

**Voice:** warm, direct, second-person, concise (1–4 word labels). Numbers always visible
(they read as progress). No corporate "we". Examples: `המשך ללמוד`, `הירשם למועדון`,
`עולם של קורסים מחכה לך`, `המשך מהמקום שעצרת`.

---

## 1. Brand & logo
- **Wordmark:** `DigiTech` (capital D, capital T) in Rubik 800. The product name is
  **DigiTech HUB** — render "HUB" as a small teal accent set against the wordmark,
  with the Hebrew tagline **השכלה פרקטית** beneath.
- **Mark:** the **wing / soaring-bird swoosh** — two arcs meeting at a sharp central V,
  short left arc + long right sweep. Supplied as:
  - `public/brand-book/assets/digitech-swoosh-white.png` (white, drop on dark/gradient), and
  - `--swoosh` in `globals.css` (an SVG mask — paint any color or gradient).
- **App icon / badge:** rounded-square tile with the **purple→teal** brand gradient
  (`--grad-mark`) + white wing + a small **mint "spark" dot** (the HUB signal motif).
- **Clear space & don'ts:** keep the wing's own height of padding around the lockup.
  Don't recolor the wing outside purple / white / the brand gradient, don't add a second
  accent color to it, don't stretch it (hold the 220:86 ratio), don't drop it on a busy bg.

---

## 2. Three principles (settle any judgment call)
1. **בהירות / Clarity** — sharp hierarchy, generous whitespace, one screen = one task.
2. **רוגע / Calm** — light quiet base; purple is an accent, not noise. Color only when it means something.
3. **קצב / Momentum** — progress is always visible: progress bars, mint checks, "continue where you left off."

---

## 3. Color — what each token is *for* (don't improvise)

The canonical tokens live in `app/globals.css` under `@theme`. They are exposed as
Tailwind utilities (`bg-brand-purple-700`, `text-brand-purple-100`, etc.) and as CSS
custom properties.

| Token | Hex | Use |
|---|---|---|
| `--color-bg-main` | `#F7F6FB` | page background. **Never pure white**, never grey. |
| `--color-bg-card` | `#FFFFFF` | cards, sheets |
| `--color-brand-purple-50` | `#F3EEFF` | active nav pill, tinted fills |
| `--color-neutral-950` | `#1C1430` | headings & primary text |
| `--color-neutral-700` | `#5B5572` | body / secondary |
| `--color-neutral-500` | `#928CA6` | meta, placeholders |
| `--color-neutral-200` | `#ECE9F5` | hairline card borders |
| `--color-neutral-300` | `#E1DDEF` | 1.5px control/input borders |
| `--color-brand-purple-700` | `#4B2E83` | **primary buttons, Hero, brand, headings-on-light** |
| `--color-brand-purple-600` | `#5C3BA0` | primary hover |
| `--color-brand-purple-500` | `#6B3FE0` | links, focus rings, secondary accent |
| `--hero-from → --hero-to` | `#362465 → #5F3E9C` | Hero gradient (~140°) |
| `--color-brand-teal` / `-bright` | `#2BA8C9` / `#4CBCDC` | **brand-mark accent** — logo gradient, "HUB", rare highlights |
| `--grad-mark` | purple→teal | app icon / badge tile |
| `--color-signal` | `#1FB58A` | **mint** — progress, LIVE dot, success/checks |
| `--color-gold` | `#E0982E` | "new" badge / highlight (sparingly) |
| `--color-danger` | `#E0567B` | errors / destructive |

**Rules**
- Purple carries the brand: buttons, Hero, active states, links.
- **Teal is brand-mark only** — the logo gradient, the "HUB" accent, occasional highlights. It is *not* a primary action color.
- **Mint green is reserved** for progress / LIVE / success — never decorative.
- Teal → mint sit in the same cyan-green family on purpose: the logo's teal flows into the product's progress green. Keep that relationship; don't introduce a third cool accent.
- One Hero gradient only. No multi-color background gradients elsewhere. No flat grey shadows.

---

## 4. Typography
- **Rubik** — everything (UI, body, display). Weights: 400 body, 500 UI labels, 700 card titles, 800 page/Hero titles & the wordmark.
- **Space Grotesk** — every visible **number**, code, or mono label (`12/19`, `04:12`, `63%`, `EP_08`, XP). Use `font-feature-settings:"tnum"`.
- Compact in chrome (12–18px); jump to 40–72px for Hero / celebration titles.
- Hebrew sentence-case. Em-dash separates subject from topic: `התקדמות — שבוע`. `!` only on wins.

Fonts are loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx) and
exposed as the CSS variables `--font-rubik` and `--font-space-grotesk`.

---

## 5. Shape & depth tokens
- **Radius:** input `14px` · card `20px` · Hero/large panel `28px` · **buttons / chips / pills / avatars = `999px` (pill)**. App-icon tile = `~28%` of its size.
- **Shadows are always purple-tinted, never neutral grey:**
  - card: `0 4px 20px rgba(75,46,131,.08)` (`--shadow-card`)
  - elevated (Hero/modal/hover): `0 18px 48px -18px rgba(75,46,131,.34)` (`--shadow-elevated`)
  - button: `0 12px 26px -10px rgba(75,46,131,.50)` (`--shadow-btn`)
- **Spacing:** 4px base → `4 / 8 / 16 / 24 / 40 / 64`. Cards pad `16–24`. Generous whitespace = clarity.
- **Borders:** cards none-or-hairline (`--color-neutral-200`); inputs/chips `1.5px` (`--color-neutral-300`), snapping to `--color-brand-purple-500` on focus.

---

## 6. Components
- **Buttons (pill):** primary = deep purple + button shadow · secondary = `#6B3FE0` · light = white + 1.5px border · ghost = text · white = white-on-Hero (purple text). Press = `scale(.96)`.
- **Chips / tabs:** pill, white + 1.5px border; selected = solid `--color-brand-purple-700`.
- **Status pills:** mint signal (LIVE / pulse), violet (playbook), gold (new).
- **Field / search:** white, 1.5px border, radius 14, leading search icon, optional `⌘K` kbd.
- **Card:** white, hairline border, `--shadow-card`; hover → border `--color-brand-purple-700`.
- **Course card:** deep-purple gradient thumbnail (white category icon) → category (purple) → title (Rubik 700) → meta (`19 שיעורים · 4ש 20ד · מתחילים`, neutral-500) → **mint progress bar**.
- **Hero:** Hero gradient, radius 28, white text, signal pill eyebrow, 800 title, white + ghost pill CTAs.
- **Logo / badge:** `.badge` (icon tile) and `.logo-lockup` (wordmark + HUB + tagline).
- **Empty state:** centered, light-purple circle icon, short title + one line + one pill CTA.

---

## 7. Layout (RTL)
- `dir="rtl"` on `<html>`. All flex orderings right-anchored.
- **Sidebar on the RIGHT** (deep purple `#2E1A5C` / `--color-brand-purple-900`). Brand lockup top (badge + `DigiTech HUB` / `השכלה פרקטית`), nav groups below, "join club" card + user chip at the bottom. Active item = light tinted pill with white text + accent icon.
- **Top bar (mobile):** purple chrome, search/menu trigger + a primary CTA.
- Main content on a light lavender background; white cards float on it via purple shadow.

---

## 8. Iconography
- Custom **line icons** (lucide-react), 24×24 viewBox, `stroke-width≈1.8`, round caps/joins, `currentColor`.
- Default/active on light = `--color-brand-purple-700`; inactive = `--color-neutral-500`; white on purple chrome.
- **Don't** swap in emoji for chrome icons. Emoji may appear only inside copy.

---

## 9. Light content vs. branded chrome (THE BIG RULE)

The product splits into two visual zones:

- **Light content** — the lesson viewer, guide reader, playbook reader, course overview.
  Stays **white card on `#F7F6FB` lavender**. Purple is used sparingly for accents,
  buttons, and active states. **No deep-purple chrome inside the reading frame.**
  The reader's job is to learn, not admire the design.

- **Branded chrome** — sidebar, mobile top bar, login / signup, dashboard hero,
  course / guide / playbook *listings* (the discovery surfaces, not the readers),
  account, upgrade, admin. **Deep purple sidebar + Hero + branded touches.**

When in doubt, ask: *is the user reading content here, or navigating to / picking it?*
Reading → light. Navigating / picking → branded.

---

## 10. Do & Don't
**Do** — light base; purple for actions & Hero; teal only for the mark / "HUB"; mint only for progress/LIVE/success; pill CTAs; purple-tinted shadows; numbers in Space Grotesk.
**Don't** — multi-color background gradients; teal or mint as decorative fills; grey neutral shadows; pure-white page bg; sharp corners on interactive elements; recoloring the wing mark.

---

## 11. Reference bundle
The original design hand-off lives in [public/brand-book/](public/brand-book/):
- `Learning Hub Brand Book.html` — visual brand book (open in a browser).
- `digitech-tokens.css` — the original token bundle (kept as reference; the live tokens are in `app/globals.css`).
- `assets/digitech-swoosh-white.png` — the wing mark.
