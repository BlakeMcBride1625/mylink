# Discord DM System Setup Guide

## 🎉 Complete Discord-like Messaging Interface

Your MY HUB now has a full Discord-style DM system where users can message you directly through the website!

---

## 📋 Prerequisites

### 1. PostgreSQL Database

You need to have PostgreSQL installed and running.

**Install PostgreSQL:**

**macOS (using Homebrew):**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Create the database:**

```bash
createdb myhub
```

Or use psql:

```bash
psql postgres
CREATE DATABASE myhub;
\q
```

### 2. Update Your `.env` File

Your `.env` file already has these settings:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myhub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password_here  # ⚠️ UPDATE THIS

# Admin Discord User ID (you - has access to all conversations)
ADMIN_DISCORD_ID=850726663289700373  # ✅ Already set to your ID
```

**⚠️ Important:** Update `POSTGRES_PASSWORD` with your actual PostgreSQL password.

---

## 🚀 How It Works

### For Regular Users:

1. User visits your website and goes to `/messages`
2. They're prompted to login with Discord
3. After logging in, a conversation is automatically created
4. They can send you messages directly
5. They only see their own conversation

### For You (Admin):

1. You go to `/messages`
2. Login with Discord (your ID: `850726663289700373`)
3. You see **ALL** conversations from all users in the sidebar
4. Click on any conversation to view and reply
5. You have admin controls:
   - **Close** - Mark conversation as closed (no new messages)
   - **Reopen** - Reopen a closed conversation
   - **Delete** - Permanently delete the conversation and all messages

---

## 🎨 Features

### Discord-Like UI

- **Left Sidebar**: List of all conversations (sorted by most recent)
- **Right Panel**: Active chat with message history
- **Real-time Updates**: Messages poll every 3 seconds
- **Avatars & Usernames**: Pulled from Discord profiles
- **Timestamps**: Shows "X minutes ago" format
- **Status Badges**: Shows if conversation is closed

### Message Features

- **Rich text support**: Multi-line messages
- **Own vs Other**: Different styling for your messages vs theirs
- **Admin badge**: Your messages show an "ADMIN" badge
- **Typing indicator**: Visual feedback when sending
- **Auto-scroll**: Automatically scrolls to newest message

### Permissions

- **Users**: Can only see their own conversation
- **Admin (you)**: Can see all conversations and has full control

---

## 🧪 Testing

### Start the servers:

```bash
npm run dev
```

### Test Flow:

1. **As a User:**

   - Open http://localhost:1500/messages in an incognito window
   - Login with a different Discord account (not your admin one)
   - Send a test message
   - You should see your message appear

2. **As Admin (you):**

   - Open http://localhost:1500/messages in your normal browser
   - Login with Discord (your account)
   - You should see the test user's conversation in the sidebar
   - Click it to view their message
   - Reply to them
   - Try the admin controls (Close, Reopen, Delete)

3. **Back to User:**
   - Refresh the incognito window
   - You should see your admin reply

---

## 📊 Database Schema

The system uses two tables:

### `conversations`

```sql
id               SERIAL PRIMARY KEY
user_id          VARCHAR(255)      -- Discord user ID
user_name        VARCHAR(255)      -- Discord username
user_avatar      VARCHAR(500)      -- Discord avatar URL
last_message     TEXT              -- Preview of last message
last_message_at  TIMESTAMP         -- When last message was sent
status           VARCHAR(50)       -- 'open' or 'closed'
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

### `messages`

```sql
id               SERIAL PRIMARY KEY
conversation_id  INTEGER           -- References conversations(id)
sender_id        VARCHAR(255)      -- Discord user ID
sender_name      VARCHAR(255)      -- Discord username
sender_avatar    VARCHAR(500)      -- Discord avatar URL
content          TEXT              -- Message content
is_admin         BOOLEAN           -- Is sender the admin?
created_at       TIMESTAMP
```

---

## 🔌 API Endpoints

All require authentication (Discord OAuth).

### Conversations

- `GET /api/conversations` - Get all conversations (filtered by permission)
- `GET /api/conversations/:id` - Get specific conversation
- `POST /api/conversations` - Create or get existing conversation
- `DELETE /api/conversations/:id` - Delete conversation (admin only)
- `PATCH /api/conversations/:id/close` - Close conversation (admin only)
- `PATCH /api/conversations/:id/reopen` - Reopen conversation (admin only)

### Messages

- `GET /api/conversations/:id/messages` - Get all messages in conversation
- `POST /api/conversations/:id/messages` - Send a message
  ```json
  {
    "content": "Your message here"
  }
  ```

---

## 🎯 Navigation

The Messages page is accessible via:

- **URL**: http://localhost:1500/messages
- **Nav Bar**: Click the message icon in the navigation sidebar
- **Auto-redirect**: After Discord login, users are sent to `/messages`

---

## 🛠️ Troubleshooting

### "Connection refused" error:

- Make sure PostgreSQL is running: `brew services list`
- Start it if needed: `brew services start postgresql@15`

### "Database does not exist":

- Create the database: `createdb myhub`

### "Authentication failed":

- Check your `POSTGRES_PASSWORD` in `.env`
- Try connecting manually: `psql -U postgres -d myhub`

### Messages not updating:

- Check browser console for errors
- Verify backend is running on port 1600
- Check that you're logged in with Discord

### Can't see other users' conversations:

- Make sure you're logged in as admin (your Discord ID matches `ADMIN_DISCORD_ID`)
- Check backend logs for permission errors

---

## 🎨 Customization

### Change polling interval:

In `Messages.tsx` and `ChatView.tsx`, update the interval:

```typescript
const interval = setInterval(fetchConversations, 5000); // 5 seconds
```

### Change message styling:

Edit `ChatView.tsx` - message bubbles use Tailwind classes:

```typescript
className={`
  ${isOwnMessage
    ? 'bg-quantum-glow bg-opacity-20'  // Your messages
    : 'bg-white bg-opacity-10'          // Their messages
  }
`}
```

### Add notifications:

You can add browser notifications when new messages arrive by using the Notification API in the polling functions.

---

## 📝 Production Deployment

### Environment Variables:

Update your production `.env`:

```env
POSTGRES_HOST=your-production-db-host
POSTGRES_PORT=5432
POSTGRES_DB=myhub
POSTGRES_USER=your-db-user
POSTGRES_PASSWORD=your-secure-password
ADMIN_DISCORD_ID=850726663289700373
```

### Database:

- Use a managed PostgreSQL service (e.g., Heroku Postgres, Railway, Supabase)
- Run migrations on production DB
- Set up automated backups

### Security:

- Use SSL for PostgreSQL connections in production
- Enable CORS only for your domain
- Use environment-specific redirect URIs for Discord OAuth

---

## 🎉 You're Done!

Your Discord DM system is now fully functional! Users can message you directly through your website, and you can manage all conversations from the Messages page.

Visit http://localhost:1500/messages to get started!
