# CLAUDE.md — Dosa Hut Aspley

Persistent project context for Claude. Everything below was read out of this
repository on **2026-09-22**. Where the repository does not answer a question,
this file says so rather than guessing.

> **Branch scope.** This repository is the **Aspley** branch site only. Aspley
> content must never be mixed with Sunshine Coast or any other Dosa Hut branch.
> See [§17 Branch Separation Rules](#17-branch-separation-rules) and
> [§18 Duplicate / Conflicting Information](#18-duplicate--conflicting-information).

---

## 1. Project Overview

**What it is.** A single-page marketing site for **Dosa Hut Aspley**, a branch
of the Dosa Hut Indian multi-cuisine restaurant group, plus a second standalone
page for an in-store **VIP Club** sign-up. It is a Next.js App Router
application; the landing page is static, the VIP page is backed by real API
routes and a database.

**Business purpose.** Convert local search and in-store foot traffic into
orders. The site does not take payment or manage a cart — every ordering action
hands off to the restaurant's external ordering platform. Its jobs are:
present the menu attractively, make the branch findable (address, map, hours,
phone), capture catering enquiries, and enrol VIP members.

**Target customers.** Brisbane northside residents near Aspley Hypermarket
looking for Indian food for dine-in, takeaway, delivery or event catering; plus
walk-in customers who scan the in-store VIP poster.

**What a customer can do.**

| Action | Where | Mechanism |
|---|---|---|
| Browse dishes by category | Landing → Crowd Pleasers | `DishCarousel`, 7 tabs |
| Search the whole menu | Navbar search icon | `MenuSearch` overlay, 112 dishes |
| Get a recommendation | Landing → Craving Finder | `FlavorFinder`, 3-step filter |
| Order online | Every CTA | External link to `SITE.orderUrl` |
| Download the full menu | Showcase + Footer | External PDF link |
| Enquire about catering | Catering section | External link to `SITE.cateringUrl` |
| Find / call the restaurant | Location + Footer | Google Maps embed, `tel:` link |
| Join the VIP Club | `/vip` | Form → OTP → scratch card |

**Main customer journey (landing page).**

```
Hero (video + "Order Now")
  → Trust strip
  → Crowd Pleasers carousel  ──► external ordering site
  → Our Story
  → Why Aspley Loves Us
  → Craving Finder (Veg/Non-Veg → Spice → Craving) ──► external ordering site
  → Catering ──► external catering enquiry page
  → Location (map, hours, phone)
  → Footer
```

**VIP journey (separate page).** Poster QR → `/vip` → phone check → details →
OTP → scratch card reveals a welcome gift.

---

## 2. Technology Stack

Everything here is read from `package.json`, config files and source. Versions
are exact, not inferred.

| Layer | Technology | Version / detail |
|---|---|---|
| Framework | **Next.js** (App Router, Turbopack) | `16.3.4` |
| Language | **TypeScript** | `^5`, strict via `tsconfig.json` |
| UI runtime | **React / React DOM** | `19.2.8` |
| Styling | **Tailwind CSS v4** | `^4` via `@tailwindcss/postcss` |
| CSS entry | `app/globals.css` | `@import "tailwindcss"` + `@theme inline` tokens |
| Fonts | **Fontsource**, self-hosted | Cormorant Garamond, Nunito, Oswald |
| ORM | **Drizzle ORM** | `^0.45.2`, `drizzle-kit ^0.31.10` |
| Database (prod) | **PostgreSQL** via `postgres-js` | `postgres ^3.4.9`; Neon, AWS Sydney |
| Database (local) | **PGlite** (Postgres → WASM) | `@electric-sql/pglite ^0.5.8`, stores in `.pglite/` |
| Email | **Resend** | called over `fetch`, no SDK dependency |
| WhatsApp | **WATI** | **PAUSED** — see [§8](#8-vip-club) |
| Linting | **ESLint 9** + `eslint-config-next` | flat config, `eslint.config.mjs` |
| Package manager | **npm** | `package-lock.json` present; no yarn/pnpm lockfile |
| Hosting | **Vercel** (per `README.md`) | ⚠️ not confirmed from the repo — see [§15](#15-configuration--environment) |

**No UI component library.** There is no shadcn/ui, Radix, MUI, Headless UI or
similar. Every component in `components/` is hand-written with Tailwind classes.

**No animation library.** No Framer Motion. All motion is CSS transitions plus
one keyframe class (`.category-enter`) in `globals.css`.

**`next.config.ts` is empty** — the default export carries no options, so image
optimisation, headers and redirects are all at Next.js defaults.

**Known deviation:** `package.json` `"name"` is `"dosa-hut"`, not
`"dosa-hut-aspley"`. Cosmetic, but it is a leftover from the shared codebase.

### Framework caveat

`AGENTS.md` (checked in, re-written by `next dev`) warns that this Next.js
version has breaking changes relative to older training data, and instructs
reading `node_modules/next/dist/docs/` before writing code. **Honour that** —
do not assume Next 13/14/15 conventions.

---

## 3. Complete Project Structure

```text
Aspley/
├── AGENTS.md                    Next.js version warning (auto-maintained by `next dev`)
├── CLAUDE.md                    ← this file
├── README.md                    Setup, env vars, deployment checklist, trade-offs
├── .env.example                 Env var names + commentary (⚠️ gitignored, see §15)
├── .env.local                   Real local values (gitignored)
├── .gitignore
├── eslint.config.mjs            Flat ESLint config
├── next.config.ts               Empty — all Next.js defaults
├── postcss.config.mjs           Tailwind v4 PostCSS plugin
├── tsconfig.json                Path alias `@/*` → repo root
│
├── app/                         Next.js App Router
│   ├── layout.tsx               Root layout: fonts, metadata, Restaurant JSON-LD
│   ├── page.tsx                 Landing page — composes 10 sections
│   ├── globals.css              Tailwind import, @theme colour tokens, utilities
│   ├── favicon.ico
│   ├── vip/
│   │   └── page.tsx             /vip — VIP Club sign-up page
│   └── api/
│       ├── auth/
│       │   ├── check-phone/route.ts   Is this phone already a member?
│       │   ├── send-otp/route.ts      Issue + deliver a one-time code
│       │   └── verify-otp/route.ts    Verify code, create member + session
│       └── vip/
│           └── scratch-card/route.ts  GET reward state / POST claim reward
│
├── components/                  All presentational components (no index barrel)
│   ├── Navbar.tsx               Sticky header; separate mobile & desktop bars
│   ├── Hero.tsx                 Video hero, H1, Order Now, Weekend Special
│   ├── HeroVideo.tsx            Two-clip looping background video player
│   ├── TrustStrip.tsx           Orange band, three static claims
│   ├── FoodShowcase.tsx         "Crowd Pleasers" — 7 category tabs
│   ├── DishCarousel.tsx         3-up coverflow carousel, swipe + arrows
│   ├── DishCard.tsx             One dish card (used by search + Craving Finder)
│   ├── OurStory.tsx             About copy, 3 stats, shopfront photo
│   ├── WhyUs.tsx                4 feature tiles on maroon
│   ├── FlavorFinder.tsx         "Craving Finder" 3-step recommender
│   ├── MenuSearch.tsx           Full-screen menu search overlay
│   ├── Catering.tsx             Catering pitch + 3-image bento collage
│   ├── Location.tsx             Address, phone, hours + map
│   ├── LocationMap.tsx          Lazy Google Maps iframe with loading/fail states
│   ├── Footer.tsx               Socials, links, address, hours, sitemap
│   ├── WeekendSpecialModal.tsx  Modal featuring Chicken Dum Biryani
│   ├── Button.tsx               Shared button/link primitive
│   ├── PrimaryGlowButton.tsx    Orange gradient CTA primitive
│   ├── Icons.tsx                All inline SVG icons
│   └── vip/
│       ├── VipJoinFlow.tsx      5-step VIP form state machine
│       ├── VipBenefits.tsx      Static benefits list
│       └── ScratchCard.tsx      Canvas scratch-to-reveal reward
│
├── lib/
│   ├── site.ts                  ⭐ SITE config, HOURS, DISHES, STORY_STATS, FEATURES
│   ├── menu.ts                  ⭐ MENU_ITEMS (123 dishes), VISIBLE_MENU_ITEMS, searchMenu()
│   ├── use-swipe.ts             Touch-swipe hook (carousel)
│   ├── use-prefers-reduced-motion.ts
│   └── vip/
│       ├── db.ts                Drizzle: postgres-js OR PGlite, chosen by env
│       ├── schema.ts            5 tables; `BRANCH = "aspley"`
│       ├── repo.ts              Data access used by the API routes
│       ├── otp.ts               Code generation, hashing, expiry, attempts
│       ├── session.ts           Signed cookie session
│       ├── mobile.ts            AU mobile normalisation + masking
│       ├── gifts.ts             REWARDS table with weights
│       ├── resend-otp.ts        Email delivery via Resend HTTP API
│       └── wati.ts              WhatsApp delivery — PAUSED stub
│
├── scripts/
│   ├── migrate-vip.mjs          `npm run vip:migrate`
│   ├── seed-vip.mjs             `npm run vip:seed`
│   ├── neon-migration.sql       Production DDL
│   └── vip-club-create-tables.sql
│
├── design/vip-poster/           In-store poster generator (build tooling, not shipped)
│   ├── README.md, build-poster.mjs, poster.html, logo.png, qr.png
│   └── print/dosahut-vip-poster-a3.pdf
│
├── docs/
│   └── vip-poster-copy.md
│
└── public/
    ├── images/                  38 loose files + 6 category folders (171 assets total)
    │   ├── biryani_images/      16
    │   ├── curry_images/        39
    │   ├── dishes/              35  ← newer individually-sourced dish photos
    │   ├── dosa_images/         19
    │   ├── indo_chinese_images/ 15
    │   └── tandoor_starters_images/ 6
    ├── videos/                  2 hero clips
    └── menu/                    ⚠️ DosaHut_Menu-sunshine-coast-9-10-2025.pdf — see §18
```

---

## 4. Dosa Hut Aspley Business Information

**Single source of truth: [`lib/site.ts`](lib/site.ts), the `SITE` object
(lines 3–40).** Almost nothing is hardcoded in components; they read `SITE`.
The exceptions are listed in [§16](#16-hard-coded-business-information).

| Business detail | Value | File | Used by |
|---|---|---|---|
| Brand name | `Dosa Hut` | — | Logo asset, copy |
| Branch name | `Dosa Hut Aspley` | `lib/site.ts` → `SITE.name` | `layout.tsx` (OG siteName, JSON-LD), `app/vip/page.tsx` (logo alt) |
| Address line 1 | `Shop 6 & 7/46 Gayford Street` | `SITE.addressLine1` | `Location.tsx:29`, `Footer.tsx:88`, JSON-LD `streetAddress` |
| Address line 2 | `Aspley, QLD 4034` | `SITE.addressLine2` | `Location.tsx:29`, `Footer.tsx:90` |
| Address (full) | `Shop 6 & 7/46 Gayford Street, Aspley QLD 4034` | `SITE.addressFull` | ⚠️ **unreferenced** — see §19 |
| Suburb / region / postcode | `Aspley` / `QLD` / `4034` | `layout.tsx:87-89` (hardcoded in JSON-LD) | Structured data |
| Phone (display) | `0466 977 674` | `SITE.phoneDisplay` | `Location.tsx:35`, `Footer.tsx:93` |
| Phone (link) | `tel:+61466977674` | `SITE.phoneHref` | `Location.tsx:33`, `Footer.tsx:92` |
| Phone (JSON-LD) | `+61466977674` | `layout.tsx:81` — **hardcoded duplicate** | Structured data |
| Email | **none** | — | No customer-facing email anywhere. See §19 |
| Coordinates | `-27.3634881, 153.0163604` | `SITE.lat` / `SITE.lng` | JSON-LD `geo`, directions URL |
| Google Maps place | `SITE.placeUrl` | `lib/site.ts` | JSON-LD `hasMap` |
| Directions | `SITE.directionsUrl` (`maps/dir/?api=1&destination=lat,lng`) | `lib/site.ts` | `Location.tsx`, `Footer.tsx:105` |
| Map embed | `SITE.mapEmbedUrl` (`maps?q=46+Gayford+St+Aspley+QLD+4034&output=embed`) | `lib/site.ts` | `LocationMap.tsx:69` |
| Ordering URL | `https://aspley.dosahut.net.au/` | `SITE.orderUrl` | Hero, Navbar ×2, FoodShowcase, DishCard, WeekendSpecialModal, Location, Footer, JSON-LD `OrderAction` |
| Menu PDF | `https://www.dosahut.net.au/wp-content/uploads/2025/10/NIC_Dosa-Hut-menuASPLEY-8-10-25.pdf` | `SITE.menuPdfUrl` | `FoodShowcase.tsx:90`, `Footer.tsx:74`, JSON-LD `menu` |
| Catering | `https://www.dosahut.net.au/catering/indian-catering-aspley/` | `SITE.cateringUrl` | `Catering.tsx:70`, `Footer.tsx:66` |
| Main brand site | `https://www.dosahut.net.au/` | `SITE.mainSiteUrl` | `Footer.tsx:119`, JSON-LD `sameAs` |
| Sitemap | `https://www.dosahut.net.au/sitemap.html` | `SITE.sitemapUrl` | `Footer.tsx:127` |
| Instagram | `https://www.instagram.com/dosahutaspley/` | `SITE.instagramUrl` | `Footer.tsx:13`, JSON-LD `sameAs` |
| Facebook | `https://www.facebook.com/DosaHutAspley/` | `SITE.facebookUrl` | `Footer.tsx:12`, JSON-LD `sameAs` |
| Uber Eats | `.../store/dosa-hut-aspley/AVpvfAxqTOW91C5jWeVfVw` | `SITE.uberEatsUrl` | ⚠️ **unreferenced** — see §19 |
| DoorDash | `https://www.doordash.com/store/dosa-hut-aspley-983073/` | `SITE.doorDashUrl` | ⚠️ **unreferenced** — see §19 |
| Canonical site URL | `NEXT_PUBLIC_SITE_URL` ?? `https://aspley.dosahut.net.au` | `SITE.siteUrl` | `metadataBase`, canonical, OG, JSON-LD |
| OG image | `/images/hero-banner.png` | `SITE.ogImage` | `layout.tsx` OG + JSON-LD `image` |
| Price range | `$$` | `layout.tsx:82` | JSON-LD |
| Cuisines | Indian, South Indian, Indo-Chinese | `layout.tsx:83` | JSON-LD |
| Reservations | `acceptsReservations: false` | `layout.tsx:99` | JSON-LD |

### Opening hours

Defined **twice**, in two different shapes, and they must be kept in step
(`layout.tsx:45-46` says so explicitly):

| Source | Shape | Value |
|---|---|---|
| `lib/site.ts` → `HOURS` | Display strings | Mon–Thu 11:00–15:00 & 17:00–22:00 · Fri 11:00–22:00 · **Sat 09:00–22:00** · Sun 11:00–22:00 |
| `app/layout.tsx` → `OPENING_HOURS` | schema.org `OpeningHoursSpecification` | Same values, grouped as Mon–Thu (two blocks), **Fri + Sun**, Sat |

Rendered by `Location.tsx:43` and `Footer.tsx:98`.

### Service model

| Service | Evidence |
|---|---|
| **Dine-in** | `FEATURES` in `lib/site.ts` ("Dine-in, fast takeaways, and custom event catering"); reward copy in `lib/vip/gifts.ts` ("Valid on dine-in and takeaway at Dosa Hut Aspley") |
| **Takeaway** | Same sources; `layout.tsx` description "Order online for pickup or delivery" |
| **Delivery** | Mentioned in the meta description only. No delivery-partner link is rendered (Uber Eats / DoorDash are unreferenced). |
| **Catering** | Full section; enquiry handled off-site at `SITE.cateringUrl`. No form in this repo. |
| **Reservations** | Explicitly **not** offered (`acceptsReservations: false`). |

### Offers / promotions

| Offer | Where | Notes |
|---|---|---|
| "Weekend Special" | `WeekendSpecialModal.tsx` | Features **Chicken Dum Biryani**. Comment at lines 8–11 states there is **no real discount** — no strikethrough price is shown; it reflects the genuine Fri–Sun longer trading window only. |
| VIP welcome gifts | `lib/vip/gifts.ts` | 10% off (weight 40) · Free Mango Lassi (25) · Free Gulab Jamun (25) · $5 off over $30 (10). ⚠️ `app/vip/page.tsx:59` marks these **"Placeholder prizes pending owner sign-off (Girish, 2026-09-14)"**. |

There are **no other discounts, coupon codes or branch-specific promotions** in
the repository.

---

## 5. Brand Assets — Aspley

**171 asset files** under `public/`. **133 referenced, 38 unreferenced.**

### Core brand assets

| Asset | Path | Type | Used on | Component | Purpose | Branch |
|---|---|---|---|---|---|---|
| Primary logo | `public/images/logo.png` | PNG | Landing, `/vip` | `Navbar.tsx:38,80`; `app/vip/page.tsx:22` | Header mark (both bars) and VIP page hero | **Aspley** — the artwork carries an "ASPLEY" ribbon |
| Logo source file | `public/images/logo-source-dh-star.png` | PNG | — | — | Working/source variant | ⚠️ **unreferenced** |
| Poster logo | `design/vip-poster/logo.png` | PNG | Poster PDF | `build-poster.mjs` | Print asset, not served to the web | Build tooling |
| Poster QR | `design/vip-poster/qr.png` | PNG | Poster PDF | `build-poster.mjs` | Links to `/vip` | Build tooling |
| Favicon | `app/favicon.ico` | ICO | All routes | Next.js convention | Browser tab | Shared |
| OG / hero banner | `public/images/hero-banner.png` | PNG | Social previews | `layout.tsx` via `SITE.ogImage` | Open Graph + JSON-LD image. **Not rendered on-page.** | Shared |

### Photography

| Asset | Path | Type | Used on | Component | Purpose | Branch |
|---|---|---|---|---|---|---|
| Shopfront | `public/images/dosa-hut-aspley.webp` | WebP | Our Story | `OurStory.tsx:43` | The Aspley shopfront at night | **Aspley** (alt text describes Aspley signage) |
| Hero video A | `public/videos/Lark20260910-153613.mp4` | MP4 | Hero | `HeroVideo.tsx:12` | Looping background, clip 1 | Unverified branch |
| Hero video B | `public/videos/Lark20260910-153609.mp4` | MP4 | Hero | `HeroVideo.tsx:16` | Looping background, clip 2 | Unverified branch |
| Catering ×3 | `images/catering-buffet.jpg`, `catering-platter.jpg`, `catering-chafing-spread.jpg` | JPG | Catering | `Catering.tsx:14,21,28` | Bento collage | Unverified branch |
| Masala chai | `public/images/dish-masala-chai.jpg` | JPG | Crowd Pleasers | `FoodShowcase.tsx` (hardcoded) | Chai upsell strip | Shared |
| Chicken Tikka | `public/images/dish-chicken-tikka.jpg` | JPG | Showcase + menu | `lib/site.ts`, `lib/menu.ts` (D1) | Only surviving `dish-*` file in use | Shared |

### Dish photo folders

| Folder | Files | Referenced by | Notes |
|---|---|---|---|
| `images/dishes/` | 35 | `lib/menu.ts`, `lib/site.ts` | Newest set, kebab-case names, individually sourced |
| `images/curry_images/` | 39 | both data files | Original scrape, `Name_NN.jpg` convention |
| `images/dosa_images/` | 19 | both data files | " |
| `images/biryani_images/` | 16 | both data files | " |
| `images/indo_chinese_images/` | 15 | both data files | " |
| `images/tandoor_starters_images/` | 6 | both data files | " |

### Fonts

Self-hosted via Fontsource, imported in `app/layout.tsx:2-12`. No Google Fonts
network request.

| Family | Weights | Tailwind token |
|---|---|---|
| Cormorant Garamond | 500, 600, 700 | `font-display` |
| Nunito | 400–800 | body default |
| Oswald | 500, 600, 700 | `font-heading` |

### Icons

All icons are **inline SVG** in `components/Icons.tsx` (163 lines) — no icon
package. Includes `FacebookIcon`, `InstagramIcon`, `ArrowRightIcon`,
`CloseIcon`, `FlameIcon`, `UtensilsIcon`, `LeafIcon`, `DeviceIcon`.

### Colour tokens

Defined in `app/globals.css` under `@theme inline`:

```
maroon  950 #3d0707 · 900 #570b0b · 800 #6b0f0f · 700 #821414
orange  600 #d94e1d · 500 #f15a27 · peach-400 #f79473
cream     0 #fffdfa ·  50 #fff7f4 · 100 #f9ece4 · 200 #f2ddd0
ink     900 #241512 · 600 #5c4a44
```

### ⚠️ Unreferenced assets (38) — do not delete without checking

**Legacy `dish-*.jpg` set (29 files).** Superseded by the folder-based sets.
Still on disk: `dish-butter-chicken`, `dish-cheese-chilli-dosa`,
`dish-chicken-65-biryani`, `dish-chicken-65`, `dish-chicken-dum-biryani`,
`dish-chicken-madras`, `dish-chicken-tikka-masala`, `dish-chilli-chicken`,
`dish-dal-makhani`, `dish-ghee-plain-dosa`, `dish-goat-curry`,
`dish-goat-karahi`, `dish-gobi-65`, `dish-lamb-dosa`, `dish-lamb-rogan-josh`,
`dish-masala-dosa`, `dish-onion-dosa`, `dish-palak-paneer`,
`dish-paneer-butter-masala`, `dish-paneer-dosa`, `dish-paneer-tikka`,
`dish-paper-dosa`, `dish-plain-dosa`, `dish-rava-lamb-dosa`,
`dish-rava-masala-dosa`, `dish-rava-onion-dosa`, `dish-tandoori-chicken-half`,
`dish-vegetable-dosa`, `dish-vegetarian-dum-biryani`.
(`dish-chicken-tikka.jpg` and `dish-masala-chai.jpg` **are** still in use.)

**Orphaned dish photos in folders (6).** Their dishes are not in either data
file: `biryani_images/Gobi_65_Biryani_-_Family_Pack_17.jpg`,
`biryani_images/Veg_Biryani_-_Family_Pack_15.jpg`,
`biryani_images/Veg_Biryani_-_Jumbo_Pack_16.jpg`,
`curry_images/Aloo_Gobi_Masala_39.jpg`, `curry_images/Chicken_Vindaloo_12.jpg`,
`curry_images/Lamb_Vindaloo_18.jpg`, `indo_chinese_images/Prawn_(I)_65_dry_15.jpg`.

**Other (2).** `images/logo-source-dh-star.png`,
**`menu/DosaHut_Menu-sunshine-coast-9-10-2025.pdf`** ← see §18.

### Duplicate photographs

There are **29 groups of byte-identical files** across `public/images/`
(the same picture saved under several names in different folders). However,
**no two _visible_ dishes share a photograph** in either data file — verified by
content hash. Two dishes were deliberately hidden because their only available
photo belonged to another dish (see §7).

---

## 6. Landing Page

`app/page.tsx` composes ten components in this order. Every section is a
sibling `<section>`; there is no shared page-level layout wrapper beyond
`<main className="flex min-h-screen flex-col">`.

### 6.1 Navbar — `components/Navbar.tsx` (`"use client"`)

| Field | Detail |
|---|---|
| Purpose | Sticky header, menu search entry point, primary order CTA |
| Content | Logo, Search, Home / Menu / Catering, "Aspley" location pin, Order Online |
| Data source | `NAV_LINKS` and `SITE` from `lib/site.ts` |
| Assets | `/images/logo.png` |
| Links | `#top`, `#menu`, `#catering`, `#location`, `SITE.orderUrl` (new tab) |
| Actions | Opens `MenuSearch` overlay; opens mobile drawer |
| Desktop (`lg+`) | Single bar (line 75): logo left; search, nav links, Aspley pin, Order Online right |
| Tablet / mobile (`<lg`) | Separate bar (line 35): logo, hamburger, search, bag. Nav lives in a slide-in drawer (line 141, `aria-label="Site menu"`) |

`NAV_LINKS` deliberately omits a "Location" entry — the Aspley pin already
links to `#location` (comment in `lib/site.ts`).

### 6.2 Hero — `components/Hero.tsx` + `HeroVideo.tsx` (`"use client"`)

| Field | Detail |
|---|---|
| Purpose | Brand impact + primary conversion |
| H1 | "Aspley's Go-To Indian Fine Dining." |
| Tagline | "Quintessential South Indian delicacies, slow-cooked curries & signature Gongura specials — freshly prepared right near Aspley Hypermarket." |
| Background | **Video, not an image** — two MP4 clips, one visible at a time |
| CTAs | **Order Now** → `SITE.orderUrl` · **Weekend Special** → opens modal |
| Layout | One centred layout at every width (comment line 17: "Desktop no longer has a layout of its own") |
| Sizing | `min-h-[35rem]` → `md:min-h-[45rem]`; H1 `text-5xl` → `sm:6xl` → `lg:7xl` → `xl:5xl` |
| Accessibility | Copy block is `pointer-events-none`; only the CTA row re-enables pointer events |

`HeroVideo` decodes only the visible clip (comment line 78) and honours
`prefers-reduced-motion` via `lib/use-prefers-reduced-motion.ts`.

> ⚠️ The H1 is a tagline, not the branch name. **"Dosa Hut Aspley" as a title
> appears only in `Location.tsx:17`** and in `<title>`/JSON-LD — not in the hero.

### 6.3 Trust strip — `components/TrustStrip.tsx`

Static orange band, three claims: "PART OF THE DOSA HUT FAMILY",
"25+ LOCATIONS ACROSS AUSTRALIA", "NOW SERVING ASPLEY". Hardcoded in the
component. Stacks vertically on mobile, single 60px row with dot separators at
`md+`.

### 6.4 Crowd Pleasers (menu showcase) — `components/FoodShowcase.tsx` (`"use client"`)

| Field | Detail |
|---|---|
| Purpose | Browse featured dishes by category |
| Data source | `DISHES` + `DISH_CATEGORIES` from `lib/site.ts`, filtered by active tab **and `!dish.hidden`** |
| Tabs (7) | Dosa · Biryani & More · Tandoori Starters · Vegetarian Curries · Chicken Curries · Indo-Chinese · Goat & Lamb Curry |
| Deep links | Reads `#menu-<slug>` on mount and on `hashchange`, switches tab and scrolls (lines 16–29) |
| Extras | Masala chai upsell strip (hardcoded image + copy); **DOWNLOAD FULL MENU (PDF)** → `SITE.menuPdfUrl` |
| Rendering | Delegates to `DishCarousel` |

**`DishCarousel.tsx`** — a 3-up coverflow: centre card plus peeking neighbours,
prev/next buttons (44×44 touch targets), swipe via `lib/use-swipe.ts`, and a
maroon gradient fallback plate for a dish with no photo. Heights
`260px → sm:300px → md:360px`; card width `68%` → `sm:52%`, max 460px.

### 6.5 Our Story — `components/OurStory.tsx`

Founders (Anil Kumar Karpurapu, Praveen Indukuri), Aspley Hypermarket
proximity, 100+ dishes / 90+ dosas. Stats from `STORY_STATS`: **25+ Branches
Across Australia**, **7M+ Customers Served Yearly**, **2025 Culinary &
Hospitality Award**. Image: the Aspley shopfront, `hover:scale-105`.
Single column on mobile → `md:grid-cols-[0.85fr_1.15fr]`.

### 6.6 Why Aspley Loves Us — `components/WhyUs.tsx`

Four tiles from `FEATURES` in `lib/site.ts`, icons from `Icons.tsx`:
100+ Authentic Dishes · Prime Location (Aspley Hypermarket) · Every Occasion ·
Traditional Recipes. Grid `1 → sm:2 → md:4`.

### 6.7 Craving Finder — `components/FlavorFinder.tsx` (`"use client"`)

| Field | Detail |
|---|---|
| Purpose | Guided dish recommendation |
| Data source | **`VISIBLE_MENU_ITEMS`** from `lib/menu.ts` (112 dishes) |
| Steps | 1 Veg/Non-Veg (`is_veg`) → 2 Spice (`mild`/`medium`/`spicy`) → 3 Craving (13 labels) |
| State | Three nullable `useState` values; `step` is **derived**, never stored |
| Filtering | `is_veg` is absolute and never relaxed. Spice and craving options are pre-filtered so no button can produce an empty screen. |
| Fallback | exact → drop craving → drop spice → diet only, each with an explanatory line. Tiers 2–4 are currently unreachable because of the pre-filtering. |
| Ranking | **None.** Results are a boolean filter in declaration order — no score, no sort, no cap. |
| Results | Horizontal snap-scroll rail at **every** width (`85vw → sm:340px → lg:320px`) |
| Backdrop | Warm 3-stop gradient + radial dot pattern. No glassmorphism. |

### 6.8 Catering — `components/Catering.tsx`

Maroon section with an orange radial glow. Copy: "Indian Cuisine Catering in
Aspley". Three highlights (House Parties & Birthdays, Weddings & Social
Functions, Corporate & Office Events). CTA → `SITE.cateringUrl` (external).
Bento collage: 1 tall + 2 stacked at `sm+`, stacked 208px tiles on mobile.

### 6.9 Location — `components/Location.tsx` + `LocationMap.tsx` (`"use client"`)

| Field | Detail |
|---|---|
| Heading | **"Dosa Hut Aspley"** — the only on-page use of the full branch name |
| Content | Address (`SITE.addressLine1/2`), `tel:` phone, `HOURS` table |
| Map | `LocationMap` — iframe mounted only when near the viewport (IntersectionObserver), `loading="lazy"`, `title="Dosa Hut Aspley location map"`, with loading and failure states |
| Links | `SITE.directionsUrl`, `SITE.phoneHref` |

### 6.10 Footer — `components/Footer.tsx`

Socials (Facebook, Instagram from `SOCIALS`, line 11), Order Online, Catering,
Menu PDF, address, phone, directions, `HOURS`, main site, sitemap.

> **No Privacy Policy link** — `README.md` records that `dosahut.net.au` has no
> privacy page (verified 404), so only the sitemap is linked. See §10.

### 6.11 Weekend Special modal — `components/WeekendSpecialModal.tsx` (`"use client"`)

Triggered from the Hero. Features `DISHES.find(d => d.name === "Chicken Dum
Biryani")`. Escape-to-close, hover-capability detection
(`(hover: hover) and (pointer: fine)`). No discount is displayed — see §4.

---

## 7. Menu

### Two independent datasets — this is the most important thing to know

| | `lib/menu.ts` | `lib/site.ts` |
|---|---|---|
| Export | `MENU_ITEMS` → `VISIBLE_MENU_ITEMS` | `DISHES` |
| Count | **123** total, 11 hidden, **112 visible** | **101** total, 10 hidden, **91 visible** |
| Categories | **12** | **7** (the showcase tabs) |
| Fields | `code`, `name`, `category`, `price`, `is_veg`, `spice_level`, `dietary_tags`, `description`, `image?`, `hidden?` | `category`, `name`, `price`, `diet?`, `spiceLevel?`, `image?`, `alt?`, `hidden?` |
| Consumed by | `FlavorFinder`, `MenuSearch` (`searchMenu()`) | `FoodShowcase`/`DishCarousel`, `WeekendSpecialModal` |

**They overlap on 72 dishes. Prices were cross-checked: 0 mismatches.**
`lib/site.ts` (line ~68) explains the split deliberately — diet and spice live
only in the per-section arrays, because duplicating them "is what caused those
values to drift apart previously".

**Editing rule: a dish that appears in both files must be updated in both.**

### Categories

`lib/menu.ts` (12): Snacks & Street Chaats (17) · Dosa (20) · Dosa & Uttapam (2)
· Tandoori Starters (11) · Vegetarian Curries (10) · Chicken Curries (9) ·
Goat, Lamb & Seafood Curries (7) · Biryani & More (15) · Indo Chinese (15) ·
Noodles & Fried Rice (13) · Omelette (2) · Stuffed Naan (2)

`lib/site.ts` `DISH_CATEGORIES` (7): Dosa (22) · Biryani & More (15) ·
Tandoori Starters (11) · Vegetarian Curries (13) · Chicken Curries (13) ·
Indo-Chinese (15) · Goat & Lamb Curry (12)

⚠️ Naming differs between files: `"Indo Chinese"` vs `"Indo-Chinese"`;
`"Goat, Lamb & Seafood Curries"` vs `"Goat & Lamb Curry"`. Five `menu.ts`
categories have **no showcase tab** (Snacks & Street Chaats, Noodles & Fried
Rice, Omelette, Stuffed Naan, Dosa & Uttapam) — reachable only via search and
the Craving Finder, which `MenuSearch.tsx:8-11` documents as intentional.

### Prices

Hardcoded strings, e.g. `"$8.95"`, `"$21.95"`, and ranged forms like
`"$4.50 (1 Pc) / $6.95 (2 Pc)"`. Range across the menu: **$4.50 – $28.95**.
`README.md` requires reconciling prices against the printed menu before deploy.

### Search — `searchMenu()` in `lib/menu.ts:1414`

Reads `VISIBLE_MENU_ITEMS`. Every term must appear in the haystack
(code + name + category + description + spice + tags). Ranked: exact code +100,
code prefix +60, exact name +80, name prefix +40, name contains +25,
category +15, tag +12, spice +10. Default limit 24.

### The `hidden` mechanism

`hidden?: boolean` exists on **both** types. Consumers filter it out:
`VISIBLE_MENU_ITEMS` (`lib/menu.ts:1406`) for the Craving Finder and search;
`!dish.hidden` in `FoodShowcase.tsx:14-15` for the showcase.

Set on dishes with **no unique photograph** — a gradient placeholder next to
real photos was judged worse than no card. Data is preserved, not deleted;
removing the flag restores the dish.

| Hidden in `lib/menu.ts` (11) | Hidden in `lib/site.ts` (10) |
|---|---|
| A9 Bread Pakora (1 Pc) | Mysore Masala Dosa |
| A10 Aaloo Bonda (2 Pc) | Rava Chicken Dosa |
| F6 Schezwan Paneer (Dry/Gravy) | Prawn Roast Biryani |
| I8 Mysore Masala Dosa | Murgh Malai Reshmi Tikka |
| D6 Murgh Malai Reshmi Tikka | Tandoori Chicken (Full) |
| D8 Tandoori Chicken Full | Mixed Tandoor Platter |
| D10 Mixed Tandoor Platter | Lamb Chop |
| D11 Lamb Chop | Punjabi Butter Chicken |
| E16 Punjabi Butter Chicken | Chicken Makhani |
| H20 Prawn Roast Biryani | Schezwan Paneer |
| I19 Rava Chicken Dosa | |

The lists differ because **Bread Pakora and Aaloo Bonda are not in `DISHES`**,
and **Chicken Makhani is not in `MENU_ITEMS`**. Punjabi Butter Chicken and
Chicken Makhani were hidden for a distinct reason: their only available photo
was byte-identical to Butter Chicken's and Mango Chicken's respectively.

### Menu access points

| Route | Mechanism |
|---|---|
| Showcase carousel | 7 tabs, deep-linkable via `#menu-<slug>` |
| Search overlay | Navbar search icon → `MenuSearch` |
| Craving Finder | 3-step filter |
| Full menu PDF | External link, `SITE.menuPdfUrl` (Aspley PDF on `dosahut.net.au`) |
| Ordering | External, `SITE.orderUrl` |

### ⚠️ Possible branch mismatch — menu PDF

```
Possible branch mismatch:
File:             public/menu/DosaHut_Menu-sunshine-coast-9-10-2025.pdf
Current content:  A menu PDF whose filename states "sunshine-coast"
Expected branch:  Aspley
Reason for concern: This is the Aspley repository. The filename names another
                  branch, and the dated filename (9-10-2025) suggests a
                  superseded document.
Mitigating fact:  The file is UNREFERENCED. Nothing in the codebase links to
                  it. SITE.menuPdfUrl points to an external Aspley PDF
                  (NIC_Dosa-Hut-menuASPLEY-8-10-25.pdf), so no customer is
                  served the Sunshine Coast file.
Action taken:     None. Documented only, not deleted.
```

**No Sunshine Coast dishes, prices or categories were found in `lib/menu.ts` or
`lib/site.ts`.** The menu data itself is Aspley-consistent.

---

## 8. VIP Club

**VIP Club exists.** It is the only part of the site with a backend.

| Aspect | Detail |
|---|---|
| Route | `/vip` |
| Page | `app/vip/page.tsx` (server component, own `metadata`) |
| Components | `components/vip/VipJoinFlow.tsx` (309 lines, `"use client"`), `VipBenefits.tsx`, `ScratchCard.tsx` |
| Entry point | In-store poster QR (`design/vip-poster/`). **Not linked from the landing page navigation or footer.** |
| Branch constant | `BRANCH = "aspley"` in `lib/vip/schema.ts:14`; DB columns default to `'aspley'` |

### Form — state machine in `VipJoinFlow.tsx`

Steps: `phone` → `details` → `otp` → `card` (or `returning`).

| Step | Fields | Validation |
|---|---|---|
| `phone` | Mobile (`type="tel"`, `required`) | AU mobile normalisation in `lib/vip/mobile.ts`; server re-validates |
| `details` | Name (`required`), Mobile (`type="tel"`), Email (`type="email"`, `required`) | Server checks name non-empty and email presence |
| `otp` | 6-digit code (`required`) | Server checks hash, expiry, attempt count (`lib/vip/otp.ts`) |
| `card` | — | `ScratchCard` canvas reveal |
| `returning` | — | Shows name + visit count for an existing member |

Client state also tracks `sentTo` (masked destination), `channel`, `devCode`
(non-production only), `reward`, `welcomeBack`, `error`, `busy`.

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/check-phone` | POST | Returns `{ isExisting, phone, phoneMasked }` |
| `/api/auth/send-otp` | POST | Generates + delivers a code; 400 on bad input, 409 on conflict |
| `/api/auth/verify-otp` | POST | Verifies, creates/updates member, issues session via `createSession()` |
| `/api/vip/scratch-card` | GET / POST | GET reward state, POST claim. **401 without a session** |

### Data flow

```
User (/vip)
  → VipJoinFlow (client)
  → POST /api/auth/check-phone         → repo.ts → Drizzle → Postgres/PGlite
  → POST /api/auth/send-otp            → otp.ts (hash + store)
                                       → resend-otp.ts  (email, LIVE)
                                       → wati.ts        (WhatsApp, PAUSED → queues a row)
  → POST /api/auth/verify-otp          → session.ts (signed cookie)
                                       → repo.registerOrReturn / touchBranchVisit
  → GET/POST /api/vip/scratch-card     → gifts.ts weighted draw → vip_rewards
  → Response
  → ScratchCard reveal / returning-member panel
```

### Database

`lib/vip/db.ts` selects the driver by env: **`DATABASE_URL` set** → `postgres-js`
against **Neon PostgreSQL (AWS Sydney)**; **unset** → **PGlite** (Postgres
compiled to WASM) in `.pglite/`. Switching is an env var, not a code change.

Tables (`lib/vip/schema.ts`): `vip_members`, `vip_rewards`, `vip_branch_visits`,
`vip_wa_logs`, `vip_otp_codes`. Migrations: `npm run vip:migrate`; seed:
`npm run vip:seed`; SQL in `scripts/neon-migration.sql` and
`scripts/vip-club-create-tables.sql`.

### Delivery channels

| Channel | Status | File |
|---|---|---|
| **Email (Resend)** | **Live**, the working channel | `lib/vip/resend-otp.ts` |
| **WhatsApp (WATI)** | **PAUSED** — business WhatsApp profile not active. Sends nothing; writes a `queued` row into `vip_wa_logs` so there is a backlog to flush later. | `lib/vip/wati.ts` |

`app/api/auth/send-otp/route.ts:8` records this as temporary: "using email OTP
via Resend until WhatsApp Business Profile + WATI are approved."

### Success / error states

- **Success:** `card` step with the scratch reveal, or `returning` with name and
  visit count.
- **Error:** a single `error` string rendered at `VipJoinFlow.tsx:123`, set from
  the API's `message`/`error`, falling back to "Something went wrong."
- **Mobile:** the page is mobile-first (`max-w-md` throughout, `min-h-dvh`) —
  it is designed for a phone that just scanned a poster.

---

## 9. Terms & Conditions

**There is no Terms & Conditions route, page or component in this repository.**

| Checked | Result |
|---|---|
| `app/**/page.tsx` | Only `app/page.tsx` and `app/vip/page.tsx` |
| Footer links | Order Online, Catering, Menu PDF, directions, main site, sitemap — no Terms |
| Navigation | `NAV_LINKS` = Home, Menu, Catering — no Terms |

**Cross-branch note:** a sibling repository on this machine
(`~/Desktop/dosa-hut`, remote `Girishkumar-16/dosahut`) does contain
`app/vip/terms/page.tsx`. That is **a different repository and a different
remote** — it is not part of Aspley. Do not copy from it without explicit
instruction.

Given the VIP Club collects name, phone and email and issues promotional
rewards, the absence of Terms is worth raising with the business owner.

---

## 10. Privacy Policy

**There is no Privacy Policy route, page or component in this repository.**

This is a **documented, deliberate** omission. `README.md` (Known trade-offs):

> The footer has no Privacy link because `dosahut.net.au` has no privacy policy
> page (verified 404). Sitemap points at the real `dosahut.net.au/sitemap.html`.

**Privacy-relevant functionality that exists anyway:**

| Behaviour | File |
|---|---|
| Collects name, phone, email | `VipJoinFlow.tsx` → `vip_members` |
| Stores OTP codes hashed, with expiry and attempt limits | `lib/vip/otp.ts` |
| Sets a signed session cookie | `lib/vip/session.ts` (`VIP_SESSION_SECRET`) |
| Masks phone numbers in responses and logs | `lib/vip/mobile.ts` (`maskMobile`) |
| Never logs a live OTP in production | `lib/vip/wati.ts:38` |
| Records marketing-channel consent | `channel` state; `vip_wa_logs` |

No analytics, tag manager, pixel or third-party tracker is present — so there is
no cookie-consent requirement from tracking.

---

## 11. Navigation & Routes

```
/                                   Landing page — app/page.tsx
│   #top          Hero
│   #menu         Crowd Pleasers      (deep-linkable: #menu-dosa, #menu-biryani-&-more, …)
│   #our-story    Our Story
│   #why-us       Why Aspley Loves Us
│   #craving-finder  Craving Finder
│   #catering     Catering
│   #location     Location
│
├── /vip                            VIP Club — app/vip/page.tsx
│
└── /api
    ├── /auth/check-phone           POST
    ├── /auth/send-otp              POST
    ├── /auth/verify-otp            POST
    └── /vip/scratch-card           GET, POST

(no /menu, /terms, /privacy, /about, /contact route exists)
```

| Route | File | Purpose | How users reach it | Dependencies |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Everything customer-facing | Direct, search, social | 10 components, `lib/site.ts`, `lib/menu.ts` |
| `/vip` | `app/vip/page.tsx` | VIP sign-up | **Poster QR only** — not linked in-site | VIP components, 4 API routes, DB |
| `/api/auth/*` | `app/api/auth/*/route.ts` | Registration + OTP | `fetch` from `VipJoinFlow` | `lib/vip/*`, DB, Resend |
| `/api/vip/scratch-card` | `app/api/vip/scratch-card/route.ts` | Reward state / claim | `fetch` from `VipJoinFlow` | Session cookie, DB, `gifts.ts` |

`categorySlug()` in `lib/site.ts` generates the `#menu-<slug>` anchors
(lowercase, spaces → hyphens).

---

## 12. Component Architecture

```
app/layout.tsx                    fonts · metadata · Restaurant JSON-LD
│
├── app/page.tsx  (/)
│   ├── Navbar ............................ "use client"
│   │   ├── MenuSearch .................... "use client"  (overlay)
│   │   │   └── DishCard ⭐
│   │   └── Icons
│   ├── Hero .............................. "use client"
│   │   ├── HeroVideo ..................... "use client"
│   │   │   └── use-prefers-reduced-motion
│   │   ├── WeekendSpecialModal ........... "use client"
│   │   └── Icons
│   ├── TrustStrip ........................ static
│   ├── FoodShowcase ...................... "use client"
│   │   ├── DishCarousel .................. "use client"
│   │   │   └── use-swipe
│   │   ├── Button ⭐
│   │   └── PrimaryGlowButton ⭐
│   ├── OurStory .......................... static
│   ├── WhyUs ............................. static
│   │   └── Icons
│   ├── FlavorFinder ...................... "use client"
│   │   └── DishCard ⭐
│   ├── Catering .......................... static
│   │   └── PrimaryGlowButton ⭐
│   ├── Location .......................... static
│   │   └── LocationMap ................... "use client"
│   └── Footer ............................ static
│       └── Icons
│
└── app/vip/page.tsx  (/vip)
    ├── VipJoinFlow ....................... "use client"
    │   └── ScratchCard ................... "use client"
    └── VipBenefits ....................... static
```

⭐ = reused in more than one place. **Change these carefully.**

| Shared component | Used by | Props |
|---|---|---|
| `DishCard` | `MenuSearch`, `FlavorFinder` | `{ item: MenuItem }` |
| `Button` | `FoodShowcase` | `href`, `variant`, `size`, `external` |
| `PrimaryGlowButton` | `FoodShowcase`, `Catering` | `href`, `full`, `className` |
| `Icons` | Navbar, Hero, WhyUs, Footer, Catering, DishCard, MenuSearch | `size`, `color` |

**Page-specific:** `Hero`, `HeroVideo`, `TrustStrip`, `OurStory`, `WhyUs`,
`Catering`, `Location`, `LocationMap`, `Footer`, `WeekendSpecialModal`,
`FoodShowcase`, `DishCarousel`, `FlavorFinder`, `MenuSearch` (landing);
`VipJoinFlow`, `VipBenefits`, `ScratchCard` (VIP).

**Notable prop flows:** `FoodShowcase` → `DishCarousel` receives
`{ dishes, orderUrl }`; `DishCard` reads `SITE.orderUrl` itself rather than
taking it as a prop.

**No global state.** No Context, Redux, Zustand or SWR/React Query. All state is
local `useState` in the component that owns it.

---

## 13. Data Flow

### Landing page — fully static, no runtime data fetching

```
Build time
  lib/site.ts   (SITE, HOURS, DISHES, DISH_CATEGORIES, STORY_STATS, FEATURES)
  lib/menu.ts   (MENU_ITEMS → VISIBLE_MENU_ITEMS, searchMenu)
        ↓ imported directly
  Components (bundled into the client where "use client")
        ↓
  UI
```

**Everything on the landing page is hardcoded in TypeScript.** There is no API,
no CMS, no database and no fetch call. Updating a price, an address or an image
means editing `lib/site.ts` or `lib/menu.ts` and redeploying.

The whole 123-item `MENU_ITEMS` array ships to the browser, because
`FlavorFinder` and `MenuSearch` are client components. Fine at this size; worth
watching if the menu grows.

### VIP page — real backend

```
User → VipJoinFlow (client)
     → fetch POST /api/auth/*        (Next.js route handler)
     → lib/vip/repo.ts               (data access)
     → lib/vip/db.ts                 (Drizzle)
     → Neon PostgreSQL  ── or ──  PGlite (.pglite/)
     ↕
     → lib/vip/resend-otp.ts → Resend HTTP API   (email, live)
     → lib/vip/wati.ts       → (paused; writes vip_wa_logs only)
     → Response JSON
     → UI state → ScratchCard / returning panel
```

---

## 14. External Integrations

| Service | Purpose | File | Component | How it works |
|---|---|---|---|---|
| **Ordering platform** (`aspley.dosahut.net.au`) | All online ordering | `lib/site.ts` → `SITE.orderUrl` | Hero, Navbar, FoodShowcase, DishCard, WeekendSpecialModal, Location, Footer | Plain `<a target="_blank" rel="noopener noreferrer">`. No cart or payment here. |
| **Google Maps Embed** | Show the branch | `lib/site.ts` → `SITE.mapEmbedUrl` | `LocationMap.tsx:69` | `<iframe>` mounted only when near the viewport, `loading="lazy"`, titled, with loading + failure states. No API key. |
| **Google Maps Directions** | Turn-by-turn | `SITE.directionsUrl` | `Location.tsx`, `Footer.tsx:105` | `maps/dir/?api=1&destination=<lat>,<lng>` — coordinates avoid the shortener redirect hop |
| **Google Maps Place** | Structured data | `SITE.placeUrl` | `layout.tsx` JSON-LD `hasMap` | Full place URL |
| **Instagram** | Social | `SITE.instagramUrl` | `Footer.tsx:13`, JSON-LD `sameAs` | Link |
| **Facebook** | Social | `SITE.facebookUrl` | `Footer.tsx:12`, JSON-LD `sameAs` | Link |
| **dosahut.net.au** | Brand site, menu PDF, catering, sitemap | `SITE.mainSiteUrl`, `menuPdfUrl`, `cateringUrl`, `sitemapUrl` | Footer, FoodShowcase, Catering | External links / external PDF |
| **Resend** | Transactional email (OTP) | `lib/vip/resend-otp.ts` | VIP flow | `fetch` to the Resend HTTP API; `RESEND_API_KEY`, `RESEND_FROM` |
| **WATI (WhatsApp Business)** | OTP over WhatsApp | `lib/vip/wati.ts` | VIP flow | **PAUSED** — sends nothing, queues a `vip_wa_logs` row |
| **Neon PostgreSQL** | VIP database (AWS Sydney) | `lib/vip/db.ts` | VIP APIs | `postgres-js` + Drizzle when `DATABASE_URL` is set |
| **PGlite** | Local database | `lib/vip/db.ts` | VIP APIs | Postgres→WASM in `.pglite/` when `DATABASE_URL` is unset |
| **Schema.org** | SEO structured data | `app/layout.tsx:74-106` | Root layout | `Restaurant` JSON-LD in `<head>` |
| **Vercel** | Hosting (per README) | — | — | ⚠️ unverified from the repo — see §15 |

**Not present:** Google Analytics, GTM, Meta Pixel, Hotjar, Sentry, Stripe or
any payment SDK, any CMS, any booking system, any customer-facing WhatsApp
(`wa.me`) link.

---

## 15. Configuration & Environment

> **Never put real secret values in this file or any committed file.**
> Only names and purposes are documented below.

### Environment variables

| Name | Purpose | Referenced in |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for `metadataBase`, canonical tag, OG URLs, JSON-LD. Falls back to `https://aspley.dosahut.net.au`. | `lib/site.ts` → `SITE.siteUrl` |
| `DATABASE_URL` | Neon Postgres connection. **Unset ⇒ PGlite.** | `lib/vip/db.ts` |
| `PGLITE_DIR` | Override the local PGlite directory | `lib/vip/db.ts` |
| `VIP_SESSION_SECRET` | Signs the VIP session cookie | `lib/vip/session.ts` |
| `RESEND_API_KEY` | Resend API credential | `lib/vip/resend-otp.ts` |
| `RESEND_FROM` | Verified sender identity for OTP email | `lib/vip/resend-otp.ts` |
| `NODE_ENV` | Gates dev-only OTP logging | `lib/vip/wati.ts`, route handlers |
| `WATI_API_ENDPOINT` | WATI endpoint | `.env.example` only — **not read by any code** (WATI is paused) |
| `WATI_BEARER_TOKEN` | WATI credential | `.env.example` only |
| `WATI_TEMPLATE_NAME` | WATI template | `.env.example` only |
| `WATI_TEMPLATE_PARAM` | WATI template parameter | `.env.example` only |

### Files

| File | Status |
|---|---|
| `.env.example` | Present with extensive commentary. ⚠️ **Gitignored** by the `.env*` rule in `.gitignore:34`, so it is **not checked in** — a new developer cloning the repo will not receive it. |
| `.env.local` | Real local values. Gitignored (correct). |
| `next.config.ts` | Empty config object — all Next.js defaults. |
| `postcss.config.mjs` | `@tailwindcss/postcss` only. |
| `eslint.config.mjs` | Flat config extending `eslint-config-next`. |
| `tsconfig.json` | Path alias `@/*` → repo root. |

### Build & deployment

```bash
npm run dev        # next dev (Turbopack)
npm run build      # next build
npm run start      # next start
npm run lint       # eslint
npm run vip:migrate
npm run vip:seed
```

`README.md` documents Vercel with a pre-deploy checklist: set
`NEXT_PUBLIC_SITE_URL`; verify at 375px / 768px / 1280px and on a real iPhone
(video autoplay cannot be confirmed otherwise); reconcile prices against the
printed menu.

> ⚠️ **Deployment could not be confirmed from the repository.** There is no
> `.vercel/` directory, no `vercel.json`, and no linked project. At the time of
> writing `https://dosahut-aspley.vercel.app/` returned **404**, and
> `https://aspley.dosahut.net.au/` returns 200 but serves the **third-party
> ordering platform** (`server: openresty`, no `_next` assets), not this app.

---

## 16. Hard-Coded Business Information

Most business data lives in `lib/site.ts`. These are the places it does **not**:

| Information | Value | File / line | Note |
|---|---|---|---|
| Page title | "Dosa Hut Aspley \| Fine Dining & Authentic Indian Restaurant" | `app/layout.tsx:16` | |
| Meta description | Includes the **full Aspley address** | `app/layout.tsx:17-18` | **Duplicates** `SITE.addressLine1/2` |
| Phone (JSON-LD) | `+61466977674` | `app/layout.tsx:81` | **Duplicates** `SITE.phoneHref` — update both |
| Suburb / region / postcode | `Aspley` / `QLD` / `4034` | `app/layout.tsx:87-89` | Not derived from `SITE` |
| Opening hours (schema) | 4 `OpeningHoursSpecification` blocks | `app/layout.tsx:47-72` | **Duplicates** `HOURS`; lines 45-46 warn to keep them in step |
| Price range / cuisines | `$$`; Indian, South Indian, Indo-Chinese | `app/layout.tsx:82-83` | |
| Trust-strip claims | "25+ LOCATIONS ACROSS AUSTRALIA", "NOW SERVING ASPLEY" | `components/TrustStrip.tsx:1-5` | |
| Story copy + founders | Anil Kumar Karpurapu, Praveen Indukuri; "near Aspley Hypermarket" | `components/OurStory.tsx:16-25` | |
| Hero tagline | "…right near Aspley Hypermarket." | `components/Hero.tsx:28-32` | |
| Catering copy + 3 highlights | "Indian Cuisine Catering in Aspley" | `components/Catering.tsx:6-10, 52-59` | |
| Chai upsell copy + image | `/images/dish-masala-chai.jpg` | `components/FoodShowcase.tsx` | Image path hardcoded, not from a data file |
| Shopfront image path | `/images/dosa-hut-aspley.webp` | `components/OurStory.tsx:43` | |
| Catering image paths | 3 paths | `components/Catering.tsx:14,21,28` | |
| Hero video paths | 2 MP4 paths | `components/HeroVideo.tsx:12,16` | |
| Logo path | `/images/logo.png` | `Navbar.tsx:38,80`; `app/vip/page.tsx:22` | |
| Weekend Special dish | `"Chicken Dum Biryani"` matched **by name string** | `WeekendSpecialModal.tsx:12` | Non-null asserted (`!`) — renaming that dish in `DISHES` will crash this component |
| Stats | 25+ / 7M+ / 2025 award | `lib/site.ts` → `STORY_STATS` | |
| Features | 4 tiles incl. "Steps away from Aspley Hypermarket" | `lib/site.ts` → `FEATURES` | |
| VIP reward copy | "Valid on dine-in and takeaway at Dosa Hut Aspley" | `lib/vip/gifts.ts:25` | |
| Branch constant | `"aspley"` | `lib/vip/schema.ts:14` + DB column defaults | |
| All dish names / prices / descriptions | 123 + 101 entries | `lib/menu.ts`, `lib/site.ts` | |

---

## 17. Branch Separation Rules

> ### **Aspley information must not be mixed with Sunshine Coast or any other Dosa Hut branch information.**

Before changing anything customer-facing, confirm it belongs to Aspley.

### Classification of what is in this repository

| Classification | Items |
|---|---|
| **Confirmed Aspley** | `SITE.name`, `addressLine1/2`, `addressFull`, `phoneDisplay`/`phoneHref`, `lat`/`lng`, `placeUrl`, `directionsUrl`, `mapEmbedUrl`, `orderUrl` (`aspley.dosahut.net.au`), `menuPdfUrl` (`…menuASPLEY-8-10-25.pdf`), `cateringUrl` (`…indian-catering-aspley/`), `instagramUrl` (`dosahutaspley`), `facebookUrl` (`DosaHutAspley`), `uberEatsUrl` / `doorDashUrl` (both slugs say `dosa-hut-aspley`), `HOURS`, `layout.tsx` title/description/JSON-LD, `images/logo.png` (ASPLEY ribbon), `images/dosa-hut-aspley.webp`, `lib/vip/schema.ts` `BRANCH = "aspley"` and DB defaults, VIP reward copy, Aspley Hypermarket references |
| **Shared brand (all branches)** | `mainSiteUrl`, `sitemapUrl`, Dosa Hut logo wordmark, fonts, colour tokens, `STORY_STATS` (group-wide: 25+ branches, 7M+ customers), founders' names, "PART OF THE DOSA HUT FAMILY" |
| **Other branch — present** | `public/menu/DosaHut_Menu-sunshine-coast-9-10-2025.pdf` (unreferenced) · `.env.example:41` commented example sender `noreply@dosahutsunshinecoast.net.au` |
| **Unknown / unverifiable** | Both hero videos · all three catering photos · every dish photograph. Nothing in the repo records which branch's kitchen or premises they were shot at. The scraped folders (`curry_images/`, `dosa_images/`, …) have no branch provenance recorded anywhere. |

### Cross-repository hazard

A **different repository** exists on this machine at `~/Desktop/dosa-hut`
(remote `Girishkumar-16/dosahut`) that looks similar and serves on a different
port. It is **not** this project. Do not copy files, assets or data between
them without explicit instruction. Confirm you are in
`~/Desktop/Aspley` (remote `maheswar-rao/dosahut-aspley`) before editing.

### Practical rules

1. Any new URL must contain `aspley` (or be a confirmed brand-wide URL) before
   it goes into `SITE`.
2. Any new PDF must be the Aspley menu. Check the filename.
3. Any new photo of premises, signage or staff must be confirmed as Aspley.
   Generic food photography is acceptable brand-wide.
4. `BRANCH` in `lib/vip/schema.ts` and the `first_branch` / `home_branch` /
   `last_branch` DB defaults must stay `"aspley"`.
5. If provenance cannot be confirmed, say so — do not guess.

---

## 18. Duplicate / Conflicting Information

```
Issue:              Sunshine Coast menu PDF in the Aspley repository
File:               public/menu/DosaHut_Menu-sunshine-coast-9-10-2025.pdf
Value A:            Local PDF filename names the Sunshine Coast branch, dated 9-10-2025
Value B:            SITE.menuPdfUrl → external NIC_Dosa-Hut-menuASPLEY-8-10-25.pdf
Possible reason:    Leftover from a shared or forked codebase
Needs verification: Whether the file should be deleted or replaced with the Aspley PDF
Impact:             None currently — the file is unreferenced; customers get the Aspley PDF
```

```
Issue:              Sunshine Coast sender domain in the env example
File:               .env.example:41 (commented line)
Value A:            RESEND_FROM="Dosa Hut VIP <noreply@dosahutsunshinecoast.net.au>"
Value B:            No Aspley sender domain is proposed anywhere
Possible reason:    Copied from the Sunshine Coast project's env template
Needs verification: What the correct Aspley sender domain should be
Impact:             Commented out and gitignored. The file's own comments note the
                    domain is "not_started" in Resend and that the only verified
                    domains on the account are chilliindia.com.au (wrong brand) and
                    zenithitservices.com.au (the agency).
```

```
Issue:              Phone number stored in two places
File:               lib/site.ts (SITE.phoneHref "tel:+61466977674")
                    app/layout.tsx:81 (telephone "+61466977674")
Value A / B:        Currently identical
Possible reason:    JSON-LD written without importing from SITE
Needs verification: No — they agree today
Impact:             A future change to one will silently desync the other
```

```
Issue:              Opening hours stored in two shapes
File:               lib/site.ts (HOURS, display strings)
                    app/layout.tsx:47-72 (OPENING_HOURS, schema.org)
Value A / B:        Currently consistent
Possible reason:    Two required formats
Needs verification: No — layout.tsx:45-46 already flags the coupling
Impact:             Must be edited together
```

```
Issue:              Two menu datasets for the same restaurant
File:               lib/menu.ts (MENU_ITEMS, 123) / lib/site.ts (DISHES, 101)
Value A / B:        72 dishes overlap. Prices cross-checked: 0 mismatches.
Possible reason:    Deliberate — documented in lib/site.ts
Needs verification: No
Impact:             A dish in both files must be updated in both
```

```
Issue:              Category names differ between the two datasets
File:               lib/menu.ts / lib/site.ts
Value A:            "Indo Chinese"                   / "Goat, Lamb & Seafood Curries"
Value B:            "Indo-Chinese"                   / "Goat & Lamb Curry"
Possible reason:    Independently authored
Needs verification: Whether they should be unified
Impact:             Cosmetic today; a naive join across the two files would fail
```

```
Issue:              29 groups of byte-identical image files
File:               throughout public/images/
Possible reason:    Same photo saved under several names across scraped folders
Needs verification: Which copy is canonical before any cleanup
Impact:             Wasted repository size. No two VISIBLE dishes share a photo —
                    verified by content hash.
```

```
Issue:              Package name does not match the project
File:               package.json → "name": "dosa-hut"
Possible reason:    Inherited from the shared codebase
Needs verification: Low priority, cosmetic
```

**Not found:** conflicting Aspley addresses, conflicting phone numbers,
conflicting hours, old branch names in customer-facing copy, or Sunshine Coast
dishes/prices in either menu dataset.

---

## 19. Current Implementation Status

### Complete and working

- Landing page, all ten sections
- `/vip` sign-up: phone check → details → OTP (email) → scratch card → returning member
- Menu search (112 dishes, ranked)
- Craving Finder (3-step, with fallback ladder)
- Showcase carousel with 7 tabs and `#menu-<slug>` deep links
- Lazy Google Maps embed with loading and failure states
- SEO: metadata, canonical, Open Graph, `Restaurant` JSON-LD
- `tsc --noEmit`, `eslint .` and `npm run build` all pass with zero errors

### Partially implemented / paused

| Item | Status |
|---|---|
| **WhatsApp OTP (WATI)** | **PAUSED.** Business profile not approved. Queues rows in `vip_wa_logs`; email is the live channel. |
| **VIP rewards** | Marked **"Placeholder prizes pending owner sign-off (Girish, 2026-09-14)"** in `app/vip/page.tsx:59`. |
| **`RESEND_FROM` domain** | Not DNS-verified. Falls back to `onboarding@resend.dev`, which only delivers to the account owner. |
| **Dish photography** | 112/123 menu items and 91/101 showcase dishes have photos. 11 and 10 respectively are `hidden` for want of a unique photo. |

### Missing / absent

| Item | Note |
|---|---|
| Terms & Conditions page | None — see §9 |
| Privacy Policy page | None — documented trade-off, see §10 |
| **Uber Eats link** | `SITE.uberEatsUrl` defined, **rendered nowhere**. `README.md` records it as kept "in case the delivery-partner links return." |
| **DoorDash link** | `SITE.doorDashUrl` — same |
| **`SITE.addressFull`** | Defined, **rendered nowhere** |
| **WhatsApp contact link** | No `wa.me` link anywhere. WhatsApp exists only inside the paused VIP OTP channel. Not mentioned in the README — likely a genuine gap. |
| Explicit `viewport` export | Absent from `app/layout.tsx`. Next.js injects the default `width=device-width, initial-scale=1`, so it works but is not explicit. |
| `.env.example` in version control | Gitignored by `.env*` — a fresh clone gets no template |
| Analytics / error monitoring | None |
| Tests | No test framework, no test files |
| CI | No `.github/workflows` |

### Latent issues worth knowing

| Issue | Where | Risk |
|---|---|---|
| Craving Finder matching is **substring** over a flattened haystack | `FlavorFinder.tsx:29-46` | `"egg"` matches `"veggie"`. **Zero false positives today** (verified against the dataset), but a dish named e.g. "Veggie Delight" would silently surface under the Egg craving. |
| "Curry" (45 items) and "Crispy" (48 items) are very broad cravings | `FlavorFinder.tsx:16,26` | With no ranking, those return a long rail |
| Weekend Special matches a dish **by name string**, non-null asserted | `WeekendSpecialModal.tsx:12` | Renaming "Chicken Dum Biryani" in `DISHES` crashes the component |
| Full 123-item dataset ships to the browser | `"use client"` consumers | Acceptable now; watch as the menu grows |
| Fallback tiers 2–4 in the Craving Finder are unreachable | `FlavorFinder.tsx:102-116` | Dead code by design (options are pre-filtered); harmless insurance |
| `I14 Non-Veg Dosa Chef Special` matches the "Paneer" craving | `lib/menu.ts` | Its description mentions paneer alongside chicken and lamb. Arguably correct; the only cross-diet craving leak. |

---

## 20. Responsive Design

Tailwind v4 defaults are in use — **no custom `--breakpoint-*` tokens** are
defined in `app/globals.css`.

| Prefix | Min-width |
|---|---|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |

### Breakpoint-class usage per component

`FoodShowcase` 25 · `Footer` 21 · `Hero` 21 · `Location` 20 · `WhyUs` 20 ·
`OurStory` 19 · `Catering` 17 · `Navbar` 16 · `FlavorFinder` 13 ·
`WeekendSpecialModal` 11 · `Button` 10 · `DishCarousel` 9 · `TrustStrip` 7 ·
`MenuSearch` 6 · `PrimaryGlowButton` 4 · `LocationMap` 3 ·
`DishCard` 0 (fluid — sized by its parent) · `HeroVideo` 0 (absolute fill) ·
`Icons` 0 (props-driven).

### Behaviour by element

| Element | Mobile (<640px) | Tablet (640–1023px) | Desktop (≥1024px) |
|---|---|---|---|
| **Navbar** | Logo, hamburger, search, bag; slide-in drawer | Same mobile bar (switch is at `lg`) | Full bar: logo + search + nav + Aspley pin + Order Online |
| **Hero** | `min-h-35rem`, H1 `text-5xl`, CTAs stacked full-width | `sm:` CTAs go side-by-side, H1 `text-6xl` | `md:min-h-45rem`; H1 `lg:text-7xl` then **`xl:text-5xl`** (deliberately smaller on very wide screens) |
| **Hero video** | Absolute fill, `object-cover`; only the visible clip decodes | Same | Same. README notes 720×1280 source is upscaled on large desktops |
| **Trust strip** | Stacked, centred, no dots | — | `md:` single 60px row with dot separators |
| **Showcase carousel** | 260px tall, card 68% width, swipe | `sm:` 300px, card 52% | `md:` 360px, arrows at `sm:left-3/right-3` |
| **Craving Finder** | Cards `85vw`, horizontal snap rail | `sm:340px` | `lg:320px` — **still a rail, not a grid** (3–4 visible) |
| **Menu search results** | Single column, vertical scroll | Single column | `lg:grid-cols-3`, `xl:grid-cols-4` |
| **Our Story** | Single column, image 320px | `sm:` image 400px | `md:grid-cols-[0.85fr_1.15fr]`, `lg:` image 500px |
| **Why Us** | 1 column | `sm:2` | `md:4` |
| **Catering collage** | Stacked 208px tiles | `sm:` 2×2 bento, 380px | `md:` 450px |
| **Location** | Stacked; map below details | — | Side-by-side |
| **Footer** | Stacked columns | Partial columns | Full multi-column |
| **VIP form** | `max-w-md`, `min-h-dvh` — phone-first by design | Same, centred | Same, centred |

### Cross-cutting rules in `app/globals.css`

- `@media (min-width: 1024px)` — desktop-only refinements (line 77)
- `@media (max-width: 1023px)` — mobile/tablet overrides (line 126)
- `@media (hover: none)` — disables hover-only affordances on touch (line 140)
- `@media (prefers-reduced-motion: reduce)` — suppresses motion (line 173)
- `.scrollbar-none` / `.scrollbar-thin` — Tailwind has no thin-scrollbar utility
- `.category-enter` — the one keyframe animation (showcase tab change)

**Touch targets:** `min-h-[44px]` is applied consistently to buttons, pills,
carousel arrows and CTAs (iOS minimum).

**Images:** every `next/image` carries explicit `sizes`; `DishCard` falls back
to a maroon gradient plate on load error (`onError`) rather than a broken icon.

---

## 21. Development Rules

1. **Preserve Dosa Hut branding.** Colours, fonts and the logo are set; do not
   substitute alternatives.
2. **Do not replace approved brand assets unnecessarily.** `logo.png` and
   `dosa-hut-aspley.webp` are confirmed Aspley assets.
3. **Do not mix Aspley content with Sunshine Coast or another branch.** See
   §17. Verify you are in `~/Desktop/Aspley`, not `~/Desktop/dosa-hut`.
4. **Do not invent business information.** If the repo does not state it, ask.
5. **Do not change address, phone, prices, offers or opening hours without
   verification.** Hours and phone each live in two files — change both.
6. **Reuse existing components.** `DishCard`, `Button`, `PrimaryGlowButton`
   and `Icons` already cover most needs.
7. **Avoid unnecessary dependencies.** There is no UI kit, icon package or
   animation library by choice. Add SVGs to `Icons.tsx`.
8. **Do not expose secrets.** Names only in docs; values only in `.env.local`.
9. **Preserve responsive behaviour.** Verify at 375 / 768 / 1280px. Keep
   `min-h-[44px]` on interactive elements.
10. **Test shared components carefully.** `DishCard` renders in both search and
    the Craving Finder; `Icons` is used by seven components.
11. **Check all links and CTAs after relevant changes.** Every order CTA is an
    external link — a broken `SITE.orderUrl` breaks the site's entire purpose.
12. **Preserve SEO and accessibility.** Keep the JSON-LD in step with `SITE`
    and `HOURS`; keep `alt` text, `aria-label`s and the map `title`.

### Additional project-specific rules

13. **Read `node_modules/next/dist/docs/` before writing Next.js code** —
    `AGENTS.md` warns this version has breaking changes vs. older conventions.
14. **A dish in both `lib/menu.ts` and `lib/site.ts` must be updated in both.**
    72 dishes overlap.
15. **Never give two visible dishes the same photograph.** Check by content hash
    (`md5`), not filename — the download sets contain 29 duplicate groups. If
    the only available photo belongs to another dish, set `hidden: true`.
16. **`alt` text describes the specific photograph.** Replacing an image means
    rewriting its `alt`.
17. **Prefer a new filename over overwriting an image in place.** A new path is
    a new URL, so no browser or Next image cache can serve the stale picture.
18. **Never delete a dish to hide it.** Set `hidden: true` — the record of what
    the kitchen sells stays complete and the change is one line to revert.
19. **Read `VISIBLE_MENU_ITEMS`, never `MENU_ITEMS`, when rendering.**
20. **Keep `BRANCH = "aspley"`** in `lib/vip/schema.ts` and the DB defaults.
21. **Do not un-pause WATI** without confirming the WhatsApp Business profile is
    approved; `lib/vip/wati.ts` documents the switch-back procedure.
22. **VIP rewards need owner sign-off** before being treated as final.

---

## 22. Important Files to Know

| File | Purpose | Why it matters |
|---|---|---|
| **`lib/site.ts`** | `SITE` config, `HOURS`, `DISHES` (101), `DISH_CATEGORIES`, `STORY_STATS`, `FEATURES` | ⭐ **The single most important file.** Nearly all Aspley business information and the showcase menu live here. |
| **`lib/menu.ts`** | `MENU_ITEMS` (123), `VISIBLE_MENU_ITEMS`, `searchMenu()` | ⭐ The full menu behind search and the Craving Finder. The second menu dataset. |
| `app/page.tsx` | Landing page composition | The section order of the whole site, in 25 lines |
| `app/layout.tsx` | Fonts, metadata, `Restaurant` JSON-LD | Only place with SEO structured data; **hardcodes phone, address parts and hours** |
| `app/globals.css` | Tailwind import, `@theme` colour tokens, custom utilities, media queries | The design system |
| `components/Navbar.tsx` | Header, both bars, search trigger | Every page entry point; separate mobile/desktop markup |
| `components/Footer.tsx` | Socials, links, address, hours | Second home of the business info |
| `components/FoodShowcase.tsx` + `DishCarousel.tsx` | Menu browsing | Primary menu experience |
| `components/FlavorFinder.tsx` | Craving Finder | Most complex client logic on the landing page |
| `components/MenuSearch.tsx` + `DishCard.tsx` | Menu search | `DishCard` is shared — changes affect two features |
| `components/Location.tsx` + `LocationMap.tsx` | Address, hours, phone, map | Only on-page use of the full branch name; Google Maps integration |
| `components/Catering.tsx` | Catering pitch | Catering enquiries leave the site here |
| `app/vip/page.tsx` | VIP Club page | The only non-landing route |
| `components/vip/VipJoinFlow.tsx` | 5-step VIP form | The only real form in the project |
| `app/api/auth/*/route.ts` | Registration + OTP | The only backend endpoints |
| `app/api/vip/scratch-card/route.ts` | Reward state / claim | Session-protected (401 without a cookie) |
| `lib/vip/db.ts` | Drizzle driver switch | Neon vs PGlite by env var |
| `lib/vip/schema.ts` | 5 tables, `BRANCH = "aspley"` | Branch identity in the database |
| `lib/vip/wati.ts` | WhatsApp — **PAUSED** | Documents how to switch it back on |
| `lib/vip/gifts.ts` | Weighted `REWARDS` | Placeholder prizes pending sign-off |
| `.env.example` | Env var names + commentary | ⚠️ Gitignored — not in a fresh clone |
| `README.md` | Setup, env, deploy checklist, known trade-offs | Records *why* Uber Eats/DoorDash and the Privacy link are absent |
| `AGENTS.md` | Next.js version warning | Read before writing Next.js code |
| `public/menu/…sunshine-coast….pdf` | Unreferenced PDF | ⚠️ Other-branch artefact — see §18 |

---

## Quick Context for Claude

**This is Dosa Hut → the Aspley branch → a Next.js 16 marketing website.**

**Repository:** `~/Desktop/Aspley`, remote `maheswar-rao/dosahut-aspley`.
⚠️ A different, similar-looking repo exists at `~/Desktop/dosa-hut`
(`Girishkumar-16/dosahut`) — **that is not this project.** Check before editing.

**Pages — only two.** `/` (the landing page, 10 sections, fully static) and
`/vip` (VIP Club sign-up, reached by in-store poster QR, backed by 4 API routes
and Postgres). **No Terms page, no Privacy page, no `/menu` route.**

**Business information lives in `lib/site.ts`** — the `SITE` object plus
`HOURS`. Address: *Shop 6 & 7/46 Gayford Street, Aspley QLD 4034*. Phone:
*0466 977 674*. Ordering: `aspley.dosahut.net.au`. ⚠️ Phone, address parts and
opening hours are **duplicated** in `app/layout.tsx`'s JSON-LD — change both.

**Menu lives in two files.** `lib/menu.ts` (`MENU_ITEMS`, 123 dishes, 12
categories → search + Craving Finder) and `lib/site.ts` (`DISHES`, 101 dishes,
7 tabs → showcase). **72 dishes overlap; edit both.** Dishes without a unique
photo carry `hidden: true` rather than being deleted — render from
`VISIBLE_MENU_ITEMS`, never `MENU_ITEMS`.

**Key assets:** `images/logo.png` (has the ASPLEY ribbon),
`images/dosa-hut-aspley.webp` (the shopfront), two hero MP4s in `public/videos/`,
and ~150 dish photos across `images/dishes/` plus five category folders.
38 assets are unreferenced, including a **Sunshine Coast menu PDF**.

**Shared components to treat carefully:** `DishCard`, `Button`,
`PrimaryGlowButton`, `Icons`.

**External integrations:** the ordering platform, Google Maps (embed +
directions), Instagram, Facebook, `dosahut.net.au` (menu PDF, catering,
sitemap), Resend (live OTP email), WATI (**paused**), Neon/PGlite. **No
analytics, no payment, no CMS.**

**Branch separation is the standing rule.** Aspley content must never be mixed
with Sunshine Coast or any other branch. Known other-branch artefacts: the
unreferenced `public/menu/DosaHut_Menu-sunshine-coast-9-10-2025.pdf` and a
commented `dosahutsunshinecoast.net.au` sender in `.env.example`. Branch
provenance of the hero videos, catering photos and dish photography **cannot be
determined from this repository** — do not assert it.
