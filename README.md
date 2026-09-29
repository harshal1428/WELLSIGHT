# WELLSIGHT

Offset well knowledge and decision support for drilling operations.

## Run locally

1. Install Node.js and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and set `VITE_CARTO_API_KEY` to your CARTO API key. The map falls back to OpenStreetMap when no key is set.
4. Run `npm run dev`.

`VITE_*` variables are included in the client bundle. CARTO keys used here are public browser keys; restrict their allowed domains in CARTO. Do not put private server credentials in a `VITE_*` variable.

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket and import it into Vercel.
2. Keep the default project root. Vercel detects Vite; the build command is `npm run build`, the output directory is `dist`, and Node.js 20.19 or newer is required.
3. In Vercel project settings, add `VITE_CARTO_API_KEY` for Preview and Production (and Development if desired). Use the restricted public browser key; `VITE_*` values are included in the client bundle. The map falls back to OpenStreetMap if the variable is absent.
4. Redeploy after adding or changing the environment variable. `vercel.json` rewrites app routes to `index.html` for client-side routing.

The deployed frontend supports the same browser-side workflows as local use. Saved readings, alert states, notes, and feedback remain in that browser's local storage; imported records are held for the current browser session. They are not shared with other users or devices and can be cleared by browser storage settings. Vercel deployment does not add a telemetry service, backend, login, or shared database.

## Scripts

- `npm run dev` — start the local development server.
- `npm run build` — type-check and create the production build in `dist`.
- `npm run lint` — run Oxlint.
- `npm run preview` — preview the production build locally.

The application is a browser-based decision-support interface using local reference well, event, and parameter records. Live rig telemetry, an application backend, user authentication, and persistent server storage are not connected. Values shown in monitoring and risk views are not operational measurements or calibrated predictions. Connect and validate an approved telemetry and data service before operational use.
