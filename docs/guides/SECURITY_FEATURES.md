# 🔒 Security Features & Admin Dashboard

Complete security implementation for MY HUB with admin controls, rate limiting, IP logging, and user management.

---

## 🎯 What's Been Implemented

### 1. **IP Address Logging** ✅

- Every Discord login is logged with user's IP address
- IP addresses stored in database for security tracking
- Supports proxy forwarding headers (x-forwarded-for)

### 2. **Rate Limiting** ✅

Three levels of rate limiting:

- **General API**: 100 requests per 15 minutes per IP
- **Auth/Login**: 5 attempts per 15 minutes per IP
- **Messages**: 10 messages per 1 minute per IP

Prevents:

- API abuse
- Brute force attacks
- Message spam
- DDoS attempts

### 3. **User Blocking System** ✅

- Block users from accessing the site
- Blocked users are immediately logged out
- Cannot send messages or access conversations
- Optional block reason tracking

### 4. **Admin Dashboard** ✅

**URL**: http://localhost:1500/admin

**Features**:

- View all registered users
- See user IDs, names, avatars
- Track IP addresses for each user
- View last login times
- See user status (Active/Blocked)
- Real-time updates

**Admin Controls**:

- **Block** - Prevent user access (with reason)
- **Unblock** - Restore user access
- **Delete** - Permanently remove user and all their data

**Access Control**:

- Only YOU can access (admin Discord ID: 850726663289700373)
- Non-admins get "Access Denied" message
- Protected by admin middleware

### 5. **Privacy Policy & Terms of Service** ✅

- **Privacy Policy**: `/privacy`
- **Terms of Service**: `/terms`
- Accessible via footer on every page
- Covers data collection, user rights, acceptable use

---

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  user_id           VARCHAR(255) UNIQUE NOT NULL,
  user_name         VARCHAR(255) NOT NULL,
  user_avatar       VARCHAR(500),
  ip_address        VARCHAR(45),
  is_blocked        BOOLEAN DEFAULT FALSE,
  block_reason      TEXT,
  last_login        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:

- `user_id` (for fast lookups)
- `is_blocked` (for access checks)
- `ip_address` (for security tracking)

---

## 🔐 Security Flow

### User Login:

1. User authenticates via Discord OAuth
2. System captures their IP address
3. User info logged/updated in database
4. System checks if user is blocked
5. If blocked → logout + redirect with error
6. If not blocked → proceed to messages

### Blocked User Attempt:

1. User tries to access any protected endpoint
2. `isAuthenticated` middleware checks block status
3. If blocked → immediate logout + 403 error
4. Frontend shows "Account blocked" message

### Rate Limiting:

1. Each request tracked by IP address
2. Counter increments per request
3. If limit exceeded → 429 error
4. User must wait until window expires
5. Headers show remaining requests

---

## 🛡️ Admin Dashboard Guide

### Accessing the Dashboard:

```
http://localhost:1500/admin
```

### What You'll See:

- **User List Table** with:
  - User avatar and name
  - Discord User ID
  - IP Address (in cyan monospace)
  - Last login time
  - Status badge (Active/Blocked)
  - Action buttons

### Managing Users:

#### Block a User:

1. Click **Block** button
2. Enter reason (optional)
3. User is immediately blocked
4. They'll be logged out on next request
5. Cannot login again until unblocked

#### Unblock a User:

1. Click **Unblock** button
2. Confirm action
3. User can now login again
4. Block reason is cleared

#### Delete a User:

1. Click **Delete** button
2. Confirm (THIS CANNOT BE UNDONE)
3. Deletes:
   - User account
   - All their conversations
   - All their messages
4. Complete data removal

---

## 🚨 Rate Limit Details

### General API (`/api/*`):

```javascript
Window: 15 minutes
Limit: 100 requests
Applies to: All API endpoints
```

### Authentication (`/auth/*`):

```javascript
Window: 15 minutes
Limit: 5 attempts
Applies to: Discord login/logout
```

### Messaging:

```javascript
Window: 1 minute
Limit: 10 messages
Applies to: Sending messages
```

