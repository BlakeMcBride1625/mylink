#!/bin/bash

# Daily Badge Update Script
# Run this script daily via cron to:
# 1. Download latest badge assets
# 2. Check for badge changes on your profile

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 MY HUB - Daily Badge Update"
echo "=============================="
echo "Started at: $(date)"
echo ""

# Step 1: Download all badges
echo "📦 Step 1: Downloading all badge assets..."
bash "$SCRIPT_DIR/download-all-badges.sh"
echo ""

# Step 2: Check for badge changes
echo "🔍 Step 2: Checking for badge changes..."
cd "$PROJECT_ROOT"
node "$SCRIPT_DIR/check-badge-changes.js"
echo ""

echo "✅ Daily badge update complete!"
echo "Finished at: $(date)"

