# ☁️ Cloudflare Setup Guide

Complete guide for deploying MY HUB with Cloudflare for DNS, CDN, and SSL.

---

## 🎯 **What Cloudflare Provides**

✅ **DNS Management** - Point your domain to your server  
✅ **CDN (Content Delivery Network)** - Faster global access  
✅ **SSL/TLS Certificates** - Free HTTPS encryption  
✅ **DDoS Protection** - Security against attacks  
✅ **Caching** - Improved performance  
✅ **Analytics** - Traffic insights

---

## 📋 **Prerequisites**

- [ ] Domain name purchased (e.g., `epildevconnect.uk`)
- [ ] Server/VPS with Docker installed
- [ ] Cloudflare account (free tier is fine)

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Add Your Domain to Cloudflare**

1. Go to https://dash.cloudflare.com/
2. Click **"Add a Site"**
3. Enter your domain: `epildevconnect.uk`
4. Select **Free Plan**
5. Click **"Add Site"**

Cloudflare will scan your existing DNS records.

---

### **Step 2: Update Nameservers**

1. Cloudflare will provide 2 nameservers like:

   ```
   cora.ns.cloudflare.com
   duke.ns.cloudflare.com
   ```

2. Go to your domain registrar (where you bought the domain)
3. Find DNS/Nameserver settings
4. Replace existing nameservers with Cloudflare's
5. Save changes

⏰ **Wait 24-48 hours** for DNS propagation (usually takes 1-2 hours)

---

### **Step 3: Configure DNS Records**

In Cloudflare Dashboard → DNS → Records:

#### **Developer Subdomain (A Record) - FOR MY HUB**

```
Type: A
Name: developer
IPv4 address: YOUR_SERVER_IP
Proxy status: Proxied (orange cloud)
TTL: Auto
```

This will make your site accessible at: `https://developer.epildevconnect.uk/myhub/`

#### **Main Website (Optional - if you have other content)**

```
Type: A
Name: @
IPv4 address: YOUR_SERVER_IP
Proxy status: Proxied (orange cloud)
TTL: Auto
```

#### **WWW Subdomain (Optional)**

```
Type: CNAME
Name: www
Target: epildevconnect.uk
Proxy status: Proxied (orange cloud)
TTL: Auto
```

---

### **Step 4: SSL/TLS Configuration**

1. Go to **SSL/TLS** tab
2. Select **Full (strict)** encryption mode
3. Go to **SSL/TLS → Edge Certificates**
4. Enable:
   - ✅ **Always Use HTTPS**
   - ✅ **Automatic HTTPS Rewrites**
   - ✅ **Minimum TLS Version**: TLS 1.2

---

### **Step 5: Page Rules (Optional but Recommended)**

Create page rules for better performance:

#### **Force HTTPS**

```
URL: http://developer.epildevconnect.uk/*
Setting: Always Use HTTPS
```

#### **Cache Everything** (for static assets)

```
URL: developer.epildevconnect.uk/myhub/assets/*
Settings:
- Cache Level: Cache Everything
- Edge Cache TTL: 1 month
```

---

### **Step 6: Firewall Rules (Security)**

1. Go to **Security → WAF**
2. Enable **Managed Rules**
3. Set **Security Level**: Medium

Optional - Block specific countries or IPs:

```
(ip.geoip.country ne "GB" and ip.geoip.country ne "US")
Action: Challenge
```

---

### **Step 7: Speed Optimization**

#### **Auto Minify**

Go to **Speed → Optimization**:

- ✅ JavaScript
- ✅ CSS
- ✅ HTML

#### **Brotli Compression**

- ✅ Enable Brotli

#### **HTTP/2 & HTTP/3**

- ✅ Enable HTTP/2
- ✅ Enable HTTP/3 (QUIC)

---

## 🐳 **Docker + Cloudflare Integration**

### **Update Your `.env` for Production**

