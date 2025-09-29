# 🚀 Vercel Deployment Guide for Paju Restaurant CMS

This guide will walk you through deploying your restaurant CMS to Vercel with Postgres database and Blob storage.

## Prerequisites
- Vercel account (free tier works)
- GitHub repository with your code
- Domain name (optional, Vercel provides free subdomain)

## Step 1: Prepare Your Repository

1. **Push all code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Verify your build works locally:**
   ```bash
   npm run build
   ```

## Step 2: Create Vercel Project

1. **Visit** [vercel.com](https://vercel.com) and sign in
2. **Click "Add New"** → **"Project"**
3. **Import your GitHub repository**
4. **Configure project:**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

5. **DO NOT deploy yet** - click "Continue" but don't deploy until we set up the database

## Step 3: Set Up Neon PostgreSQL Database

1. **In your Vercel dashboard**, go to your project
2. **Navigate to**: **Marketplace** tab
3. **Search for**: **"Neon"** and click on it
4. **Click**: **"Add Integration"**
5. **Configure integration:**
   - Select your Vercel project
   - **Custom Prefix**: `DATABASE` (recommended)
   - Choose your Neon database or create a new one
6. **Click**: **"Add Integration"**

### 3.1 Initialize Database Schema

1. **Go to your Neon Console** at [console.neon.tech](https://console.neon.tech)
2. **Select your database** that was connected to Vercel
3. **Go to**: **SQL Editor** tab
4. **Copy and paste** the entire contents of `/database/schema.sql` into the editor
5. **Click**: **"Run"** to create all tables and insert sample data
6. **Verify**: Check that tables were created by running:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

## Step 4: Set Up Vercel Blob Storage

1. **In your Vercel dashboard**, go to your project
2. **Navigate to**: **Storage** tab
3. **Click**: **"Create Database"** → **"Blob"**
4. **Configure blob storage:**
   - Name: `paju-images` (or your preferred name)
   - Region: Same as your database region
5. **Click**: **"Create"**

## Step 5: Configure Environment Variables

1. **In your Vercel dashboard**, go to **Settings** → **Environment Variables**
2. **The Neon integration should have automatically added** these database variables:

### Database Variables (automatically added by Neon):
```
DATABASE_URL
DATABASE_URL_UNPOOLED
DATABASE_HOST
DATABASE_USER
DATABASE_PASSWORD
DATABASE_NAME
```

### Manually Add These Variables:

### Blob Storage Variables (from Blob storage settings):
```
BLOB_READ_WRITE_TOKEN
```

### Application Variables:
```
JWT_SECRET = "your-super-secret-production-jwt-key-minimum-32-characters-long"
NODE_ENV = "production"
NEXT_PUBLIC_APP_URL = "https://your-app-name.vercel.app"
```

**⚠️ Important**: 
- Set environment for: **Production, Preview, and Development**
- JWT_SECRET should be a long, random string (use a password generator)
- Replace `your-app-name` with your actual Vercel app URL

## Step 6: Deploy Your Application

1. **Go back to your project overview**
2. **Click**: **"Deploy"** or trigger a new deployment
3. **Wait for build to complete** (usually 2-3 minutes)
4. **Visit your deployment URL**

## Step 7: Set Up Your Admin Account

1. **Visit**: `https://your-app-name.vercel.app/cms`
2. **Log in with default credentials:**
   - Username: `admin`
   - Password: `admin123`
3. **⚠️ IMMEDIATELY change the admin password** (this feature needs to be implemented)

## Step 8: Test Your CMS

1. **Add menu items** with images
2. **Update restaurant hours**
3. **Create custom categories**
4. **Test menu enable/disable functionality**
5. **Verify image uploads work**

## Step 9: Custom Domain (Optional)

1. **In Vercel dashboard**: **Settings** → **Domains**
2. **Add your domain**
3. **Configure DNS** as instructed by Vercel
4. **Update NEXT_PUBLIC_APP_URL** environment variable with your custom domain

## Troubleshooting

### Build Errors
- Check the **Functions** tab for error details
- Verify all environment variables are set
- Check that your database schema was applied correctly

### Database Connection Issues
- Verify all DATABASE_* environment variables are correct (added by Neon integration)
- Check that your Neon database is properly connected to Vercel
- Run a test query in the Neon Console SQL Editor

### Image Upload Issues
- Verify BLOB_READ_WRITE_TOKEN is set correctly
- Check Blob storage is in the same region
- Test file size limits (5MB max)

### Authentication Issues
- Verify JWT_SECRET is set and long enough
- Check that default admin user exists in database
- Clear browser cookies and try again

## Production Best Practices

1. **Security:**
   - Change default admin password immediately
   - Use strong JWT secret (32+ characters)
   - Consider implementing user management

2. **Performance:**
   - Enable Vercel Analytics
   - Monitor database query performance
   - Optimize images in Blob storage

3. **Backup:**
   - Regularly export database
   - Keep environment variables documented
   - Monitor Vercel usage limits

## Support

If you encounter issues:
1. Check Vercel deployment logs in **Functions** tab
2. Verify environment variables in **Settings**
3. Test database connectivity in **Storage** → **Postgres** → **Query**
4. Review this guide for missing steps

## Migration from Development

Your existing development data won't automatically transfer. To migrate:
1. Export data from development environment
2. Insert into production database via Vercel Postgres Query interface
3. Upload existing images to Blob storage (manual process)

---

**🎉 Congratulations!** Your restaurant CMS is now live on Vercel with persistent database and image storage!