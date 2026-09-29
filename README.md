# OffsetIQ / WELLSIGHT

OffsetIQ is a React and Vite workspace for reviewing active and offset well context, recorded drilling events, historical cases, risk evidence, alerts, reports, imports, and an AI-assisted chat. This guide documents the current pages and the recent workspace changes so another developer can run and integrate the project.

> **Data and operational use:** The application contains a mixture of workspace records and imported records. It is a decision-support interface; historical record counts are not likelihood estimates, and generated text is not an operational instruction. Always use approved well programs and qualified operational review.

## Pages and recent changes

| Page | Route | Changes in this workspace |
| --- | --- | --- |
| Overview | `/` | Kept as the landing view for the shared well context and navigation. |
| Live Well | `/live-well` | Refined the live well presentation and well-context visuals. |
| Nearby Wells | `/nearby-wells` | Uses the shared active-well context and offset well data. |
| Correlation | `/correlation` | Remains available as a comparison view for well/event context. |
| Historical Knowledge | `/knowledge` | Filters explicitly marked `Sample Data` events out of the historical case results; keeps other historical cases. Updated case cards and evidence drawer/source presentation to avoid presenting seeded demo documents as real source material. |
| Risk Intelligence | `/risk` | Reworked risk summaries and category cards to use recorded event counts, highest recorded severity, comparable well counts, and matched context factors. Removed misleading fixed prototype score / `/100` presentation. Added risk analytics charts and refined risk detail/evidence views. |
| Alerts | `/alerts` | Updated alert presentation to align with the recorded-event evidence model and shared well context. |
| Reports | `/reports` | Redesigned the report workspace and white formal preview. Added downloadable JSON, CSV, and Markdown report formats alongside browser print/PDF, engineer review notes, and active-well-specific context. Report content is built from current well context, historical event records, alerts, and review notes. |
| Data Import | `/import` | Reworked the interface around file selection, upload queue, validation/review, and imported-record visibility. Supports selecting or dropping files and adding structured event records; removed the sample loader and prototype copy. |
| AI Chat | `/chat` | Added a full conversation UI with contextual prompt suggestions, conversation controls, loading/error handling, response copy, and active-well context. Chat requests go through a server endpoint to Gemini; the API key is server-only. |

The application routes and shared `WellProvider` are declared in `src/App.tsx`. Shared well selection/state is in `src/hooks/useWellContext.tsx` and related data/type files. UI components are grouped under `src/components/` by feature.

## Requirements

- Node.js compatible with the Vite version in `package.json` (use a current Node LTS release).
- npm.
- A Google Gemini API key to use AI Chat.
- Optional: a CARTO public browser key for map tiles. The map can use its configured fallback without one.

## Local setup

1. Clone the repository and enter the application directory (the directory containing this `README.md` and `package.json`).
2. Install dependencies:

   ```sh
   npm install
   ```

3. Copy `.env.example` to `.env.local`:

   ```sh
   # macOS/Linux
   cp .env.example .env.local

   # Windows PowerShell
   Copy-Item .env.example .env.local
   ```

4. Edit `.env.local` and set the values you need:

   ```dotenv
   VITE_CARTO_API_KEY=your_carto_public_browser_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

   `GEMINI_API_KEY` must remain a server-side variable. Never rename it to `VITE_GEMINI_API_KEY`, paste it into source code, or commit `.env.local`. The `.gitignore` excludes `.env`, `*.local`, dependencies, and build output.

5. Start the local development server:

   ```sh
   npm run dev
   ```

6. Open the local URL printed by Vite. Use the sidebar to visit `/import`, `/chat`, `/risk`, `/knowledge`, and `/reports`. After changing `.env.local`, restart the dev server.

## Gemini chat integration

- Browser UI: `src/pages/ChatPage.tsx`.
- Local development endpoint: `/api/chat`, added as Vite middleware in `vite.config.ts`.
- Production endpoint: `api/chat.ts` (Vercel serverless function).
- Shared request validation and Gemini API call: `server/gemini.ts`.
- Secret name: `GEMINI_API_KEY`.

The chat sends recent conversation messages and selected workspace context (active well, nearby event records, alerts, and imported-record count) to the backend. The backend calls Gemini and returns only the generated reply. Requests are limited in size and message count. The service returns a setup error when `GEMINI_API_KEY` is missing.

For production, configure `GEMINI_API_KEY` in the hosting provider's server environment settings (for Vercel, Project Settings → Environment Variables), then redeploy. Configure `VITE_CARTO_API_KEY` separately as a public browser variable only if needed. Do not share a `.env.local` file containing keys; each developer should use their own credentials.

## Import and reports workflow

1. Open **Data Import** and choose one or more supported files or drop them into the upload area.
2. Review the parsed/queued records and validation feedback. Use the structured event form when a record needs manual entry.
3. Approve valid records for the shared workspace. Imported data is then available to relevant well views and report context according to the app's data model.
4. Open **Reports**, review the active well and evidence, and add engineer observations, notes, follow-up actions, and review status.
5. Export JSON, CSV, or Markdown, or use Print/PDF from the report page. Check the browser print preview for page breaks and choose paper/layout settings appropriate to the report.

Imported files and browser state are not automatically shared across a second computer unless the project is connected to a shared persistence service. For a teammate's local setup, clone/pull the code, install dependencies, add their own `.env.local`, and import the required source data on their own system. For centralized multi-user records, connect a database/storage service and authentication; the current frontend state alone is not a shared backend database.

## Scripts

```sh
npm run dev      # Start Vite development server
npm run build    # TypeScript project build and Vite production bundle
npm run lint     # Run Oxlint
npm run preview  # Serve the built bundle locally
```

## Deployment

The repository includes `api/chat.ts` for Vercel's serverless function convention and `vercel.json` for client-side route fallback. Import the repository into Vercel using the WELLSIGHT project directory as the root. Use `npm run build` and `dist` as the build command/output directory, and configure server-side `GEMINI_API_KEY` for each required environment. Redeploy after setting secrets. Do not commit local secrets or paste them into GitHub issues, README files, or client-side code.

## Project structure

```text
src/
  App.tsx                   Routes and shared well provider
  components/               Shared and feature-specific UI
  hooks/                    Shared well context and app hooks
  pages/                    Routed page components
  types/                    Shared TypeScript types
  utils/                    Risk, alert, import, and report helpers
api/chat.ts                 Production chat function
server/gemini.ts            Gemini request handler
vite.config.ts              Vite setup and local /api/chat middleware
.env.example                Safe environment-variable template
```

## Working with changes from this branch

To bring the branch into another clone, fetch it and check it out (replace `<branch>` with the branch name shared by the contributor):

```sh
git fetch origin
git switch <branch>
npm install
```

If integrating into an existing feature branch, merge or cherry-pick through Git after reviewing the diff. Keep local credentials and imported operational data out of commits. The branch should be reviewed and merged into the default branch by the repository maintainers when ready.
