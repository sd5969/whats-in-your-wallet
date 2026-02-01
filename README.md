# MERN Credit Card Value Studio

A full stack MERN app for comparing credit card value with configurable annual
spend, benefits, and card assignments.

## Table of contents

- [Structure](#structure)
- [Setup](#setup)
- [Storage behavior](#storage-behavior)
- [Deployment (Ubuntu + Apache)](#deployment-ubuntu--apache)
  - [1) Build and place the client](#1-build-and-place-the-client)
  - [2) Configure the client API base](#2-configure-the-client-api-base)
  - [Example build + deploy command](#example-build--deploy-command)
  - [3) Run the server as a systemd service](#3-run-the-server-as-a-systemd-service)
  - [4) Apache reverse proxy configuration](#4-apache-reverse-proxy-configuration)
  - [Subfolder hosting example](#subfolder-hosting-example)

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
`/card_studio/services/` so that the Express routes can still use `/api/...`
(`GET /api/state`, `PUT /api/state`, etc.).

### 1) Build and place the client

```bash
cd client
npm install
npm run build
```

Copy `client/dist` to your Apache document root for the site, e.g.
`/var/www/card_studio/`.

If you want to host the UI under a subfolder (e.g. `https://abc.com/test/`),
set a base path before building:

```
VITE_BASE_PATH=/test/
```

Then rebuild the client so asset paths are generated with the subfolder prefix.

### 2) Configure the client API base

Set the client API base to the proxied subpath:

```
VITE_API_URL=/card_studio/services
```

Rebuild the client after changing the value.

#### Example build + deploy command

If you want a one-liner to build and deploy the UI to an Apache doc root:

```bash
cd client
VITE_BASE_PATH=/card_studio/ npm run build && \
  rm -r /path/to/apache/docroot/card_studio && \
  cp -r dist /path/to/apache/docroot/card_studio && \
  cp .env /path/to/apache/docroot/card_studio
```

Replace `/path/to/apache/docroot` with your Apache document root. The `.env`
copy is optional if you want the environment file alongside the deployed
assets.

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

#### Subfolder hosting example

If you want the UI at `https://abc.com/test/`, set `VITE_BASE_PATH=/test/`
and use an Apache alias. Example snippet:

```
Alias /test/ /var/www/card_studio/

<Directory /var/www/card_studio>
  Options FollowSymLinks
  AllowOverride None
  Require all granted
</Directory>

RewriteEngine On
RewriteCond %{REQUEST_URI} ^/test/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^/test/ /test/index.html [L]
```
