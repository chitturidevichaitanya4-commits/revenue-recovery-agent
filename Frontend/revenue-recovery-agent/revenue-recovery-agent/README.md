# Revenue Recovery Agent — Dashboard

A React + Vite + TypeScript + Tailwind frontend for the Revenue Recovery Agent
FastAPI backend. Built for a hackathon demo: it tells the story of a failed
payment being detected, scored by a Random Forest model, assigned a recovery
strategy, worked by the recovery executor, and (hopefully) recovered.

## Running it

1. Start the FastAPI backend on `http://127.0.0.1:8000` (unchanged — this
   project only reads from it).
2. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open the printed local URL. In dev, requests to `/api/*` are proxied to
   `http://127.0.0.1:8000/*` (see `vite.config.ts`), so no CORS setup is
   needed on the backend.

For a production build talking to a deployed backend, copy `.env.example` to
`.env` and set `VITE_API_BASE_URL` to the backend's real URL, then run
`npm run build`.

## What it uses from the backend

- `GET /analytics` — powers the executive KPI strip, the AI engine's
  priority distribution, and the recovered-vs-at-risk chart.
- `GET /transactions` — powers the recovery cases table, the case detail
  drawer, the failure-reason chart, the payment attempts table, and the
  activity feed.
- `GET /health` and `GET /` — inform the "Backend Status" indicator.

## About the normalization layer

The brief specifies `/transactions` as the source of truth for recovery
cases, but doesn't pin down the exact field names or guarantee that every
row already carries a computed priority/decision/strategy/status. To stay
useful either way, `src/lib/normalize.ts`:

- Reads whichever field names are present (`payment_amount` or `amount`,
  `failure_reason`, `case_id` or `id`, etc.).
- If a row already includes `priority`, `decision`, `strategy`, or `status`,
  those values are used as-is — the backend's own answer always wins.
- Only when `priority` is missing does the dashboard estimate one from
  amount vs. balance, purely for display. Whenever this happens, the case's
  `derived` flag is set, and the UI shows a small `est.` marker next to the
  priority badge (in the cases table and the case drawer) plus explanatory
  copy — it never claims the estimate is a genuine model output. If your
  `/transactions` response already includes `priority` on every row, this
  fallback never fires and the marker never appears.
- Decision, strategy, and executor state still fall back to the tables
  documented in the brief when missing, but only priority is presented with
  the `est.` disclosure, since that's the one value that could otherwise be
  mistaken for the ML model's actual prediction.


## Structure

```
src/
  lib/          API client, formatting helpers, normalization
  hooks/        useAnalytics, useRecoveryCases (polling every 15s)
  components/   One component per dashboard section
  App.tsx       Layout + section composition
```
