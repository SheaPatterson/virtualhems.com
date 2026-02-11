# VirtualHEMS Performance Optimization Guide
## Maximizing Your Premium VPS (4 CPU | 8GB RAM | 256GB SSD)

Your VPS specs are excellent! Here's how to get maximum performance from your hardware.

## 🚀 Performance Targets

With your premium hardware, you can achieve:
- **50+ concurrent users** without performance degradation
- **Sub-100ms API response times** for most operations
- **99.9% uptime** with proper monitoring
- **Real-time AI features** without lag
- **Instant page loads** with aggressive caching

## 🎯 Resource Allocation Strategy

### **CPU Distribution (4 cores total)**
```
Frontend (Nginx):     1.0 core  (25%)
Backend API:          2.0 cores (50%) 
WebSocket Server:     0.5 cores (12.5%)
Database/Cache:       0.5 cores (12.5%)
```

### **Memory Allocation (8GB total)**
```
System + OS:         1.5GB (19%)
Backend API:         3.0GB (37%)
Redis Cache:         1.5GB (19%)
PostgreSQL:          1.0GB (12%)
Monitoring:          1.0GB (13%)
```

### **Storage Strategy (256GB total)**
```
System:              20GB  (8%)
Application:         15GB  (6%)
Database:            50GB  (20%)
Logs:                30GB  (12%)
Backups:             80GB  (31%)
Monitoring Data:     30GB  (12%)
Free Space:          31GB  (12%)
```

## ⚡ High-Performance Configurations

### **1. Nginx Optimization**
```nginx
# /etc/nginx/nginx.conf
worker_processes 4;                    # Match CPU cores
worker_connections 2048;               # High connection limit
worker_rlimit_nofile 8192;            # File descriptor limit

events {
    worker_connections 2048;
    use epoll;                         # Linux-optimized event model
    multi_accept on;                   # Accept multiple connections
}

http {
    # Connection pooling
    upstream backend {
        least_conn;                    # Load balancing
        server backend:8001 max_fails=3 fail_timeout=30s;
        keepalive 32;                  # Connection pooling
    }
    
    # Caching
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:100m 
                     max_size=1g inactive=60m use_temp_path=off;
    
    # Buffer optimization
    client_body_buffer_size 128k;
    client_max_body_size 100m;
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
}
```

### **2. Backend API Optimization**
```python
# backend/server.py
import uvicorn
from fastapi import FastAPI
import asyncio
import aioredis
from sqlalchemy.pool import QueuePool

# Database connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,              # Connection pool size
    max_overflow=30,           # Additional connections
    pool_pre_ping=True,        # Validate connections
    pool_recycle=3600          # Recycle connections hourly
)

# Redis connection pool
redis_pool = aioredis.ConnectionPool.from_url(
    "redis://redis:6379",
    max_connections=20
)

# Run with multiple workers
if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        workers=4,                     # Utilize all CPU cores
        worker_class="uvicorn.workers.UvicornWorker",
        loop="uvloop",                 # High-performance event loop
        access_log=False,              # Disable for performance
        reload=False
    )
```

### **3. Redis Caching Strategy**
```redis
# redis.conf
maxmemory 1.5gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Connection optimization
tcp-keepalive 300
timeout 0
tcp-backlog 511
```

### **4. PostgreSQL Tuning**
```postgresql
# postgresql.conf
shared_buffers = 2GB                   # 25% of RAM
effective_cache_size = 6GB             # 75% of RAM
work_mem = 64MB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1                 # SSD optimization
effective_io_concurrency = 200         # SSD optimization
```

## 🔧 Application-Level Optimizations

### **1. Frontend Optimizations**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          maps: ['leaflet', 'react-leaflet'],
          charts: ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### **2. API Response Caching**
```python
from functools import lru_cache
import aioredis

# Memory caching for frequently accessed data
@lru_cache(maxsize=1000)
def get_static_data(key: str):
    return expensive_computation(key)

# Redis caching for dynamic data
async def get_cached_missions(user_id: str):
    cache_key = f"missions:{user_id}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    missions = await fetch_missions(user_id)
    await redis.setex(cache_key, 300, json.dumps(missions))  # 5min cache
    return missions
```

### **3. Database Query Optimization**
```python
# Use database indexes
class Mission(Base):
    __tablename__ = "missions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)           # Index for user queries
    created_at = Column(DateTime, index=True)      # Index for time queries
    status = Column(String, index=True)            # Index for status filters

# Efficient queries with pagination
async def get_missions(user_id: str, page: int = 1, limit: int = 20):
    offset = (page - 1) * limit
    return await db.execute(
        select(Mission)
        .where(Mission.user_id == user_id)
        .order_by(Mission.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
```

## 📊 Monitoring and Alerting

### **1. Performance Metrics to Track**
```yaml
# Key metrics for your premium setup
CPU_Usage:
  warning: > 70%
  critical: > 85%

Memory_Usage:
  warning: > 80%
  critical: > 90%

Disk_Usage:
  warning: > 80%
  critical: > 90%

API_Response_Time:
  warning: > 200ms
  critical: > 500ms

Database_Connections:
  warning: > 15
  critical: > 18

Redis_Memory:
  warning: > 1.2GB
  critical: > 1.4GB
```

