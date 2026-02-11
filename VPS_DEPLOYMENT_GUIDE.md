# VirtualHEMS VPS Deployment Guide

## 🚀 Deploy to VPS for 24/7 Access

This guide will help you deploy VirtualHEMS to your VPS for production use with 24/7 availability.

## Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 50GB minimum
- **CPU**: 2 cores minimum
- **Network**: Public IP with ports 80, 443, 8001, 8080 available

### Domain Setup
- Domain name pointing to your VPS IP
- SSL certificate (we'll use Let's Encrypt)

## Step 1: VPS Initial Setup

### Connect to Your VPS
```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### Install Required Software
```bash
# Ubuntu/Debian
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx nodejs npm python3 python3-pip docker.io docker-compose

# CentOS/RHEL
sudo yum install -y curl wget git nginx certbot python3-certbot-nginx nodejs npm python3 python3-pip docker docker-compose
```

### Start Services
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

## Step 2: Clone and Setup Project

### Clone Repository
```bash
cd /opt
sudo git clone https://github.com/yourusername/virtualhems.git
sudo chown -R $USER:$USER /opt/virtualhems
cd /opt/virtualhems
```

### Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd backend
pip3 install -r requirements.txt
cd ..
```

## Step 3: Environment Configuration

### Create Production Environment Files
```bash
# Frontend environment
cat > .env.production << 'EOF'
VITE_API_URL=https://your-domain.com
VITE_WS_URL=wss://your-domain.com
NODE_ENV=production
EOF

# Backend environment
cat > backend/.env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
S3_BUCKET=your-bucket-name
ENVIRONMENT=production
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
EOF
```

### Update AWS Config
```bash
# Update backend/aws_config.json with your production values
cat > backend/aws_config.json << 'EOF'
{
    "aws_region": "us-east-1",
    "user_pool_id": "your-pool-id",
    "user_pool_client_id": "your-client-id",
    "identity_pool_id": "your-identity-pool-id",
    "s3_bucket": "your-bucket-name",
    "dynamodb_tables": {
        "missions": "VirtualHEMS_Missions",
        "telemetry": "VirtualHEMS_Telemetry",
        "users": "VirtualHEMS_Users",
        "hems_bases": "VirtualHEMS_HemsBases",
        "hospitals": "VirtualHEMS_Hospitals",
        "helicopters": "VirtualHEMS_Helicopters"
    }
}
EOF
```

## Step 4: Build Production Assets

### Build Frontend
```bash
npm run build
```

### Test Backend
```bash
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Test in another terminal: curl http://localhost:8001/api/health
# Stop with Ctrl+C
cd ..
```

## Step 5: Create Systemd Services

### Backend Service
```bash
sudo tee /etc/systemd/system/virtualhems-backend.service << 'EOF'
[Unit]
Description=VirtualHEMS Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/virtualhems/backend
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### WebSocket Bridge Service
```bash
sudo tee /etc/systemd/system/virtualhems-websocket.service << 'EOF'
[Unit]
Description=VirtualHEMS WebSocket Bridge
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/virtualhems/backend
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/bin/python3 websocket_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### Enable and Start Services
```bash
sudo systemctl daemon-reload
sudo systemctl enable virtualhems-backend
sudo systemctl enable virtualhems-websocket
sudo systemctl start virtualhems-backend
sudo systemctl start virtualhems-websocket

# Check status
sudo systemctl status virtualhems-backend
sudo systemctl status virtualhems-websocket
```

## Step 6: Nginx Configuration

### Create Nginx Config
```bash
sudo tee /etc/nginx/sites-available/virtualhems << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (will be added by certbot)
    
    # Frontend (React build)
    location / {
        root /opt/virtualhems/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WebSocket connections
    location /ws/ {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
EOF
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/virtualhems /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: SSL Certificate

### Get Let's Encrypt Certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 8: Firewall Configuration

### Configure UFW (Ubuntu)
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 8001  # Backend API (optional, for direct access)
sudo ufw enable
```

