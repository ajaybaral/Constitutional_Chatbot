# Vercel Deployment Guide

## Issues Fixed

### 1. Read-Only Filesystem Error ✅
**Problem**: `EROFS: read-only file system, mkdir '/var/task/uploads'`

**Solution**: Removed the code attempting to create uploads directory in `server.js`. Vercel serverless functions have a read-only filesystem.

### 2. Configuration Added ✅
Created `vercel.json` to properly configure the deployment for both frontend and backend.

---

## Environment Variables Required

Add these in your Vercel project settings:

### Required Variables:
```
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Optional Variables:
```
CONSTITUTION_DRIVE_URL=your_google_drive_url
CONSTITUTION_FILE_PATH=your_constitution_file_path
```

### Firebase Variables (Frontend):
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## Deployment Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Fixed Vercel deployment issues"
git push
```

### 2. Configure Vercel Project

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add all required environment variables (listed above)
4. Make sure to add variables for **Production**, **Preview**, and **Development** environments

### 3. Redeploy

After adding environment variables:
- Vercel will automatically redeploy from GitHub
- Or manually trigger a new deployment from the Vercel dashboard

---

## Post-Deployment

### What Works on Vercel:
✅ Frontend React app  
✅ Backend API routes  
✅ MongoDB connection  
✅ Firebase authentication  
✅ AI chat functionality  

### What Doesn't Work (Serverless Limitations):
❌ File uploads to local filesystem  
❌ Creating directories  
❌ Writing to disk outside `/tmp`  

**Alternative for file uploads**: Use Vercel Blob Storage, AWS S3, or Cloudinary

---

## Troubleshooting

### If deployment still fails:

1. **Check Build Logs**:
   - Go to Vercel Dashboard → Deployments
   - Click on the failed deployment
   - Review build logs for errors

2. **Verify Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify MongoDB connection string is correct

3. **Check Function Logs**:
   - Go to your deployment → Functions tab
   - View runtime logs to see actual errors

4. **MongoDB Atlas**:
   - Ensure your MongoDB cluster allows connections from `0.0.0.0/0` (or Vercel's IP ranges)
   - Check database user permissions

---

## Architecture on Vercel

```
vercel.app
├── Frontend (React)
│   └── Built from /client
│   └── Served as static files
│
└── Backend (Node.js Serverless Functions)
    └── API routes from server.js
    └── Routes: /api/*
```

---

## Important Notes

- **Cold Starts**: First request may be slow due to serverless cold starts
- **Timeouts**: Free tier has 10s timeout, hobby/pro have longer timeouts
- **Database**: Use MongoDB Atlas or other hosted database (Vercel doesn't provide persistent storage)
- **File Storage**: Use external services for file uploads

---

## Success Indicators

After successful deployment, you should see:
✅ Green checkmark on Vercel deployment  
✅ Frontend loads at your-project.vercel.app  
✅ Can sign in with Google  
✅ Can create new chats  
✅ AI responses work  

---

Need help? Check Vercel docs: https://vercel.com/docs