### **2. Grafana Dashboard Queries**
```promql
# CPU usage by container
rate(container_cpu_usage_seconds_total[5m]) * 100

# Memory usage percentage
(container_memory_usage_bytes / container_spec_memory_limit_bytes) * 100

# API request rate
rate(http_requests_total[5m])

# Database connection pool
pg_stat_database_numbackends

# Redis memory usage
redis_memory_used_bytes
```

## 🚀 Performance Testing

### **Load Testing Script**
```bash
#!/bin/bash
# load-test.sh

echo "🧪 VirtualHEMS Load Testing"

# Test API endpoints
echo "Testing API performance..."
ab -n 1000 -c 50 http://localhost:8001/api/health
ab -n 500 -c 25 http://localhost:8001/api/missions
ab -n 200 -c 10 http://localhost:8001/api/profiles

# Test WebSocket connections
echo "Testing WebSocket performance..."
node websocket-load-test.js

# Test database performance
echo "Testing database performance..."
pgbench -c 10 -j 2 -t 1000 virtualhems

echo "Load testing completed!"
```

### **Expected Performance Results**
```
API Endpoints:
├── /api/health: 2000+ req/sec
├── /api/missions: 500+ req/sec
├── /api/profiles: 300+ req/sec
└── /api/telemetry: 1000+ req/sec

WebSocket:
├── Concurrent connections: 500+
├── Message throughput: 10,000+ msg/sec
└── Latency: <10ms

Database:
├── Read queries: 1000+ qps
├── Write queries: 500+ qps
└── Connection time: <5ms
```

## 💡 Advanced Optimizations

### **1. CDN Integration**
```javascript
// Use CDN for static assets
const CDN_URL = "https://cdn.your-domain.com";

// Optimize image loading
<img 
  src={`${CDN_URL}/images/optimized/${image}.webp`}
  loading="lazy"
  decoding="async"
/>
```

### **2. Service Worker Caching**
```javascript
// sw.js - Cache API responses
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/static/')) {
    event.respondWith(
      caches.open('api-cache').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

### **3. Database Partitioning**
```sql
-- Partition large tables by date
CREATE TABLE missions_2024 PARTITION OF missions
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE telemetry_2024 PARTITION OF telemetry
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## 🎯 Capacity Planning

### **Current Capacity (4 CPU, 8GB RAM)**
- **Concurrent Users**: 50-100
- **API Requests**: 1000+ req/sec
- **WebSocket Connections**: 500+
- **Database Records**: 10M+ missions
- **Storage**: 200GB+ with backups

### **Scaling Triggers**
```
Scale Up When:
├── CPU usage > 70% for 10+ minutes
├── Memory usage > 80% for 5+ minutes
├── API response time > 200ms average
├── Database connections > 15
└── Disk usage > 80%

Scale Out When:
├── Concurrent users > 80
├── API requests > 800 req/sec
├── WebSocket connections > 400
└── Database queries > 500 qps
```

## 🔍 Performance Troubleshooting

### **Common Issues and Solutions**

#### **High CPU Usage**
```bash
# Identify CPU-intensive processes
top -p $(pgrep -d',' -f virtualhems)

# Check container CPU usage
docker stats --no-stream

# Solution: Scale backend workers or optimize queries
```

#### **Memory Leaks**
```bash
# Monitor memory usage over time
watch -n 5 'free -h && docker stats --no-stream'

# Check for memory leaks in Node.js
node --inspect backend/server.js

# Solution: Implement proper cleanup and garbage collection
```

#### **Slow Database Queries**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 100;

-- Analyze slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

## 📈 Performance Optimization Checklist

### **✅ Infrastructure**
- [ ] 4 CPU cores fully utilized
- [ ] 8GB RAM optimally allocated
- [ ] SSD storage with proper partitioning
- [ ] Nginx with 2048+ connections
- [ ] Redis caching enabled
- [ ] Database connection pooling

### **✅ Application**
- [ ] Multi-worker backend (4 processes)
- [ ] API response caching
- [ ] Database query optimization
- [ ] Frontend code splitting
- [ ] Image optimization
- [ ] Gzip compression

### **✅ Monitoring**
- [ ] Prometheus metrics collection
- [ ] Grafana performance dashboards
- [ ] Automated alerting
- [ ] Performance testing suite
- [ ] Capacity planning metrics

### **✅ Security**
- [ ] Rate limiting configured
- [ ] SSL/TLS optimization
- [ ] Security headers
- [ ] Firewall rules
- [ ] Regular security updates

---

## 🎉 Expected Results

With these optimizations on your premium VPS:

- **⚡ 50+ concurrent users** without performance issues
- **🚀 Sub-100ms API responses** for most operations
- **💾 Efficient memory usage** with intelligent caching
- **🔄 99.9% uptime** with automatic recovery
- **📊 Real-time monitoring** and alerting
- **💰 $600+ annual savings** vs. managed hosting

Your VirtualHEMS platform will perform like a professional enterprise application! 🚁