### Configure firewalld (CentOS)
```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8001/tcp
sudo firewall-cmd --reload
```

## Step 9: Monitoring and Logging

### Create Log Directories
```bash
sudo mkdir -p /var/log/virtualhems
sudo chown www-data:www-data /var/log/virtualhems
```

### Setup Log Rotation
```bash
sudo tee /etc/logrotate.d/virtualhems << 'EOF'
/var/log/virtualhems/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload virtualhems-backend
        systemctl reload virtualhems-websocket
    endscript
}
EOF
```

### Health Check Script
```bash
tee /opt/virtualhems/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for VirtualHEMS
LOG_FILE="/var/log/virtualhems/health-check.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check backend API
if curl -f -s http://localhost:8001/api/health > /dev/null; then
    echo "[$DATE] Backend API: OK" >> $LOG_FILE
else
    echo "[$DATE] Backend API: FAILED - Restarting service" >> $LOG_FILE
    sudo systemctl restart virtualhems-backend
fi

# Check WebSocket service
if pgrep -f "websocket_server.py" > /dev/null; then
    echo "[$DATE] WebSocket Service: OK" >> $LOG_FILE
else
    echo "[$DATE] WebSocket Service: FAILED - Restarting service" >> $LOG_FILE
    sudo systemctl restart virtualhems-websocket
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEM_USAGE -gt 90 ]; then
    echo "[$DATE] WARNING: Memory usage is ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF

chmod +x /opt/virtualhems/health-check.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/virtualhems/health-check.sh") | crontab -
```

## Step 10: Backup Strategy

### Database Backup Script
```bash
tee /opt/virtualhems/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/virtualhems/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup configuration files
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
    /opt/virtualhems/.env.production \
    /opt/virtualhems/backend/.env \
    /opt/virtualhems/backend/aws_config.json \
    /etc/nginx/sites-available/virtualhems

# Export DynamoDB data (requires AWS CLI)
if command -v aws &> /dev/null; then
    aws dynamodb scan --table-name VirtualHEMS_Users --output json > "$BACKUP_DIR/users_$DATE.json"
    aws dynamodb scan --table-name VirtualHEMS_Missions --output json > "$BACKUP_DIR/missions_$DATE.json"
    aws dynamodb scan --table-name VirtualHEMS_Helicopters --output json > "$BACKUP_DIR/helicopters_$DATE.json"
    aws dynamodb scan --table-name VirtualHEMS_Hospitals --output json > "$BACKUP_DIR/hospitals_$DATE.json"
    aws dynamodb scan --table-name VirtualHEMS_HemsBases --output json > "$BACKUP_DIR/hems_bases_$DATE.json"
fi

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/virtualhems/backup.sh

# Schedule daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/virtualhems/backup.sh") | crontab -
```

## Step 11: Performance Optimization

### Enable HTTP/2 and Compression
```bash
# Already included in nginx config above
```

### PM2 for Node.js Process Management (Alternative)
```bash
# If you prefer PM2 over systemd
npm install -g pm2

# Create PM2 ecosystem file
tee /opt/virtualhems/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'virtualhems-backend',
    script: 'python3',
    args: '-m uvicorn server:app --host 0.0.0.0 --port 8001',
    cwd: '/opt/virtualhems/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'virtualhems-websocket',
    script: 'python3',
    args: 'websocket_server.py',
    cwd: '/opt/virtualhems/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M'
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Step 12: Security Hardening

### Fail2Ban for SSH Protection
```bash
sudo apt install fail2ban

sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Update System Packages Automatically
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Step 13: Deployment Script

