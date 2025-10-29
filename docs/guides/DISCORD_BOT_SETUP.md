# Discord Bot Setup for Badge Display

Your dashboard now uses the **official Discord API** to fetch badge data!

## 📝 Step 1: Create a Discord Bot

1. Go to: https://discord.com/developers/applications
2. Click **"New Application"**
3. Give it a name (e.g., "MY HUB Dashboard")
4. Click **Create**

## 🤖 Step 2: Create a Bot

1. In your application, go to the **"Bot"** tab (left sidebar)
2. Click **"Add Bot"**
3. Confirm by clicking **"Yes, do it!"**

## 🔑 Step 3: Get Your Bot Token

1. Under the bot settings, find **"TOKEN"**
2. Click **"Reset Token"**
3. Click **"Copy"** to copy your bot token
4. **⚠️ Keep this token SECRET! Never share it or commit it to git!**

## 🔧 Step 4: Add Configuration to `.env`

Open your `.env` file and add these lines:

```env
# Discord Bot Token (keep this secret!)
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Your Discord User ID (find it by right-clicking your profile in Discord with Developer Mode on)
VITE_DISCORD_USER_ID=850726663289700373
```

**Replace:**

- `YOUR_BOT_TOKEN_HERE` with the bot token you copied
- `850726663289700373` with your Discord user ID

### How to Find Your Discord User ID:

1. Open Discord
2. Go to **Settings** → **Advanced**
3. Enable **Developer Mode**
4. Right-click your username anywhere
5. Click **Copy User ID**

## ✅ Step 5: Enable Required Intents (Optional)

In the Discord Developer Portal:

1. Go to **"Bot"** tab
2. Scroll down to **"Privileged Gateway Intents"**
3. You don't need to enable any intents for basic user info

## 🎯 Step 6: Bot Permissions

Your bot needs **NO permissions** and doesn't need to be in any servers!

The bot token is only used to authenticate API requests to fetch public user data.

## 🚀 Step 7: Test It

1. Make sure your `.env` has the `DISCORD_BOT_TOKEN`
2. Restart your dev servers: `npm run dev`
3. Open http://localhost:1500
4. Your badges should now load from the official Discord API!

## 🔍 What Data We Fetch

Using endpoint: `https://discord.com/api/v10/users/{user_id}`

**Returns:**

- ✅ User ID, username, discriminator
- ✅ Avatar and banner URLs
- ✅ Public flags (badges)
  - Staff, Partner, HypeSquad, Bug Hunter
  - Early Supporter, Verified Developer
  - Active Developer, etc.

**Does NOT return:**

- ❌ Nitro subscription status
- ❌ Server boost status
- ❌ Clan badges
- ❌ Premium info

_(These require OAuth or different endpoints)_

## 🛡️ Security Notes

- ✅ Bot token is stored in `.env` (already in `.gitignore`)
- ✅ Token is only used server-side
- ✅ Never exposed to the frontend/browser
- ✅ Only fetches public user data

## 📚 Official Discord API Documentation

- Discord Developer Portal: https://discord.com/developers/docs
- User Object: https://discord.com/developers/docs/resources/user
- User Flags: https://discord.com/developers/docs/resources/user#user-object-user-flags

---

**Need help?** Check the Discord Developer Portal or the API docs!
