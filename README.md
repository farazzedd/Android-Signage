# Elvision - Digital Signage System

Professional digital signage solution for Android TVs. Deploy your own Xibo-like system with a full backend, CMS, and player app.

## Features

✨ **Full-Featured CMS**
- Admin and client authentication
- Multi-user accounts with roles
- Media management (images & videos)
- Playlist creation and scheduling
- Display management with invite codes
- WebSocket push notifications
- Real-time content updates

📱 **Android TV Player**
- Lightweight APK for Android TVs
- Invite code linking
- Full-screen playback
- Local caching & offline support
- Auto-reconnection
- Error recovery

🔧 **Developer-Friendly**
- Built with React, Express, and Drizzle ORM
- TypeScript for type safety
- Docker support for easy deployment
- REST API + WebSocket
- Modern UI with Tailwind CSS

🚀 **Enterprise-Grade**
- Self-hosted (no external dependencies)
- All media stored locally
- Database included (SQLite)
- Scalable architecture
- Security best practices

---

## Quick Start

### Local Development (5 minutes)

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5000`

### Docker Deployment (30 minutes)

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete instructions.

Quick version:
```bash
# On your VPS
git clone https://github.com/YOUR-USERNAME/elvision.git
cd elvision
sudo bash scripts/setup-vps.sh
sudo bash scripts/deploy.sh
```

---

## Project Structure

```
elvision/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── index.html
├── server/                # Express backend
│   ├── index.ts          # Server entry
│   ├── routes.ts         # API routes
│   ├── db.ts             # Database setup
│   └── storage.ts        # File storage
├── shared/               # Shared types
│   └── schema.ts         # Data schemas
├── scripts/              # Deployment scripts
├── Dockerfile           # Container image
├── docker-compose.yml   # Multi-container setup
├── DEPLOYMENT.md        # Detailed deployment guide
└── QUICKSTART.md        # Quick reference
```

---

## Deployment Options

### 1. **Single VPS** (Recommended for Budget)
- Everything on one server with Docker
- Cost: ~$5-15/month
- Setup time: ~30 minutes
- [Full Guide](DEPLOYMENT.md#docker-deployment-single-vps)

### 2. **VPS + Vercel** (Recommended for Scale)
- Frontend on Vercel (free + CDN)
- Backend on VPS with Docker
- Cost: ~$5-35/month
- [Full Guide](DEPLOYMENT.md#vercel-frontend-deployment)

### 3. **Heroku** (Simplest Onboarding)
- Everything managed
- Cost: ~$7+/month
- Setup time: ~15 minutes
- [Instructions](DEPLOYMENT.md#option-3-heroku-simplest-higher-cost)

### 4. **Railway.app** (Modern Alternative)
- Git-based deployment
- Cost: ~$5+/month
- Setup time: ~10 minutes
- [Instructions](DEPLOYMENT.md#option-4-railwayapp-modern-alternative)

---

## Quick Reference

### Development Commands
```bash
npm run dev              # Start with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run check            # Type check
npm run db:push          # Database migration
```

### Docker Commands
```bash
docker compose up -d     # Start containers
docker compose down      # Stop containers
docker compose logs -f   # View logs
docker compose ps        # Check status
```

### Generate Secrets
```bash
# Generate random strings for your .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Environment Configuration

### Development
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./db.sqlite
JWT_SECRET=dev-secret
SESSION_SECRET=dev-session
```

### Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=sqlite:/app/db.sqlite
JWT_SECRET=<secure-random-string>
SESSION_SECRET=<secure-random-string>
DOMAIN=your-domain.com
```

See `.env.example` for complete configuration options.

---

## Documentation

