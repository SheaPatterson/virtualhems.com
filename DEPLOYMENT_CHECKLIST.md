# VirtualHEMS Premium Deployment Checklist
## Ready to Deploy Your 24/7 HEMS Platform! 🚁

## 📋 Pre-Deployment Checklist

### **✅ VPS Information**
- [ ] VPS IP Address: `74.208.72.38`
- [ ] SSH Access: `ssh root@74.208.72.38 or `ssh username@your-vps-ip`
- [ ] Domain Name: `74.208.72.38:3000 (optional but recommended)
- [ ] Email for SSL: `sheapatterson@icloud.com`

### **✅ AWS Credentials Ready**
- [ ] AWS Access Key ID: `AKIATIGI2FSHYA7ZXSXV`
- [ ] AWS Secret Access Key: `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`
- [ ] Cognito User Pool ID: `us-east-1_1c0V6g4OQ'
- [ ] Cognito Client ID: `682jtce3sr02pne6vf9f0tk8ak`
- [ ] S3 Bucket Name: `virtualhems-assets-223759445135'
- [ ] DynamoDB Tables: Created and populated

### **✅ Local Preparation**
- [ ] All files committed to Git repository
- [ ] Repository accessible from VPS
- [ ] AWS credentials tested locally

## 🚀 Deployment Steps

### **Step 1: Connect to Your VPS**
```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Or if using non-root user
ssh your-username@YOUR_VPS_IP
```

### **Step 2: Clone Your Repository**
```bash
# Navigate to optimal directory
cd /opt

# Clone your VirtualHEMS repository
git clone https://github.com/yourusername/virtualhems.git
# OR upload your files via SCP/SFTP

# Set proper ownership
chown -R www-data:www-data /opt/virtualhems
cd /opt/virtualhems
```

### **Step 3: Run Premium Deployment**
```bash
# Make scripts executable
chmod +x *.sh

# Run the premium deployment script
sudo ./premium-deploy.sh
```

**The script will:**
- ✅ Detect your premium hardware (4 CPU, 8GB RAM)
- ✅ Install all required software
- ✅ Optimize system for high performance
- ✅ Configure Docker with premium settings
- ✅ Set up monitoring and security
- ✅ Create backup systems

### **Step 4: Configure Environment**
```bash
# Edit the premium environment file
nano .env.premium

# Update with your actual values:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-actual-access-key
AWS_SECRET_ACCESS_KEY=your-actual-secret-key
COGNITO_USER_POOL_ID=your-actual-pool-id
COGNITO_CLIENT_ID=your-actual-client-id
S3_BUCKET=your-actual-bucket-name
DOMAIN=your-domain.com
```

### **Step 5: Deploy Premium Stack**
```bash
# Copy premium config to main env
cp .env.premium .env

# Start the premium Docker stack
docker-compose -f docker-compose.premium.yml up -d

# Check all services are running
docker-compose -f docker-compose.premium.yml ps
```

### **Step 6: Setup SSL (If you have a domain)**
```bash
# Run SSL setup script
sudo ./ssl-setup.sh

# Enter your domain and email when prompted
# This will automatically configure Let's Encrypt SSL
```

### **Step 7: Verify Deployment**
```bash
# Check service health
curl http://localhost:8001/api/health

# Check frontend
curl http://localhost/

# Check Docker containers
docker ps

# Check system resources
htop
```

## 🔍 Post-Deployment Verification

### **✅ Service Health Checks**
```bash
# Backend API
curl http://localhost:8001/api/health
# Expected: {"status": "healthy"}

# Frontend
curl -I http://localhost/
# Expected: HTTP/1.1 200 OK

# WebSocket
nc -z localhost 8787
# Expected: Connection succeeded

# Redis
redis-cli ping
# Expected: PONG

# PostgreSQL
sudo -u postgres psql -c "SELECT version();"
# Expected: PostgreSQL version info
```

### **✅ Performance Verification**
```bash
# Check CPU usage (should be low at idle)
top -bn1 | grep "Cpu(s)"

# Check memory usage
free -h

# Check disk usage
df -h

# Check Docker container stats
docker stats --no-stream
```

### **✅ Access Your Platform**
- **Frontend**: `http://your-vps-ip` or `https://your-domain.com`
- **Admin Panel**: `http://your-vps-ip/admin` or `https://your-domain.com/admin`
- **API Health**: `http://your-vps-ip:8001/api/health`
- **Grafana Monitoring**: `http://your-vps-ip:3000` (admin/admin123)
- **Prometheus Metrics**: `http://your-vps-ip:9090`

## 🛠️ Configuration Verification

### **✅ Test Core Features**
1. **User Registration**: Create a test account
2. **Profile Management**: Complete user profile
3. **Mission Creation**: Create a test mission
4. **AI Dispatch**: Test AI dispatch chat
5. **ATC Communications**: Test ATC system
6. **Voice Input**: Test voice features (if browser supports)
7. **Admin Panel**: Access admin features
8. **Plugin Download**: Test plugin download links

