# Dosa Hut Aspley — Landing Page

A marketing landing page for the Dosa Hut Aspley branch (Shop 6 & 7/46
Gayford Street, Aspley). It introduces the restaurant, showcases the menu and
location, and funnels visitors to the existing ordering system. It is **not**
the ordering page: there is no cart, checkout, backend or database.

Journey: Dosa Hut main site → Queensland → Aspley → this page →
Order Online → `aspley.dosahut.net.au`.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React + TypeScript
- Tailwind CSS v4 — configured in `app/globals.css` via `@theme`, no
  `tailwind.config.js`
- Self-hosted fonts via `@fontsource`: Cormorant Garamond (display), Nunito
  (body), Oswald (headings). No external font requests at build or runtime.
- Statically prerendered; no API routes, no server state

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Environment variables

One, and it matters:

| Variable | Purpose | Default if unset |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for `metadataBase`, the `<link rel="canonical">` tag, Open Graph URLs and the `Restaurant` JSON-LD | `https://aspley.dosahut.net.au` |

**Set this to the domain the site is actually deployed on before going live.**
The fallback is the *ordering* domain, so leaving it unset publishes a
canonical tag pointing at a different site, which can keep this one out of
search results.

## Project structure

```
app/
  layout.tsx      metadata, Open Graph, LocalBusiness JSON-LD, LCP preload
  page.tsx        assembles the page from section components
  globals.css     Tailwind theme tokens, brand palette, .btn-primary-glow
components/       one component per section, plus shared Button / Icons
lib/
  site.ts         single source of truth for copy, links, hours, menu data
  use-swipe.ts    horizontal swipe detection for carousels
  use-prefers-reduced-motion.ts
public/
  images/         photography, logo, hero poster
  videos/         hero background clips
  menu/           the full menu PDF
```

Page order (`app/page.tsx`): Navbar → Hero → TrustStrip → FoodShowcase →
OurStory → WhyUs → FlavorFinder → Catering → Location → Footer.

## Component behaviour

### Hero (`Hero.tsx` + `HeroVideo.tsx`)

One layout at every viewport — mobile, tablet, iPad and desktop all get the
same full-bleed video hero with centred copy. There is no desktop-specific
variant, no tilted or rotating collage, and no breakpoint branching inside
the component.

`HeroVideo` runs a two-clip sequence:

1. `Lark20260910-153613.mp4` (20s) — playback **stops 2s before the end** so
   the baked-in Dosa Hut banner never appears
2. `Lark20260910-153609.mp4` (17.3s) — plays in full
3. loops back to the first

Details worth knowing before editing it:

- **Both files ship byte-identical to their originals** at 720×1280. Every
  encoder preset available on macOS without `ffmpeg` either degraded them
  (204×360, 404×720) or matched the original size for nothing, so the end trim
  is done in code (`endTrimMs`) rather than by cutting the asset. There is no
  higher-resolution source; a responsive `<source media>` switch would serve
  identical files, so none is wired up. If HD re-exports arrive, add the
  switch then.
- **Cross-fade, not a cut.** The next clip starts `HANDOVER_LEAD_MS` (300ms)
  before the current one's playable end, both keep playing through a
  `CROSSFADE_MS` (2000ms) dissolve, and the outgoing video is paused only
  after the fade completes. Pausing it immediately makes the fade look frozen.
- **`advancedFromRef` guards the handover.** `timeupdate` fires several times a
  second and can satisfy the handover window twice; without the guard each hit
  queues another step increment and the sequence skips a clip entirely.
- **Staggered loading.** Clip one is `preload="auto"`; clip two starts
  downloading `PRELOAD_NEXT_MS` (2.5s) into playback, so first paint competes
  with one download while still buffering well before the dissolve.
- **Poster = clip one's own first frame** (`hero-video-poster.jpg`). Any other
  image flashes on refresh as it swaps to the video. Preloaded in `layout.tsx`
  under `media="(max-width: 1279px)"`.
- **No tint layer.** The video renders at natural colour; there is no
  `bg-black/*` or gradient scrim. Hero copy is plain maroon (headline) and
  cream (paragraph) with no text-shadow.
- **Reduced motion**: nothing autoplays under `prefers-reduced-motion`; the
  poster shows instead.

### Menu carousel (`FoodShowcase.tsx` + `DishCarousel.tsx`)