### When Limit is Exceeded:

```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

**HTTP Status**: `429 Too Many Requests`

**Headers Include**:

- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests left
- `X-RateLimit-Reset`: When limit resets

---

## 📱 User-Facing Pages

### Privacy Policy (`/privacy`):

- Data collection disclosure
- How information is used
- User rights (access, deletion, etc.)
- Security measures
- Contact information

### Terms of Service (`/terms`):

- Acceptable use policy
- Account responsibilities
- Content guidelines
- Rate limiting notice
- Suspension/termination conditions
- Disclaimer and liability

### Footer:

- Appears on every page
- Links to Privacy Policy
- Links to Terms of Service
- Copyright notice

---

## 🔍 Security Monitoring

### What Gets Logged:

- User logins (with IP addresses)
- Failed authentication attempts
- Rate limit violations (console warnings)
- Blocked user access attempts

### Monitoring Recommendations:

1. **Regularly check Admin Dashboard**

   - Review new users
   - Monitor IP addresses
   - Check for suspicious patterns

2. **Watch for Rate Limit Hits**

   - Check backend logs
   - Look for repeated 429 errors
   - Identify abusive IPs

3. **Review User Activity**
   - Track message frequency
   - Monitor conversation patterns
   - Watch for spam or abuse

---

## 🚀 Testing Security Features

### Test Rate Limiting:

```bash
# Send multiple requests quickly
for i in {1..15}; do
  curl http://localhost:1600/auth/discord
  echo "Request $i"
done

# After 5 requests, you should get rate limited
```

### Test Blocking:

1. Login as a test user (not admin)
2. Go to `/admin` as admin
3. Block the test user
4. Try to access `/messages` as test user
5. Should see "Account blocked" error

### Test Admin Access:

1. Try accessing `/admin` without being logged in
2. Should redirect to Discord login
3. Login with non-admin account
4. Should see "Access Denied"
5. Login as admin
6. Should see full dashboard

---

## 🎯 Admin Privileges

**Admin Discord ID**: `850726663289700373` (from `.env`)

**What Admins Can Do**:

- Access `/admin` dashboard
- View all users and IPs
- Block/unblock any user
- Delete users and their data
- See all conversations (from Messages page)
- Close/reopen conversations
- Delete conversations

**What Regular Users Can Do**:

- Access `/messages`
- See only their own conversation
- Send messages (within rate limits)
- View Privacy Policy and Terms
- Cannot access admin features

---

## 🛠️ Configuration

### Environment Variables:

```env
ADMIN_DISCORD_ID=850726663289700373  # Your admin Discord ID
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=myhub
POSTGRES_USER=admin
POSTGRES_PASSWORD=25Epildev-db25.
```

### Customizing Rate Limits:

Edit `server/index.ts`:

```typescript
// General API limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window
  max: 100, // Max requests
  message: 'Custom message', // Error message
});
```

---

## 📋 Security Checklist

- ✅ IP logging on all logins
- ✅ Rate limiting (3 tiers)
- ✅ User blocking system
- ✅ Admin dashboard with controls
- ✅ Automatic block checking
- ✅ Privacy Policy published
- ✅ Terms of Service published
- ✅ Footer with legal links
- ✅ Admin-only access control
- ✅ Database indexes for performance
- ✅ Secure password handling (PostgreSQL)
- ✅ Session management

---

## 🎉 Quick Access URLs

- **Admin Dashboard**: http://localhost:1500/admin
- **Messages**: http://localhost:1500/messages
- **Privacy Policy**: http://localhost:1500/privacy
- **Terms of Service**: http://localhost:1500/terms

---

## 📞 Support & Updates

All security features are now active and protecting your site!

**To monitor abuse**:

1. Check `/admin` regularly
2. Review PostgreSQL `users` table
3. Watch backend console for rate limit warnings

**To update security settings**:

- Modify rate limits in `server/index.ts`
- Update Privacy Policy in `src/sections/PrivacyPolicy.tsx`
- Update Terms in `src/sections/TermsOfService.tsx`

Your site is now fully secured! 🔒✨
