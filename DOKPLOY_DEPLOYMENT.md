# VirtualHEMS Dokploy Deployment Guide
## Deploy with Dokploy - Much Easier! 🚀

Since you're using Dokploy, deployment becomes much simpler and more elegant. Dokploy will handle Docker, SSL, monitoring, and scaling for you.

## 🎯 Why Dokploy is Perfect for VirtualHEMS

### **Advantages with Dokploy**
- ✅ **Git-based deployment** - Push to deploy
- ✅ **Automatic SSL** - Let's Encrypt integration
- ✅ **Built-in monitoring** - No need for separate Prometheus/Grafana
- ✅ **Easy scaling** - Scale services with UI
- ✅ **Database management** - PostgreSQL/Redis with UI
- ✅ **Environment management** - Secure env var handling
- ✅ **Automatic backups** - Built-in backup system
- ✅ **Domain management** - Easy subdomain setup

## 🚀 Dokploy Deployment Steps

### **Step 1: Prepare Your Repository**

First, let's create Dokploy-optimized configuration files:

#### **Create `dokploy.json`**
```json
{
  "name": "virtualhems",
  "type": "compose",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/virtualhems.git",
    "branch": "main"
  },
  "domains": [
    {
      "host": "virtualhems.yourdomain.com",
      "https": true,
      "www": true
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "ENVIRONMENT": "production"
  }
}
```

#### **Create `docker-compose.dokploy.yml`**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      - VITE_API_URL=https://api.virtualhems.yourdomain.com
      - VITE_WS_URL=wss://ws.virtualhems.yourdomain.com
    labels:
      - "dokploy.enable=true"
      - "dokploy.http.routers.frontend.rule=Host(`virtualhems.yourdomain.com`)"
      - "dokploy.http.routers.frontend.tls.certresolver=letsencrypt"
    restart: unless-stopped
    networks:
      - virtualhems

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
      - COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
      - S3_BUCKET=${S3_BUCKET}
      - DATABASE_URL=postgresql://virtualhems:${POSTGRES_PASSWORD}@postgres:5432/virtualhems
      - REDIS_URL=redis://redis:6379
      - WORKERS=4
    labels:
      - "dokploy.enable=true"
      - "dokploy.http.routers.backend.rule=Host(`api.virtualhems.yourdomain.com`)"
      - "dokploy.http.routers.backend.tls.certresolver=letsencrypt"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - virtualhems

  websocket:
    build:
      context: ./backend
      dockerfile: Dockerfile.websocket
    environment:
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    labels:
      - "dokploy.enable=true"
      - "dokploy.http.routers.websocket.rule=Host(`ws.virtualhems.yourdomain.com`)"
      - "dokploy.http.routers.websocket.tls.certresolver=letsencrypt"
    restart: unless-stopped
    networks:
      - virtualhems

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=virtualhems
      - POSTGRES_USER=virtualhems
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - virtualhems

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 1gb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - virtualhems

networks:
  virtualhems:
    external: false

volumes:
  postgres_data:
  redis_data:
```

### **Step 2: Access Dokploy Dashboard**

1. **Open Dokploy**: `https://dokploy.yourdomain.com` (or your Dokploy URL)
2. **Login** with your admin credentials

### **Step 3: Create New Application**

1. **Click "New Application"**
2. **Choose "Docker Compose"**
3. **Application Settings**:
   - **Name**: `virtualhems`
   - **Repository**: Your GitHub repo URL
   - **Branch**: `main`
   - **Compose File**: `docker-compose.dokploy.yml`

### **Step 4: Configure Environment Variables**

In Dokploy dashboard, add these environment variables:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
S3_BUCKET=your-bucket-name

# Database
POSTGRES_PASSWORD=secure-random-password

