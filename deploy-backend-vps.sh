#!/bin/bash
# VirtualHEMS Backend Deployment Script for VPS
# This deploys ONLY the backend services (API + WebSocket)

set -e

echo "🚁 VirtualHEMS Backend Deployment"
echo "=================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Get VPS IP
VPS_IP=$(hostname -I | awk '{print $1}')
echo "📍 VPS IP: $VPS_IP"

# Install dependencies
echo "📦 Installing dependencies..."
apt update
apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# Navigate to backend directory
cd /root/virtualhems.com/backend || {
    echo "❌ Backend directory not found. Clone the repo first:"
    echo "   git clone https://github.com/SheaPatterson/virtualhems.com.git"
    exit 1
}

# Create virtual environment
echo "🐍 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install --upgrade pip
pip install -r requirements.txt

# Create environment file
echo "⚙️  Creating environment file..."
cat > .env << 'EOF'
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIATIGI2FSHYA7ZXSXV
AWS_SECRET_ACCESS_KEY=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
COGNITO_USER_POOL_ID=us-east-1_1c0V6g4OQ
COGNITO_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
S3_BUCKET=virtualhems-assets-223759445135
EOF

# Create systemd service for backend API
echo "🔧 Creating backend API service..."
cat > /etc/systemd/system/virtualhems-backend.service << 'EOF'
[Unit]
Description=VirtualHEMS Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/virtualhems.com/backend
Environment="PATH=/root/virtualhems.com/backend/venv/bin"
ExecStart=/root/virtualhems.com/backend/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for WebSocket
echo "🔧 Creating WebSocket service..."
cat > /etc/systemd/system/virtualhems-websocket.service << 'EOF'
[Unit]
Description=VirtualHEMS WebSocket Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/virtualhems.com/backend
Environment="PATH=/root/virtualhems.com/backend/venv/bin"
ExecStart=/root/virtualhems.com/backend/venv/bin/python websocket_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Start services
echo "🚀 Starting services..."
systemctl enable virtualhems-backend
systemctl start virtualhems-backend

systemctl enable virtualhems-websocket
systemctl start virtualhems-websocket

# Wait a moment for services to start
sleep 3

# Check service status
echo ""
echo "📊 Service Status:"
echo "=================="
systemctl status virtualhems-backend --no-pager | head -10
echo ""
systemctl status virtualhems-websocket --no-pager | head -10

# Test API
echo ""
echo "🧪 Testing API..."
if curl -s http://localhost:8001/api/health > /dev/null; then
    echo "✅ Backend API is responding on port 8001"
else
    echo "❌ Backend API is not responding"
fi

# Configure firewall
echo ""
echo "🔥 Configuring firewall..."
ufw allow 8001/tcp comment 'VirtualHEMS API'
ufw allow 8787/tcp comment 'VirtualHEMS WebSocket'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 22/tcp comment 'SSH'
echo "y" | ufw enable || true

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "📍 Your backend is now running at:"
echo "   API: http://$VPS_IP:8001"
echo "   WebSocket: ws://$VPS_IP:8787"
echo ""
echo "🔧 Next Steps:"
echo "1. Update Vercel environment variables:"
echo "   VITE_API_URL=http://$VPS_IP:8001"
echo "   VITE_WS_URL=ws://$VPS_IP:8787"
echo ""
echo "2. Redeploy on Vercel"
echo ""
echo "3. (Optional) Set up SSL with your domain:"
echo "   - Point api.virtualhems.com to $VPS_IP"
echo "   - Point ws.virtualhems.com to $VPS_IP"
echo "   - Run: certbot --nginx -d api.virtualhems.com -d ws.virtualhems.com"
echo ""
echo "📝 Useful commands:"
echo "   systemctl status virtualhems-backend"
echo "   systemctl status virtualhems-websocket"
echo "   systemctl restart virtualhems-backend"
echo "   journalctl -u virtualhems-backend -f"
echo ""
