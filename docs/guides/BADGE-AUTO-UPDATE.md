# 🎨 Badge Auto-Update System - Quick Start

Automatically download all Discord badges and check for profile badge changes daily.

## ⚡ Quick Commands

```bash
# Download all available badges (23+ files)
npm run badges:download

# Check if your badges have changed
npm run badges:check

# Run both (daily update)
npm run badges:update
```

## 🤖 Set Up Daily Auto-Updates

### macOS/Linux - Cron Job

Add this to your crontab (`crontab -e`):

```bash
0 3 * * * cd "/Volumes/Coding Projects/MyLink" && npm run badges:update >> /tmp/myhub-badge-update.log 2>&1
```

This runs every day at 3:00 AM.

### Windows - Task Scheduler

1. Open Task Scheduler
2. Create Basic Task: "MY HUB Badge Updates"
3. Trigger: Daily at 3:00 AM
4. Action: Start Program
   - Program: `bash.exe`
   - Arguments: `-c "cd '/path/to/MyLink' && npm run badges:update"`

## 📦 What Gets Downloaded

- ✅ **23+ General Badges** (Staff, Partner, HypeSquad, Bug Hunter, Active Developer, etc.)
- ✅ **8 Nitro Subscription Tiers** (Bronze → Fire)
- ✅ **9 Server Boost Levels** (1 month → 2 years)
- ✅ **Special Badges** (Apprentice, Quest, etc.)

All badges saved to: `public/badges/`

## 🔍 Badge Change Detection

The system tracks your Discord profile badges and logs any changes:

```json
{
  "badges": ["nitro_gold", "hypesquad_online_house_1", "active_developer"],
  "lastChecked": "2025-10-29T12:00:00.000Z",
  "history": [...]
}
```

Saved to: `data/badge-history.json`

## 📋 Check Logs

```bash
# View update logs
tail -f /tmp/myhub-badge-update.log

# Check badge history
cat data/badge-history.json | json_pp
```

## 🛠️ Troubleshooting

**Scripts won't run?**

```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

**Backend not found?**

- Make sure backend is running: `npm run dev:backend`
- Check `.env` has `DISCORD_BOT_TOKEN` and `VITE_DISCORD_USER_ID`

**Cron not working?**

```bash
# Check cron is running
ps aux | grep cron

# View cron logs
tail -f /var/log/syslog | grep cron  # Linux
log show --predicate 'process == "cron"' --last 1h  # macOS
```

## 📚 Full Documentation

See [`docs/BADGE-UPDATES.md`](./docs/BADGE-UPDATES.md) for:

- macOS Launch Agent setup (more reliable than cron)
- Advanced configuration
- Manual badge updates
- Detailed troubleshooting

## 🌐 Badge Resources

- [Discord Resources Badge List](https://discordresources.com/resources/official-badges/)
- [mezotv/discord-badges](https://github.com/mezotv/discord-badges) (GitHub)

---

**Ready to go!** Your badges will now update automatically every day. 🎉
