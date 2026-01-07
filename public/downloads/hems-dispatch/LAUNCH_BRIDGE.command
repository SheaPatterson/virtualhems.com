#!/bin/bash
# HEMS TACTICAL BRIDGE - MAC INITIALIZER

# Move to the directory where the script is located
cd "$(dirname "$0")"

clear
echo "========================================"
echo "    HEMS OPS-CENTER: TACTICAL BRIDGE    "
echo "========================================"
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed."
    echo "Please download and install it from: https://nodejs.org"
    echo ""
    read -p "Press any key to exit..."
    exit
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "[INIT] Installing local components..."
    npm install express cors
fi

echo "[STARTING] Initializing server..."
node server.js