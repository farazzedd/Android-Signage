# Quick Start Guide - Elvision

Get Elvision up and running in minutes!

## 🏃 5-Minute Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Start development server
npm run dev
```

Visit `http://localhost:5000` 🎉

---

## 🚀 30-Minute Docker Deployment

### On Your Local Machine

```bash
# 1. Build production build
npm run build

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### On Your VPS

```bash
# 1. SSH into VPS
ssh root@your-vps-ip

# 2. Run setup script (Ubuntu/Debian only)
curl https://raw.githubusercontent.com/YOUR-USERNAME/elvision/main/scripts/setup-vps.sh | sudo bash

# 3. Clone repository
cd /opt
git clone https://github.com/YOUR-USERNAME/elvision.git
cd elvision

# 4. Configure environment
cp .env.example .env
nano .env
# Edit these:
# - JWT_SECRET=<generate secure string>
# - SESSION_SECRET=<generate secure string>
# - DOMAIN=your-domain.com

# 5. Deploy
sudo bash scripts/deploy.sh

# 6. (Optional) Setup Nginx with SSL
sudo bash scripts/setup-nginx.sh
```

Visit `http://your-vps-ip:5000` or `https://your-domain.com`

---

## 📋 What You Get

✅ Full backend API with authentication
✅ React frontend with Tailwind CSS
✅ Database (SQLite built-in)
✅ Media upload/storage
✅ WebSocket support
✅ Docker containerization
✅ Database migrations
✅ Environment configuration
✅ Deployment scripts
✅ Backup tools

---

## 🔑 Generate Required Secrets

Run this to generate secure random strings for your `.env` file:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📚 Common Commands

```bash
# Local development
npm run dev              # Start with hot reload
npm run build            # Build for production
npm run check            # TypeScript check
npm run db:push          # Database migration

# Docker
docker compose up -d     # Start containers
docker compose down      # Stop containers
docker compose logs -f   # View logs
docker compose ps        # Check status

# Backups
bash scripts/backup.sh   # Backup database & uploads

# SSH into container
docker compose exec backend bash
```

---

## 🌐 Deployment Options

| Option | Cost | Complexity | Best For |
|--------|------|-----------|----------|
| **Single VPS** | $5-15/mo | Low | Small teams, budget-conscious |
| **VPS + Vercel** | $5-35/mo | Medium | Global reach, frontendCDN |
| **Heroku** | $7+/mo | Very Low | Quick deployments, managed |
| **Railway** | $5+/mo | Low | Modern, Git-based deployment |

---

## 🆘 Troubleshooting

### Port already in use
```bash
# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Database migration failed
```bash
npm run db:push
```

### Can't connect to backend
- Check backend is running: `curl http://localhost:5000/api`
- Check `.env` VITE_API_URL matches
- Check firewall allows port 5000

### Docker containers won't start
```bash
docker compose logs backend  # Check error
docker compose down
docker compose up -d         # Restart
```

---

## 📞 Support Resources

- **Documentation**: See `DEPLOYMENT.md`
- **Docker Docs**: https://docs.docker.com
- **Express.js**: https://expressjs.com
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

---

## ✨ Next Steps

1. ✅ Get it running locally
2. ✅ Push to GitHub
3. ✅ Deploy to VPS with Docker
4. ✅ Add custom domain & SSL
5. ✅ Set up automated backups
6. ✅ Configure monitoring & alerts

---

**Happy deploying! 🚀**
