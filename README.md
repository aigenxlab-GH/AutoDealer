# Sapphire Auto Hub

A premium, single-dealer **used car & bike digital showroom** with a WhatsApp lead
pipeline. Buyers browse a fast, SEO-friendly catalog; every enquiry is captured as a
first-party lead **before** the customer is handed off to WhatsApp. A protected admin
desk manages inventory and leads.

Built to run **fully on mock data with zero external accounts**, then flip to a real
Supabase + Cloudinary backend with an env change.

## Features

**Public**
- Branded homepage — hero, trust/USP bar, featured listings, testimonials
- Separate **Cars** and **Bikes** catalogs with search, filters (make, price, year, km,
  fuel, transmission) and sort — all driven by shareable URL params
- Vehicle detail page — swipeable gallery, spec table, **EMI calculator**, share,
  shortlist, similar vehicles, sticky mobile "Enquire" bar
- **Hybrid lead flow** — capture Name + Phone → persist a lead → deep-link to WhatsApp
- Shortlist/favourites (localStorage, no login), floating WhatsApp button
- SEO — per-page metadata, Open Graph, JSON-LD (`Car`/`Motorcycle` + `AutoDealer`),
  dynamic `sitemap.xml`, `robots.txt`, ISR

**Admin** (`/admin`)
- Session-gated control desk (mock auth in dev; Supabase Auth-ready)
- Inventory CRUD with a dynamic car/bike form (Engine CC for bikes; Fuel/Transmission
  for cars), media uploader with primary-image selection, featured/sold toggles
- Lead management — search, status (new/contacted/closed), one-click call/WhatsApp,
  CSV export, per-vehicle lead counts

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) ·
Supabase (Postgres) · Cloudinary · Indian locale (₹ lakh/crore, km, +91 WhatsApp).

## Quick start (mock mode — no accounts needed)

```bash
npm install
cp .env.example .env.local   # defaults already work
npm run dev                  # http://localhost:3000
```

- Public site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> · demo login **admin@sapphireautohub.com / admin123**

Everything works against in-memory seed data (`src/lib/data/mock/`).

## Project structure

```
src/
  app/
    (public)/            # public site (shares Header/Footer/FloatingWhatsApp)
      page.tsx           # home
      cars/ bikes/       # catalogs
      [type]/[id]/       # vehicle detail (car|bike)
      shortlist/ about/ contact/
    admin/
      login/             # standalone login (outside the gated shell)
      (dashboard)/       # gated shell: dashboard (inventory), leads
    actions/             # server actions (auth, leads, admin CRUD)
    api/cloudinary-sign/ # signed-upload endpoint
    sitemap.ts robots.ts
  components/            # UI, catalog, enquiry, admin, icons
  lib/
    data/                # repository layer (mock + supabase) ← the swap point
    supabase/  auth.ts  cloudinary.ts  format.ts  emi.ts  whatsapp.ts ...
  proxy.ts               # admin route gate (Next 16 proxy/middleware)
supabase/schema.sql      # run this to provision the real DB
```

The whole app talks to `vehicleRepository` / `leadRepository` from `src/lib/data`. The
active implementation is chosen by `DATA_SOURCE` — no page/component changes needed to
switch backends.

## Going to production

### 1. Supabase (database)
1. Create a project at <https://supabase.com>.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Set env vars and flip the data source:
   ```
   DATA_SOURCE=supabase
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # server-only, never exposed
   ```

### 2. Cloudinary (images)
Add credentials and the admin media uploader switches from inline data-URLs to direct,
signed Cloudinary uploads automatically:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Admin auth
Dev uses a signed-cookie mock gate (`ADMIN_EMAIL` / `ADMIN_PASSWORD` /
`ADMIN_SESSION_SECRET`). For production, set a long random `ADMIN_SESSION_SECRET`, or
swap `src/proxy.ts` + `src/app/actions/auth.ts` for Supabase Auth.

See [`.env.example`](.env.example) for the full reference.

## Deployment

**Vercel (simplest):** import the repo, add the env vars above, deploy. No config needed.

**Cloudflare Pages ($0 target):** use the OpenNext adapter:
```bash
npm i -D @opennextjs/cloudflare wrangler
npx opennextjs-cloudflare build
npx wrangler pages deploy
```
Add the same env vars in the Cloudflare dashboard. The codebase avoids Node-only
lock-in, so it runs on either host.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
