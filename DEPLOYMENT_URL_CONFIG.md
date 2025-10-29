# 🌐 Deployment URL Configuration

**Production URL**: `https://developer.epildevconnect.uk/myhub/`

This document explains the specific configuration for deploying MY HUB to a subdomain with a subdirectory path.

---

## 📍 **URL Structure**

```
https://developer.epildevconnect.uk/myhub/
         ↑                            ↑
    Subdomain                   Subdirectory
```

- **Domain**: `epildevconnect.uk`
- **Subdomain**: `developer`
- **Path**: `/myhub/`
- **Full URL**: `https://developer.epildevconnect.uk/myhub/`

---

## ⚙️ **Configuration Changes Made**

### **1. Vite Configuration (`vite.config.ts`)**

✅ **Updated** - Added base path for production builds:

```typescript
base: mode === 'production' ? '/myhub/' : '/',
```

**What this does:**

- All asset paths (CSS, JS, images) will be prefixed with `/myhub/`
- Routes will work correctly in subdirectory
- Development still runs at root `/` for localhost

---

### **2. Nginx Configuration (`nginx-myhub.conf`)**

✅ **Created** - New Nginx config for subdirectory routing:

**Key sections:**

```nginx
# Frontend at /myhub/
location /myhub/ {
    proxy_pass http://localhost:1500/;
    rewrite ^/myhub/(.*) /$1 break;
}

# API at /myhub/api/
location /myhub/api/ {
    proxy_pass http://localhost:1600/api/;
}

# Auth at /myhub/auth/
location /myhub/auth/ {
    proxy_pass http://localhost:1600/auth/;
}
```

**What this does:**

- Strips `/myhub/` prefix before passing to app
- Routes API and Auth requests correctly
- Preserves real IP from Cloudflare

---

### **3. Environment Variables (`.env`)**

⚠️ **YOU MUST UPDATE** these for production:

```env
# CRITICAL: Update Discord OAuth redirect URI
DISCORD_REDIRECT_URI=https://developer.epildevconnect.uk/myhub/auth/callback

# Keep these the same
FRONTEND_PORT=1500
BACKEND_PORT=1600
```

**Also update in Discord Developer Portal:**

1. Go to https://discord.com/developers/applications
2. Select your application
3. Go to OAuth2 → Redirects
4. Add: `https://developer.epildevconnect.uk/myhub/auth/callback`

---

### **4. Cloudflare DNS**

✅ **Setup required** - Add A record for subdomain:

```
Type: A
Name: developer
IPv4 address: YOUR_SERVER_IP
Proxy status: Proxied (orange cloud)
```

**Result**: `developer.epildevconnect.uk` → Your server

---

## 🚀 **Deployment Steps**

### **Step 1: Update Environment**

Create `.env.production` on your server:

```env
# Server
FRONTEND_PORT=1500
BACKEND_PORT=1600
SESSION_SECRET=your-production-secret

# Discord OAuth (CRITICAL!)
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=https://developer.epildevconnect.uk/myhub/auth/callback
VITE_DISCORD_USER_ID=850726663289700373
ADMIN_DISCORD_ID=850726663289700373
DISCORD_BOT_TOKEN=your_bot_token

# Email
SMTP_HOST=smtp.livemail.co.uk
SMTP_PORT=587
SMTP_USER=connectwithme@epildevconnect.uk
SMTP_PASS=your_smtp_password

# APIs
LASTFM_API_KEY=your_key
LASTFM_USERNAME=your_username
WAKATIME_API_KEY=your_key

# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432  # Internal Docker port (external is 1800)
POSTGRES_DB=myhub_db
```

---

### **Step 2: Build for Production**

```bash
# Build frontend with /myhub/ base path
npm run build

# The dist/ folder will have assets at /myhub/assets/*
```

---

### **Step 3: Deploy with Docker**

