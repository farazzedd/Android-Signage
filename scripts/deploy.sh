#!/bin/bash

# Elvision Deployment Script
# Run this on your VPS to deploy the application

set -e

echo "🚀 Elvision Deployment Script"
echo "=============================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Step 1: Check prerequisites
echo "✓ Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Installing..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose not found. Installing..."
  apt install docker-compose-plugin -y
fi

echo "✓ Prerequisites OK"

# Step 2: Clone or update repository
echo ""
echo "📦 Cloning/updating repository..."

if [ ! -d "/opt/elvision" ]; then
  cd /opt
  git clone https://github.com/YOUR-USERNAME/elvision.git
else
  cd /opt/elvision
  git pull origin main
fi

cd /opt/elvision

# Step 3: Setup environment
echo ""
echo "⚙️  Setting up environment..."

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠️  .env file created. Please edit /opt/elvision/.env with your settings"
  echo "   Critical settings:"
  echo "   - JWT_SECRET: $(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  echo "   - SESSION_SECRET: $(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
  echo "   - DOMAIN: your-domain.com"
  exit 1
fi

# Step 4: Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."

docker compose down || true
docker compose pull
docker compose up -d

# Step 5: Wait for container to be ready
echo ""
echo "⏳ Waiting for application to start..."
sleep 10

# Step 6: Run database migrations
echo ""
echo "🗄️  Setting up database..."

docker compose exec -T backend npm run db:push || true

# Step 7: Verify deployment
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Access your application at:"
echo "  Frontend: http://localhost:5000"
echo "  API: http://localhost:5000/api"
echo ""
echo "Check logs with: docker compose logs -f"
echo "Stop containers with: docker compose down"