### Create Automated Deployment Script
```bash
tee /opt/virtualhems/deploy.sh << 'EOF'
#!/bin/bash

set -e

echo "🚀 Starting VirtualHEMS deployment..."

# Pull latest changes
cd /opt/virtualhems
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Update backend dependencies
cd backend
pip3 install -r requirements.txt
cd ..

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart virtualhems-backend
sudo systemctl restart virtualhems-websocket

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Health check
sleep 5
if curl -f -s http://localhost:8001/api/health > /dev/null; then
    echo "✅ Deployment successful! Backend is healthy."
else
    echo "❌ Deployment failed! Backend health check failed."
    exit 1
fi

echo "🎉 VirtualHEMS deployment completed successfully!"
echo "🌐 Visit: https://your-domain.com"
EOF

chmod +x /opt/virtualhems/deploy.sh
```

## Step 14: Testing Deployment

### Test All Services
```bash
# Test backend API
curl https://your-domain.com/api/health

# Test frontend
curl -I https://your-domain.com

# Check service status
sudo systemctl status virtualhems-backend
sudo systemctl status virtualhems-websocket
sudo systemctl status nginx

# Check logs
sudo journalctl -u virtualhems-backend -f
sudo journalctl -u virtualhems-websocket -f
```

## Step 15: Domain and DNS Configuration

### DNS Records to Add
```
A     your-domain.com        -> YOUR_VPS_IP
A     www.your-domain.com    -> YOUR_VPS_IP
CNAME api.your-domain.com    -> your-domain.com
```

### Update Frontend Configuration
```bash
# Update .env.production with your actual domain
sed -i 's/your-domain.com/youractualdomain.com/g' .env.production
```

## Maintenance Commands

### View Logs
```bash
# Backend logs
sudo journalctl -u virtualhems-backend -f

# WebSocket logs
sudo journalctl -u virtualhems-websocket -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Health check logs
tail -f /var/log/virtualhems/health-check.log
```

### Update Deployment
```bash
cd /opt/virtualhems
./deploy.sh
```

### Restart Services
```bash
sudo systemctl restart virtualhems-backend
sudo systemctl restart virtualhems-websocket
sudo systemctl reload nginx
```

### Check System Resources
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Service status
sudo systemctl status virtualhems-backend virtualhems-websocket nginx
```

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check logs
sudo journalctl -u virtualhems-backend -n 50

# Check Python dependencies
cd /opt/virtualhems/backend
pip3 install -r requirements.txt

# Test manually
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001
```

#### Frontend Not Loading
```bash
# Check nginx config
sudo nginx -t

# Rebuild frontend
cd /opt/virtualhems
npm run build

# Check file permissions
sudo chown -R www-data:www-data /opt/virtualhems/dist
```

#### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

#### High Memory Usage
```bash
# Check processes
ps aux --sort=-%mem | head

# Restart services
sudo systemctl restart virtualhems-backend
sudo systemctl restart virtualhems-websocket
```

## Performance Monitoring

### Setup Basic Monitoring
```bash
# Install htop for system monitoring
sudo apt install htop

# Monitor logs in real-time
sudo apt install multitail
multitail /var/log/nginx/access.log /var/log/virtualhems/health-check.log
```

## Cost Optimization

### AWS Resource Management
- Use DynamoDB On-Demand pricing for variable workloads
- Set up CloudWatch alarms for cost monitoring
- Use S3 Intelligent Tiering for asset storage
- Monitor Bedrock API usage for AI features

### VPS Resource Optimization
- Monitor CPU and memory usage
- Use nginx caching for static assets
- Implement log rotation to save disk space
- Regular cleanup of old backups

---

## 🎉 Deployment Complete!

Your VirtualHEMS platform is now running 24/7 on your VPS with:

- ✅ Production-ready configuration
- ✅ SSL encryption
- ✅ Automatic service restart
- ✅ Health monitoring
- ✅ Automated backups
- ✅ Security hardening
- ✅ Performance optimization

**Access your platform at**: `https://your-domain.com`

**Admin panel**: `https://your-domain.com/admin`

**API health check**: `https://your-domain.com/api/health`

Remember to replace `your-domain.com` with your actual domain name throughout the configuration files!