```env
# Production URLs - deployed at developer.epildevconnect.uk/myhub/
DISCORD_REDIRECT_URI=https://developer.epildevconnect.uk/myhub/auth/callback
FRONTEND_PORT=1500
BACKEND_PORT=1600

# Cloudflare will proxy port 80/443, but internally you use 1500/1600
```

### **Nginx Reverse Proxy (on your server)**

Use the provided `nginx-myhub.conf` file. Copy it to your server:

```bash
# On your server
sudo cp nginx-myhub.conf /etc/nginx/sites-available/myhub
sudo ln -s /etc/nginx/sites-available/myhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Key configuration points:**

- MY HUB runs at `/myhub/` subdirectory
- Frontend served from `localhost:1500`
- Backend API at `localhost:1600`
- Real IP captured from Cloudflare headers
- Proper URL rewriting for subdirectory deployment

Add to `docker-compose.yml`:

```yaml
nginx:
  image: nginx:alpine
  container_name: myhub-nginx
  restart: unless-stopped
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - ./nginx.conf:/etc/nginx/conf.d/default.conf
    - ./ssl:/etc/nginx/ssl # For SSL certs if not using Cloudflare proxy
  depends_on:
    - myhub
  networks:
    - myhub-network
```

---

## ✅ **Verification Checklist**

After setup, verify everything works:

- [ ] `https://developer.epildevconnect.uk/myhub/` loads your site
- [ ] SSL certificate shows "Secure" in browser
- [ ] Discord OAuth redirects work correctly
- [ ] API endpoints respond (test contact form)
- [ ] Real-time features work (Discord presence, Last.fm, WakaTime)
- [ ] Check Cloudflare Analytics for traffic

---

## 🔧 **Troubleshooting**

### **Site not loading**

- Check DNS propagation: https://www.whatsmydns.net/
- Verify server IP is correct in Cloudflare DNS
- Check server firewall allows ports 80 and 443

### **SSL errors**

- Ensure SSL mode is **Full (strict)**
- Check that your server has proper SSL certificates
- If using Cloudflare proxy, ensure origin server supports SSL

### **Discord OAuth not working**

- Update `DISCORD_REDIRECT_URI` in Discord Developer Portal
- Must match exactly: `https://developer.epildevconnect.uk/myhub/auth/callback`
- Update `.env` file with same URL
- Clear browser cache and cookies

### **API calls failing**

- Check Cloudflare Firewall logs for blocked requests
- Verify WAF rules aren't blocking legitimate traffic
- Test API directly: `curl https://developer.epildevconnect.uk/myhub/api/health`

### **Real IP not logged**

- Make sure Nginx uses `$http_cf_connecting_ip` header
- Cloudflare sends real IP in `CF-Connecting-IP` header

---

## 📊 **Cloudflare Analytics**

Monitor your site's performance:

1. Go to **Analytics & Logs → Web Analytics**
2. View:
   - Traffic (requests, bandwidth)
   - Security threats blocked
   - Cache hit rate
   - Performance insights

---

## 🔐 **Security Best Practices**

1. ✅ Enable **Under Attack Mode** if experiencing DDoS
2. ✅ Use **Rate Limiting** for API endpoints
3. ✅ Set up **Email Routing** for custom domain emails
4. ✅ Enable **Bot Fight Mode** to block malicious bots
5. ✅ Use **Zero Trust** for admin access (optional)

---

## 💰 **Cost**

- **Cloudflare Free Tier**: $0/month
  - Unlimited bandwidth
  - Global CDN
  - SSL certificates
  - Basic DDoS protection
  - Limited page rules (3)

Perfect for personal projects!

---

## 📖 **Additional Resources**

- [Cloudflare Docs](https://developers.cloudflare.com/)
- [DNS Management Guide](https://support.cloudflare.com/hc/en-us/articles/360019093151)
- [SSL/TLS Guide](https://developers.cloudflare.com/ssl/)
- [Nginx + Cloudflare](https://support.cloudflare.com/hc/en-us/articles/200170786)

---

**Your site will be fast, secure, and globally distributed! 🚀**
