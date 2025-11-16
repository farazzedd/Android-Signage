#!/bin/bash

# Elvision Nginx Reverse Proxy Setup
# Run this to set up Nginx as a reverse proxy with SSL

set -e

echo "🌐 Nginx Reverse Proxy Setup"
echo "============================="

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# Step 1: Install Nginx and Certbot
echo "📦 Installing Nginx and Certbot..."
apt update
apt install -y nginx certbot python3-certbot-nginx

# Step 2: Get domain name
echo ""
echo "Enter your domain name (e.g., example.com):"
read DOMAIN

if [ -z "$DOMAIN" ]; then
  echo "Domain required"
  exit 1
fi

# Step 3: Create Nginx config
echo ""
echo "⚙️  Creating Nginx configuration..."

cat > /etc/nginx/sites-available/elvision <<EOF
upstream backend {
    server backend:5000;
}

server {
    listen 80;
    server_name $DOMAIN;

    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/elvision_access.log;
    error_log /var/log/nginx/elvision_error.log;

    # Client upload size (for media uploads)
    client_max_body_size 500M;

    # Frontend
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API
    location /api {
        proxy_pass http://backend/api;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }

    # Media uploads
    location /uploads {
        proxy_pass http://backend/uploads;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Step 4: Enable site
echo ""
echo "🔗 Enabling Nginx site..."
ln -sf /etc/nginx/sites-available/elvision /etc/nginx/sites-enabled/elvision
rm -f /etc/nginx/sites-enabled/default

# Step 5: Test Nginx config
echo ""
echo "🧪 Testing Nginx configuration..."
nginx -t

# Step 6: Get SSL certificate
echo ""
echo "🔐 Getting SSL certificate from Let's Encrypt..."
echo "Make sure DNS is pointing to this server before continuing!"
echo "Press Enter to continue..."
read

certbot certonly --nginx -d $DOMAIN

# Step 7: Start Nginx
echo ""
echo "▶️  Starting Nginx..."
systemctl restart nginx
systemctl enable nginx

echo ""
echo "✅ Nginx Reverse Proxy Setup Complete!"
echo ""
echo "Your site is ready at: https://$DOMAIN"
echo ""
echo "SSL Certificate auto-renewal:"
certbot renew --dry-run

echo ""
echo "Check Nginx status:"
systemctl status nginx
