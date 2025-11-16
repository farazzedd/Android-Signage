# 🚀 Deployment Quick Reference

**Print this page or bookmark it!**

---

## 📍 Where to Start

1. **First time?** → Read [QUICKSTART.md](QUICKSTART.md)
2. **Want details?** → Read [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Choosing hosting?** → Read [HOSTING.md](HOSTING.md)
4. **Using GitHub?** → Read [GITHUB_SETUP.md](GITHUB_SETUP.md)

---

## ⚡ 60 Second Setup

```bash
# Local Development
npm install
npm run dev
# ✓ Visit http://localhost:5000

# Or with Docker
docker compose up -d
# ✓ Visit http://localhost:5000
```

---

## 🏠 Hosting Options (Cost + Time)

| Platform | Monthly | Setup | Best For |
|----------|---------|-------|----------|
| **Single VPS** | $5 | 30 min | Budget & control |
| **VPS + Vercel** | $10 | 60 min | Scale & CDN |
| **Vercel + Railway** | $5 | 15 min | Quick & easy |
| **Heroku** | $50+ | 15 min | Managed |

---

## 🚀 Deploy Commands

### Local
```bash
npm run dev              # Development with hot reload
npm run build            # Build for production
npm run check            # Type check
npm run db:push          # Database migrations
```

### Docker
```bash
docker compose up -d     # Start
docker compose down      # Stop
docker compose logs -f   # View logs
docker compose restart   # Restart
```

### VPS (Ubuntu/Debian)
```bash
# Initial setup (run once)
curl https://raw.githubusercontent.com/YOUR-USERNAME/elvision/main/scripts/setup-vps.sh | sudo bash

# Deploy app
sudo bash scripts/deploy.sh

# Setup Nginx + SSL (optional)
sudo bash scripts/setup-nginx.sh

# Manual deployment
cd /opt/elvision
git pull
docker compose up -d
```

### Vercel
```bash
# Install CLI
npm i -g vercel

# Deploy
vercel --prod

# Or: Connect GitHub → Auto-deploys
```

---

## 🔑 Generate Secrets

```bash
# Run this command twice
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use for:
# JWT_SECRET = [first output]
# SESSION_SECRET = [second output]
```

---

## 📝 Environment Variables

### Local Development
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./db.sqlite
JWT_SECRET=dev-key-change-in-production
SESSION_SECRET=dev-session-change-in-production
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:/app/db.sqlite
JWT_SECRET=<secure-random-string>
SESSION_SECRET=<secure-random-string>
VITE_API_URL=https://your-domain.com
VITE_WS_URL=wss://your-domain.com
DOMAIN=your-domain.com
```

---

## 🔒 Pre-Deployment Checklist

- [ ] Secrets generated and unique
- [ ] `.env` configured
- [ ] `.env` NOT in git (check `.gitignore`)
- [ ] Tested locally: `npm run dev` works
- [ ] Tested build: `npm run build` works
- [ ] Database initialized: `npm run db:push`
- [ ] Backups configured
- [ ] Firewall allows ports 80, 443, 5000

---

## 🆘 Troubleshooting

### Port 5000 in use?
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Docker won't start?
```bash
docker compose logs backend
docker compose down
docker compose up -d
```

### Can't reach VPS?
```bash
# Check it's running
ping your-vps-ip

# Check port is open
curl http://your-vps-ip:5000

# Check firewall
sudo ufw status
```

### Database error?
```bash
npm run db:push
```

---

## 📋 Deployment Paths

### Path 1: Single VPS (30 minutes)
```
VPS Setup
  ↓
Deploy Application
  ↓
Setup Nginx (optional)
  ↓
Live!
```

### Path 2: VPS + Vercel (60 minutes)
```
Deploy Backend to VPS
  ↓
Deploy Frontend to Vercel
  ↓
Configure API URLs
  ↓
Live!
```

### Path 3: Vercel + Railway (15 minutes)
```
Push to GitHub
  ↓
Connect Vercel
  ↓
Connect Railway
  ↓
Live!
```

---

## 🔗 API Endpoints

```
Authentication
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/me

Displays
  GET    /api/displays
  POST   /api/displays
  PATCH  /api/displays/:id
  DELETE /api/displays/:id
  POST   /api/displays/invite/:code

Media
  GET    /api/media
  POST   /api/media/upload
  DELETE /api/media/:id

Playlists
  GET    /api/playlists
  POST   /api/playlists
  PATCH  /api/playlists/:id
  DELETE /api/playlists/:id

Schedules
  GET    /api/schedules
  POST   /api/schedules
  PATCH  /api/schedules/:id
  DELETE /api/schedules/:id
```

---

## 🌐 WebSocket Events

```javascript
// Connect
ws://your-domain.com or ws://localhost:5000

// Send
{ action: 'join', displayKey: 'abc123' }
{ action: 'ping' }

// Receive
{ action: 'refresh', displayKey: 'abc123' }
{ action: 'pong' }
```

---

## 💾 Backup

```bash
# Manual backup
bash scripts/backup.sh

# Daily backups (Linux/Mac)
# Add to crontab:
0 2 * * * /opt/elvision/scripts/backup.sh

# Check backups
ls -lh /backups/elvision/
```

---

## 📞 Git Workflow

```bash
# First time
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/elvision.git
git push -u origin main

# Daily
git add .
git commit -m "Your change"
git push origin main

# Deploy changes
# On VPS: git pull && docker compose restart
```

---

## 📊 Status Check

```bash
# Local
npm run check              # TypeScript check
curl http://localhost:5000 # API health

# Docker
docker compose ps          # Container status
docker compose logs -f     # View logs

# VPS
curl http://your-vps:5000  # API health
docker compose ps          # Container status
df -h                      # Disk space
free -h                    # Memory
```

---

## 🔐 Security Reminders

✅ **DO:**
- Use unique secrets per environment
- Store `.env` securely (not in git)
- Use HTTPS in production
- Update packages regularly
- Test backups regularly

❌ **DON'T:**
- Commit `.env` file
- Use weak passwords
- Run as root unnecessarily
- Disable firewall
- Ignore security updates

---

## 📚 Quick Links

- 📖 [QUICKSTART.md](QUICKSTART.md) - 5-30 minute guide
- 📖 [DEPLOYMENT.md](DEPLOYMENT.md) - Complete guide
- 🏠 [HOSTING.md](HOSTING.md) - Platform comparison
- 🐙 [GITHUB_SETUP.md](GITHUB_SETUP.md) - Version control
- 📄 [README.md](README.md) - Project overview

---

## 🎯 Success Indicators

Your deployment is successful when:

✅ `npm run dev` works locally
✅ `npm run build` completes
✅ `docker compose up -d` starts containers
✅ App accessible at your URL
✅ Database initialized
✅ Media uploads work
✅ WebSocket connects
✅ Backups automated

---

## 🚀 You're Ready!

Choose your hosting from [HOSTING.md](HOSTING.md) and follow the setup guide.

**Good luck! 🎉**

---

## Emergency Commands

```bash
# Reset everything (WARNING: deletes data)
docker compose down -v

# View all logs
docker compose logs backend frontend

# SSH into container
docker compose exec backend bash

# Restart all services
docker compose restart

# Stop everything
docker compose stop

# Remove old images
docker image prune
```

---

**Save this page for quick reference!**

Print version: Use your browser's print function
Bookmark: Ctrl+D (Windows/Linux) or Cmd+D (Mac)
