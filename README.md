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
Recommended after domain DNS is verified: `RESEND_FROM_EMAIL=Peace Home Rental <noreply@peacehomerental.com>` and `OWNER_NOTIFY_EMAIL=contact@peacehomerental.com`.
Bind `APPLE_CLIENT_ID` (Services ID) to enable Sign in with Apple. Without it, the Apple button stays unavailable.

### Resend domain (`peacehomerental.com`)

Add these DNS records, then verify in Resend:

| Type | Name | Value |
|------|------|--------|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfVWxDYVR+LAvT2Pl9x6CvuwH/jv1btIvSDBj0hlM/o2Pa0MMv5E8C3J9+fO+cvqwPPbUGPEHdCF5MzZ0tJCAVwt35ddslNyvfeKCQpb7eiJOE3FfnqKxeHGLlGUiuZgvbm6qXac5ZBKI3+3YDgYnSHzPMUqPxxr1W/Nn3tLSx0wIDAQAB` |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` (priority 10) |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` |
| CNAME | `rsend` | `send.forge.rmta.net` |

