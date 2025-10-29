#!/bin/bash

echo "🔧 MY HUB - Environment Setup"
echo ""
echo "This will create your .env file with Gmail SMTP configuration."
echo ""
read -p "Enter your Gmail address (e.g., blakemcbride1625@gmail.com): " EMAIL
echo ""
echo "📝 To get your Gmail App Password:"
echo "   1. Go to https://myaccount.google.com/apppasswords"
echo "   2. Create app password for 'Mail' > 'Custom: MY HUB'"
echo "   3. Copy the 16-character password (no spaces)"
echo ""
read -p "Enter your Gmail App Password: " SMTP_PASS
echo ""

cat > .env << EOL
# MY HUB Environment Variables
FRONTEND_PORT=1500
BACKEND_PORT=1600
SESSION_SECRET=$(openssl rand -base64 32)

# Discord
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:1500/auth/callback
VITE_DISCORD_USER_ID=850726663289700373
ADMIN_DISCORD_ID=850726663289700373
DISCORD_BOT_TOKEN=your_discord_bot_token

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=$EMAIL
SMTP_PASS=$SMTP_PASS

# APIs
LASTFM_API_KEY=your_lastfm_api_key
LASTFM_USERNAME=your_lastfm_username
WAKATIME_API_KEY=your_wakatime_api_key

# Database
POSTGRES_USER=admin
POSTGRES_PASSWORD=25Epildev-db25.
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myhub_db
EOL

echo ""
echo "✅ .env file created successfully!"
echo ""
echo "📧 Email configuration:"
echo "   SMTP_HOST: smtp.gmail.com"
echo "   SMTP_USER: $EMAIL"
echo "   SMTP_PASS: ****${SMTP_PASS: -4}"
echo ""
echo "🔄 Restart your servers with: npm run dev"
echo ""
