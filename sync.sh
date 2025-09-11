#!/bin/bash

set -e  # Exit on any error

# Add Bun to PATH
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

echo "🚀 Starting deployment sync..."

# Sync with remote
echo "📥 Syncing with origin/main..."
git reset --hard HEAD
git pull origin main --force

# Install dependencies
echo "📦 Installing dependencies..."
composer install --prefer-dist --no-interaction
bun install

# Build assets
echo "🏗️  Building assets..."
bun run build

# Handle migrations
if [[ "$1" == "fresh" ]]; then
  echo "🗃️  Running fresh migration with seeder"
  php artisan migrate:fresh --seed
elif [[ "$1" == "migrate" ]]; then
  echo "🗃️  Running migrations..."
  php artisan migrate
fi

echo "✅ Deployment completed successfully!"