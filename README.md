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

## Deployment (Ubuntu + Apache)

This app works well with Apache serving the static client and proxying API
requests to the Node server. The API is mounted at
`/card_stuio/services/` so that the Express routes can still use `/api/...`
(`GET /api/state`, `PUT /api/state`, etc.).

### 1) Build and place the client

```bash
cd client
npm install
npm run build
```

Copy `client/dist` to your Apache document root for the site, e.g.
`/var/www/card_studio/`.

### 2) Configure the client API base

Set the client API base to the proxied subpath:

```
VITE_API_URL=/card_stuio/services
```

Rebuild the client after changing the value.

### 3) Run the server as a systemd service

Example `/etc/systemd/system/card-studio.service`:

```
[Unit]
Description=Card Studio API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/card-studio/server
Environment=NODE_ENV=production
Environment=PORT=5050
Environment=SESSION_SECRET=replace-me
Environment=CLIENT_ORIGIN=https://your-domain.example
ExecStart=/usr/bin/node /opt/card-studio/server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now card-studio
```

### 4) Apache reverse proxy configuration

Enable proxy modules (Ubuntu):

```bash
sudo a2enmod proxy proxy_http headers rewrite
sudo systemctl restart apache2
```

Example Apache vhost snippet:

```
<VirtualHost *:80>
  ServerName your-domain.example
  DocumentRoot /var/www/card_studio

  <Directory /var/www/card_studio>
    Options FollowSymLinks
    AllowOverride None
    Require all granted
  </Directory>

  # Serve the React app (single-page app fallback)
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ /index.html [L]

  # Proxy API to Node
  ProxyPreserveHost On
  ProxyPass /card_studio/services/ http://127.0.0.1:5050/
  ProxyPassReverse /card_studio/services/ http://127.0.0.1:5050/
</VirtualHost>
```

Notes:
- The trailing slash matters for `ProxyPass` mappings.
- If you use HTTPS, place the proxy config in your SSL vhost block.
