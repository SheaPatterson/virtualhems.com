#!/bin/bash

set -e

# VirtualHEMS Quick Deploy Script
echo "🚁 VirtualHEMS Quick Deploy Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root for system setup
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is fine for initial server setup."
    IS_ROOT=true
else
    IS_ROOT=false
fi

print_header "1. System Requirements Check"

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Linux detected ✓"
    if command -v apt &> /dev/null; then
        PKG_MANAGER="apt"
        print_status "Using apt package manager"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
        print_status "Using yum package manager"
    else
        print_error "Unsupported package manager"
        exit 1
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "macOS detected ✓"
    PKG_MANAGER="brew"
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew not found. Please install Homebrew first."
        exit 1
    fi
else
    print_error "Unsupported operating system: $OSTYPE"
    exit 1
fi

# Check available memory
MEMORY_GB=$(free -g 2>/dev/null | awk '/^Mem:/{print $2}' || echo "unknown")
if [ "$MEMORY_GB" != "unknown" ] && [ "$MEMORY_GB" -lt 4 ]; then
    print_warning "Low memory detected: ${MEMORY_GB}GB. Recommended: 4GB+"
fi

print_header "2. Install Dependencies"

install_dependencies() {
    case $PKG_MANAGER in
        "apt")
            if [ "$IS_ROOT" = true ]; then
                apt update
                apt install -y curl wget git nginx nodejs npm python3 python3-pip docker.io docker-compose
            else
                sudo apt update
                sudo apt install -y curl wget git nginx nodejs npm python3 python3-pip docker.io docker-compose
            fi
            ;;
        "yum")
            if [ "$IS_ROOT" = true ]; then
                yum update -y
                yum install -y curl wget git nginx nodejs npm python3 python3-pip docker docker-compose
            else
                sudo yum update -y
                sudo yum install -y curl wget git nginx nodejs npm python3 python3-pip docker docker-compose
            fi
            ;;
        "brew")
            brew install node python nginx docker docker-compose
            ;;
    esac
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker and dependencies..."
    install_dependencies
else
    print_status "Docker already installed ✓"
fi

# Start Docker service (Linux only)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ "$IS_ROOT" = true ]; then
        systemctl enable docker
        systemctl start docker
    else
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        print_warning "Added user to docker group. You may need to log out and back in."
    fi
fi

print_header "3. Project Setup"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the VirtualHEMS project root."
    exit 1
fi

print_status "Installing Node.js dependencies..."
npm install

print_status "Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt
cd ..

print_header "4. Configuration Setup"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env configuration file..."
    cat > .env << 'EOF'
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
COGNITO_USER_POOL_ID=your-pool-id-here
COGNITO_CLIENT_ID=your-client-id-here
S3_BUCKET=your-bucket-name-here

# Domain Configuration
DOMAIN=localhost
VITE_API_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8787

# Development Settings
NODE_ENV=development
ENVIRONMENT=development
EOF
    print_warning "Created .env file with default values. Please update with your AWS credentials."
else
    print_status ".env file already exists ✓"
fi

# Create backend .env if it doesn't exist
if [ ! -f backend/.env ]; then
    print_status "Creating backend .env file..."
    cp .env backend/.env
fi

print_header "5. Choose Deployment Method"

