# CloudSport

AI-powered sports prediction, analysis, and analytical ticket-building platform.
Predictions are model estimates, not guarantees. **No real-money wagering, payouts,
or betting-odds integration is implemented at any stage of this product.**

## Phase 1 scope (current)

- Auth (email/password, JWT)
- Fixture ingestion for one league (Premier League) via API-Football
- Single prediction market (match result) via Claude API reasoning over fetched stats
- Manual ticket builder (add / remove / view / combined probability)
- Dashboard: today's fixtures + predictions

See the project roadmap (tracked outside this repo) for later phases: explainability,
live analysis, personalization, additional sports, monetization, admin.

## Design system

CloudSport's visual language is built around *forecasting*, not betting — probability
and confidence are drawn (bands, gradients), not just printed as numbers.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0F1B2D` | Primary text, deep backgrounds |
| `--overcast` | `#EDF1F5` | App background |
| `--surface` | `#FFFFFF` | Cards |
| `--sunbreak` | `#E8A33D` | High confidence / positive signal |
| `--steel` | `#4C6B8A` | Moderate / uncertain signal |
| `--storm` | `#B5533C` | Low confidence / upset risk |

- **Display type**: Newsreader (serif) — headlines, scores, match titles
- **UI/body type**: IBM Plex Sans — everything else, especially data-dense areas
- **Layout**: left-aligned; a horizon-line divider separates settled results from
  upcoming fixtures; confidence renders as a gradient band, never a bare badge alone

Keep new UI consistent with these tokens (see `client/src/styles/tokens.css` and
`client/tailwind.config.js`) rather than introducing new colors/fonts ad hoc.

## Stack

- Client: React + Tailwind
- Server: Node/Express
- DB: PostgreSQL
- AI: Claude API (see `server/src/services/aiEngine.js`)
- Sports data: API-Football (see `server/src/services/dataProvider.js`)

## Setup — GitHub Codespaces only

This project is developed and run entirely on GitHub — no local machine or external
host required. A Codespace boots Node **and** Postgres together automatically.

**1. Add your keys as Codespaces secrets** (one-time, done on github.com):
   Repo → Settings → Secrets and variables → Codespaces → New repository secret.
   Add these three:
   - `API_FOOTBALL_KEY`
   - `ANTHROPIC_API_KEY`
   - `JWT_SECRET` (any long random string)

**2. Launch a Codespace**: repo page → **Code** → **Codespaces** → **Create codespace
   on main**. It builds automatically (`.devcontainer/`) with Node and Postgres both
   running, and your secrets already available as environment variables — no `.env`
   file to manage.

**3. Run the server** in the Codespace terminal:
   ```bash
   cd server && npm run dev