# 🚀 Railway Deployment - Complete Guide
## Push to GitHub + Deploy to Railway in 15 Minutes

---

## 📋 Step 1: Create GitHub Account & Repository

### A. Create GitHub Account
1. **Open:** https://github.com/signup
2. **Enter your email** (use the email you want)
3. **Create password** (strong password)
4. **Username** (something like `mfmoh` or `your-name`)
5. **Click "Create Account"**
6. **Verify email** - Check your inbox and click the verification link

✅ **GitHub account created!**

---

### B. Create a New Repository on GitHub

1. **Open:** https://github.com/new
2. **Fill in these fields:**
   - **Repository name**: `android-signage` (or `elvision`)
   - **Description**: "Digital Signage System for Android"
   - **Public** (anyone can see) or **Private** (only you)
   - **Check:** Add a README file ❌ (uncheck - we have one)
   - **Check:** Add .gitignore ❌ (uncheck - we have one)
   - **Check:** Choose a license ❌ (uncheck)

3. **Click "Create repository"**

✅ **Repository created on GitHub!**

---

## 🔧 Step 2: Push Your Code to GitHub

### A. Open PowerShell Terminal

1. **Go to your project folder:**
```powershell
cd C:\Users\mfmoh\Desktop\AndroidSignage
```

2. **Check if git is initialized:**
```powershell
git status
```

**If you see an error:**
- Git is not initialized yet, continue below
- If you see branch info, jump to **Step 2B**

### B. Initialize Git (Only if needed)

```powershell
# Initialize git
git init

# Check git status
git status
```

You should see files listed as "Untracked files"

---

### C. Add All Your Files to Git

```powershell
# Stage all files
git add .

# Check what's staged
git status
```

You should see your files in green (staged for commit)

---

### D. Create Your First Commit

```powershell
# Commit with a message
git commit -m "Initial commit: Android Signage system ready for deployment"

# Check commit
git log --oneline
```

✅ **Files are committed!**

---

### E. Connect to GitHub Repository

```powershell
# Replace YOUR_USERNAME with your GitHub username
# Replace YOUR_REPO with your repository name (e.g., android-signage)

git remote add origin https://github.com/YOUR_USERNAME/android-signage.git

# Example:
# git remote add origin https://github.com/mfmoh/android-signage.git
```

**Verify the connection:**
```powershell
git remote -v
```

You should see:
```
origin  https://github.com/YOUR_USERNAME/android-signage.git (fetch)
origin  https://github.com/YOUR_USERNAME/android-signage.git (push)
```

---

### F. Push Your Code to GitHub

```powershell
# Set main branch and push
git branch -M main
git push -u origin main
```

**First time, you might see:**
```
Username for 'https://github.com':
```

Enter your GitHub username, press Enter

```
Password for 'https://github.com/YOUR_USERNAME':
```

**⚠️ IMPORTANT: Use Personal Access Token (NOT your password)**

#### Get Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Fill in:
   - **Note**: `Railway Deployment Token`
   - **Expiration**: 90 days (or No expiration)
   - **Select scopes**: Check `repo` and `gist`
4. Click **"Generate token"**
5. **COPY the token** (it only shows once!)
6. Go back to PowerShell and paste it as password

---

### G. Verify Push Was Successful

```powershell
git log --oneline
```

Then open https://github.com/YOUR_USERNAME/android-signage

You should see your code on GitHub! ✅

---

## 🚂 Step 3: Deploy to Railway

### A. Sign Up to Railway

1. **Open:** https://railway.app
2. **Click "Start Project"**
3. **Click "Deploy from GitHub"**
4. **Authorize Railway to access your GitHub**
5. **Select repository access:**
   - Choose "Only select repositories"
   - Select `android-signage`
   - Click "Install & Authorize"

✅ **Railway connected to GitHub!**

---

### B. Create a Railway Project

1. **Go to:** https://railway.app/dashboard
2. **Click "New Project"** button
3. **Select "Deploy from GitHub repo"**
4. **Select your repository** (`android-signage`)
5. **Railway will detect your setup** (it might take 10 seconds)
6. **Click "Deploy"**

Railway will start building your app (takes 2-5 minutes)

✅ **Deployment started!**

---

### C. Add PostgreSQL Database

While deployment is running, let's add a database:

1. **In Railway dashboard, go to your project**
2. **Click "New"** button (or **"+ Add Service"**)
3. **Select "Database"** → **"PostgreSQL"**
4. **Railway creates database automatically** ✅

---

### D. Configure Environment Variables

1. **Go to your Railway project**
2. **Click the main app service** (not the database)
3. **Go to "Variables" tab**
4. **Click "RAW Editor"**
5. **Paste these variables:**

