# MERN Credit Card Value Studio

A full stack MERN app for comparing credit card value with configurable annual
spend, benefits, and card assignments.

## Structure

- `server`: Express API with in-memory session storage
- `client`: React UI (Vite)

## Setup

1. Create environment files.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` with a strong `SESSION_SECRET` for production deployments.

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

## Storage behavior

Workspace data is stored in the server's in-memory session store and scoped to
the browser session cookie. Clearing cookies, using an incognito window, or
opening the app in a different browser creates a fresh workspace. Restarting
the server clears all stored workspaces.