- 📖 **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- ⚡ **[Quick Start](QUICKSTART.md)** - Get running in 5-30 minutes
- 🔧 **[Setup Scripts](scripts/)** - Automated setup for VPS
- 🐳 **[Docker Guide](DEPLOYMENT.md#docker-deployment-single-vps)** - Containerization

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Current user info

### Displays
- `GET /api/displays` - List displays
- `POST /api/displays` - Create display
- `GET /api/displays/:id` - Get display
- `PATCH /api/displays/:id` - Update display
- `DELETE /api/displays/:id` - Delete display
- `POST /api/displays/invite/:code` - Link display by invite code

### Media
- `GET /api/media` - List media files
- `POST /api/media/upload` - Upload media
- `DELETE /api/media/:id` - Delete media
- `GET /uploads/:filename` - Download media

### Playlists
- `GET /api/playlists` - List playlists
- `POST /api/playlists` - Create playlist
- `PATCH /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist

### Schedules
- `GET /api/schedules` - List schedules
- `POST /api/schedules` - Create schedule
- `PATCH /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

---

## WebSocket Events

Connect to `ws://your-domain.com` or `ws://localhost:5000` in development.

### Client → Server
```javascript
// Join display channel
{ action: 'join', displayKey: 'abc123' }

// Heartbeat
{ action: 'ping' }
```

### Server → Client
```javascript
// Content refresh
{ action: 'refresh', displayKey: 'abc123' }

// Ping response
{ action: 'pong' }
```

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Query** - Server state
- **Wouter** - Lightweight routing
- **Zod** - Schema validation

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **SQLite** - Default database
- **WebSockets** - Real-time updates
- **Passport** - Authentication
- **Multer** - File uploads
- **zod-validation-error** - Error handling

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (optional)
- **Let's Encrypt** - Free SSL (optional)

---

## Security

✅ Environment variables for secrets
✅ Input validation with Zod
✅ SQL injection prevention with ORM
✅ CORS configuration
✅ HTTPS/SSL support
✅ Session-based authentication
✅ JWT token support
✅ File upload validation
✅ Rate limiting ready

---

## Performance

- Optimized React builds with Vite
- Lazy loading for images/videos
- WebSocket for real-time updates
- Local caching on players
- Database query optimization
- Gzip compression
- CDN-ready with Vercel option

---

## Scaling

When ready to scale beyond single VPS:

```
Vercel (Frontend CDN)
         ↓
    Load Balancer
    /    |    \
  API1  API2  API3 (Auto-scaled backends)
    \    |    /
   PostgreSQL (Managed DB)
   + S3 (Media storage)
```

[See Scaling Guide](DEPLOYMENT.md#scaling-beyond-one-server)

---

## Backup & Recovery

Automated backup script included:

```bash
bash scripts/backup.sh          # Manual backup
# Add to crontab for daily backups:
# 0 2 * * * /opt/elvision/scripts/backup.sh
```

Backups include:
- Database snapshot
- All uploaded media
- 30-day retention (configurable)

---

## Troubleshooting

### Container issues?
```bash
docker compose logs backend     # View errors
docker compose restart backend  # Restart
docker compose down -v          # Reset (WARNING: deletes data)
```

### Database problems?
```bash
npm run db:push                 # Reapply migrations
```

### WebSocket not connecting?
- Verify firewall allows WebSocket port
- Check `VITE_WS_URL` environment variable
- Verify Nginx config if using reverse proxy

[More troubleshooting →](DEPLOYMENT.md#troubleshooting)

---

## Support

- 📚 Full documentation in `/docs`
- 🐛 Report issues on GitHub
- 💬 Community discussions
- 📧 Contact support

---

## License

MIT - Feel free to use for personal or commercial projects

---

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## Roadmap

- [ ] iOS player
- [ ] Advanced layouts
- [ ] Geolocation scheduling
- [ ] Advanced analytics
- [ ] Multi-zone displays
- [ ] Live TV integration

---

## Getting Help

1. **Check [QUICKSTART.md](QUICKSTART.md)** for fast setup
2. **Read [DEPLOYMENT.md](DEPLOYMENT.md)** for detailed info
3. **Review [API docs](#api-endpoints)**
4. **Check logs**: `docker compose logs -f`
5. **Search issues** on GitHub

---

**Ready to deploy? Start with [QUICKSTART.md](QUICKSTART.md)! 🚀**