```
NODE_ENV=production
PORT=3000
```

6. **Now connect the database URL:**
   - Click back to "Variables"
   - Look for **`DATABASE_URL`** - it should auto-appear if PostgreSQL is linked
   - If not, go to PostgreSQL service → Variables → copy `DATABASE_URL`
   - Paste it in your app's variables

7. **Add any other variables you need:**
```
VITE_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
API_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}/api
```

---

### E. Configure Build & Start Commands

1. **Go to your app service → Settings**
2. **Scroll to "Build" section**
3. **Set these:**
   - **Start Command**: `npm start`
   - **Build Command**: `npm run build`

4. **Scroll to "Deploy" section**
5. **Make sure "Auto Deploy" is ON** (green toggle)

---

### F. Wait for Deployment

Railway is building your app. You should see:
1. **Build in progress** (yellow)
2. **Build complete** (green checkmark)
3. **Deployment in progress** (yellow)
4. **Deployment complete** (green checkmark)

This takes about 5-10 minutes.

---

### G. Get Your Live URL

1. **Go to your project in Railway**
2. **Look at the top of the page**
3. **You'll see your public domain:**
   - Example: `https://android-signage-production.up.railway.app`

✅ **Your app is LIVE!**

---

## ✅ Verify Your Deployment

1. **Open your Railway URL** in browser
2. **You should see your Android Signage app**
3. **Test the functionality:**
   - Can you login?
   - Can you create displays?
   - Can you upload media?

---

## 🔄 Pushing Updates to Production

Now that everything is set up, pushing updates is easy:

```powershell
# Make your changes locally
# Then in PowerShell:

# Stage changes
git add .

# Commit
git commit -m "Added new feature: xyz"

# Push to GitHub
git push origin main
```

**Railway will automatically:**
1. Detect the push
2. Pull new code
3. Rebuild
4. Redeploy
5. Your live app updates automatically ✅

---

## 🚨 Troubleshooting

### Issue: "Deployment failed"
**Check logs in Railway:**
1. Click your app in Railway dashboard
2. Go to "Deployments" tab
3. Click the failed deployment
4. Look at the error in red text
5. Common fixes:
   - Missing environment variable
   - Build command failed
   - Database not connected

### Issue: "Build takes too long (>20 min)"
1. Check Railway logs for errors
2. Usually it's a database connection issue
3. Verify DATABASE_URL is correct

### Issue: "Can't access my app URL"
1. Check if deployment shows "green" status
2. Wait a few minutes (might still be starting)
3. Try hard refresh: `Ctrl+Shift+R`
4. Check browser console for errors

### Issue: "Database not connecting"
1. Go to PostgreSQL service in Railway
2. Check "Connect" tab
3. Copy the full DATABASE_URL
4. Paste it exactly in your app's variables

### Issue: "Push to GitHub failed"
```powershell
# Check your remote
git remote -v

# If wrong, remove and re-add:
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/android-signage.git

# Try pushing again
git push -u origin main
```

---

## 📊 Quick Reference

| Action | Command |
|--------|---------|
| Check git status | `git status` |
| Stage all files | `git add .` |
| Commit changes | `git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| See commit history | `git log --oneline` |

---

## 🎯 What You Now Have

✅ GitHub repository with your code  
✅ Railway project connected to GitHub  
✅ PostgreSQL database  
✅ Live app running at your Railway URL  
✅ Auto-deployment on every GitHub push  

---

## 🔗 Useful Links

| Service | Link |
|---------|------|
| **GitHub** | https://github.com |
| **Railway** | https://railway.app |
| **GitHub Tokens** | https://github.com/settings/tokens |
| **Railway Dashboard** | https://railway.app/dashboard |

---

## 📝 Your Deployment Info (Save This!)

Fill in your details:

```
GitHub Username: ___________________
GitHub Repository: android-signage
GitHub URL: https://github.com/YOUR_USERNAME/android-signage

Railway Project URL: https://railway.app/dashboard
Railway App URL: https://android-signage-production.up.railway.app
Railway Database: PostgreSQL (auto-created)
```

---

## 🎓 Next Steps (After Deployment Works)

1. **Add custom domain** (optional)
   - Go to Railway → Settings → Custom Domain
   - Add your own domain (e.g., signage.yourdomain.com)

2. **Setup monitoring** (optional)
   - Railway has built-in monitoring
   - Check Deployments tab for status

3. **Backup database** (important)
   - Enable automatic backups in Railway PostgreSQL settings

4. **Scale up** (if needed)
   - Railway allows you to upgrade to paid plan for more resources

---

**You're all set! Your app is now live on Railway! 🚀**

For help: https://docs.railway.app