```bash
# On your server
git clone YOUR_REPO
cd MY-HUB

# Copy your production .env
nano .env

# Copy nginx config
sudo cp nginx-myhub.conf /etc/nginx/sites-available/myhub
sudo ln -s /etc/nginx/sites-available/myhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Start containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

---

### **Step 4: Update Discord Developer Portal**

1. Go to https://discord.com/developers/applications
2. Select your MY HUB application
3. Navigate to **OAuth2 → Redirects**
4. Add redirect URI: `https://developer.epildevconnect.uk/myhub/auth/callback`
5. Click **Save Changes**

---

## ✅ **Testing Checklist**

After deployment, test these URLs:

- [ ] **Homepage**: https://developer.epildevconnect.uk/myhub/
- [ ] **Projects**: https://developer.epildevconnect.uk/myhub/projects
- [ ] **Contact**: https://developer.epildevconnect.uk/myhub/contact
- [ ] **Messages**: https://developer.epildevconnect.uk/myhub/messages
- [ ] **Admin**: https://developer.epildevconnect.uk/myhub/admin
- [ ] **API Health**: https://developer.epildevconnect.uk/myhub/api/health

### **OAuth Test**

1. Go to https://developer.epildevconnect.uk/myhub/messages
2. Click login
3. Should redirect to Discord
4. After auth, should return to https://developer.epildevconnect.uk/myhub/messages

---

## 🔧 **Troubleshooting**

### **Assets not loading (404 errors)**

**Symptom**: CSS/JS files return 404

**Cause**: Base path not configured correctly

**Fix**:

```bash
# Rebuild with production mode
NODE_ENV=production npm run build
```

Verify `vite.config.ts` has:

```typescript
base: mode === 'production' ? '/myhub/' : '/',
```

---

### **Discord OAuth fails**

**Symptom**: "redirect_uri_mismatch" error

**Cause**: Mismatch between `.env` and Discord settings

**Fix**:

1. Check `.env` file:
   ```
   DISCORD_REDIRECT_URI=https://developer.epildevconnect.uk/myhub/auth/callback
   ```
2. Match exactly in Discord Developer Portal
3. Restart backend: `docker-compose restart myhub`

---

### **Routes return 404**

**Symptom**: Navigating to `/projects` returns 404

**Cause**: Nginx not configured for SPA routing

**Fix**: Update `nginx-myhub.conf`:

```nginx
location /myhub/ {
    proxy_pass http://localhost:1500/;
    try_files $uri $uri/ /index.html;
}
```

---

### **API calls fail**

**Symptom**: Network errors in browser console

**Cause**: CORS or proxy misconfiguration

**Fix**:

1. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
2. Verify proxy headers in `nginx-myhub.conf`
3. Check backend CORS settings in `server/index.ts`

---

## 📊 **URL Mapping Reference**

| User Visits           | Nginx Receives        | Proxies To                    | App Sees        |
| --------------------- | --------------------- | ----------------------------- | --------------- |
| `/myhub/`             | `/myhub/`             | `localhost:1500/`             | `/`             |
| `/myhub/projects`     | `/myhub/projects`     | `localhost:1500/projects`     | `/projects`     |
| `/myhub/api/health`   | `/myhub/api/health`   | `localhost:1600/api/health`   | `/api/health`   |
| `/myhub/auth/discord` | `/myhub/auth/discord` | `localhost:1600/auth/discord` | `/auth/discord` |

---

## 🔒 **Security Notes**

1. ✅ All routes require `/myhub/` prefix
2. ✅ Direct access to `localhost:1500` is blocked by firewall
3. ✅ Real IP addresses logged from Cloudflare headers
4. ✅ Rate limiting applies to all `/myhub/*` paths
5. ✅ Session cookies scoped to `/myhub/` path

---

## 📖 **Additional Documentation**

- **Cloudflare Setup**: `docs/CLOUDFLARE_SETUP.md`
- **General Deployment**: `docs/DEPLOYMENT.md`
- **Pre-Deployment Checklist**: `PRE_DEPLOYMENT_CHECKLIST.md`

---

**Your MY HUB will be live at**: `https://developer.epildevconnect.uk/myhub/` 🚀
