#!/bin/bash

# VirtualHEMS - Start All Services

echo "=========================================="
echo "VirtualHEMS - Starting All Services"
echo "=========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Kill existing processes
echo "Checking for existing processes..."
if check_port 8001; then
    echo "  Killing process on port 8001..."
    lsof -ti:8001 | xargs kill -9 2>/dev/null
fi
if check_port 8787; then
    echo "  Killing process on port 8787..."
    lsof -ti:8787 | xargs kill -9 2>/dev/null
fi
if check_port 8788; then
    echo "  Killing process on port 8788..."
    lsof -ti:8788 | xargs kill -9 2>/dev/null
fi

echo ""
echo "Starting services..."
echo ""

# Start Backend API
echo "1. Starting Backend API (port 8001)..."
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
cd ..

# Wait for backend to start
sleep 3

# Start WebSocket Bridge
echo "2. Starting WebSocket Bridge (ports 8787, 8788)..."
cd backend
python3 websocket_server.py > ../logs/websocket.log 2>&1 &
WEBSOCKET_PID=$!
echo "   PID: $WEBSOCKET_PID"
cd ..

# Wait for websocket to start
sleep 2

# Start Frontend
echo "3. Starting Frontend (port 8080)..."
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"

echo ""
echo "=========================================="
echo "✓ All Services Started!"
echo "=========================================="
echo ""
echo "Services:"
echo "  Backend API:       http://localhost:8001"
echo "  WebSocket (X-Plane): ws://localhost:8787"
echo "  WebSocket (MSFS):    ws://localhost:8788"
echo "  Frontend:          http://localhost:8080"
echo ""
echo "Process IDs:"
echo "  Backend:    $BACKEND_PID"
echo "  WebSocket:  $WEBSOCKET_PID"
echo "  Frontend:   $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend:    tail -f logs/backend.log"
echo "  WebSocket:  tail -f logs/websocket.log"
echo "  Frontend:   tail -f logs/frontend.log"
echo ""
echo "To stop all services:"
echo "  ./stop_all.sh"
echo ""
echo "Press Ctrl+C to stop monitoring (services will keep running)"
echo ""

# Create stop script
cat > stop_all.sh << 'EOF'
#!/bin/bash
echo "Stopping VirtualHEMS services..."
lsof -ti:8001 | xargs kill -9 2>/dev/null && echo "  ✓ Backend stopped"
lsof -ti:8787 | xargs kill -9 2>/dev/null && echo "  ✓ WebSocket (X-Plane) stopped"
lsof -ti:8788 | xargs kill -9 2>/dev/null && echo "  ✓ WebSocket (MSFS) stopped"
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "  ✓ Frontend stopped"
echo "All services stopped."
EOF
chmod +x stop_all.sh

# Monitor logs
echo "Monitoring logs (Ctrl+C to exit)..."
echo ""
tail -f logs/backend.log logs/websocket.log logs/frontend.log
