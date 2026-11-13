# Peace Home Rental

Installable web app for [peacehomerental.com](https://peacehomerental.com) — browse homes, filter by market, and start an application from your phone.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — ESLint

## App features

- **Customer site** (`/`): home, listings search, property detail, favorites, tour requests, FAQ, policies, apply
- **Renter accounts** (`/login`, `/signup`, `/account`): email login requires password + 6-digit email security code; Apple Sign In; create account; customer verification (phone + policies)
- Tours and applications require a verified customer
- **Messaging** (`/messages` and `/owner/messages`): customers message the office; owners reply; inquiries open a thread
- **Activity**: account, verification, inquiry, and message events on the account page and owner overview
- **Transactional email**: verification, welcome (after email confirm), verified-customer, inquiry confirmations, and new-message notices
- **Owner workspace** (`/owner`): overview, listings, inquiries, messages, add/edit homes — separate shell and nav, gated by Cursor sign-in (publish as private or team)
- Progressive Web App (manifest + service worker) for Add to Home Screen
- Brand styling matched to Peace Home Rental (forest / paper)
- Postgres when published (`migrations/`); local/dev uses in-memory PGlite when `DATABASE_URL` is unset

## Secrets (published app)

Transactional email uses the **Resend** SDK (`RESEND_API_KEY`, optional `RESEND_FROM_EMAIL`, `OWNER_NOTIFY_EMAIL`) with idempotency keys. Auth codes are never returned in API responses.
Bind `APPLE_CLIENT_ID` (Services ID) to enable Sign in with Apple. Without it, the Apple button stays unavailable.

