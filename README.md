# DigitalMart — Digital Products E‑Commerce Store

A full‑stack e‑commerce platform for selling **digital products** (ebooks,
courses, templates, license keys, etc.), built with **Next.js 14 (App
Router)** and **MongoDB**. Buyers fund an in‑app **wallet** and pay for
products from their balance; admins get a dedicated dashboard to manage
products and view all payments.

## Features

- 🛍️ Storefront with search, category filters, product pages, cart
- 👤 Auth (register/login) using NextAuth (credentials + JWT sessions)
- 🔑 Forgot / reset password flow, emailed via Resend
- 💰 Wallet system — users fund their balance via **Paystack** and pay for
  products instantly from it
- 🖼️ Product image uploads straight from the admin's device to **Cloudinary**
  (no manual URL pasting)
- 🏷️ Managed categories — admins create categories once, products are
  assigned from a dropdown, storefront sorts/filters by them
- 🧾 Order history with instant digital delivery links
- 🔒 Race-condition-safe checkout — wallet debits and stock decrements run
  inside a MongoDB transaction, so two simultaneous purchases can never
  double-spend the same balance or oversell limited stock
- 🛠️ Admin dashboard:
  - Stats overview (products, users, orders, total funded)
  - Full product CRUD (create, update, delete, show/hide) with image upload
  - Category management
  - Payments log — every wallet funding & purchase, filterable
- 🎨 Clean, responsive UI built with Tailwind CSS following consistent
  spacing, color and component conventions (see `app/globals.css`)

## Tech stack

- **Framework:** Next.js 14 (App Router, Server Components + Route Handlers)
- **Database:** MongoDB with Mongoose (uses transactions for checkout —
  requires a replica set, which MongoDB Atlas provides by default even on
  the free tier)
- **Auth:** NextAuth.js (Credentials provider, JWT sessions)
- **Payments:** Paystack (wallet funding)
- **Images:** Cloudinary (product image uploads)
- **Email:** Resend (password reset emails)
- **Styling:** Tailwind CSS
- **State:** React Context for cart (persisted to `localStorage`)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string (Atlas or local) |
| `NEXTAUTH_SECRET` | Random string used to sign session tokens — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of your app, e.g. `http://localhost:3000` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials used by the seed script to create your first admin account |
| `NEXT_PUBLIC_APP_NAME` | Store name shown in the UI |
| `NEXT_PUBLIC_CURRENCY` | ISO currency code used for formatting, e.g. `NGN`, `USD` |
| `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | From Paystack dashboard → Settings → API Keys |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From Cloudinary console — used for product image uploads |
| `RESEND_API_KEY` / `EMAIL_FROM` | From Resend dashboard → API Keys — used to send password reset emails |

### 3. Seed the database (creates admin user + sample products + categories)

```bash
npm run seed
```

This creates an admin account using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from
your `.env.local`, plus a few sample categories and digital products so the
store isn't empty. Before adding your own products from the admin panel,
create categories first under **Admin → Categories** — the product form
only lets you pick from existing categories, by design, so the storefront's
category filter always stays clean and consistent.

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`. Log in with your admin credentials and visit
`/admin` to manage products and view payments.

## How the wallet works (Paystack integration)

The wallet is wired to **Paystack** for real payments:

1. A logged-in user goes to **/wallet** and enters an amount to fund.
2. `POST /api/wallet/fund` calls Paystack's **Initialize Transaction** API and
   returns an `authorizationUrl` — Paystack's own secure checkout page.
3. The browser redirects the user to that URL to enter card/bank details.
4. After payment, Paystack redirects back to `/wallet/callback`, which calls
   `POST /api/wallet/verify`. This route calls Paystack's **Verify
   Transaction** API server-to-server, checks the amount matches exactly,
   and only then credits the user's wallet — the wallet is never credited
   based on anything the browser alone reports.
