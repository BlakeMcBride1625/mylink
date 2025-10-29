#!/bin/bash

echo "🔍 VERIFYING GIT SAFETY BEFORE PUSH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Checking for sensitive files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Run: git init"
    echo ""
fi

# Check for .env files
echo "1. Checking for .env files..."
if git status --porcelain 2>/dev/null | grep -q "\.env$"; then
    echo "❌ DANGER: .env file will be committed!"
    echo "   Fix: Check your .gitignore"
    exit 1
else
    echo "✅ .env files properly ignored"
fi

# Check for node_modules
echo "2. Checking for node_modules..."
if git status --porcelain 2>/dev/null | grep -q "node_modules"; then
    echo "❌ DANGER: node_modules will be committed!"
    echo "   Fix: Check your .gitignore"
    exit 1
else
    echo "✅ node_modules properly ignored"
fi

# Check for common secrets
echo "3. Searching for hardcoded secrets..."
SECRETS_FOUND=false

# Check for API keys in source files
if grep -r "API.*KEY.*=.*['\"]" src/ server/ 2>/dev/null | grep -v "your_" | grep -v "example" | grep -v "\.example" > /dev/null; then
    echo "⚠️  WARNING: Potential API keys found in source code"
    grep -r "API.*KEY.*=.*['\"]" src/ server/ 2>/dev/null | grep -v "your_" | grep -v "example" | head -n 3
    SECRETS_FOUND=true
fi

# Check for passwords
if grep -r "PASSWORD.*=.*['\"]" src/ server/ 2>/dev/null | grep -v "your_" | grep -v "example" | grep -v "SMTP_PASS" > /dev/null; then
    echo "⚠️  WARNING: Potential passwords found in source code"
    grep -r "PASSWORD.*=.*['\"]" src/ server/ 2>/dev/null | grep -v "your_" | grep -v "example" | head -n 3
    SECRETS_FOUND=true
fi

if [ "$SECRETS_FOUND" = false ]; then
    echo "✅ No hardcoded secrets detected"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 FILES TO BE COMMITTED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d ".git" ]; then
    # Stage all files temporarily to see what would be committed
    git add . 2>/dev/null
    git status --short 2>/dev/null | head -n 20
    echo ""
    echo "(Showing first 20 files)"
    echo ""
    echo "Total files to commit: $(git status --short 2>/dev/null | wc -l)"
    
    # Unstage everything
    git reset 2>/dev/null > /dev/null
else
    echo "⚠️  Git not initialized. Run 'git init' first."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SAFETY CHECK RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SECRETS_FOUND" = true ]; then
    echo "⚠️  WARNINGS FOUND - Review before pushing"
else
    echo "✅ All checks passed - Safe to push!"
fi

echo ""
echo "Next steps:"
echo "  1. git init (if not done)"
echo "  2. git add ."
echo "  3. git commit -m 'Initial commit'"
echo "  4. git remote add origin YOUR_REPO"
echo "  5. git push -u origin main"
