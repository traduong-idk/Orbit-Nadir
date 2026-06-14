# Orbit Nadir

Internal sourcing/procurement web tool for supplier discovery, data cleaning, company vetting, and supplier management.

## Tech stack

- Next.js (App Router)
- Tailwind CSS
- Google Gemini API (gemini-1.5-flash)
- Google Places API
- Google Sheets API (service account)
- Deploy target: Cloudflare Pages

## Setup

```bash
cd orbit-nadir
npm install
cp .env.local.example .env.local
# Fill in API keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

```
GEMINI_API_KEY=
GOOGLE_PLACES_API_KEY=
GOOGLE_SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

Place `credentials.json` (service account) in the project root, or use env vars above.

Place your logo at `public/logo.png`.

## Project structure

```
components/
  Sidebar.jsx          — Navigation + theme toggle
  Layout.jsx           — Main layout wrapper
  SupplierDiscovery.jsx — Tab 1
  CleanData.jsx        — Tab 2
  VetCompany.jsx       — Tab 3
  SupplierMaster.jsx   — Tab 4
lib/
  gemini.js            — Gemini API + web search
  places.js            — Google Places API
  sheets.js            — Google Sheets export
  scraper.js           — masothue.com scraper
  translate.js         — Translation utilities
  mockData.js          — Mock data for UI testing
```

## Mock data

All tables are pre-populated with mock data so the UI is fully testable before API keys are configured. API routes fall back to mock responses when env vars are empty.

## Cloudflare Pages deployment

```bash
npm run build
npx @cloudflare/next-on-pages
```

Configure environment variables in the Cloudflare Pages dashboard.

## Google Sheets tabs

Export buttons write to these sheet tabs (append only):
- Supplier Discovery
- Clean Data
- Vet Company
- Supplier Master
