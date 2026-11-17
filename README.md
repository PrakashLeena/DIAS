# Watson Decoration — வட்ஷன் பந்தல் சேவை

<<<<<<< HEAD
Event rental & decoration catalogue (Tamil + English). Customers browse 11 categories, tick items,
and send the whole selection to the owner by WhatsApp or call directly. The owner manages
everything from the Admin Panel — no code changes needed.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 3 · MongoDB + Mongoose · Cloudinary (photo uploads) · Vercel.

## Structure

```
app/(site)/            Public site: home (category grid + reviews), /category/[id]
app/admin/             Admin login + dashboard (single page: categories & items, contact info, reviews)
app/api/reviews        Public "Write a Review" endpoint (rate limited)
app/api/admin/*        content (PUT), reviews (DELETE), upload, auth
components/site/       Header/nav bar, category grid, category view, selection sheet + sticky action bar, reviews
components/admin/      Admin editors (categories, items, sub-categories, photo upload)
lib/default-content.js The 11 categories, items and contact numbers used until the admin saves
lib/contact.js         wa.me / tel: helpers and the WhatsApp message formatter
```

## Run locally

```bash
npm install
cp .env.example .env.local     # MONGODB_URI, NEXTAUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ...
npm run seed:admin             # creates the admin login
npm run seed                   # (optional) stores the default content in MongoDB
npm run dev                    # http://localhost:3000   admin: /admin
```

`npm run seed -- --force` resets categories/items/contact to the defaults (reviews and admins are untouched).
Until something is saved in the Admin Panel the site shows the built-in defaults from `lib/default-content.js`.

## Admin Panel (/admin)

- **Categories & Items** — add / rename (Tamil + English) / reorder / delete categories, change button photo and emoji,
  upload / replace / delete item photos, edit item names, sizes, group headings, quantity presets (e.g. 100, 150 …) or a
  1–18 count dropdown, sub-categories (Cooking Vessels) and the note / contact notice of each category.
  Press **Save** to publish.
- **Contact Info** — business name, WhatsApp number (orders go here) and up to 4 "Call" numbers.
- **Reviews** — delete unwanted customer reviews.

## Photos

Production needs `IMAGE_STORAGE_CONFIGURATION=cloudinary://<key>:<secret>@<cloud>` (see `.env.example`).
Without it uploads are stored in `public/uploads` (local development only).
=======
Bilingual (Tamil default, English) event decoration & tent rental platform:
individual product rentals, predefined event packages, a custom package builder,
guest checkout with Order IDs, public order tracking, and a secure admin dashboard.

**Stack:** Next.js 16 (App Router, JavaScript) · React 19 · Tailwind CSS 3 · MongoDB Atlas + Mongoose 9 ·
React Hook Form + Zod 4 · Lucide icons · Framer Motion (one small reveal component) · Cloudinary for uploads · Vercel.

---

## 1. Project structure

```
app/
  [lang]/                 Public site. Tamil = "/", English = "/en" (rewritten by proxy.js)
    page.js               Home — Stage Décor design (interactive stage hero, packages, estimator, gallery, testimonials, booking)
    products/ [slug]/     Product list (search, category, price filter, pagination) + details
    categories/ [slug]/   Category list + category pages
    packages/ [slug]/     Package list + details (Book now / Customize this package)
    custom-package/       Custom Package Builder
    checkout/ order-confirmation/ track-order/
    gallery/ about/ contact/ privacy-policy/ terms/
  admin/
    login/                Admin login (no public registration)
    (panel)/              Dashboard, orders, customers, products, categories, packages, inventory, settings, SEO
  api/
    orders/ orders/track/ quote/        Public APIs (rate limited, validated)
    admin/**                            Admin APIs (session + same-origin checks)
  sitemap.js robots.js
components/   ui, layout, home, products, packages, builder, cart, checkout, tracking, gallery, admin, seo
contexts/     LangContext (language + dictionary), CartContext (guest basket in localStorage), AdminContext
hooks/        useMoney
lib/          db, auth (JWT), admin-session, api helpers, rate-limit, validators (Zod), inventory,
              order-builder (server-side pricing), order-id, seo, storage (Cloudinary), i18n/
models/       Admin, Category, Product, Package, Order, WebsiteSettings, RateLimit
services/     catalog.js (public reads), admin.js (admin reads)
utils/        format, slug, serialize
scripts/      seed.js, create-admin.js
public/       images/ (optimised client photos), videos/hero.mp4, icon.svg
styles/       globals.css (design tokens from the Stage Décor design system)
```

