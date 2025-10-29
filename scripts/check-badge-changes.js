#!/usr/bin/env node

/**
 * Check Badge Changes Script
 * Monitors Discord profile for badge changes and logs updates
 * Run this daily via cron to track badge changes
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(projectRoot, '.env') });

const BADGE_HISTORY_FILE = join(projectRoot, 'data', 'badge-history.json');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:1600';
const DISCORD_USER_ID = process.env.VITE_DISCORD_USER_ID || process.env.DISCORD_USER_ID;

/**
 * Fetch current badges from the backend API
 */
async function fetchCurrentBadges() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/discord/profile/${DISCORD_USER_ID}`);
    return response.data.badges || [];
  } catch (error) {
    console.error('❌ Failed to fetch current badges:', error.message);
    return null;
  }
}

/**
 * Load badge history from file
 */
function loadBadgeHistory() {
  if (!existsSync(BADGE_HISTORY_FILE)) {
    return { badges: [], lastChecked: null, history: [] };
  }
  
  try {
    const data = readFileSync(BADGE_HISTORY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('⚠️  Failed to read badge history:', error.message);
    return { badges: [], lastChecked: null, history: [] };
  }
}

/**
 * Save badge history to file
 */
function saveBadgeHistory(history) {
  try {
    // Ensure data directory exists
    const dataDir = dirname(BADGE_HISTORY_FILE);
    if (!existsSync(dataDir)) {
      import('fs').then(fs => fs.mkdirSync(dataDir, { recursive: true }));
    }
    
    writeFileSync(BADGE_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('❌ Failed to save badge history:', error.message);
  }
}

/**
 * Compare badge arrays
 */
function compareBadges(oldBadges, newBadges) {
  const added = newBadges.filter(badge => !oldBadges.includes(badge));
  const removed = oldBadges.filter(badge => !newBadges.includes(badge));
  
  return { added, removed, changed: added.length > 0 || removed.length > 0 };
}

/**
 * Badge name mapper for friendly display
 */
const BADGE_NAMES = {
  nitro_gold: 'Nitro (Gold Tier)',
  nitro_subscriber: 'Nitro Subscriber',
  hypesquad_online_house_1: 'HypeSquad Bravery',
  hypesquad_online_house_2: 'HypeSquad Brilliance',
  hypesquad_online_house_3: 'HypeSquad Balance',
  active_developer: 'Active Developer',
  premium_guild_subscriber: 'Server Booster',
  quest_completed: 'Completed A Quest',
  apprentice: 'Apprentice',
  early_supporter: 'Early Supporter',
  verified_developer: 'Early Verified Bot Developer',
  staff: 'Discord Staff',
  partner: 'Partnered Server Owner',
  certified_moderator: 'Moderator Programs Alumni',
  bug_hunter_level_1: 'Bug Hunter Level 1',
  bug_hunter_level_2: 'Bug Hunter Level 2',
  clan_badge: 'Clan Badge',
};

function getBadgeName(badgeKey) {
  return BADGE_NAMES[badgeKey] || badgeKey;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Discord Badge Change Checker');
  console.log('================================\n');
  
  // Fetch current badges
  console.log('📡 Fetching current badges...');
  const currentBadges = await fetchCurrentBadges();
  
  if (!currentBadges) {
    console.log('❌ Could not fetch badges. Is the backend running?');
    process.exit(1);
  }
  
  console.log(`✅ Found ${currentBadges.length} badges\n`);
  
  // Load history
  const history = loadBadgeHistory();
  const previousBadges = history.badges || [];
  
  // Compare badges
  const comparison = compareBadges(previousBadges, currentBadges);
  
  if (comparison.changed) {
    console.log('🎉 Badge changes detected!\n');
    
    if (comparison.added.length > 0) {
      console.log('✨ New badges added:');
      comparison.added.forEach(badge => {
        console.log(`  + ${getBadgeName(badge)}`);
      });
      console.log('');
    }
    
    if (comparison.removed.length > 0) {
      console.log('❌ Badges removed:');
      comparison.removed.forEach(badge => {
        console.log(`  - ${getBadgeName(badge)}`);
      });
      console.log('');
    }
    
    // Update history
    history.history.push({
      timestamp: new Date().toISOString(),
      added: comparison.added,
      removed: comparison.removed,
      badges: currentBadges,
    });
    
    // Keep only last 30 changes
    if (history.history.length > 30) {
      history.history = history.history.slice(-30);
    }
  } else {
    console.log('✅ No badge changes detected');
  }
  
  // Update current state
  history.badges = currentBadges;
  history.lastChecked = new Date().toISOString();
  
  // Display current badges
  console.log('\n📋 Current badges:');
  currentBadges.forEach((badge, index) => {
    console.log(`  ${index + 1}. ${getBadgeName(badge)}`);
  });
  
  // Save history
  saveBadgeHistory(history);
  
  console.log(`\n💾 Badge history saved to: ${BADGE_HISTORY_FILE}`);
  console.log(`⏰ Last checked: ${new Date().toLocaleString()}\n`);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

