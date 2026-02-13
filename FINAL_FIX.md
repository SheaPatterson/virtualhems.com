# VirtualHEMS - Final Simple Fix

## ✅ Your Backend Built Successfully!

The Dokploy build completed. Now we just need to make sure it's running correctly.

## 🔧 In Dokploy Dashboard

### **Check These Settings:**

1. **Start Command** should be:
   ```
   cd backend && python server.py
   ```
   OR
   ```
   python backend/server.py
   ```

2. **Port** should be: `8001`

3. **Environment Variables** should include:
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV
   AWS_SECRET_ACCESS_KEY=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
   COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ
   COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
   S3_BUCKET=virtualhems-assets-223759445135
   ```

4. **Domain** should be: `api.virtualhems.com`

## 🧪 Test Your Backend

Once it's running, test it:
```bash
curl http://api.virtualhems.com/api/health
```

Should return: `{"status":"healthy"}`

## 📝 Update Vercel

Once backend is responding:

1. Go to https://vercel.com/dashboard
2. Your project → Settings → Environment Variables
3. Set:
   ```
   VITE_API_URL=http://api.virtualhems.com
   ```
4. Redeploy

## ✅ That's It!

Your app will then work:
- Frontend on Vercel loads
- Connects to backend on your VPS
- Backend connects to AWS DynamoDB/Cognito
- Everything works!

## 🚨 If Backend Still Won't Start

The simplest fix is to just run it directly on your VPS without Dokploy:

```bash
ssh root@74.208.72.38
cd /root/virtualhems.com/backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn boto3 pydantic python-jose passlib bcrypt python-multipart
python server.py
```

Then update Vercel to use `http://74.208.72.38:8001`

**Simple. No Docker. Just works.**
