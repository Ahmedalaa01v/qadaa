# Complete Production Deployment Guide

**بسم الله الرحمن الرحيم** - A step-by-step guide for deploying your Qada Tracker website

This guide is designed for beginners with **no experience** in GitHub, Vercel, or deployment. Follow each step carefully, and your website will be live insha'Allah.

## Overview: What We'll Do

1. **Set up Supabase** (your database)
2. **Upload to GitHub** (store your code)
3. **Buy and configure domain** (from Hostinger)
4. **Deploy with Vercel** (make it live)
5. **Connect everything together**

---

## Part 1: Supabase Setup (Your Database)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - Name: `qada-tracker`
   - Database Password: **Save this securely!**
   - Region: Choose closest to your users

### Step 2: Set Up Database
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy ALL contents from your `schema.sql` file
4. Paste into the editor and click **"Run"**
5. You should see "Success" messages

### Step 3: Configure Authentication
1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `https://qadaa.org` (your domain)
   - `https://qadaa.org/reset-password`
3. Go to **Authentication** → **Passwords**:
   - Enable "Block compromised passwords"
4. Go to **Authentication** → **MFA**:
   - Enable "Time-based One-Time Password (TOTP)"

### Step 4: Get Your API Keys
1. Go to **Settings** → **API**
2. Copy and save these (you'll need them later):
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

---

## Part 2: GitHub Setup (Store Your Code)

### Step 1: Install GitHub Desktop
1. Download [GitHub Desktop](https://desktop.github.com)
2. Install and sign in with your GitHub account
3. If you don't have a GitHub account, create one at [github.com](https://github.com)

### Step 2: Upload Your Project
1. **Open GitHub Desktop**
2. Click **"Add"** → **"Add Existing Repository"**
3. **Browse** to your folder: `V:\Applications\qadaa`
4. Click **"Add Repository"**
5. If asked about `.gitignore`, click **"Continue"**
6. **Publish Repository**:
   - **Name**: `qada-tracker`
   - **Description**: `Islamic prayer tracking app to help Muslims make up missed prayers`
   - **✅ Keep this code private** (UNCHECK this - make it public for open source)
   - Click **"Publish Repository"**
7. **Commit your changes**:
   - In GitHub Desktop, you'll see changed files
   - Write commit message: `Initial commit - Qada Tracker v1.0`
   - Click **"Commit to main"**
   - Click **"Push origin"**

Your code is now on GitHub! 🎉

---

## Part 3: Domain Setup (Hostinger)

### Step 1: Buy Your Domain
1. Go to [hostinger.com](https://hostinger.com)
2. Search for `qadaa.org` (or your preferred domain)
3. Purchase the domain (usually $10-15/year)
4. **Don't buy hosting** - you only need the domain

### Step 2: Access Domain Management
1. In Hostinger dashboard, go to **"Domains"**
2. Click on your domain (`qadaa.org`)
3. Look for **"DNS Zone"** or **"DNS Management"**

**⚠️ Important**: Don't change DNS settings yet - we'll do this after setting up Vercel

---

## Part 4: Vercel Deployment (Make It Live)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. **Sign up with GitHub** (this connects your repositories)

### Step 2: Deploy Your Project
1. In Vercel dashboard, click **"New Project"**
2. **Import Git Repository**:
   - Find your `qada-tracker` repository
   - Click **"Import"**
3. **Configure Project**:
   - **Project Name**: `qada-tracker`
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
4. **Environment Variables** (very important!):
   - Click **"Environment Variables"**
   - Add these 3 variables:
     ```
     Name: NEXT_PUBLIC_SUPABASE_URL
     Value: [Your Supabase Project URL from Part 1]
     
     Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
     Value: [Your Supabase anon key from Part 1]
     
     Name: NEXT_PUBLIC_SITE_URL
     Value: https://qadaa.org
     ```
5. Click **"Deploy"**

Wait 2-3 minutes - Vercel will build and deploy your site!

### Step 3: Get Vercel URLs
After deployment completes:
1. You'll get a **Vercel URL** like: `https://qada-tracker-xyz.vercel.app`
2. Test this URL - your site should work!
3. Go to **Project Settings** → **Domains**
4. Note the **deployment URL** for the next step

---

## Part 5: Connect Your Domain

### Step 1: Add Domain to Vercel
1. In your Vercel project, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `qadaa.org`
4. Vercel will show you DNS records to configure

### Step 2: Configure DNS in Hostinger
1. **Copy the DNS values** Vercel shows you
2. Go back to **Hostinger** → **Your Domain** → **DNS Zone**
3. **Add these records** (replace existing if needed):

   **For Root Domain (qadaa.org):**
   - **Type**: A
   - **Name**: @ (or blank)
   - **Value**: [IP address Vercel gives you]
   
   **For WWW (www.qadaa.org):**
   - **Type**: CNAME
   - **Name**: www
   - **Value**: [CNAME value Vercel gives you]

4. **Save changes**
5. **Wait 15-30 minutes** for DNS to propagate

### Step 3: Verify Everything Works
1. Visit `https://qadaa.org` - should show your site
2. Visit `https://www.qadaa.org` - should redirect to main site
3. Test registration/login
4. Test password reset
5. Check that prayers can be tracked

---

## Part 6: Final Configuration

### Step 1: Update Supabase Redirect URLs
1. Go back to **Supabase** → **Authentication** → **URL Configuration**
2. **Update Redirect URLs** to use your real domain:
   - `https://qadaa.org`
   - `https://qadaa.org/reset-password`
3. **Remove** any localhost URLs

### Step 2: Test Everything
Visit your live site and test:
- ✅ Site loads at `https://qadaa.org`
- ✅ Registration works
- ✅ Email confirmation arrives
- ✅ Login/logout works
- ✅ Password reset works
- ✅ Prayer tracking works
- ✅ Settings save properly

---

## Part 7: Making Updates

### When You Make Changes:
1. **Edit files** on your computer
2. **Open GitHub Desktop**
3. **Review changes** shown
4. **Write commit message** (describe what you changed)
5. **Click "Commit to main"**
6. **Click "Push origin"**
7. **Vercel automatically redeploys** (2-3 minutes)

### If Something Goes Wrong:
1. Check **Vercel Dashboard** → **Deployments** for errors
2. Check **Supabase Logs** for database issues
3. Verify **environment variables** are correct
4. Test on Vercel's temporary URL first

---

## Troubleshooting Common Issues

### "Build Failed" Error
- Check if all files are committed to GitHub
- Verify environment variables are set correctly
- Look at the build logs in Vercel

### "Database Connection Error"
- Verify Supabase URL and key are correct
- Check if schema.sql was run successfully
- Ensure RLS policies are enabled

### "Domain Not Working"
- Wait longer (DNS can take up to 24 hours)
- Double-check DNS records in Hostinger
- Try visiting the Vercel URL directly

### "Authentication Not Working"
- Update Supabase redirect URLs
- Clear browser cache and cookies
- Check if email confirmations are arriving

---

## 🎉 Congratulations!

Your Qada Tracker is now live at `https://qadaa.org`! 

May Allah accept this effort and make it beneficial for the entire Ummah. The website will help thousands of Muslims keep track of their missed prayers and fulfill their religious obligations.

**بارك الله فيك** - May Allah bless you for this contribution to the Muslim community!
