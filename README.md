# Watson Decoration — வட்ஷன் பந்தல் சேவை

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
