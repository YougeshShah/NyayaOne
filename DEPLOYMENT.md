# NyayaOne — Production Deployment (Single Server)

Covers 0–10 organizations. A 4 vCPU / 8GB RAM Ubuntu 24.04 server is enough
to start (matches the "Option 1: Single Server (Best for MVP)" spec).

## 1. Server Prerequisites

```bash
# On a fresh Ubuntu 24.04 server:
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

## 2. Get the Code onto the Server

Copy/clone the `nyayaone/` folder (backend, company-web, law-firm-web,
student-web, docker-compose.prod.yml, reverse-proxy.conf) onto the server.

## 3. Configure Environment

```bash
cd nyayaone
cp .env.prod.example .env.prod
nano .env.prod
```
Fill in a strong `DB_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
(long random strings — `openssl rand -hex 32` generates one). Leave
`ANTHROPIC_API_KEY` and payment gateway keys blank until you're ready to
turn those on — the app works fine without them (Chatbot/Content Generator
just show a "not configured" message).

## 4. Point Your Domain

Once you own a domain, add these DNS **A records**, all pointing at your
server's IP:
```
api.yourdomain.com
admin.yourdomain.com
firm.yourdomain.com
learn.yourdomain.com
```

Then find-and-replace `yourdomain.com` with your real domain in:
- `reverse-proxy.conf` (4 places)
- `docker-compose.prod.yml` (3 `VITE_API_BASE_URL` lines)

## 5. Build and Start

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First run takes a few minutes (building 4 images). Check everything is up:
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

## 6. Seed Initial Data

```bash
docker compose -f docker-compose.prod.yml exec backend npx ts-node prisma/seed.ts
```

## 7. Add HTTPS (Free, via Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d admin.yourdomain.com -d firm.yourdomain.com -d learn.yourdomain.com
```
(Run this on the host, not inside a container, or adapt with the certbot
Docker image — either works. Certbot auto-renews via a systemd timer.)

## Redeploying After Code Changes

```bash
git pull   # or copy over updated files
docker compose -f docker-compose.prod.yml up -d --build
```
Migrations run automatically on backend startup (`prisma migrate deploy`).

## Backups

```bash
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U nyayaone nyayaone_db > backup-$(date +%F).sql
```
Run this on a cron schedule and copy backups off-server (e.g. to
Backblaze B2 / any S3-compatible storage).

## When You Outgrow One Server

This setup covers the MVP stage. When usage grows past what one server
handles comfortably, the next steps are (in order): move Postgres to a
managed database service, move uploaded files to object storage (Cloudflare
R2 / Backblaze B2), then split the busiest services onto their own servers.
No code changes needed for any of this — only infrastructure.
