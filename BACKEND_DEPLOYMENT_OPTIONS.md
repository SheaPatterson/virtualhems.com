# VirtualHEMS Backend Deployment Options

## 🎯 What You Need to Deploy

Your **Python FastAPI server** (`backend/server.py`) needs to run somewhere. This server:
- Connects to your AWS services (DynamoDB, Cognito, S3, Bedrock)
- Provides REST API endpoints for your frontend
- Handles authentication, missions, users, AI features

## ✅ Current Status

- **Frontend**: Deployed on Vercel ✅
- **AWS Services**: DynamoDB, Cognito, S3, Bedrock ✅
- **API Server**: NOT DEPLOYED ❌ ← This is the problem!

---

## 🚀 Deployment Options (Easiest to Hardest)

### **Option 1: Railway.app (Recommended - Easiest)**

**Why**: Free tier, automatic deployments, simple setup

**Steps**:
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `virtualhems.com` repository
5. Add environment variables:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV
   AWS_SECRET_ACCESS_KEY=IhDyUaTVnPmKyy1rZyG2G6+wNY9oXYdsvEsBGlfS
   COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ
   COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
   S3_BUCKET=virtualhems-assets-223759445135
   ```
6. Set start command: `cd backend && python server.py`
7. Deploy!
8. Copy the Railway URL (e.g., `https://your-app.railway.app`)
9. Update Vercel env vars:
   ```
   VITE_API_URL=https://your-app.railway.app
   ```

**Cost**: Free for hobby projects

---

### **Option 2: Render.com**

**Why**: Similar to Railway, good free tier

**Steps**:
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
6. Add environment variables (same as above)
7. Deploy!

**Cost**: Free tier available

---

### **Option 3: AWS Elastic Beanstalk**

**Why**: Keeps everything in AWS ecosystem

**Steps**:
1. Install AWS EB CLI: `pip install awsebcli`
2. Navigate to backend: `cd backend`
3. Initialize: `eb init -p python-3.11 virtualhems-backend`
4. Create environment: `eb create virtualhems-backend-env`
5. Set environment variables: `eb setenv AWS_REGION=us-east-1 ...`
6. Deploy: `eb deploy`

**Cost**: ~$10-20/month (t2.micro instance)

---

### **Option 4: Your VPS (Manual)**

**Why**: You already have it, full control

**Steps**:
1. SSH to your VPS: `ssh root@your-vps-ip`
2. Clone repo: `git clone https://github.com/SheaPatterson/virtualhems.com.git`
3. Run deployment script: `bash deploy-backend-vps.sh`
4. Get your VPS IP
5. Update Vercel env vars:
   ```
   VITE_API_URL=http://YOUR_VPS_IP:8001
   ```

**Cost**: Already paid for

---

### **Option 5: AWS Lambda + API Gateway (Serverless)**

**Why**: Scales automatically, pay per request

**Steps**: More complex, requires AWS SAM or Serverless Framework

**Cost**: Very cheap for low traffic (~$1-5/month)

---

## 🎯 My Recommendation

**Use Railway.app** - It's the fastest and easiest:

1. **5 minutes to deploy**
2. **Free for your usage**
3. **Automatic HTTPS**
4. **Auto-deploys on git push**
5. **Built-in monitoring**

---

## 📝 After Backend Deployment

Once your backend is deployed, update Vercel:

1. Go to Vercel dashboard
2. Select your VirtualHEMS project
3. Go to Settings → Environment Variables
4. Update:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_WS_URL=wss://your-backend-url.railway.app
   ```
5. Redeploy

---

## 🧪 Testing Your Backend

After deployment, test these endpoints:

```bash
# Health check
curl https://your-backend-url/api/health

# Should return: {"status": "healthy"}
```

---

## 🔧 WebSocket Server

For the WebSocket server (simulator plugins), you have two options:

1. **Deploy separately** on Railway (create another service)
2. **Run on your VPS** (use the deploy script)

The WebSocket server is in `backend/websocket_server.py`

---

## ❓ Which Should You Choose?

- **Want it working in 5 minutes?** → Railway
- **Want everything in AWS?** → Elastic Beanstalk
- **Want full control?** → Your VPS
- **Want cheapest long-term?** → Lambda (but more complex)

**I recommend Railway for now, then migrate to AWS later if needed.**
