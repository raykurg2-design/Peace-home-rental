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
- **Renter accounts** (`/account`): email verification + customer verification (phone + policies); tours and applications require a verified customer
- **Owner workspace** (`/owner`): overview, listings, inquiries, add/edit homes — separate shell and nav, gated by Cursor sign-in (publish as private or team)
- Progressive Web App (manifest + service worker) for Add to Home Screen
- Brand styling matched to Peace Home Rental (forest / paper)
- Postgres when published (`migrations/`); local/dev uses in-memory PGlite when `DATABASE_URL` is unset

## Secrets (published app)

Bind `RESEND_API_KEY` (and optionally `RESEND_FROM_EMAIL`) for real verification emails. Without them, signup shows a local preview verification link.

