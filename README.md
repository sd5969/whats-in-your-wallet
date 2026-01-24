# MERN Credit Card Value Studio

A full stack MERN app for comparing credit card value with configurable annual
spend, benefits, and card assignments.

## Structure

- `server`: Express API with MongoDB (Mongoose)
- `client`: React UI (Vite)

## Setup

1. Create environment files.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

2. Install dependencies.

```bash
cd server
npm install
cd ../client
npm install
```

3. Run the app (two terminals).

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The UI runs at `http://localhost:5173` and the API at `http://localhost:5050`.

## Export / Import Workspace

These scripts read from the `MONGODB_URI` in `server/.env`, so run them from the
`server` directory (or ensure `server/.env` is in your working directory).

Export to stdout:

```bash
node scripts/exportWorkspace.js
```

Export to a file:

```bash
node scripts/exportWorkspace.js /path/to/workspace.json
```

Import from a file:

```bash
node scripts/importWorkspace.js /path/to/workspace.json
```

Import from stdin:

```bash
cat /path/to/workspace.json | node scripts/importWorkspace.js
```

Reset the saved workspace:

```bash
node scripts/resetWorkspace.js
```

Export, reset, and reimport (with backup file path optional):

```bash
node scripts/resetWithBackup.js /path/to/workspace-backup.json
```

Migrate spend-only into the latest defaults (keeps your spend, resets cards/benefits/assignments):

```bash
node scripts/migrateSpendOnly.js
```

Migrate spend + earning rates into the latest defaults (keeps your spend and per-card multipliers, resets benefits/assignments):

```bash
node scripts/migrateSpendAndRates.js
```
