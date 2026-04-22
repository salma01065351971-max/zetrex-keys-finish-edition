# Hostinger Deployment Guide for ZetrexKeys

## Overview
This guide explains how to deploy ZetrexKeys to Hostinger Business Web Hosting (Node.js).

## Prerequisites
- Hostinger Business Web Hosting account
- MongoDB Atlas account with database configured
- Your MongoDB connection string (MONGODB_URI)

## Step 1: Build Frontend Locally

```bash
cd frontend
npm run build
```

This creates the `build/` folder in the frontend directory.

## Step 2: Move Build Files to Backend

```bash
cd backend
mkdir -p public
cp -r ../frontend/build/* public/
```

## Step 3: Prepare Backend for Deployment

```bash
cd backend
./deploy.sh
```

This installs production dependencies.

## Step 4: Upload to Hostinger

### Option A: Using File Manager
1. Compress the `backend/` folder (excluding `.env` and `node_modules/.cache`)
2. Upload the compressed file to Hostinger File Manager
3. Extract the files to your public directory

### Option B: Using Git (Recommended)
1. Push your changes to GitHub
2. In Hostinger hPanel, use Git integration to clone the repository
3. Navigate to the `backend/` folder as your document root

## Step 5: Configure Node.js in Hostinger

1. Go to **hPanel** → **Setup** → **Node.js Selector**
2. Click **Create Application**
3. Configure:
   - **Node.js Version**: 18.x or 20.x
   - **Application Mode**: Production
   - **Application Root**: `/public_html/backend` (or your chosen path)
   - **Application URL**: Your domain
   - **Application Startup File**: `server.js`
   - **Document Root**: `public`
4. Click **Create**

## Step 6: Add Environment Variables

In the Node.js application settings in Hostinger:

```
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=DigiVault <noreply@digivault.com>
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=live
FRONTEND_URL=https://your-domain.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Step 7: MongoDB Atlas Whitelist

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Select **Allow Access from Anywhere** (`0.0.0.0/0`)
   - This allows Hostinger's servers to connect
5. Click **Confirm**

**Security Note:** If you prefer stricter security, you can add Hostinger's specific IP ranges instead of `0.0.0.0/0`.

## Step 8: Restart Application

In Hostinger Node.js Selector:
1. Click **Restart** button
2. Wait for the application to start
3. Check the logs for any errors

## Step 9: Verify Deployment

1. Visit your domain
2. Check if the frontend loads
3. Try to access the health check: `https://your-domain.com/api/health`
4. Test login and product display

## Troubleshooting

### Application Won't Start
- Check Node.js version compatibility (use 18.x or 20.x)
- Verify `server.js` is set as the startup file
- Check logs in Hostinger Node.js Selector

### Database Connection Failed
- Verify MONGODB_URI is correct
- Ensure MongoDB Atlas has whitelisted Hostinger IPs
- Check if MongoDB Atlas is in the same region as Hostinger

### Frontend Not Loading
- Verify `public/` folder contains the build files
- Check that Document Root is set to `public`
- Ensure static file serving is working

### CORS Errors
- Set `FRONTEND_URL` to your Hostinger domain
- Set `HOSTINGER_URL` environment variable to your domain
- Check CORS configuration in `server.js`

## File Structure After Deployment

```
backend/
├── server.js          # Main entry point
├── package.json       # Dependencies
├── package-lock.json
├── .env              # Environment variables (create manually)
├── controllers/      # Route controllers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Express middleware
├── services/        # Business logic
├── uploads/         # Uploaded files
├── utils/          # Helper functions
├── public/          # React frontend build files
│   ├── index.html
│   ├── static/
│   └── asset-manifest.json
└── node_modules/    # Dependencies
```

## Important Notes

- **Do NOT upload** the `.env` file from your local machine
- **Manually create** the `.env` file in Hostinger with production values
- **Keep sensitive data** secure - never commit `.env` to Git
- **Regularly update** dependencies for security patches
- **Monitor logs** in Hostinger for any errors

## Support

If you encounter issues:
1. Check Hostinger Node.js logs
2. Verify MongoDB Atlas connection
3. Ensure all environment variables are set correctly
4. Check file permissions (should be 755 for folders, 644 for files)
