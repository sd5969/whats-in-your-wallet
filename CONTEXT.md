# Project Context

This file is a short handoff for the next Codex session.

## Repo
- Name: `whats-in-your-wallet`
- Remote: `git@github.com:sd5969/whats-in-your-wallet.git`
- Branch: `main`

## App Overview
- MERN credit-card value comparison app.
- Client: React + Vite (`client/`).
- Server: Express + Mongoose (`server/`).
- API: `/api/state` GET/PUT persists a single `Workspace` document that now contains `scenarios` and `activeScenarioId`.
- Server default port is 5050, client uses `VITE_API_URL` or falls back to `http://localhost:5050`.

## Recent Major Changes
- Added multi-user support by passing `?user=` to `/api/state`.
  - Server: `Workspace` has `userId` field; routes load/save per user.
  - Client: localStorage stores users + active user; dropdown in header to switch/add users.
- Scenario favorites:
  - Each scenario has `favorite` boolean.
  - Scenario comparison rows show a Pin toggle.
  - "Delete all" now deletes only non-favorites.
- Scenario comparison chart:
  - Rebuilt to use a vertical list of stacked bars.
  - Axis line is a vertical black line between label and bar.
  - Label column width now `250px` (`--scenario-label-width` in CSS).
  - Bars are absolute width based on total net value.
  - Max height with scroll for the list.

## Default Card Data (key points)
- Bilt Blue/Obsidian/Palladium defaults updated.
  - Obsidian annual fee: 95, Palladium: 495.
- Amex Gold annual fee: 325.
- Rent defaults: Amex Gold, Venture X, CSP, Apple Card are 0x.
- Venture X other travel: 2x.
- CSP groceries: 1x.
- Apple Card misc: 2x.
- Bilt special rent rate logic implemented.
- Split travel into `flights` and `travelOther` (with migration logic).

## Tooling / Scripts
- Server scripts:
  - `scripts/exportWorkspace.js`
  - `scripts/importWorkspace.js`
  - `scripts/resetWorkspace.js`
  - `scripts/resetWithBackup.js`
  - `scripts/migrateSpendOnly.js`
  - `scripts/migrateSpendAndRates.js`
- `server/workspace_v2.json` holds desired defaults (travel split into flights/travelOther).

## Known Issues / Notes
- Scenario comparison bar length was problematic earlier; currently uses inline width on `.scenario-bar`.
- If scenario saves fail for many scenarios, server JSON limit was increased to 2mb.
