# VirtualHEMS Quick Fix Checklist

## The Problem
- ✅ Backend builds successfully in Dokploy
- ❌ Backend not responding at http://api.virtualhems.com/api/health
- ❌ Frontend on Vercel can't connect (using localhost URL)
- ❌ Login/data not working

## The Fix (Copy/Paste These Steps)

### 1️⃣ Fix Backend in Dokploy (5 minutes)

**Go to Dokploy dashboard on your VPS:**
- URL: http://74.208.72.38:3000 (or wherever Dokploy is)

**Find your backend service and check:**

1. **Environment Variables** - Make sure these are set:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV
   AWS_SECRET_ACCESS_KEY=IhDyUaTVnPmKyy1rZyG2G6+wNY9oXYdsvEsBGlfS
   COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ
   COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
   S3_BUCKET=virtualhems-assets-223759445135
   PORT=8001
   ```

2. **Start Command** - Should be:
   ```
   python server.py
   ```
   OR
   ```
   cd backend && python server.py
   ```

3. **Port Mapping** - Should be:
   - Container Port: 8001
   - External Domain: api.virtualhems.com

4. **Click "Redeploy"**

5. **Check Logs** - Look for:
   ```
   VirtualHEMS Backend Starting...
   AWS Region: us-east-1
   Config loaded: True
   ```

6. **Test it works** - Open in browser or run:
   ```bash
   curl http://api.virtualhems.com/api/health
   ```
   Should see: `{"status":"healthy","version":"6.0.0",...}`

### 2️⃣ Update Vercel (2 minutes)

**Go to Vercel dashboard:**
- URL: https://vercel.com/dashboard

**Find your project → Settings → Environment Variables**

**Add/Update these:**
```
VITE_API_URL=http://api.virtualhems.com
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_1c0V6g4OQ
VITE_USER_POOL_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
```

**Redeploy:**
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

### 3️⃣ Test Everything (2 minutes)

**Test backend:**
```bash
curl http://api.virtualhems.com/api/health
curl http://api.virtualhems.com/api/hospitals
```

**Test frontend:**
1. Go to https://virtualhems-com.vercel.app
2. Click "Sign Up"
3. Create account with email/password
4. Check if you can see hospitals/bases on map

## If Still Not Working

### Check Dokploy Logs
1. Go to Dokploy dashboard
2. Click on backend service
3. Click "Logs" tab
4. Look for error messages
5. Copy/paste errors to me

### Check DNS
Make sure in Route 53:
- `api.virtualhems.com` → A record → 74.208.72.38

### Test Backend Directly on VPS
SSH into VPS and run:
```bash
ssh root@74.208.72.38
curl http://localhost:8001/api/health
```

If this works but external URL doesn't, it's a Dokploy port mapping issue.

## What Was Fixed
- Added missing startup code to `backend/server.py`
- Updated `.env` with production URLs
- Backend should now start properly when deployed

## Need Help?
Tell me:
1. What step you're on
2. What error you see in Dokploy logs
3. What happens when you test the URLs
