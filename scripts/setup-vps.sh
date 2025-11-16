#!/bin/bash

# Elvision Setup Script for fresh VPS
# Run this first on a clean Ubuntu/Debian VPS

set -e

echo "🔧 Elvision VPS Setup Script"
echo "============================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Step 1: Update system
echo "📦 Updating system packages..."
apt update
apt upgrade -y
apt install -y curl git wget nano htop

# Step 2: Install Docker
echo ""
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Step 3: Install Docker Compose
echo ""
echo "🐳 Installing Docker Compose..."
apt install -y docker-compose-plugin

# Step 4: Start Docker
echo ""
echo "▶️  Starting Docker service..."
systemctl start docker
systemctl enable docker

# Step 5: Create non-root user (optional)
echo ""
echo "👤 Creating non-root user (optional)..."
if ! id -u elvision &>/dev/null; then
  useradd -m -s /bin/bash elvision
  usermod -aG docker elvision
  echo "✓ User 'elvision' created with docker access"
else
  echo "✓ User 'elvision' already exists"
fi

# Step 6: Setup firewall (UFW)
echo ""
echo "🔒 Setting up firewall..."
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 5000/tcp  # Application
ufw --force enable

# Step 7: Setup swap (if not enough RAM)
echo ""
echo "💾 Checking swap..."
if [ $(free | grep Swap | awk '{print $2}') -eq 0 ]; then
  echo "Creating 2GB swap file..."
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Step 8: Create app directory
echo ""
echo "📁 Creating application directory..."
mkdir -p /opt/elvision
cd /opt/elvision

# Step 9: Clone repository
echo ""
echo "📥 Cloning repository..."
echo "Enter your GitHub repository URL (press Enter to skip):"
read REPO_URL

if [ ! -z "$REPO_URL" ]; then
  git clone $REPO_URL /opt/elvision
  cd /opt/elvision
fi

# Step 10: Setup complete
echo ""
echo "✅ VPS Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Add your GitHub repository:"
echo "   cd /opt/elvision"
echo "   git clone https://github.com/YOUR-USERNAME/elvision.git ."
echo ""
echo "2. Configure environment:"
echo "   cp .env.example .env"
echo "   nano .env"
echo ""
echo "3. Deploy:"
echo "   sudo bash scripts/deploy.sh"
echo ""
echo "System info:"
echo "  OS: $(lsb_release -ds)"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker compose version)"