## 2. Local development

Requirements: Node.js 20.9+ (22 recommended), a MongoDB database (local `mongod` or Atlas).

```bash
npm install
cp .env.example .env.local      # then fill in the values (see section 4)
npm run seed                    # sample categories, products, packages, settings
npm run seed:admin              # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev                     # http://localhost:3000  (admin: /admin)
```

- `npm run seed -- --force` replaces catalogue + settings (never touches orders or admins).
- `npm run seed:admin -- --reset` resets the admin password to `ADMIN_PASSWORD`.
- `npm run optimize:photos` re-generates `/public/images/*` (WebP, max 1600px) from the raw `/photos` folder.

## 3. MongoDB Atlas setup

1. Create a free/shared cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user with a strong password (role: *Read and write to any database*).
3. **Network Access** → add `0.0.0.0/0` (required for Vercel's dynamic IPs) — the strong user password protects access.
4. **Connect → Drivers** → copy the connection string, add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/watson-decoration?retryWrites=true&w=majority`
5. Put it in `MONGODB_URI`. Run `npm run seed` once against Atlas — it also builds all indexes
   (order ID, categories, status, event dates, inventory lookups, TTL for rate limits).

## 4. Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only read by `npm run seed:admin`. Remove `ADMIN_PASSWORD` from Vercel after the admin is created. |
| `NEXTAUTH_SECRET` | ≥32 random chars; signs admin session tokens. `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` |
| `NEXT_PUBLIC_SITE_URL` | Public URL, no trailing slash (canonical URLs, sitemap, Open Graph) |
| `IMAGE_STORAGE_CONFIGURATION` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` (Cloudinary dashboard → "API environment variable") |

Secrets are only read on the server. Nothing sensitive uses the `NEXT_PUBLIC_` prefix.

## 5. Admin account initialisation

There is **no public registration**. Create the first administrator with the protected seed script:

```bash
# with MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD (≥10 chars) set in .env.local
npm run seed:admin
```

Passwords are hashed with bcrypt (cost 12). Sessions are signed HS256 JWTs in an `httpOnly`, `SameSite=Lax`,
`Secure` (production) cookie that expires after 8 hours. Login is rate-limited per IP and per account.

## 6. Image & video storage

Vercel's filesystem is ephemeral, so uploads go to **Cloudinary**: the admin browser asks `/api/admin/upload`
for a server-signed request and uploads straight to Cloudinary (no 4.5 MB serverless body limit, videos supported).
Without `IMAGE_STORAGE_CONFIGURATION`, local development stores uploads in `public/uploads/` (disabled in production).

**Homepage design:** the homepage reproduces the Stage Décor design — components live in
`components/stage/`, text in `lib/i18n/home-ui.js`. The hero is the interactive stage
built from `public/images/image-slider/slide-01.webp`, the first of four background slides (hotspot coordinates are tied to that photo; names, visibility and colours are editable in Admin → 3D Design). The estimator's optional extras map to
the products `large-wedding-tent`, `decorative-lighting` and `flower-arch-walkway` (`HOME_ADDON_SLUGS` in `services/catalog.js`).
The "Book your date" form saves consultation requests to MongoDB — see **Admin → Enquiries**.

**Hero video (not shown on the homepage design):** the client's own footage is bundled as `public/videos/hero.mp4`.
Replace it any time in **Admin → Website settings → Hero video** (upload or URL). For best performance upload an
MP4 (H.264) under ~8 MB, 1280–1920 px wide, plus a poster image. The poster renders first; the video only loads
after the page is interactive and is skipped on Save-Data/2G connections and for reduced-motion users.

## 7. GitHub

```bash
git init
git add .
git commit -m "Watson Decoration platform"
git branch -M main
git remote add origin https://github.com/<you>/watson-decoration.git
git push -u origin main
```

`.gitignore` excludes `.env*`, `node_modules`, `.next`, `public/uploads` and the raw `photos/` folder.

## 8. Vercel deployment

1. <https://vercel.com/new> → import the GitHub repository (framework auto-detected: Next.js).
2. **Environment Variables** (Production + Preview): `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`,
   `IMAGE_STORAGE_CONFIGURATION`. (Add `ADMIN_EMAIL`/`ADMIN_PASSWORD` only if you run the admin script from CI — normally run it locally against Atlas.)
3. Deploy. Then add your custom domain and update `NEXT_PUBLIC_SITE_URL` to it, and redeploy.
4. Submit `https://your-domain/sitemap.xml` in Google Search Console (paste the verification code in Admin → SEO settings).

## 9. How key features work

- **Languages:** `lib/i18n/dictionaries/{ta,en}.js` hold all UI text; content stored in MongoDB uses `{ ta, en }`.
  Tamil pages live at `/…`, English at `/en/…`, each with its own metadata, canonical and `hreflang` alternates.
- **Pricing is server-side only.** `lib/order-builder.js` re-prices every cart line from the database
  (`per_day` items × rental days; packages use their own package price). The checkout shows a live server quote.
- **Inventory** (`lib/inventory.js`): available = total − damaged/blocked − quantities in **accepted** orders whose
  rental period overlaps. Pending orders never reduce stock; completed/cancelled orders release it. Availability is
  validated when the order is placed **and again when the admin accepts it** (overbooking is refused).
- **Order IDs:** `EVT-YYYYMMDD-XXXXX` (crypto-random, unambiguous characters, unique index with retry).
- **Tracking** returns only the order ID, masked name, dates, items, totals, status, history and the admin's
  customer message — never phone, address, email or internal notes. Rate-limited (12 lookups / 10 min / IP).
- **Rate limits** are stored in MongoDB (TTL collection) so they work across serverless instances.
- **Caching:** public pages are ISR-cached (5 min) and purged immediately whenever an admin saves content.

## 10. SEO

Per-page titles/descriptions in both languages, canonical + `hreflang`, Open Graph/Twitter cards, XML sitemap with
language alternates, `robots.txt`, JSON-LD (`LocalBusiness`, `Product` + `Offer`, `BreadcrumbList`),
semantic headings and image alt text. Products and packages have optional SEO title/description overrides.

**Client keywords:** the placeholder `[CLIENT SEO KEYWORDS WILL BE PROVIDED HERE]` is stored in
**Admin → SEO settings → Keywords**. While the placeholder is present no keywords are published. Replace it with the
client-provided keywords (comma separated, Tamil and English) — no code change needed.

## 11. Before launch — content to confirm with the client

- Phone, WhatsApp number, email, address, map, social links (Admin → Website settings). WhatsApp/call buttons appear once set.
- **Currency and country code**: set to Sri Lanka — `Rs.` / `LKR` / `+94` (changeable in Admin → Website settings).
- All **sample prices and stock quantities** created by the seed script.
- **Sample testimonials** (named "Sample — …") are only seeded in development — replace or delete them.
- Product photos for items without images (tables, cooking equipment, etc.) show a neutral placeholder.
- Review the privacy policy and terms text (`lib/content/legal.js`).

## 12. Production testing checklist

- [ ] Home loads in Tamil at `/`; language switch goes to `/en` and back on every page.
- [ ] Hero video plays (muted, loop) on desktop and mobile; poster shows first.
- [ ] Products: search, category filter, price filter, sort, pagination, product details.
- [ ] Packages: list, details, **Book now** → checkout, **Customize this package** → builder with items loaded.
- [ ] Builder: add/increase/decrease/remove items, estimated total updates, continue to checkout.
- [ ] Checkout: required-field validation messages in both languages; date rules (no past dates, end ≥ start, event inside period).
- [ ] Place an order → confirmation shows the Order ID; Copy button works; basket is cleared.
- [ ] Track the order → *Pending*; no phone/address visible; wrong ID shows "not found"; >12 attempts → rate-limited.
- [ ] Admin login (wrong password rejected); `/admin/*` redirects to login when signed out.
- [ ] Accept the order with a customer message → tracking page shows *Accepted* + message immediately.
- [ ] Place a second order that exceeds remaining stock for overlapping dates → refused; accepting a conflicting order → refused.
- [ ] Mark completed → stock released (Admin → Inventory).
- [ ] Create/edit/delete a product and a package with image upload (Cloudinary); unpublish hides it from the site.
- [ ] Website settings and SEO settings save and appear on the site.
- [ ] `/sitemap.xml` and `/robots.txt` use the production domain.
- [ ] Lighthouse (mobile) on Home, Products, Package details.
>>>>>>> 6ef55310b926b8304db243483f45c8bf859d5e1b
