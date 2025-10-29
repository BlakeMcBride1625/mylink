import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { pool, initializeDatabase, getOrCreateConversation, logUserLogin, isUserBlocked } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 1600;

// Middleware
app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT || 1500}`,
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 messages per minute
  message: 'Too many messages sent, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/auth/', authLimiter);

app.use(session({
  secret: process.env.SESSION_SECRET || 'myhub-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Discord OAuth Configuration
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI || 'http://localhost:1500/auth/callback',
    scope: ['identify', 'email'],
  }, (accessToken: string, refreshToken: string, profile: any, done: any) => {
    return done(null, { profile, accessToken });
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });
}

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Auth Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/callback',
  passport.authenticate('discord', { failureRedirect: '/messages' }),
  async (req, res) => {
    try {
      const user = (req.user as any)?.profile;
      if (user) {
        const userId = user.id;
        const userName = user.username || user.global_name || 'Unknown';
        const userAvatar = user.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
        
        // Get user's IP address
        const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                         req.socket.remoteAddress || 
                         'Unknown';
        
        // Log user login
        await logUserLogin(userId, userName, userAvatar, ipAddress);
        
        // Check if user is blocked
        const blocked = await isUserBlocked(userId);
        if (blocked) {
          req.logout(() => {
            res.redirect('/?error=blocked');
          });
          return;
        }
      }
      res.redirect('/messages');
    } catch (error) {
      console.error('Error in auth callback:', error);
      res.redirect('/messages');
    }
  }
);

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

app.post('/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

// Middleware to check if user is admin
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const userId = (req.user as any)?.profile?.id;
  const adminId = process.env.ADMIN_DISCORD_ID;
  
  if (userId === adminId) {
    return next();
  }
  
  res.status(403).json({ error: 'Forbidden: Admin access required' });
};

// Middleware to check if user is authenticated and not blocked
const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check if user is blocked
  const userId = (req.user as any)?.profile?.id;
  if (userId) {
    const blocked = await isUserBlocked(userId);
    if (blocked) {
      req.logout(() => {});
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
    }
  }
  
  next();
};

// ========================================
// ADMIN USER MANAGEMENT API ENDPOINTS
// ========================================

// Get all users (admin only)
app.get('/api/admin/users', isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, user_name, user_avatar, ip_address, is_blocked, block_reason, last_login, created_at FROM users ORDER BY last_login DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Block a user (admin only)
app.post('/api/admin/users/:userId/block', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    await pool.query(
      'UPDATE users SET is_blocked = TRUE, block_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [reason || 'No reason provided', userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

// Unblock a user (admin only)
app.post('/api/admin/users/:userId/unblock', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    await pool.query(
      'UPDATE users SET is_blocked = FALSE, block_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

// Delete a user and all their data (admin only)
app.delete('/api/admin/users/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Delete user's messages first (cascade should handle this, but being explicit)
    await pool.query('DELETE FROM messages WHERE sender_id = $1', [userId]);
    
    // Delete user's conversations
    await pool.query('DELETE FROM conversations WHERE user_id = $1', [userId]);
    
    // Delete user
    await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ========================================
// CONVERSATION & MESSAGE API ENDPOINTS
// ========================================

// Get all conversations (admin sees all, users see only their own)
app.get('/api/conversations', isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    let query = 'SELECT * FROM conversations';
    let params: any[] = [];

    if (!isUserAdmin) {
      // Regular users only see their own conversation
      query += ' WHERE user_id = $1';
      params = [userId];
    }

    query += ' ORDER BY last_message_at DESC';

    const result = await pool.query(query, params);
    res.json({ conversations: result.rows, isAdmin: isUserAdmin });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get a specific conversation
app.get('/api/conversations/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    const result = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = result.rows[0];

    // Check permissions: admin can see all, users can only see their own
    if (!isUserAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:id/messages', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.profile?.id;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    // First check if user has permission to view this conversation
    const convResult = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = convResult.rows[0];

    if (!isUserAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Fetch messages
    const messagesResult = await pool.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({ messages: messagesResult.rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
app.post('/api/conversations/:id/messages', messageLimiter, isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = (req.user as any)?.profile;
    const userId = user?.id;
    const userName = user?.username || user?.global_name || 'Unknown';
    const userAvatar = user?.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;
    const adminId = process.env.ADMIN_DISCORD_ID;
    const isUserAdmin = userId === adminId;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Check if user has permission to send to this conversation
    const convResult = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
    
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = convResult.rows[0];

    if (!isUserAdmin && conversation.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Insert message
    const messageResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, sender_name, sender_avatar, content, is_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, userId, userName, userAvatar, content, isUserAdmin]
    );

    // Update conversation's last message
    await pool.query(
      `UPDATE conversations
       SET last_message = $1, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [content, id]
    );

    res.json({ message: messageResult.rows[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create a new conversation (or get existing)
app.post('/api/conversations', isAuthenticated, async (req, res) => {
  try {
    const user = (req.user as any)?.profile;
    const userId = user?.id;
    const userName = user?.username || user?.global_name || 'Unknown';
    const userAvatar = user?.avatar ? `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png` : null;

    const conversation = await getOrCreateConversation(userId, userName, userAvatar);
    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Delete a conversation (admin only)
app.delete('/api/conversations/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM conversations WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Close a conversation (admin only)
app.patch('/api/conversations/:id/close', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE conversations SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ error: 'Failed to close conversation' });
  }
});

// Reopen a conversation (admin only)
app.patch('/api/conversations/:id/reopen', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `UPDATE conversations SET status = 'open', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error reopening conversation:', error);
    res.status(500).json({ error: 'Failed to reopen conversation' });
  }
});

// API Proxy Routes
app.get('/api/lanyard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await axios.get(`https://api.lanyard.rest/v1/users/${userId}`);
    res.json(response.data);
  } catch (error) {
    console.error('Lanyard API error:', error);
    res.status(500).json({ error: 'Failed to fetch Lanyard data' });
  }
});

// Discord profile endpoint (badges, banner, etc.) - Official Discord API
app.get('/api/discord/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    if (!botToken) {
      return res.status(500).json({ error: 'Discord bot token not configured' });
    }
    
    // Fetch user data from official Discord API
    const userResponse = await axios.get(`https://discord.com/api/v10/users/${userId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
        'User-Agent': 'MY-HUB-Dashboard/1.0'
      }
    });
    
    const userData = userResponse.data;
    const publicFlags = userData?.public_flags || 0;
    
    // Decode badge flags
    const badgeFlags: Record<number, string> = {
      1: 'staff',
      2: 'partner',
      4: 'hypesquad',
      8: 'bug_hunter_level_1',
      64: 'hypesquad_online_house_1',
      128: 'hypesquad_online_house_2',
      256: 'hypesquad_online_house_3',
      512: 'premium_early_supporter',
      16384: 'bug_hunter_level_2',
      131072: 'verified_developer',
      262144: 'certified_moderator',
      4194304: 'active_developer'
    };
    
    const badges: string[] = [];
    
    // Detect profile features
    const hasAnimatedBanner = userData.banner?.startsWith('a_');
    const hasAvatarDecoration = userData.avatar_decoration_data != null;
    const hasDisplayNameStyles = userData.display_name_styles != null;
    const hasCollectibles = userData.collectibles != null;
    
    // Add badges in the order they appear on Discord profile (left to right)
    
    // 1. Nitro Gold
    if (hasAnimatedBanner || hasAvatarDecoration || hasDisplayNameStyles || hasCollectibles) {
      badges.push('nitro_gold');
    }
    
    // 2. HypeSquad Bravery (from public_flags)
    if (publicFlags & 64) {
      badges.push('hypesquad_online_house_1');
    }
    
    // 3. Active Developer (from public_flags)
    if (publicFlags & 4194304) {
      badges.push('active_developer');
    }
    
    // 4. Server Booster
    if (hasDisplayNameStyles || hasAvatarDecoration) {
      badges.push('premium_guild_subscriber');
    }
    
    // 5. Completed A Quest
    badges.push('quest_completed');
    
    // 6. Apprentice
    badges.push('apprentice');
    
    // Add any other public_flags badges not already added
    for (const [flag, badgeName] of Object.entries(badgeFlags)) {
      const flagNum = parseInt(flag);
      if ((publicFlags & flagNum) && !badges.includes(badgeName)) {
        badges.push(badgeName);
      }
    }
    
    const response = {
      user: userData,
      badges,
      clan: userData.clan || null,
      avatar_decoration: userData.avatar_decoration_data || null,
      nameplate: userData.collectibles?.nameplate || null,
      avatar_url: userData.avatar 
        ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator) % 5}.png`,
      banner_url: userData.banner
        ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}.png?size=600`
        : null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Discord profile API error:', error);
    res.status(500).json({ error: 'Failed to fetch Discord profile data' });
  }
});

app.get('/api/lastfm/recent', async (req, res) => {
  try {
    const username = process.env.LASTFM_USERNAME;
    const apiKey = process.env.LASTFM_API_KEY;
    
    if (!username || !apiKey) {
      return res.status(500).json({ error: 'Last.fm credentials not configured' });
    }

    const response = await axios.get('http://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'user.getrecenttracks',
        user: username,
        api_key: apiKey,
        format: 'json',
        limit: 1,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Last.fm API error:', error);
    res.status(500).json({ error: 'Failed to fetch Last.fm data' });
  }
});

app.get('/api/wakatime/stats', async (req, res) => {
  try {
    const username = process.env.WAKATIME_USERNAME;
    const apiKey = process.env.WAKATIME_API_KEY;
    
    if (!username || !apiKey) {
      return res.status(500).json({ error: 'WakaTime credentials not configured' });
    }

    // Use summaries endpoint for real-time data (last 7 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await axios.get(
      `https://wakatime.com/api/v1/users/${username}/summaries?start=${startDate}&end=${endDate}&api_key=${apiKey}`
    );
    
    // Transform summaries data to match the stats format
    const summaries = response.data.data || [];
    const languages = {};
    let totalSeconds = 0;
    let bestDay = null;
    let bestDaySeconds = 0;

    summaries.forEach((day: any) => {
      const dayTotal = day.grand_total?.total_seconds || 0;
      totalSeconds += dayTotal;
      
      if (dayTotal > bestDaySeconds) {
        bestDaySeconds = dayTotal;
        bestDay = {
          date: day.range.date,
          text: day.grand_total?.text || '0 secs'
        };
      }

      day.languages?.forEach((lang: any) => {
        if (!languages[lang.name]) {
          languages[lang.name] = { name: lang.name, total_seconds: 0 };
        }
        languages[lang.name].total_seconds += lang.total_seconds || 0;
      });
    });

    const languageArray = Object.values(languages)
      .sort((a: any, b: any) => b.total_seconds - a.total_seconds)
      .map((lang: any) => ({
        name: lang.name,
        total_seconds: lang.total_seconds,
        percent: totalSeconds > 0 ? Math.round((lang.total_seconds / totalSeconds) * 100 * 100) / 100 : 0,
        text: formatDuration(lang.total_seconds)
      }));

    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const humanReadableTotal = hours > 0 ? `${hours} hrs ${mins} mins` : `${mins} mins`;

    res.json({
      data: {
        status: 'ok',
        human_readable_total: humanReadableTotal,
        total_seconds: totalSeconds,
        languages: languageArray,
        best_day: bestDay,
        is_coding_activity_visible: true,
        is_language_usage_visible: true,
        is_editor_usage_visible: true
      }
    });
  } catch (error) {
    console.error('WakaTime API error:', error);
    res.status(500).json({ error: 'Failed to fetch WakaTime data' });
  }
});

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} hrs ${mins} mins`;
  if (mins > 0) return `${mins} mins`;
  return `${seconds} secs`;
}

// Contact Form Routes
app.post('/api/contact/discord', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { message } = req.body;
    const user: any = req.user;
    
    // Send DM via Discord (requires bot setup or webhook)
    // For now, we'll send an email notification
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `MY HUB Contact from ${user.profile.username}`,
      text: `Message from Discord user ${user.profile.username}#${user.profile.discriminator}:\n\n${message}`,
      html: `
        <h3>Message from Discord user ${user.profile.username}#${user.profile.discriminator}</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Discord message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.post('/api/contact/email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Send email to site owner (Blake)
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `MY HUB Contact: ${subject} (from ${name})`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation email to sender
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `Re: ${subject}`,
      text: `Hi ${name},\n\nThank you for reaching out! I've received your message regarding "${subject}" and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\nBlake (@epildev)\nMY HUB - EpilDevConnect`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border-radius: 16px; border: 1px solid rgba(0, 217, 255, 0.1); backdrop-filter: blur(10px);">
                    <!-- Header -->
                    <tr>
                      <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(0, 217, 255, 0.1);">
                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #00d9ff; text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);">
                          MY HUB
                        </h1>
                        <p style="margin: 10px 0 0; font-size: 14px; color: #8899aa; font-family: 'Courier New', monospace;">
                          by EpilDevConnect
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 20px; font-size: 24px; color: #ffffff;">
                          Hi ${name},
                        </h2>
                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                          Thank you for reaching out! I've received your message regarding <strong style="color: #00d9ff;">"${subject}"</strong> and will get back to you as soon as possible.
                        </p>
                        
                        <!-- Message Quote -->
                        <div style="margin: 30px 0; padding: 20px; background: rgba(0, 217, 255, 0.05); border-left: 4px solid #00d9ff; border-radius: 8px;">
                          <p style="margin: 0 0 10px; font-size: 12px; color: #8899aa; text-transform: uppercase; letter-spacing: 1px; font-family: 'Courier New', monospace;">
                            Subject: ${subject}
                          </p>
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e0e0e0;">
                            ${message.replace(/\n/g, '<br>')}
                          </p>
                        </div>
                        
                        <p style="margin: 0 0 10px; font-size: 16px; line-height: 1.6; color: #cccccc;">
                          I typically respond within 24-48 hours. If you need urgent assistance, you can also reach me on Discord.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px 40px; border-top: 1px solid rgba(0, 217, 255, 0.1); background: rgba(0, 0, 0, 0.2); border-radius: 0 0 16px 16px;">
                        <p style="margin: 0 0 15px; font-size: 14px; color: #ffffff;">
                          <strong>Blake (@epildev)</strong>
                        </p>
                        <p style="margin: 0 0 5px; font-size: 13px; color: #8899aa;">
                          Senior IT App Developer | Music Producer
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #8899aa;">
                          Hythe, Southampton, England
                        </p>
                        <div style="margin: 20px 0 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                          <p style="margin: 0; font-size: 12px; color: #666; font-family: 'Courier New', monospace;">
                            © 2025 MY HUB by EpilDevConnect. All rights reserved.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Don't expose error details in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(isDev && { stack: err.stack }),
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`💬 Discord DM system initialized`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();