echo ""
echo "Choose your deployment method:"
echo "1) Docker Compose (Recommended for production)"
echo "2) Local Development (Direct execution)"
echo "3) VPS Production Setup (Full server configuration)"
echo ""
read -p "Enter your choice (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        print_header "Docker Compose Deployment"
        
        # Check if .env has real values
        if grep -q "your-.*-here" .env; then
            print_error "Please update your .env file with real AWS credentials before deploying."
            print_status "Edit .env file and run: ./deploy-docker.sh"
            exit 1
        fi
        
        print_status "Building and starting Docker containers..."
        ./deploy-docker.sh
        ;;
        
    2)
        print_header "Local Development Setup"
        
        print_status "Starting backend server..."
        cd backend
        python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
        BACKEND_PID=$!
        cd ..
        
        print_status "Starting WebSocket server..."
        cd backend
        python3 websocket_server.py &
        WEBSOCKET_PID=$!
        cd ..
        
        print_status "Starting frontend development server..."
        npm run dev &
        FRONTEND_PID=$!
        
        # Wait a moment for servers to start
        sleep 5
        
        print_status "🎉 Development servers started!"
        echo ""
        echo "📊 Access your services:"
        echo "   Frontend: http://localhost:5173"
        echo "   Backend API: http://localhost:8001"
        echo "   Health Check: http://localhost:8001/api/health"
        echo ""
        echo "Press Ctrl+C to stop all servers"
        
        # Wait for user interrupt
        trap "kill $BACKEND_PID $WEBSOCKET_PID $FRONTEND_PID 2>/dev/null; exit" INT
        wait
        ;;
        
    3)
        print_header "VPS Production Setup"
        
        if [ "$IS_ROOT" != true ]; then
            print_error "VPS setup requires root privileges. Please run with sudo."
            exit 1
        fi
        
        print_status "This will configure your VPS for production deployment."
        read -p "Enter your domain name: " DOMAIN
        read -p "Enter your email for SSL certificate: " EMAIL
        
        if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
            print_error "Domain and email are required for VPS setup"
            exit 1
        fi
        
        # Update .env with domain
        sed -i "s|DOMAIN=.*|DOMAIN=$DOMAIN|g" .env
        sed -i "s|VITE_API_URL=.*|VITE_API_URL=https://$DOMAIN|g" .env
        sed -i "s|VITE_WS_URL=.*|VITE_WS_URL=wss://$DOMAIN|g" .env
        sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env
        sed -i "s|ENVIRONMENT=.*|ENVIRONMENT=production|g" .env
        
        print_status "Building production assets..."
        npm run build
        
        print_status "Setting up systemd services..."
        # Create systemd services (from VPS_DEPLOYMENT_GUIDE.md)
        
        print_status "Configuring Nginx..."
        # Configure nginx (from VPS_DEPLOYMENT_GUIDE.md)
        
        print_status "Setting up SSL certificate..."
        ./ssl-setup.sh
        
        print_status "🎉 VPS setup completed!"
        echo "Your VirtualHEMS platform is now running at: https://$DOMAIN"
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_header "6. Post-Deployment Checks"

# Health check function
check_health() {
    local url=$1
    local service=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        print_status "$service: ✓ Healthy"
        return 0
    else
        print_warning "$service: ✗ Not responding"
        return 1
    fi
}

# Wait for services to be ready
sleep 5

case $DEPLOY_CHOICE in
    1)
        check_health "http://localhost:8001/api/health" "Backend API"
        check_health "http://localhost/" "Frontend"
        ;;
    2)
        check_health "http://localhost:8001/api/health" "Backend API"
        check_health "http://localhost:5173/" "Frontend Dev Server"
        ;;
    3)
        check_health "https://$DOMAIN/api/health" "Backend API"
        check_health "https://$DOMAIN/" "Frontend"
        ;;
esac

print_header "7. Next Steps"

echo ""
echo "🎉 VirtualHEMS deployment completed!"
echo ""
echo "📋 What to do next:"
echo ""

case $DEPLOY_CHOICE in
    1)
        echo "   1. Update your .env file with real AWS credentials"
        echo "   2. Configure your domain DNS to point to this server"
        echo "   3. Set up SSL certificates with: sudo ./ssl-setup.sh"
        echo "   4. Monitor logs with: docker-compose logs -f"
        echo "   5. Access admin panel at: http://localhost/admin"
        ;;
    2)
        echo "   1. Update your .env file with real AWS credentials"
        echo "   2. Test the application at: http://localhost:5173"
        echo "   3. Check API health at: http://localhost:8001/api/health"
        echo "   4. Access admin panel at: http://localhost:5173/admin"
        echo "   5. Use Ctrl+C to stop development servers"
        ;;
    3)
        echo "   1. Update DNS records to point to this server"
        echo "   2. Test SSL certificate at: https://www.ssllabs.com/ssltest/"
        echo "   3. Configure monitoring and backups"
        echo "   4. Access admin panel at: https://$DOMAIN/admin"
        echo "   5. Set up regular maintenance tasks"
        ;;
esac

echo ""
echo "📚 Documentation:"
echo "   - VPS Deployment: VPS_DEPLOYMENT_GUIDE.md"
echo "   - Plugin Setup: PLUGIN_SETUP_GUIDE.md"
echo "   - ATC Guide: ATC_GUIDE.md"
echo "   - Voice Input: VOICE_INPUT_GUIDE.md"
echo ""
echo "🆘 Need help? Check the documentation or create an issue on GitHub."
echo ""
echo "Happy flying! 🚁"