### **✅ Performance Testing**
```bash
# Simple load test
ab -n 100 -c 10 http://localhost:8001/api/health

# Expected results for your premium VPS:
# Requests per second: 500+
# Time per request: <20ms
# Failed requests: 0
```

## 📊 Monitoring Setup

### **✅ Grafana Dashboard**
1. Access: `http://your-vps-ip:3000`
2. Login: admin/admin123
3. Import VirtualHEMS dashboard
4. Verify all metrics are collecting

### **✅ Log Monitoring**
```bash
# Check application logs
docker-compose -f docker-compose.premium.yml logs -f backend

# Check system logs
tail -f /var/log/virtualhems/performance.log

# Check nginx logs
tail -f /var/log/nginx/access.log
```

## 🔒 Security Verification

### **✅ Firewall Status**
```bash
# Check UFW status
sudo ufw status

# Expected: Active with rules for SSH, HTTP, HTTPS
```

### **✅ SSL Certificate (if domain configured)**
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Or test online: https://www.ssllabs.com/ssltest/
```

### **✅ Fail2ban Status**
```bash
# Check fail2ban status
sudo fail2ban-client status

# Check SSH protection
sudo fail2ban-client status sshd
```

## 🎯 Performance Expectations

With your premium VPS, you should see:

### **✅ Response Times**
- API Health Check: <10ms
- User Login: <100ms
- Mission Creation: <200ms
- Profile Updates: <150ms
- AI Dispatch: <2000ms (depends on AWS Bedrock)

### **✅ Capacity**
- Concurrent Users: 50+ easily
- API Requests: 1000+ req/sec
- WebSocket Connections: 500+
- Database Queries: 500+ qps

### **✅ Resource Usage (at idle)**
- CPU: <10%
- Memory: <4GB (50%)
- Disk I/O: Minimal
- Network: <1MB/s

## 🚨 Troubleshooting Common Issues

### **Issue: Services Won't Start**
```bash
# Check Docker logs
docker-compose -f docker-compose.premium.yml logs

# Check system resources
free -h && df -h

# Restart services
docker-compose -f docker-compose.premium.yml restart
```

### **Issue: High Memory Usage**
```bash
# Check container memory usage
docker stats --no-stream

# Restart memory-intensive services
docker-compose -f docker-compose.premium.yml restart backend
```

### **Issue: SSL Certificate Problems**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check nginx configuration
sudo nginx -t
```

### **Issue: Database Connection Errors**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
docker-compose -f docker-compose.premium.yml exec postgres psql -U virtualhems -d virtualhems -c "SELECT 1;"
```

## 📈 Next Steps After Deployment

### **✅ Immediate (First 24 hours)**
1. **Monitor Performance**: Watch Grafana dashboards
2. **Test All Features**: Verify everything works
3. **Create Admin Account**: Set up your admin user
4. **Import Data**: Migrate your existing data
5. **Test Plugins**: Verify simulator plugin connectivity

### **✅ Short Term (First Week)**
1. **DNS Configuration**: Point domain to VPS
2. **SSL Optimization**: Configure SSL settings
3. **Backup Testing**: Verify backup system works
4. **Performance Tuning**: Optimize based on usage
5. **User Testing**: Invite beta users

### **✅ Long Term (First Month)**
1. **Community Building**: Invite HEMS pilots
2. **Content Creation**: Add hospitals, bases, aircraft
3. **Plugin Distribution**: Share plugins with community
4. **Monitoring Optimization**: Fine-tune alerts
5. **Scaling Planning**: Plan for growth

## 🎉 Success Metrics

Your deployment is successful when:

- ✅ **All services running**: Green status in Docker
- ✅ **Fast response times**: <100ms for most APIs
- ✅ **Low resource usage**: <50% memory, <20% CPU at idle
- ✅ **SSL working**: A+ rating on SSL Labs
- ✅ **Monitoring active**: Grafana showing metrics
- ✅ **Backups working**: Daily backups completing
- ✅ **Users can register**: Full user workflow works
- ✅ **AI features working**: Dispatch and ATC responding
- ✅ **Plugins connecting**: Simulator integration works

## 📞 Support Resources

### **Documentation**
- `VPS_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `PERFORMANCE_OPTIMIZATION.md` - Performance tuning
- `ATC_GUIDE.md` - ATC system usage
- `VOICE_INPUT_GUIDE.md` - Voice features
- `PLUGIN_SETUP_GUIDE.md` - Simulator plugins

### **Monitoring Commands**
```bash
# Quick health check
./health-check.sh

# Performance monitoring
./performance-monitor.sh

# View all logs
multitail /var/log/nginx/access.log /var/log/virtualhems/performance.log

# Container status
docker-compose -f docker-compose.premium.yml ps
```

---

## 🚁 Ready for Takeoff!

Your premium VirtualHEMS platform is now ready to serve the HEMS simulation community 24/7 with professional-grade performance and reliability!

**Estimated deployment time**: 30-60 minutes
**Expected uptime**: 99.9%+
**Concurrent user capacity**: 50+
**Annual hosting savings**: $600+

Welcome to the future of HEMS simulation! 🌟