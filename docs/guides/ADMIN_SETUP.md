# 🔧 Admin Dashboard Setup

Quick setup to enable the Admin link in your navigation.

---

## ⚙️ Add to `.env` File

Add this line to your `.env` file:

```env
VITE_ADMIN_DISCORD_ID=850726663289700373
```

This tells the frontend which Discord user ID should see the Admin link in the navigation.

---

## 🔄 Restart Servers

After adding to `.env`:

```bash
# Stop servers (Ctrl+C or)
killall node

# Start again
npm run dev
```

---

## ✅ What Happens:

1. **Before**: You can access `/admin` directly but don't see the nav link
2. **After**: The Admin dashboard link (🛡️ shield icon) appears in your navigation
3. **For Others**: Non-admin users won't see the Admin link at all

---

## 📍 Where to Find the Admin Link:

- **Desktop**: Right sidebar navigation (shield icon)
- **Mobile**: Menu → Admin (at the bottom)

---

## 🎯 Quick Access:

You can always access the admin dashboard directly:

- URL: http://localhost:1500/admin

The navigation link is just for convenience!

---

## 🔒 Security:

- Admin link only shows when logged in as admin
- Non-admin users never see it
- Backend still protects all admin endpoints
- Double layer of security (frontend + backend)

---

**Done!** After restarting, you'll see the Admin link in your nav! 🎉
