# GitHub Setup & Deployment Guide

Get your Elvision project on GitHub and ready for deployment.

---

## 🔧 Step 1: Initialize Git (If Not Already Done)

```bash
cd c:\Users\mfmoh\Desktop\AndroidSignage

# Initialize git repo
git init

# Set your details (use your GitHub email/name)
git config user.name "Your Name"
git config user.email "your.email@gmail.com"

# Or configure globally
git config --global user.name "Your Name"
git config --global user.email "your.email@gmail.com"
```

---

## 📝 Step 2: Create .gitignore (Already Included)

The `.gitignore` file should already prevent committing:
- `node_modules/`
- `.env` files
- `dist/` builds
- `uploads/` media
- Database files
- IDE files

---

## 🚀 Step 3: Create GitHub Repository

**Method A: Via GitHub Web (Easiest)**

1. Go to https://github.com/new
2. Repository name: `elvision`
3. Description: `Professional digital signage system for Android TVs`
4. Choose: **Public** (for documentation/examples) or **Private** (for your code)
5. **DO NOT** initialize with README (we have one)
6. Click "Create repository"

**Method B: Via GitHub CLI**

```bash
# Install GitHub CLI first
# Windows: https://cli.github.com

gh auth login
gh repo create elvision --public --source=. --remote=origin --push
```

---

## 📤 Step 4: Push to GitHub

```bash
# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Elvision digital signage system

- Full backend with Express.js
- React frontend with Tailwind CSS
- Docker containerization
- Deployment scripts and documentation"

# Add remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/elvision.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## 🔐 Step 5: GitHub Security Setup

### Add GitHub Token (for automatic deployments)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" > "Generate new token (classic)"
3. Set scopes:
   - ☑️ `repo` (full control)
   - ☑️ `workflow` (actions)
   - ☑️ `admin:repo_hook` (webhooks)
4. Set expiration: 90 days (rotate periodically)
5. Copy token and save securely

### Add Secrets for Deployment

1. Go to your repo: GitHub.com/YOUR-USERNAME/elvision
2. Settings > Secrets and variables > Actions
3. Add new secrets:

```
DEPLOY_HOST = your-vps-ip
DEPLOY_USER = your-vps-username
DEPLOY_KEY = your-ssh-private-key
JWT_SECRET = <generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
SESSION_SECRET = <generate same as above>
```

---

## 🤖 Step 6: GitHub Actions CI/CD (Optional)

Create automatic testing and deployment:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript check
        run: npm run check
      
      - name: Build
        run: npm run build
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/elvision
            git pull origin main
            npm install
            npm run build
            docker compose down
            docker compose up -d
            docker compose exec -T backend npm run db:push
```

---

## 📚 Step 7: Add Documentation to GitHub

Your repository now includes:

| File | Purpose |
|------|---------|
| `README.md` | Project overview & quick start |
| `DEPLOYMENT.md` | Detailed deployment guide |
| `QUICKSTART.md` | 5-30 minute setup |
| `HOSTING.md` | Hosting options & costs |
| `package.json` | Dependencies |
| `Dockerfile` | Container image |
| `docker-compose.yml` | Multi-container setup |
| `scripts/` | Deployment automation |

---

## 🔄 Ongoing Git Workflow

### Daily Development

```bash
# Before starting work
git pull origin main

# Make changes...

# Commit regularly
git add .
git commit -m "Feature: Add display scheduling"

# Push to GitHub
git push origin main
```

### Creating Features

```bash
# Create feature branch
git checkout -b feature/display-scheduling

# Make changes...

# Commit
git add .
git commit -m "Feature: Add display scheduling"

# Push branch
git push origin feature/display-scheduling

# Create Pull Request on GitHub
# Then merge to main
```

### Deploying

```bash
# Main branch auto-deploys to VPS via GitHub Actions
# Or manually:

ssh root@your-vps-ip
cd /opt/elvision
git pull origin main
npm run build
docker compose restart
```

---

## 🐛 Git Tips & Tricks

### Undo last commit (before push)
```bash
git reset HEAD~1
```

### View commit history
```bash
git log --oneline
```

### Sync fork with upstream
```bash
git remote add upstream https://github.com/ORIGINAL-AUTHOR/elvision.git
git fetch upstream
git merge upstream/main
```

### Clean up branches
```bash
# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# List branches
git branch -a
```

### Emergency: Revert to previous version
```bash
# View history
git log --oneline

# Revert to specific commit
git revert abc123def

# Or hard reset (WARNING: loses changes)
git reset --hard abc123def
git push --force
```

---

## 🚨 Common Git Issues

### "Permission denied (publickey)"

**Solution**: Add SSH key to GitHub

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your@email.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub:
# Go to https://github.com/settings/keys
# Click "New SSH key"
# Paste your public key
# Save
```

### "fatal: not a git repository"

**Solution**: Initialize git or change directory

```bash
cd c:\Users\mfmoh\Desktop\AndroidSignage
git init
```

### "Please commit your changes or stash them before you switch branches"

**Solution**: Commit or stash changes

```bash
# Commit your work
git add .
git commit -m "Work in progress"

# Or stash temporarily
git stash
```

### Can't push to main

**Solution**: Set upstream branch

```bash
git push -u origin main
```

---

## 📊 GitHub Repository Settings

### Recommended Settings

1. **Settings** > **General**
   - ✓ Wiki: Disable
   - ✓ Discussions: Enable
   - ✓ Projects: Enable

2. **Settings** > **Branches**
   - Set `main` as default branch
   - Add branch protection rules:
     - Require PR reviews before merge
     - Require status checks to pass

3. **Settings** > **Security & Analysis**
   - ✓ Enable Dependabot
   - ✓ Enable code scanning

4. **Settings** > **Deploy Keys**
   - Add deployment VPS SSH key (optional)

---

## 🔑 GitHub Secrets for Deployment

Add these to GitHub > Settings > Secrets:

```bash
# Generate these (one-time)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Required secrets:
- `JWT_SECRET` - Random 32-byte hex string
- `SESSION_SECRET` - Random 32-byte hex string
- `DEPLOY_HOST` - Your VPS IP or domain
- `DEPLOY_USER` - VPS username (default: root)
- `DEPLOY_KEY` - Your VPS SSH private key

---

## 🌐 Vercel + GitHub Integration

For Vercel deployment:

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Choose your GitHub account
4. Select `elvision`
5. Configure:
   - Framework: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
6. Add environment variables:
   - `VITE_API_URL` = `https://api.your-domain.com`
   - `VITE_WS_URL` = `wss://api.your-domain.com`
7. Click Deploy

Now every push to main auto-deploys to Vercel!

---

## 📈 Next Steps

1. ✅ Create GitHub repository
2. ✅ Push your code
3. ✅ Configure secrets
4. ✅ Set up GitHub Actions (optional)
5. ✅ Configure Vercel (if using)
6. ✅ Configure VPS auto-deployment (if using)

---

## 📖 Git Resources

- **Git Basics**: https://git-scm.com/book/en/v2
- **GitHub Docs**: https://docs.github.com
- **GitHub Actions**: https://docs.github.com/en/actions
- **Git Cheat Sheet**: https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf

---

## 🚀 You're Ready!

Your code is on GitHub and ready to deploy. Next steps:

1. **Local**: `npm run dev`
2. **GitHub**: `git push origin main`
3. **VPS**: `git pull && docker compose up -d`
4. **Vercel**: Auto-deploys on push

**Choose your deployment from [HOSTING.md](HOSTING.md) →**