5. A webhook at `POST /api/webhooks/paystack` acts as a safety net: even if
   the user closes their browser before the redirect back completes,
   Paystack will call this endpoint directly and the wallet still gets
   credited. The webhook verifies Paystack's signature before trusting the
   payload.
6. At checkout (`POST /api/orders`), the order total is deducted from the
   user's wallet balance and a `PURCHASE` transaction + `Order` record are
   created. If the balance is insufficient, checkout is blocked and the
   user is redirected to fund their wallet.

### Setting up Paystack

1. Create a free account at [paystack.com](https://paystack.com) (or log in)
2. Go to **Settings → API Keys & Webhooks**
3. Copy your **Test Secret Key** and **Test Public Key** into `.env.local`:
   ```
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. On the same page, set the **Webhook URL** to:
   ```
   https://yourdomain.com/api/webhooks/paystack
   ```
   (For local testing, use a tool like [ngrok](https://ngrok.com) to expose
   `localhost:3000` and set the webhook URL to the ngrok URL instead.)
5. Use Paystack's [test card numbers](https://paystack.com/docs/payments/test-payments/)
   to simulate a successful payment while in test mode.
6. When you're ready to accept real payments, switch to your **Live** keys
   in Paystack and update `.env.local` (and your webhook URL) accordingly.

### Currency note

Paystack primarily supports NGN, GHS, ZAR, KES and USD depending on your
business's country/settlement currency. Make sure `NEXT_PUBLIC_CURRENCY`
matches a currency your Paystack account is actually set up to accept.

## Project structure

```
app/
  page.js                 Storefront (home / shop)
  product/[id]/page.js    Product detail page
  cart/page.js            Cart + checkout
  wallet/page.js           Wallet funding + transaction history
  dashboard/page.js        User's order history
  login/, register/        Auth pages
  admin/                   Admin dashboard (protected)
    page.js                 Stats overview
    products/page.js        Product CRUD
    payments/page.js        Payments log
  api/                     Route handlers (REST-style JSON API)
components/                Reusable UI components
context/CartContext.js     Client-side cart state (localStorage)
lib/                       DB connection, auth config, helpers
models/                    Mongoose schemas (User, Product, Transaction, Order)
scripts/seed.js            DB seeding script
```

## Deployment notes

- Deploy easily to **Vercel**; set the same environment variables in your
  project settings.
- Use a **MongoDB Atlas** cluster for production (free tier is enough to
  start).
- Set `NEXTAUTH_URL` to your production domain and generate a fresh
  `NEXTAUTH_SECRET`.
- Swap the demo wallet funding flow for a real payment gateway before
  going live (see above).

## Security notes for production

- Passwords are hashed with bcrypt before storage.
- Password reset tokens are single-use, hashed before storage, expire after
  1 hour, and the forgot-password endpoint always returns the same message
  whether or not the email exists (prevents account enumeration).
- Admin routes are protected both by middleware and a server-side role
  check in `app/admin/layout.js`.
- All product mutation and payment-viewing API routes verify the caller's
  session and role server-side — never trust the client.
- Checkout runs inside a MongoDB transaction with atomic
  `findOneAndUpdate` guards on both wallet balance and stock, closing the
  race condition where two simultaneous requests could otherwise both pass
  a balance/stock check before either write happens.
- Uploaded images are validated by type and size (5MB max) server-side
  before being sent to Cloudinary.
- The Paystack webhook verifies Paystack's HMAC signature before trusting
  any payload.
- Add rate limiting (e.g. on login, forgot-password and checkout routes)
  before accepting real traffic — this starter does not include it.

### A note on MongoDB transactions

Checkout uses `session.withTransaction()`, which requires MongoDB to be
running as a **replica set** — MongoDB Atlas (including the free tier)
already runs this way, so no extra setup is needed there. A plain local
standalone `mongod` does **not** support transactions; if you develop
against a local database, either run it as a
[single-node replica set](https://www.mongodb.com/docs/manual/tutorial/convert-standalone-to-replica-set/)
or just point `MONGODB_URI` at an Atlas cluster during development too.
