#!/bin/bash

# VirtualHEMS Health Check Script
# Quick verification of all services

echo "🚁 VirtualHEMS Health Check"
echo "=========================="
echo "Timestamp: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is running
echo "🐳 Docker Services:"
if docker ps > /dev/null 2>&1; then
    print_status 0 "Docker daemon running"
    
    # Check individual containers
    containers=("frontend" "backend" "websocket" "redis" "postgres" "prometheus" "grafana")
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            print_status 0 "$container container running"
        else
            print_status 1 "$container container not running"
        fi
    done
else
    print_status 1 "Docker daemon not running"
fi

echo ""
echo "🌐 Service Health Checks:"

# Check backend API
if curl -f -s http://localhost:8001/api/health > /dev/null 2>&1; then
    print_status 0 "Backend API responding"
else
    print_status 1 "Backend API not responding"
fi

# Check frontend
if curl -f -s http://localhost/ > /dev/null 2>&1; then
    print_status 0 "Frontend responding"
else
    print_status 1 "Frontend not responding"
fi

# Check WebSocket
if nc -z localhost 8787 2>/dev/null; then
    print_status 0 "WebSocket port open"
else
    print_status 1 "WebSocket port not accessible"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    print_status 0 "Redis responding"
else
    print_status 1 "Redis not responding"
fi

# Check PostgreSQL
if docker exec -it $(docker ps -qf "name=postgres") pg_isready > /dev/null 2>&1; then
    print_status 0 "PostgreSQL responding"
else
    print_status 1 "PostgreSQL not responding"
fi

echo ""
echo "📊 System Resources:"

# CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
echo "CPU Usage: $CPU_USAGE"

# Memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
echo "Memory Usage: $MEMORY_USAGE"

# Disk usage
DISK_USAGE=$(df / | awk 'NR==2 {print $5}')
echo "Disk Usage: $DISK_USAGE"

# Load average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
echo "Load Average:$LOAD_AVG"

echo ""
echo "🔒 Security Status:"

# Check firewall
if ufw status | grep -q "Status: active"; then
    print_status 0 "UFW firewall active"
else
    print_status 1 "UFW firewall not active"
fi

# Check fail2ban
if systemctl is-active --quiet fail2ban; then
    print_status 0 "Fail2ban active"
else
    print_status 1 "Fail2ban not active"
fi

# Check SSL certificate (if domain configured)
if [ -f /etc/letsencrypt/live/*/fullchain.pem ]; then
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/*/fullchain.pem | cut -d= -f2)
    print_status 0 "SSL certificate present (expires: $CERT_EXPIRY)"
else
    print_warning "No SSL certificate found"
fi

echo ""
echo "📈 Performance Metrics:"

# Docker container stats
echo "Container Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -8

echo ""
echo "🔍 Recent Errors:"

# Check for recent errors in logs
if [ -f /var/log/virtualhems/performance.log ]; then
    echo "Recent performance alerts:"
    tail -5 /var/log/virtualhems/performance.log | grep -i "alert\|error\|warning" || echo "No recent alerts"
fi

# Check Docker logs for errors
echo ""
echo "Recent Docker errors:"
docker-compose -f docker-compose.premium.yml logs --tail=10 2>&1 | grep -i "error\|exception\|failed" | head -5 || echo "No recent Docker errors"

echo ""
echo "✅ Health check completed!"
echo ""
echo "🔧 Quick Actions:"
echo "   Restart all services: docker-compose -f docker-compose.premium.yml restart"
echo "   View live logs: docker-compose -f docker-compose.premium.yml logs -f"
echo "   Check performance: ./performance-monitor.sh"
echo "   Run backup: ./premium-backup.sh"