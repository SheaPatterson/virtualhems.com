#!/bin/bash

set -e

echo "🚀 Starting VirtualHEMS Docker deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << 'EOF'
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
COGNITO_USER_POOL_ID=your-pool-id-here
COGNITO_CLIENT_ID=your-client-id-here
S3_BUCKET=your-bucket-name-here

# Domain Configuration
DOMAIN=your-domain.com
VITE_API_URL=https://your-domain.com
VITE_WS_URL=wss://your-domain.com

# Database Configuration (if using local DB)
POSTGRES_DB=virtualhems
POSTGRES_USER=virtualhems
POSTGRES_PASSWORD=secure-password-here

# Security
JWT_SECRET=your-jwt-secret-here
ENCRYPTION_KEY=your-encryption-key-here
EOF
    print_error "Please edit the .env file with your actual configuration values."
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("AWS_REGION" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "COGNITO_USER_POOL_ID" "COGNITO_CLIENT_ID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "your-${var,,}-here" ]; then
        print_error "Please set $var in your .env file"
        exit 1
    fi
done

print_status "Environment variables validated ✓"

# Create necessary directories
print_status "Creating directories..."
mkdir -p logs ssl monitoring

# Build and start services
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Health checks
print_status "Performing health checks..."

# Check backend
if curl -f -s http://localhost:8001/api/health > /dev/null; then
    print_status "Backend API: ✓ Healthy"
else
    print_error "Backend API: ✗ Not responding"
    docker-compose logs backend
    exit 1
fi

# Check frontend
if curl -f -s http://localhost/ > /dev/null; then
    print_status "Frontend: ✓ Healthy"
else
    print_error "Frontend: ✗ Not responding"
    docker-compose logs frontend
    exit 1
fi

# Check WebSocket
if nc -z localhost 8787; then
    print_status "WebSocket: ✓ Healthy"
else
    print_warning "WebSocket: ✗ Not responding (this may be normal if no connections)"
fi

# Show running containers
print_status "Running containers:"
docker-compose ps

# Show logs
print_status "Recent logs:"
docker-compose logs --tail=20

print_status "🎉 VirtualHEMS deployment completed successfully!"
echo ""
echo "📊 Access your services:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8001"
echo "   Health Check: http://localhost:8001/api/health"
echo "   Grafana (if enabled): http://localhost:3000 (admin/admin123)"
echo "   Prometheus (if enabled): http://localhost:9090"
echo ""
echo "📝 Useful commands:"
echo "   View logs: docker-compose logs -f [service]"
echo "   Restart: docker-compose restart [service]"
echo "   Stop all: docker-compose down"
echo "   Update: ./deploy-docker.sh"
echo ""
echo "🔧 Next steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Set up SSL certificates (Let's Encrypt recommended)"
echo "   3. Configure firewall rules"
echo "   4. Set up monitoring and backups"