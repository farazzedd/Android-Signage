# Elvision - Deployment Guide

This guide covers deploying your digital signage system locally, with Docker, and to production environments.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment (Single VPS)](#docker-deployment-single-vps)
3. [Vercel Frontend Deployment](#vercel-frontend-deployment)
4. [Production Deployment Options](#production-deployment-options)
5. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites
- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Setup Steps

1. **Clone and install dependencies**
```bash
cd c:\Users\mfmoh\Desktop\AndroidSignage
npm install
```

2. **Set up environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your local settings (see .env.example for details)
```

3. **Initialize the database**
```bash
# Push database schema (uses Drizzle ORM)
npm run db:push
```

4. **Create uploads directory**
```bash
mkdir -p uploads
```

5. **Run in development mode**
```bash
npm run dev
```

This will:
- Start the Express server on port 5000
- Start the Vite dev server for hot-reloading
- Accessible at http://localhost:5000

### Development Commands

```bash
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm run check      # Type check with TypeScript
npm run db:push    # Push database schema changes
```

---

## Docker Deployment (Single VPS)

### Why Docker?
- **Consistency**: Same environment from dev to production
- **Isolation**: Containerized services don't conflict
- **Scalability**: Easy to manage and update
- **Persistence**: Volumes preserve data across restarts

### Prerequisites
- Docker and Docker Compose installed on your VPS
- A domain name (or use your VPS IP)
- SSH access to your VPS

### Step 1: Prepare Your VPS

**Ubuntu/Debian Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to avoid sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Prepare Your Application

On your local machine:

```bash
# Build the production build
npm run build

# This creates:
# - dist/public/ (frontend build)
# - dist/index.js (backend bundle)
```

### Step 3: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/elvision.git
git push -u origin main
```

### Step 4: Deploy to VPS

**Option A: Using git clone (recommended for small teams)**

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Clone your repository
git clone https://github.com/YOUR-USERNAME/elvision.git
cd elvision

# Copy environment file
cp .env.example .env

# Edit .env with your production settings
nano .env

# Start with Docker Compose
sudo docker compose up -d

# Check logs
sudo docker compose logs -f backend
```

**Option B: Using automated deployment script**

```bash
# On your VPS, download the deploy script
curl https://raw.githubusercontent.com/YOUR-USERNAME/elvision/main/scripts/deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### Step 5: Verify Deployment

```bash
# Check if containers are running
sudo docker compose ps

# View logs
sudo docker compose logs backend
sudo docker compose logs frontend

# Test the application
curl http://localhost:5000
```

### Accessing Your Application

- **Frontend**: `http://your-vps-ip:5000` or `http://your-domain.com`
- **API**: `http://your-vps-ip:5000/api`
- **WebSocket**: `ws://your-vps-ip:5000` or `wss://your-domain.com`

---

## Vercel Frontend Deployment

Vercel is ideal for deploying the React frontend if you want it separate from your backend.

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub repository pushed
- Backend already deployed

### Step 1: Create vercel.json

A `vercel.json` file is already included in the repo.

### Step 2: Deploy to Vercel

**Method 1: Via Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select "Other" as the framework
4. Configure environment variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://api.your-domain.com`)
   - `VITE_WS_URL`: Your WebSocket URL (e.g., `wss://api.your-domain.com`)
5. Deploy

**Method 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Step 3: Configure Backend URL

After deploying to Vercel, update your environment variables in the Vercel dashboard:

```
VITE_API_URL=https://your-vps-ip:5000
VITE_WS_URL=wss://your-vps-ip:5000
```

Or if you're using a domain:
```
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com
```

---

## Production Deployment Options

### Option 1: Single VPS (Recommended for Budget-Conscious)

**Cost**: ~$5-15/month
- Services: Backend, Database, Storage on one server
- Platform: DigitalOcean, Vultr, Linode, or AWS EC2

**Recommended Specs**:
- 2GB RAM (1GB minimum)
- 2 vCPU
- 50GB SSD
- Ubuntu 22.04 LTS

**Setup**: Follow "Docker Deployment" section above

### Option 2: VPS + Vercel (Recommended for Scale)

**Cost**: ~$5-15/month (VPS) + free-$20/month (Vercel)
- Frontend: Vercel (auto-scaling, CDN)
- Backend: VPS with Docker

**Setup**:
1. Deploy backend to VPS (see "Docker Deployment")
2. Deploy frontend to Vercel (see "Vercel Frontend Deployment")

### Option 3: Heroku (Simplest, Higher Cost)

**Cost**: ~$7/month minimum
- Platform: Fully managed
- Database: Built-in PostgreSQL

**Deployment**:
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set DATABASE_URL=...
heroku config:set JWT_SECRET=...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 4: Railway.app (Modern Alternative)

**Cost**: ~$5/month
- Simple Git-based deployment
- Built-in database and storage
- Better pricing than Heroku

**Deployment**:
1. Sign up at https://railway.app
2. Connect your GitHub repo
3. Add environment variables
4. Auto-deploys on git push

---

## Scaling Beyond One Server

When you outgrow a single VPS:

### Architecture Upgrade
```
┌─────────────────┐
│  Vercel (CDN)   │  Frontend with global CDN
└────────┬────────┘
         │
         ├──────────────┬──────────────┐
         │              │              │
    ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
    │ Backend 1 │  │ Backend 2 │  │ Backend 3 │
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
                 ┌──────▼───────┐
                 │  PostgreSQL  │  Managed database
                 │   (AWS RDS)  │
                 └──────┬───────┘
                        │
                 ┌──────▼───────┐
                 │  S3 Storage  │  Media storage
                 │  (AWS S3)    │
                 └──────────────┘
```

### Migration Steps
1. Set up managed PostgreSQL (AWS RDS, DigitalOcean Managed DB)
2. Set up S3 or similar for media storage
3. Use load balancer in front of multiple backend instances
4. Update database credentials in environment variables
5. Update media storage path in backend code

---

## Environment Variables

### Development (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./db.sqlite
JWT_SECRET=dev-secret-change-in-production
SESSION_SECRET=dev-session-secret
UPLOADS_DIR=./uploads
```

### Production (.env)
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/elvision
JWT_SECRET=<generate-secure-random-string>
SESSION_SECRET=<generate-secure-random-string>
UPLOADS_DIR=/app/uploads
```

**Generate secure secrets**:
```bash
# On your machine
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Security Best Practices

1. **Use HTTPS**
   - Get free SSL from Let's Encrypt
   - Use Nginx as reverse proxy

2. **Environment Variables**
   - Never commit `.env` to git
   - Use `.env.example` as template
   - Rotate secrets regularly

3. **Database**
   - Use strong passwords
   - Run behind firewall
   - Regular backups

4. **Backups**
   - Daily database backups
   - Daily media uploads backup
   - Test restore procedures monthly

---

## Troubleshooting

### Container won't start
```bash
# Check logs
sudo docker compose logs backend

# Restart container
sudo docker compose restart backend

# Full reset
sudo docker compose down
sudo docker compose up -d
```

### Database issues
```bash
# Check database logs
sudo docker compose logs db

# Reset database (WARNING: Deletes data)
sudo docker compose down -v
sudo docker compose up -d
npm run db:push
```

### WebSocket connection fails
- Check firewall allows WebSocket ports
- Verify `VITE_WS_URL` matches backend URL
- Check reverse proxy config (if using Nginx)

### Media uploads not persisting
```bash
# Verify uploads volume exists
sudo docker volume ls
sudo docker volume inspect elvision_uploads

# Check permissions
sudo chown -R 1000:1000 /var/lib/docker/volumes/elvision_uploads/_data
```

---

## Monitoring & Maintenance

### Regular Tasks
- Monitor disk space: `df -h`
- Check container health: `sudo docker compose ps`
- Review logs: `sudo docker compose logs --tail=100`
- Update containers: `sudo docker compose pull && sudo docker compose up -d`

### Recommended Tools
- **UptimeRobot**: Free uptime monitoring
- **DataDog**: Application monitoring
- **PagerDuty**: Alert management

---

## Support

For issues or questions:
1. Check logs: `sudo docker compose logs -f`
2. Review this guide
3. Open an issue on GitHub
4. Consult Docker/Express/React documentation

---

## Quick Reference

```bash
# Local development
npm install
npm run dev

# Build production
npm run build

# Docker start
sudo docker compose up -d

# Docker logs
sudo docker compose logs -f

# Docker stop
sudo docker compose down

# Database migrations
npm run db:push

# Push to GitHub
git add .
git commit -m "message"
git push origin main
```

