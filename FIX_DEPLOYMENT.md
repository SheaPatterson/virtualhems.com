# Fix VirtualHEMS Deployment - Simple Steps

## Problem Summary
1. Backend built in Dokploy but not responding at http://api.virtualhems.com/api/health
2. Frontend on Vercel can't connect (pointing to localhost)
3. Login/data not working

## Solution: 3 Simple Steps

### Step 1: Fix Backend in Dokploy

The backend is built but not starting correctly. Here's what to do:

1. **Go to Dokploy dashboard** at your VPS (74.208.72.38)
2. **Find your backend service**
3. **Check the logs** - look for errors
4. **Verify the start command** should be one of:
   - `cd backend && python server.py`
   - `python backend/server.py`
   - `uvicorn server:app --host 0.0.0.0 --port 8001`

5. **Verify environment variables are set:**
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV
   AWS_SECRET_ACCESS_KEY=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
   COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ
   COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
   S3_BUCKET=virtualhems-assets-223759445135
   PORT=8001
   ```

6. **Redeploy** the backend service

7. **Test it works:**
   ```bash
   curl http://api.virtualhems.com/api/health
   ```
   Should return: `{"status":"healthy","version":"6.0.0",...}`

### Step 2: Update Vercel Environment Variables

Once backend is responding, update your Vercel project:

1. **Go to Vercel dashboard** → Your project → Settings → Environment Variables
2. **Add/Update these variables:**
   ```
   VITE_API_URL=http://api.virtualhems.com
   VITE_AWS_REGION=us-east-1
   VITE_USER_POOL_ID=us-east-1_1c0V6g4OQ
   VITE_USER_POOL_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
   ```

3. **Redeploy** your Vercel project (Deployments → click "..." → Redeploy)

### Step 3: Test Everything

1. **Test backend directly:**
   ```bash
   curl http://api.virtualhems.com/api/health
   curl http://api.virtualhems.com/api/hospitals
   curl http://api.virtualhems.com/api/hems-bases
   ```

2. **Test frontend:**
   - Go to https://virtualhems-com.vercel.app
   - Try to sign up for a new account
   - Try to log in
   - Check if data loads (hospitals, bases, helicopters)

## Common Issues & Fixes

### Issue: Backend still not responding
**Fix:** SSH into your VPS and run backend manually to see errors:
```bash
ssh root@74.208.72.38
cd /path/to/backend
python server.py
```
Look for error messages.

### Issue: "Bad Gateway" error
**Fix:** Backend isn't running. Check Dokploy logs and restart the service.

### Issue: Login not working
**Fix:** Make sure Cognito credentials are correct in both backend AND Vercel environment variables.

### Issue: Data loads slowly or not at all
**Fix:** 
1. Check backend logs for DynamoDB errors
2. Verify AWS credentials have DynamoDB permissions
3. Test backend endpoints directly with curl

## Alternative: Simple VPS Deployment (No Dokploy)

If Dokploy is too complicated, you can deploy directly on VPS:

1. **SSH into VPS:**
   ```bash
   ssh root@74.208.72.38
   ```

2. **Install Python and dependencies:**
   ```bash
   apt update
   apt install -y python3 python3-pip nginx certbot python3-certbot-nginx
   ```

3. **Clone/upload your code:**
   ```bash
   cd /opt
   # Upload your backend folder here
   cd backend
   pip3 install -r requirements.txt
   ```

4. **Create systemd service** `/etc/systemd/system/virtualhems.service`:
   ```ini
   [Unit]
   Description=VirtualHEMS Backend
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/opt/backend
   Environment="AWS_REGION=us-east-1"
   Environment="AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV"
   Environment="AWS_SECRET_ACCESS_KEY=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"
   Environment="COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ"
   Environment="COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak"
   Environment="S3_BUCKET=virtualhems-assets-223759445135"
   ExecStart=/usr/bin/python3 server.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

5. **Start service:**
   ```bash
   systemctl daemon-reload
   systemctl enable virtualhems
   systemctl start virtualhems
   systemctl status virtualhems
   ```

6. **Configure Nginx** `/etc/nginx/sites-available/virtualhems`:
   ```nginx
   server {
       listen 80;
       server_name api.virtualhems.com;

       location / {
           proxy_pass http://localhost:8001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable site and get SSL:**
   ```bash
   ln -s /etc/nginx/sites-available/virtualhems /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   certbot --nginx -d api.virtualhems.com
   ```

8. **Update Vercel to use HTTPS:**
   ```
   VITE_API_URL=https://api.virtualhems.com
   ```

## What I Fixed in the Code

1. Added missing startup code to `backend/server.py` (the `if __name__ == "__main__"` block)
2. This was causing the backend to build but not actually start

## Next Steps

1. Try Step 1 first (fix Dokploy backend)
2. If that works, do Step 2 (update Vercel)
3. If Dokploy is too complicated, use the Alternative method

Let me know which step you're stuck on and I can help!