# Application
NODE_ENV=production
ENVIRONMENT=production
```

### **Step 5: Configure Domains**

1. **Add Domains** in Dokploy:
   - `virtualhems.yourdomain.com` → frontend service
   - `api.virtualhems.yourdomain.com` → backend service
   - `ws.virtualhems.yourdomain.com` → websocket service

2. **Enable SSL** for all domains (Dokploy handles Let's Encrypt automatically)

### **Step 6: Deploy**

1. **Click "Deploy"** in Dokploy dashboard
2. **Monitor deployment** in real-time logs
3. **Wait for completion** (usually 5-10 minutes)

## 🎯 Dokploy-Specific Optimizations

### **Create `Dockerfile.frontend.dokploy`**
```dockerfile
# Multi-stage build optimized for Dokploy
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config optimized for Dokploy
COPY nginx.dokploy.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### **Create `nginx.dokploy.conf`**
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Optimized for Dokploy proxy
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check for Dokploy
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### **Update Backend for Dokploy**
```python
# backend/server.py - Add health check for Dokploy
@app.get("/health")
async def health_check():
    """Health check endpoint for Dokploy"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

# Add CORS for Dokploy subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://virtualhems.yourdomain.com",
        "https://api.virtualhems.yourdomain.com",
        "https://ws.virtualhems.yourdomain.com",
        "http://localhost:3000",  # Development
        "http://localhost:5173"   # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 Dokploy Management

### **Deployment Commands**
```bash
# Deploy from Dokploy dashboard or via webhook
# Dokploy automatically handles:
# - Git pull
# - Docker build
# - Container restart
# - SSL certificate renewal
# - Health checks
```

### **Monitoring in Dokploy**
- **Real-time logs** for each service
- **Resource usage** monitoring
- **Health check** status
- **SSL certificate** status
- **Deployment history**

### **Scaling in Dokploy**
- **Horizontal scaling**: Increase replicas via UI
- **Vertical scaling**: Adjust resource limits
- **Auto-scaling**: Based on CPU/memory usage

## 🎯 Environment-Specific Configurations

### **Development Environment**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      - VITE_API_URL=http://localhost:8001
      - VITE_WS_URL=ws://localhost:8787
    ports:
      - "3000:80"

  backend:
    build:
      context: ./backend
    environment:
      - ENVIRONMENT=development
      - DEBUG=true
    ports:
      - "8001:8001"
    volumes:
      - ./backend:/app
```

### **Staging Environment**
```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      - VITE_API_URL=https://api-staging.virtualhems.yourdomain.com
    labels:
      - "dokploy.http.routers.frontend-staging.rule=Host(`staging.virtualhems.yourdomain.com`)"
```

## 📊 Dokploy Monitoring Integration

### **Custom Health Checks**
```yaml
# Add to docker-compose.dokploy.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### **Resource Limits**
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 3G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 🚀 Deployment Workflow with Dokploy

### **1. Development**
```bash
# Work locally
npm run dev
# Test changes
# Commit to git
git add .
git commit -m "Add new feature"
git push origin main
```

### **2. Automatic Deployment**
- **Dokploy detects** git push
- **Automatically builds** new containers
- **Runs health checks**
- **Switches traffic** to new version
- **Keeps old version** for rollback

### **3. Monitoring**
- **Check Dokploy dashboard** for deployment status
- **View real-time logs**
- **Monitor resource usage**
- **Check SSL certificate status**

## 🎯 Dokploy vs Manual Docker Comparison

| Feature | Manual Docker | Dokploy |
|---------|---------------|---------|
| **Deployment** | Manual commands | Git push to deploy |
| **SSL Certificates** | Manual certbot | Automatic Let's Encrypt |
| **Monitoring** | Setup Prometheus/Grafana | Built-in monitoring |
| **Scaling** | Manual docker-compose | UI-based scaling |
| **Rollbacks** | Manual process | One-click rollback |
| **Environment Variables** | File management | Secure UI management |
| **Domain Management** | Manual nginx config | UI-based domain setup |
| **Backups** | Custom scripts | Built-in backup system |

## 🔧 Migration from Manual to Dokploy

If you've already deployed manually, here's how to migrate:

### **1. Backup Current Data**
```bash
# Backup databases
docker exec postgres pg_dump -U virtualhems virtualhems > backup.sql
docker exec redis redis-cli BGSAVE

# Backup volumes
docker run --rm -v virtualhems_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### **2. Setup in Dokploy**
- Create new application in Dokploy
- Configure environment variables
- Deploy new version

### **3. Restore Data**
```bash
# Restore to new Dokploy deployment
docker exec -i new_postgres psql -U virtualhems virtualhems < backup.sql
```

## 🎉 Benefits of Using Dokploy

### **For You**
- ✅ **Easier management** - Web UI instead of command line
- ✅ **Automatic SSL** - No more certbot hassles
- ✅ **Git-based deployment** - Push to deploy
- ✅ **Built-in monitoring** - No separate setup needed
- ✅ **Easy scaling** - Scale with clicks, not commands

### **For Your Users**
- ✅ **Better uptime** - Automatic health checks and restarts
- ✅ **Faster deployments** - Zero-downtime deployments
- ✅ **Better performance** - Optimized container orchestration
- ✅ **More reliable** - Professional deployment practices

## 🚀 Ready to Deploy with Dokploy?

Your deployment becomes:

1. **Push code** to GitHub
2. **Configure in Dokploy** (one-time setup)
3. **Deploy automatically**
4. **Monitor via dashboard**
5. **Scale as needed**

Much simpler than manual Docker management! 

Would you like me to create the Dokploy-specific configuration files for your VirtualHEMS deployment?