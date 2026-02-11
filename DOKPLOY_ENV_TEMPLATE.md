# VirtualHEMS Dokploy Environment Variables Template
## Copy and Fill These Values in Your Dokploy Dashboard

## 🌐 Domain Configuration
```
DOMAIN=yourdomain.com
```
**Replace with your actual domain (without https://)**

---

## ☁️ AWS Configuration
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
COGNITO_USER_POOL_ID=us-east-1_...
COGNITO_CLIENT_ID=...
S3_BUCKET=virtualhems-...
```

**Use your actual AWS credentials from your previous setup**

---

## 🔧 Optional: Redis Management Interface
```
REDIS_COMMANDER_USER=admin
REDIS_COMMANDER_PASSWORD=RedisAdmin2024!
```
**For accessing Redis database through web interface**

---

## 📝 How to Add These in Dokploy

1. **Go to your VirtualHEMS application** in Dokploy
2. **Click "Environment Variables" tab**
3. **Add each variable** one by one:
   - **Key**: Variable name (e.g., `DOMAIN`)
   - **Value**: Your actual value (e.g., `yourdomain.com`)
   - **Click "Add"**
4. **Save all variables**

---

## 🔒 Security Notes

- **Never share** your AWS credentials
- **AWS credentials** should have minimal required permissions
- **Keep environment variables** secure in Dokploy

---

## ✅ Verification

After adding all variables, you should have:
- **7 environment variables** total (no PostgreSQL needed)
- **All AWS credentials** properly set
- **Domain name** configured

**Ready to deploy!** 🚀

---

## 📊 Your Architecture

**Database**: AWS DynamoDB (already set up)
**Cache**: Redis (in Docker container)
**Storage**: AWS S3 (already set up)
**Auth**: AWS Cognito (already set up)
**AI**: AWS Bedrock (already set up)