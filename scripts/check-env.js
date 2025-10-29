#!/usr/bin/env node

/**
 * Check if all required environment variables are set
 * Usage: node scripts/check-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🔍 Checking environment configuration...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('💡 Create one by running: cp .env.example .env\n');
  process.exit(1);
}

// Read .env.example to get required variables
const envExample = fs.readFileSync(envExamplePath, 'utf8');
const requiredVars = [];

envExample.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key] = trimmed.split('=');
    if (key) {
      requiredVars.push(key.trim());
    }
  }
});

// Read actual .env
const env = fs.readFileSync(envPath, 'utf8');
const setVars = new Map();

env.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      setVars.set(key.trim(), value.trim());
    }
  }
});

// Critical variables that must be set
const critical = [
  'DISCORD_USER_ID',
  'SESSION_SECRET',
  'FRONTEND_PORT',
  'BACKEND_PORT',
];

// Optional but recommended
const optional = [
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'LASTFM_USERNAME',
  'LASTFM_API_KEY',
  'WAKATIME_USERNAME',
  'WAKATIME_API_KEY',
  'SMTP_HOST',
  'SMTP_USER',
];

let hasErrors = false;
let hasWarnings = false;

// Check critical variables
console.log('✅ Critical Variables:\n');
critical.forEach((varName) => {
  const value = setVars.get(varName);
  if (!value || value.startsWith('your_') || value === 'generate_random_secret_here') {
    console.log(`   ❌ ${varName} - NOT SET`);
    hasErrors = true;
  } else {
    console.log(`   ✓ ${varName}`);
  }
});

// Check optional variables
console.log('\n⚠️  Optional Variables:\n');
optional.forEach((varName) => {
  const value = setVars.get(varName);
  if (!value || value.startsWith('your_')) {
    console.log(`   ⚠ ${varName} - Not configured (some features may not work)`);
    hasWarnings = true;
  } else {
    console.log(`   ✓ ${varName}`);
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('\n❌ Configuration incomplete!');
  console.log('Please set all critical variables in .env\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('\n✅ Critical configuration complete!');
  console.log('⚠️  Some optional features are not configured.');
  console.log('The app will work, but some features may be disabled.\n');
} else {
  console.log('\n🎉 All environment variables are configured!\n');
}

console.log('Run "npm run dev" to start the application.\n');

