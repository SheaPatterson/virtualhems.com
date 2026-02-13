# Simple VirtualHEMS Deployment - Just Make It Work!

## 🚀 Quick Deploy (5 Minutes)

### **Step 1: SSH to Your VPS**
```bash
ssh root@74.208.72.38
```

### **Step 2: Run These Commands**
```bash
# Install Python
apt update
apt install -y python3 python3-pip python3-venv git

# Clone your code
cd /root
rm -rf virtualhems.com  # Remove old if exists
git clone https://github.com/SheaPatterson/virtualhems.com.git
cd virtualhems.com/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies (this takes a few minutes)
pip install fastapi uvicorn boto3 pydantic python-jose passlib bcrypt python-multipart

# Create environment file
cat > .env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV
AWS_SECRET_ACCESS_KEY=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
COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ
COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
S3_BUCKET=virtualhems-assets-223759445135
EOF

# Start the backend (test it first)
python server.py
```

**If you see "Uvicorn running on http://0.0.0.0:8001" - IT'S WORKING!**

Press `Ctrl+C` to stop it, then continue:

### **Step 3: Make It Run Forever**
```bash
# Install screen to keep it running
apt install -y screen

# Start in background
screen -dmS backend bash -c 'cd /root/virtualhems.com/backend && source venv/bin/activate && python server.py'

# Check it's running
screen -ls
curl http://localhost:8001/api/health
```

### **Step 4: Open Firewall**
```bash
ufw allow 8001/tcp
ufw allow 8787/tcp
```

### **Step 5: Update Vercel**

1. Go to https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Add or update:
   ```
   VITE_API_URL=http://74.208.72.38:8001
   ```
4. Go to Deployments → Redeploy

## ✅ Test It

After Vercel redeploys:
1. Visit https://virtualhems-com.vercel.app
2. Try to sign in
3. It should work!

## 🔧 If Something Goes Wrong

**Check backend is running:**
```bash
ssh root@74.208.72.38
screen -r backend  # View the backend logs
# Press Ctrl+A then D to detach
```

**Restart backend:**
```bash
ssh root@74.208.72.38
screen -X -S backend quit  # Stop it
screen -dmS backend bash -c 'cd /root/virtualhems.com/backend && source venv/bin/activate && python server.py'  # Start it
```

**Check logs:**
```bash
ssh root@74.208.72.38
screen -r backend  # See what's happening
```

## 🎯 That's It!

No Docker, no Dokploy complexity, just:
- Python backend running on your VPS
- React frontend on Vercel
- AWS services for data

**Simple and it works!**
