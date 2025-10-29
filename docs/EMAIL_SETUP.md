# 📧 Email Setup Guide (SMTP Configuration)

## ⚠️ **Required for Contact Form to Work**

The contact form uses **Nodemailer** to send emails, which requires SMTP credentials. Without these, the form will show "Failed to send message."

---

## 🚀 **Quick Setup (Gmail)**

### Step 1: Create `.env` File

In your project root (`/Volumes/Coding Projects/MyLink/`), create a file named `.env`:

```bash
# In terminal:
touch .env
```

### Step 2: Add SMTP Configuration to `.env`

```env
# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=blakemcbride1625@gmail.com
SMTP_PASS=your_gmail_app_password_here
```

### Step 3: Get Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Google account (`blakemcbride1625@gmail.com`)
3. Create a new app password:
   - **App**: Mail
   - **Device**: Custom (enter "MY HUB")
4. Google will generate a 16-character password like: `xxxx xxxx xxxx xxxx`
5. Copy this password (remove spaces)
6. Paste it as `SMTP_PASS` in your `.env` file

**Example:**

```env
SMTP_PASS=abcdabcdabcdabcd
```

### Step 4: Restart Servers

```bash
# Stop current servers (Ctrl+C)
# Then restart:
npm run dev
```

✅ **Done!** Your contact form will now send emails successfully.

---

## 📋 **Full `.env` File Template**

Here's a complete `.env` file with all required variables:

```env
# ========================================
# Server Ports
# ========================================
FRONTEND_PORT=1500
BACKEND_PORT=1600

# ========================================
# Session Security
# ========================================
SESSION_SECRET=your-super-secret-session-key-change-this

# ========================================
# Discord OAuth2
# ========================================
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:1500/auth/callback
VITE_DISCORD_USER_ID=850726663289700373
ADMIN_DISCORD_ID=850726663289700373
DISCORD_BOT_TOKEN=your_discord_bot_token

# ========================================
# Email Configuration (REQUIRED FOR CONTACT FORM)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=blakemcbride1625@gmail.com
SMTP_PASS=your_gmail_app_password_here

# ========================================
# API Keys
# ========================================
LASTFM_API_KEY=your_lastfm_api_key
LASTFM_USERNAME=your_lastfm_username
WAKATIME_API_KEY=your_wakatime_api_key

# ========================================
# Database (PostgreSQL)
# ========================================
POSTGRES_USER=admin
POSTGRES_PASSWORD=25Epildev-db25.
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myhub_db
```

---

## 🔧 **Alternative SMTP Providers**

### **Outlook / Hotmail**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your_outlook_password
```

### **Yahoo Mail**

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your_yahoo_app_password
```

### **Custom SMTP Server**

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_smtp_password
```

---

## 🧪 **Testing**

After setup:

1. Restart your dev servers: `npm run dev`
2. Go to http://localhost:1500/contact
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Testing
   - Message: Test message
4. Click "Send Message"

**Expected Result:**

- ✅ Success message appears
- ✅ You receive the email at `blakemcbride1625@gmail.com`
- ✅ Test user receives confirmation email at their address

---

## ❌ **Common Issues**

### "Failed to send message"

- **Cause**: SMTP credentials not set or incorrect
- **Fix**: Double-check `.env` file and app password

### "Invalid login"

- **Cause**: Using regular password instead of app password (Gmail)
- **Fix**: Generate app password at https://myaccount.google.com/apppasswords

### "Connection timeout"

- **Cause**: Firewall blocking port 587
- **Fix**: Check firewall settings or try port 465 with `secure: true`

### "535 Authentication failed"

- **Cause**: Wrong username or password
- **Fix**: Verify credentials are correct

---

## 🔐 **Security Notes**

1. ✅ `.env` file is in `.gitignore` (not committed to Git)
2. ✅ Never share your `.env` file publicly
3. ✅ Use app passwords, not your main password
4. ✅ For production, use environment variables (not `.env` file)

---

## 📖 **References**

- [Gmail App Passwords](https://myaccount.google.com/apppasswords)
- [Nodemailer Documentation](https://nodemailer.com/)
- [SMTP Port Reference](https://www.mailgun.com/blog/email/which-smtp-port-understanding-ports-25-465-587/)

---

**Need help?** Check the backend logs for detailed error messages.