Category pills filter `DISHES` by category; the carousel cross-fades between
dishes. Manual input (arrows, swipe) uses a 320ms transition while the ambient
auto-advance uses 2400ms — a tap on a 2.4s fade reads as a broken button.

The arrows handle `onClick` and `onTouchEnd` through one `navigate()` call
with a 700ms timestamp guard, because WebKit fires a synthetic click after
touchend and would otherwise advance two slides. They also `stopPropagation()`,
which means the container's `touchend` never arrives — so `navigate()` releases
the swipe-pause itself.

### Craving Finder (`FlavorFinder.tsx`)

Filters `CRAVING_MENU` (the full per-section menus) by spice level and diet.
Spice is shown as plain text — no chilli icons.

### Map (`LocationMap.tsx`)

A blocked Google Maps embed navigates to the browser's error page, which then
fires `load` while `error` never fires — so reachability is probed with a
separate `no-cors` fetch. On failure the iframe unmounts and a fallback card
renders the address plus an "Open in Google Maps" link. There is no Maps API
key anywhere, so `RefererNotAllowedMapError` cannot occur.

## Styling standards

Brand tokens live in `app/globals.css` under `@theme`:

| Token | Hex | Use |
| --- | --- | --- |
| `maroon-900` / `maroon-800` | `#570B0B` / `#6B0F0F` | navbar, footer, headings |
| `orange-500` / `orange-600` | `#F15A27` / `#D94E1D` | primary CTAs, accents |
| `cream-0` / `cream-50` | `#FFFDFA` / `#FFF7F4` | page ground, light text |
| `ink-900` / `ink-600` | `#241512` / `#5C4A44` | body copy |

- **Primary CTAs** use `<PrimaryGlowButton>`, which applies the global
  `.btn-primary-glow` class: left-to-right orange gradient, orange drop-shadow
  glow, hover lift, `active:scale(0.95)`, plus a tightened glow under 1024px
  and a press-only state on touch devices. Every "Order Online" / "Order Now"
  on the site routes through it. `Button.tsx` covers secondary outlined
  actions only.
- **Icon badges** (hero Weekend Special button, Why Us tiles) are cream fill +
  maroon border + maroon icon. The flame is `FlameIcon` from `Icons.tsx`, not
  the 🔥 emoji, because an emoji cannot be recoloured.
- **Tap targets** are `min-h-[44px]` / `min-w-[44px]` everywhere, and buttons
  get `cursor: pointer` from a global rule (Tailwind v4's preflight resets
  buttons to `cursor: default`).
- Base body type is 20px, stepping to 24px at `lg`.

## Menu data

`lib/site.ts` holds every price. Two shapes, deliberately:

- `DISHES` — the curated, photographed "top dishes" per category for the
  showcase carousel. Carries price and photo only, **never** `diet` or
  `spiceLevel`; duplicating those is what caused data drift previously.
- `DOSA_MENU` / `BIRYANI_MENU` / `CURRY_MENU` → spread into `CRAVING_MENU` —
  the full priced menus with diet and spice, which the Craving Finder filters.

Menu sections arrive one at a time from the printed menu and are authoritative:
each overrides whatever is already in `site.ts`. Report every changed price —
these are live customer prices.

**Outstanding:** Tandoori Starters and Indo-Chinese have no full menu yet, so
their showcase dishes are deliberately unfilterable in the Craving Finder.

## Deployment

```bash
npm run build
git push origin main
```

Deployed via Vercel as a static frontend. Pre-deploy checklist:

1. `NEXT_PUBLIC_SITE_URL` set to the real domain (see above)
2. Verified in a browser at 375px, 768px and 1280px, and on a real iPhone —
   video autoplay behaviour cannot be confirmed any other way
3. Prices in `lib/site.ts` reconciled against the current printed menu

## Known trade-offs

- The hero video is 720×1280 upscaled on large desktops; sharper output needs
  higher-resolution source clips, not code.
- The footer has no Privacy link because `dosahut.net.au` has no privacy
  policy page (verified 404). Sitemap points at the real
  `dosahut.net.au/sitemap.html`.
- `SITE.uberEatsUrl`, `SITE.doorDashUrl` and `SITE.addressFull` are currently
  unreferenced; kept in case the delivery-partner links return.
