#!/bin/bash

# BiteBase Intelligence Cloudflare Deployment Script
# This script helps deploy the backend to Cloudflare Workers

set -e

echo "🚀 BiteBase Intelligence - Cloudflare Workers Deployment"
echo "========================================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

echo "📋 Current wrangler version:"
npx wrangler --version

# Check authentication
echo ""
echo "🔐 Checking Cloudflare authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
    echo "❌ Not authenticated with Cloudflare"
    echo "Please run one of the following:"
    echo "  1. Interactive login: npx wrangler login"
    echo "  2. API Token: export CLOUDFLARE_API_TOKEN=your_token_here"
    echo ""
    echo "Then run this script again."
    exit 1
else
    echo "✅ Authenticated with Cloudflare"
    npx wrangler whoami
fi

echo ""
echo "🗄️ Setting up D1 Database..."

# Check if database exists
if npx wrangler d1 list | grep -q "bitebase-intelligence-db"; then
    echo "✅ D1 database 'bitebase-intelligence-db' already exists"
else
    echo "📦 Creating D1 database..."
    npx wrangler d1 create bitebase-intelligence-db
    echo ""
    echo "⚠️  Please update wrangler.toml with the new database ID"
    echo "   You can find it in the output above"
    read -p "Press Enter after updating wrangler.toml..."
fi

# Apply migrations
echo ""
echo "🔧 Applying database migrations..."
npx wrangler d1 migrations apply bitebase-intelligence-db --env production

echo ""
echo "🏪 Setting up KV Namespaces..."

# Create KV namespaces if they don't exist
echo "Creating CACHE namespace..."
npx wrangler kv:namespace create CACHE --env production || true

echo "Creating SESSIONS namespace..."
npx wrangler kv:namespace create SESSIONS --env production || true

echo "Creating ANALYTICS namespace..."
npx wrangler kv:namespace create ANALYTICS --env production || true

echo ""
echo "🔑 Setting up environment variables..."
echo "Please set the following secrets:"

# Check if JWT_SECRET is set
if ! npx wrangler secret list --env production | grep -q JWT_SECRET; then
    echo "Setting JWT_SECRET..."
    echo "Please enter a strong JWT secret (32+ characters):"
    npx wrangler secret put JWT_SECRET --env production
else
    echo "✅ JWT_SECRET already set"
fi

echo ""
echo "🚀 Deploying to Cloudflare Workers..."

# Deploy to production
npx wrangler deploy --env production

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your API endpoints:"
echo "  Production: https://bitebase-intelligence.your-subdomain.workers.dev"
echo ""
echo "📊 Test endpoints:"
echo "  curl https://your-worker-url/"
echo "  curl https://your-worker-url/health"
echo "  curl https://your-worker-url/test-db"
echo "  curl https://your-worker-url/test-kv"
echo ""
echo "📈 Monitor your deployment:"
echo "  npx wrangler tail --env production"
echo ""
echo "🎉 BiteBase Intelligence backend is now live on Cloudflare!"