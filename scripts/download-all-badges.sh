#!/bin/bash

# Download All Discord Badges Script
# Downloads all badge assets from Discord Resources and GitHub
# Run this daily to keep badges up to date

set -e

BADGE_DIR="$(dirname "$0")/../public/badges"
TEMP_DIR="/tmp/discord-badges"

echo "🎨 Discord Badge Downloader"
echo "============================="
echo ""

# Create directories
mkdir -p "$BADGE_DIR"
mkdir -p "$TEMP_DIR"

# Discord Resources URL
DISCORD_RESOURCES="https://discordresources.com"

echo "📦 Downloading badges from Discord Resources..."

# General Badges
badges=(
  "quest.png"
  "discordlootbox.svg"
  "username.png"
  "hypesquadevents.svg"
  "hypesquadbrilliance.svg"
  "hypesquadbravery.svg"
  "hypesquadbalance.svg"
  "discordstaff.svg"
  "discordpartner.svg"
  "discordmod.svg"
  "discordbotdev.svg"
  "activedeveloper.svg"
  "discordnitro.svg"
  "earlysupporter.png"
  "discordbughunter1.svg"
  "discordbughunter2.svg"
  "supportscommands.svg"
  "automod.svg"
  "premiumbot.png"
)

for badge in "${badges[@]}"; do
  echo "  Downloading $badge..."
  curl -s -f -o "$BADGE_DIR/$badge" "$DISCORD_RESOURCES/img/$badge" 2>/dev/null || echo "    ⚠️  Failed to download $badge"
done

# Nitro Subscription Tiers
echo ""
echo "💎 Downloading Nitro subscription badges..."
mkdir -p "$BADGE_DIR/subscriptions"

nitro_tiers=(
  "bronze.svg"
  "silver.svg"
  "gold.svg"
  "platinum.svg"
  "diamond.svg"
  "emerald.svg"
  "ruby.svg"
  "fire.svg"
)

for tier in "${nitro_tiers[@]}"; do
  echo "  Downloading nitro-$tier..."
  curl -s -f -o "$BADGE_DIR/subscriptions/nitro-$tier" "$DISCORD_RESOURCES/img/subscriptions/$tier" 2>/dev/null || echo "    ⚠️  Failed to download $tier"
done

# Server Boost Tiers
echo ""
echo "🚀 Downloading server boost badges..."
mkdir -p "$BADGE_DIR/boosts"

for i in {1..9}; do
  echo "  Downloading serverboost$i.svg..."
  curl -s -f -o "$BADGE_DIR/boosts/serverboost$i.svg" "$DISCORD_RESOURCES/img/boosts/discordboost$i.svg" 2>/dev/null || echo "    ⚠️  Failed to download boost $i"
done

# GitHub Repository Badges (mezotv/discord-badges)
echo ""
echo "🌟 Downloading special badges from GitHub..."

github_badges=(
  "orb.svg:apprentice.svg"
)

for badge_mapping in "${github_badges[@]}"; do
  IFS=':' read -r github_name local_name <<< "$badge_mapping"
  echo "  Downloading $local_name..."
  curl -s -f -o "$BADGE_DIR/$local_name" "https://raw.githubusercontent.com/mezotv/discord-badges/main/assets/$github_name" 2>/dev/null || echo "    ⚠️  Failed to download $github_name"
done

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Badge download complete!"
echo "📁 Badges saved to: $BADGE_DIR"
echo ""
echo "📊 Badge Summary:"
badge_count=$(find "$BADGE_DIR" -type f \( -name "*.svg" -o -name "*.png" \) | wc -l | tr -d ' ')
echo "  Total badges downloaded: $badge_count"

