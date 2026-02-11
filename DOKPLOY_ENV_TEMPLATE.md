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

## 🔧 Redis Configuration
```
REDIS_URL=redis://your-redis-host:6379
```
**Use your actual Redis instance connection string**

Examples:
- **Local Redis**: `redis://localhost:6379`
- **Redis Cloud**: `redis://username:password@host:port`
- **AWS ElastiCache**: `redis://your-cluster.cache.amazonaws.com:6379`

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
- **Keep Redis URL secure** if it contains passwords
- **AWS credentials** should have minimal required permissions
- **Keep environment variables** secure in Dokploy

---

## ✅ Verification

After adding all variables, you should have:
- **8 environment variables** total
- **All AWS credentials** properly set
- **Redis URL** configured
- **Domain name** configured

**Ready to deploy!** 🚀

---

## 📊 Your Architecture

**Database**: AWS DynamoDB (already set up)
**Cache**: Your Redis instance (external)
**Storage**: AWS S3 (already set up)
**Auth**: AWS Cognito (already set up)
**AI**: AWS Bedrock (already set up)