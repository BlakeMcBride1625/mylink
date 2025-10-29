#!/usr/bin/env node

/**
 * Generate a secure random session secret
 * Usage: node scripts/generate-session-secret.js
 */

import crypto from 'crypto';

const secret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Generated Session Secret:\n');
console.log(secret);
console.log('\n📝 Add this to your .env file:');
console.log(`SESSION_SECRET=${secret}\n`);

