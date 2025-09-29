# 🐘 Neon PostgreSQL Setup for Vercel

## Quick Answer
**Custom Prefix**: `DATABASE`

This will create environment variables like:
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `DATABASE_HOST`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

## Updated Integration Steps

### 1. Add Neon Integration
1. Go to your Vercel project dashboard
2. Click **Marketplace** tab
3. Search for **"Neon"** and add integration
4. **Custom Prefix**: `DATABASE`
5. Connect your Neon database

### 2. Initialize Database
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your database
3. Open **SQL Editor**
4. Copy/paste contents of `/database/schema.sql`
5. Run the query to create tables and sample data

### 3. Environment Variables
The Neon integration automatically adds these to Vercel:
```
DATABASE_URL
DATABASE_URL_UNPOOLED
DATABASE_HOST
DATABASE_USER
DATABASE_PASSWORD
DATABASE_NAME
```

You still need to manually add:
```
BLOB_READ_WRITE_TOKEN (for image uploads)
JWT_SECRET (for authentication)
NEXT_PUBLIC_APP_URL (your app URL)
NODE_ENV=production
```

## ✅ Code Updated
- ✅ Database service updated for Neon variables
- ✅ Deployment guide updated
- ✅ Environment example updated
- ✅ Build tested and working

Your CMS is ready for Neon + Vercel deployment! 🚀