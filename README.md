# WELLSIGHT

WELLSIGHT is a browser-based well monitoring and intelligence workspace for reviewing well context, historical event records, risk evidence, alerts, reports, imports, and AI-assisted analysis.

## Run locally

1. Install Node.js 20.19 or newer and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the values you need:

   ```dotenv
   VITE_CARTO_API_KEY=your_restricted_public_carto_key
   GEMINI_API_KEY=your_server_only_gemini_key
   ```

   `VITE_CARTO_API_KEY` is exposed in the browser bundle, so restrict it to your domains. `GEMINI_API_KEY` is used only by the server endpoint and must never be renamed to a `VITE_*` variable or committed.
4. Run `npm run dev` and open the URL printed by Vite.

## Features

- Well overview, monitoring charts, nearby wells, and depth correlation.
- Historical case search, evidence review, risk evidence summaries, and alerts.
- Import of CSV, JSON, and searchable PDF records with field review.
- Well Intelligence workflows for offsets, timeline, evidence, data quality, feedback, fingerprints, shadow wells, knowledge graph, warnings, and counterfactual review.
- AI Chat sends the prompt and selected well context through the server endpoint to Google Gemini. Do not send confidential information unless your organization permits that processing. AI responses are analysis support, not operating instructions.
- Reports with browser print/PDF and JSON, CSV, and Markdown export; engineer notes are stored in this browser.

## Deploy to Vercel

Import the repository in Vercel with the project root set to this repository. Use:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 20.19 or newer

Add `VITE_CARTO_API_KEY` (optional public browser key) and `GEMINI_API_KEY` (private server environment variable) in Vercel Project Settings for the environments where the app will run, then redeploy. `vercel.json` preserves client-side routes; `/api/chat` is served by the Vercel function in `api/chat.ts`.

The chat endpoint has request size and input-count limits, but this project does not currently provide user authentication or a durable per-user rate limit. Before exposing Gemini chat publicly, put it behind your organization's authentication and abuse controls. The endpoint sends the user's prompt and well context to Google's Gemini service; this is not an on-premises or air-gapped inference path.

## Data and deployment limits

The browser supports local workflows, but this repository does not connect to a live rig telemetry source or provide shared server-side well data, user authentication, or cross-device persistence. Imported records are held in browser session storage; notes, report reviews, saved readings, and feedback use browser local storage. These records are not shared between users or devices. Monitoring values and historical evidence must not be treated as verified live readings or calibrated operational risk predictions.

The Gemini endpoint is a separate cloud integration and is not a substitute for a validated telemetry or operational backend. Do not use generated responses to direct drilling operations.

## Scripts

- `npm run dev` — start Vite with the local `/api/chat` middleware.
- `npm run build` — type-check and create a production build in `dist`.
- `npm run lint` — run Oxlint.
- `npm run preview` — preview the production build locally.
