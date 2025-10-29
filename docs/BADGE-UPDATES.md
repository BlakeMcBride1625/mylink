# Badge Auto-Update System

This document explains how to set up automatic daily badge updates for MY HUB.

## Overview

The badge update system consists of three scripts:

1. **`download-all-badges.sh`** - Downloads all Discord badge assets from:

   - [Discord Resources](https://discordresources.com/resources/official-badges/)
   - [mezotv/discord-badges](https://github.com/mezotv/discord-badges) (GitHub)

2. **`check-badge-changes.js`** - Monitors your Discord profile for badge changes and logs them

3. **`daily-badge-update.sh`** - Master script that runs both of the above

## Quick Start

### Manual Run

Test the scripts manually first:

```bash
# Download all badges
./scripts/download-all-badges.sh

# Check for badge changes
node scripts/check-badge-changes.js

# Run both (daily update)
./scripts/daily-badge-update.sh
```

### Set Up Daily Automatic Updates

#### Option 1: macOS/Linux (Cron)

1. **Open your crontab:**

   ```bash
   crontab -e
   ```

2. **Add this line** (runs daily at 3 AM):

   ```bash
   0 3 * * * cd "/Volumes/Coding Projects/MyLink" && ./scripts/daily-badge-update.sh >> /tmp/myhub-badge-update.log 2>&1
   ```

3. **Save and exit** (ESC, then `:wq` in vim)

4. **Verify it was added:**
   ```bash
   crontab -l
   ```

#### Option 2: macOS (Launch Agent)

Create a Launch Agent for more reliable scheduling on macOS:

1. **Create the plist file:**

   ```bash
   cat > ~/Library/LaunchAgents/uk.epildevconnect.myhub.badges.plist << 'EOF'
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
       <key>Label</key>
       <string>uk.epildevconnect.myhub.badges</string>
       <key>ProgramArguments</key>
       <array>
           <string>/Volumes/Coding Projects/MyLink/scripts/daily-badge-update.sh</string>
       </array>
       <key>WorkingDirectory</key>
       <string>/Volumes/Coding Projects/MyLink</string>
       <key>StandardOutPath</key>
       <string>/tmp/myhub-badge-update.log</string>
       <key>StandardErrorPath</key>
       <string>/tmp/myhub-badge-update.error.log</string>
       <key>StartCalendarInterval</key>
       <dict>
           <key>Hour</key>
           <integer>3</integer>
           <key>Minute</key>
           <integer>0</integer>
       </dict>
       <key>RunAtLoad</key>
       <false/>
   </dict>
   </plist>
   EOF
   ```

2. **Load the agent:**

   ```bash
   launchctl load ~/Library/LaunchAgents/uk.epildevconnect.myhub.badges.plist
   ```

3. **Test it manually:**

   ```bash
   launchctl start uk.epildevconnect.myhub.badges
   ```

4. **Check logs:**
   ```bash
   tail -f /tmp/myhub-badge-update.log
   ```

#### Option 3: Windows (Task Scheduler)

1. Open **Task Scheduler**
2. Click **Create Basic Task**
3. Name: `MY HUB Badge Updates`
4. Trigger: **Daily** at **3:00 AM**
5. Action: **Start a program**
   - Program: `bash.exe` (from Git Bash or WSL)
   - Arguments: `/c/path/to/MyLink/scripts/daily-badge-update.sh`
   - Start in: `C:\path\to\MyLink`

## Badge History

Badge changes are tracked in `data/badge-history.json`:

```json
{
  "badges": ["nitro_gold", "hypesquad_online_house_1", "active_developer"],
  "lastChecked": "2025-10-29T12:00:00.000Z",
  "history": [
    {
      "timestamp": "2025-10-29T12:00:00.000Z",
      "added": ["quest_completed"],
      "removed": [],
      "badges": ["nitro_gold", "hypesquad_online_house_1", "active_developer", "quest_completed"]
    }
  ]
}
```

## What Gets Downloaded

The script downloads **all available Discord badges**:

### General Badges (17)

- Quest, Staff, Partner, HypeSquad (all houses), Bug Hunter (1 & 2)
- Active Developer, Early Supporter, Verified Developer, Moderator Alumni
- Nitro, Automod, Commands Support, etc.

### Nitro Subscription Tiers (8)

- Bronze, Silver, Gold, Platinum, Diamond, Emerald, Ruby, Fire

### Server Boost Tiers (9)

- Levels 1-9 (1 month to 2 years)

### Special Badges

- Apprentice (Orb), Username Legacy, Lootbox, etc.

## Troubleshooting

### Script won't run

```bash
# Make sure scripts are executable
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

### Can't fetch badges

- Check if backend is running: `http://localhost:1600/health`
- Verify `.env` has `DISCORD_BOT_TOKEN` and `VITE_DISCORD_USER_ID`

### Cron not working

```bash
# Check cron logs (macOS)
log show --predicate 'process == "cron"' --last 1h

# Check system logs
tail -f /var/log/system.log | grep cron
```

### Launch Agent not working

```bash
# Check if loaded
launchctl list | grep myhub

# Unload and reload
launchctl unload ~/Library/LaunchAgents/uk.epildevconnect.myhub.badges.plist
launchctl load ~/Library/LaunchAgents/uk.epildevconnect.myhub.badges.plist
```

## Manual Badge Updates

If you want to manually update specific badges:

```bash
# Download a specific badge
curl -o public/badges/mybadge.svg https://discordresources.com/img/mybadge.svg

# Check current badges
node scripts/check-badge-changes.js
```

## Logs

Check the logs to see what happened:

```bash
# Cron logs
tail -f /tmp/myhub-badge-update.log

# Launch Agent logs
tail -f /tmp/myhub-badge-update.log
tail -f /tmp/myhub-badge-update.error.log
```

## Configuration

Edit `.env` to configure:

```env
# Required for badge checking
DISCORD_BOT_TOKEN=your_bot_token
VITE_DISCORD_USER_ID=850726663289700373

# Optional: Custom backend URL
BACKEND_URL=http://localhost:1600
```

## Disabling Auto-Updates

### Cron

```bash
crontab -e
# Comment out or delete the line
```

### Launch Agent (macOS)

```bash
launchctl unload ~/Library/LaunchAgents/uk.epildevconnect.myhub.badges.plist
rm ~/Library/LaunchAgents/uk.epildevconnect.myhub.badges.plist
```

## Notes

- Badge assets are downloaded to `public/badges/`
- Badge history is saved to `data/badge-history.json`
- The script keeps the last 30 badge changes in history
- All times are in your local timezone
- Internet connection required for badge downloads
- Backend must be running for badge change detection

---

For more information, see:

- [Discord Resources Badge List](https://discordresources.com/resources/official-badges/)
- [mezotv/discord-badges GitHub](https://github.com/mezotv/discord-badges)
