# Deployment Guide

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are configured
- [ ] Discord OAuth redirect URIs include production URL
- [ ] SSL/TLS certificates are installed
- [ ] Cloudflare is configured
- [ ] Firewall rules allow necessary ports
- [ ] Domain DNS is properly configured
- [ ] Backup strategy is in place

## Deployment Methods

### Method 1: Docker Compose (Recommended)

This is the simplest and most reliable deployment method.

#### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### Step 2: Clone Repository

```bash
cd /opt
sudo git clone <your-repo-url> myhub
cd myhub
sudo chown -R $USER:$USER .
```

#### Step 3: Configure Environment

```bash
cp .env.example .env
nano .env
# Fill in all production values
```

#### Step 4: Deploy

```bash
# Build and start
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify health
curl http://localhost:1600/health
```

#### Step 5: Set Up Auto-Start

```bash
# Enable Docker service
sudo systemctl enable docker

# Docker Compose will automatically restart containers
```

### Method 2: PM2 (Node.js Process Manager)

For deployment without Docker.

#### Step 1: Install PM2

```bash
npm install -g pm2
```

#### Step 2: Build Application

```bash
npm run build
```

#### Step 3: Create PM2 Ecosystem File

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "myhub-backend",
      script: "server/index.ts",
      interpreter: "node",
      interpreter_args: "--loader tsx",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      env_file: ".env",
    },
  ],
};
```

#### Step 4: Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on boot
pm2 startup
# Run the command it outputs
```

#### Step 5: Serve Frontend

Use nginx to serve the built frontend from the `dist` folder.

### Method 3: Systemd Service

For maximum control and integration with system services.

#### Step 1: Create Service File

```bash
sudo nano /etc/systemd/system/myhub.service
```

```ini
[Unit]
Description=MY HUB Application
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/opt/myhub
EnvironmentFile=/opt/myhub/.env
ExecStart=/usr/bin/node --loader tsx server/index.ts
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### Step 2: Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable myhub
sudo systemctl start myhub
sudo systemctl status myhub
```

## Nginx Configuration

### Basic Configuration

```nginx
server {
    listen 80;
    server_name developer.epildevconnect.uk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name developer.epildevconnect.uk;

    ssl_certificate /etc/letsencrypt/live/developer.epildevconnect.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/developer.epildevconnect.uk/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location /myhub {
        alias /opt/myhub/dist;
        try_files $uri $uri/ /myhub/index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:1600;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Auth endpoints
    location /auth {
        proxy_pass http://localhost:1600;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Configure Site

```bash
# Create configuration
sudo nano /etc/nginx/sites-available/myhub

# Enable site
sudo ln -s /etc/nginx/sites-available/myhub /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d developer.epildevconnect.uk

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

## Cloudflare Integration

### Step 1: Add Site to Cloudflare

1. Go to https://dash.cloudflare.com
2. Click "Add a Site"
3. Enter your domain
4. Choose plan (Free is sufficient)
5. Update nameservers at your domain registrar

### Step 2: DNS Configuration

Add these DNS records:

```
Type: A
Name: @
Content: your_server_ip
Proxy: Enabled (orange cloud)

Type: CNAME
Name: developer
Content: yourdomain.com
Proxy: Enabled (orange cloud)
```

### Step 3: SSL/TLS Settings

1. Go to SSL/TLS tab
2. Set SSL/TLS encryption mode to "Full" or "Full (strict)"
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

### Step 4: Speed Optimization

1. **Auto Minify**: Enable for HTML, CSS, JS
2. **Brotli**: Enable
3. **Rocket Loader**: Optional (test with your site)
4. **Caching**: Set up page rules

Example page rule for `/myhub/*`:

- Cache Level: Standard
- Browser Cache TTL: 4 hours
- Edge Cache TTL: 2 hours

### Step 5: Security

1. Enable "Bot Fight Mode"
2. Set Security Level to "Medium"
3. Enable "Email Obfuscation"
4. Configure Firewall Rules if needed

## Monitoring & Logging

### Docker Logs

```bash
# View logs
docker-compose logs -f myhub

# Save logs to file
docker-compose logs > logs.txt

# Last 100 lines
docker-compose logs --tail=100 myhub
```

### System Logs

```bash
# Journalctl (systemd)
sudo journalctl -u myhub -f

# PM2 logs
pm2 logs myhub-backend
```

### Set Up Log Rotation

Create `/etc/logrotate.d/myhub`:

```
/var/log/myhub/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Health Monitoring

Create a simple monitoring script:

```bash
#!/bin/bash
# /opt/scripts/check-myhub.sh

HEALTH_URL="http://localhost:1600/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "MY HUB is down! Status: $RESPONSE"
    # Restart service
    docker-compose -f /opt/myhub/docker-compose.yml restart
    # Or: systemctl restart myhub
fi
```

Add to crontab:

```bash
crontab -e
# Check every 5 minutes
*/5 * * * * /opt/scripts/check-myhub.sh
```

## Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
# /opt/scripts/backup-myhub.sh

BACKUP_DIR="/backups/myhub"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup environment file
cp /opt/myhub/.env $BACKUP_DIR/env_$DATE

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /opt/myhub/package.json \
    /opt/myhub/docker-compose.yml \
    /opt/myhub/tsconfig.json \
    /opt/myhub/vite.config.ts

# Remove backups older than 30 days
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /opt/scripts/backup-myhub.sh
```

## Updating Application

### Docker Deployment

```bash
cd /opt/myhub

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose logs -f
```

### PM2 Deployment

```bash
cd /opt/myhub

# Pull changes
git pull

# Install dependencies
npm install

# Rebuild
npm run build

# Restart
pm2 restart ecosystem.config.js
```

## Rollback Procedure

### Docker

```bash
# Stop current deployment
docker-compose down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild
docker-compose build
docker-compose up -d
```

### PM2

```bash
git checkout <previous-commit-hash>
npm install
npm run build
pm2 restart ecosystem.config.js
```

## Performance Optimization

### Enable Compression

In nginx:

```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### Database Query Optimization

If you add a database later, ensure:

- Proper indexing
- Connection pooling
- Query optimization

### CDN for Static Assets

Consider using Cloudflare R2 or AWS S3 for:

- Images
- Fonts
- Large static files

## Troubleshooting Production Issues

### Container Won't Start

```bash
# Check logs
docker-compose logs myhub

# Check Docker status
docker ps -a

# Rebuild
docker-compose build --no-cache
```

### High Memory Usage

```bash
# Check memory
docker stats

# Restart container
docker-compose restart
```

### API Not Responding

```bash
# Check if backend is running
curl http://localhost:1600/health

# Check nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Security Best Practices

1. **Keep system updated**:

```bash
sudo apt update && sudo apt upgrade -y
```

2. **Use UFW firewall**:

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. **Disable root SSH**:

```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

4. **Set up fail2ban**:

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

5. **Regular security audits**:

```bash
npm audit
npm audit fix
```

## Support

For deployment issues:

1. Check logs first
2. Review this documentation
3. Check GitHub issues
4. Contact via Discord: @epildev
