# Deployment Guide: Campus Social Network

Your project is now ready for deployment! Follow these steps to get it live without leaking any credentials.

## 1. Prepare for Pushing to GitHub
You should push the **entire root folder** (`University Social Media`) to GitHub. This keeps your web application, database scripts, and documentation in one place.

### Steps to Initialize and Push:
1. Open a terminal in the root folder.
2. Run these commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Ready for deployment"
   ```
3. Create a **Private Repository** on GitHub.
4. Follow the GitHub instructions to add the remote and push:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

> [!IMPORTANT]
> Your `.env.local` file is already in `.gitignore`, so your local keys will **NOT** be pushed to GitHub. This is safe.

## 2. Deploy to Vercel
I recommend Vercel for hosting your Next.js application.

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New"** > **"Project"**.
3. Import your repository.
4. **Project Settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `web-app` (IMPORTANT: Vercel needs to know the app is in the `web-app` subfolder).
5. **Environment Variables:**
   - Open your local `.env.local` file.
   - Copy each variable (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and paste them into the "Environment Variables" section in Vercel.
6. Click **Deploy**.

## 3. Database Setup (Supabase)
Ensure you have applied the `security_lock.sql` to your Supabase project:
1. Go to your Supabase Dashboard > SQL Editor.
2. Paste the contents of `security_lock.sql` and run it.
3. This will ensure only authorized university emails can sign up.

## 4. Performance Note
Once deployed, you will notice that the "cursor lag" and "system lag" from earlier will disappear. Your laptop only has to run a browser, while the cloud handles the heavy processing.

---
**Need help with any of these steps? Just ask!**
