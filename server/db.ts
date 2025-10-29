import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool
export const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'myhub',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table for security tracking
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_avatar VARCHAR(500),
        ip_address VARCHAR(45),
        is_blocked BOOLEAN DEFAULT FALSE,
        block_reason TEXT,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create conversations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_avatar VARCHAR(500),
        last_message TEXT,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id VARCHAR(255) NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_avatar VARCHAR(500),
        content TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_is_blocked ON users(is_blocked);
      CREATE INDEX IF NOT EXISTS idx_users_ip_address ON users(ip_address);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Helper function to log/update user login
export async function logUserLogin(userId: string, userName: string, userAvatar: string | null, ipAddress: string) {
  const client = await pool.connect();
  try {
    // Check if user exists
    const existingUser = await client.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user
      const result = await client.query(
        `UPDATE users 
         SET user_name = $2, user_avatar = $3, ip_address = $4, last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING *`,
        [userId, userName, userAvatar, ipAddress]
      );
      return result.rows[0];
    } else {
      // Create new user
      const result = await client.query(
        `INSERT INTO users (user_id, user_name, user_avatar, ip_address, is_blocked)
         VALUES ($1, $2, $3, $4, FALSE)
         RETURNING *`,
        [userId, userName, userAvatar, ipAddress]
      );
      return result.rows[0];
    }
  } finally {
    client.release();
  }
}

// Helper function to check if user is blocked
export async function isUserBlocked(userId: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT is_blocked FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows.length > 0 ? result.rows[0].is_blocked : false;
  } finally {
    client.release();
  }
}

// Helper function to get or create a conversation
export async function getOrCreateConversation(userId: string, userName: string, userAvatar?: string) {
  const client = await pool.connect();
  try {
    // Check if conversation exists
    const existingConv = await client.query(
      'SELECT * FROM conversations WHERE user_id = $1',
      [userId]
    );

    if (existingConv.rows.length > 0) {
      return existingConv.rows[0];
    }

    // Create new conversation
    const newConv = await client.query(
      `INSERT INTO conversations (user_id, user_name, user_avatar, status)
       VALUES ($1, $2, $3, 'open')
       RETURNING *`,
      [userId, userName, userAvatar]
    );

    return newConv.rows[0];
  } finally {
    client.release();
  }
}

