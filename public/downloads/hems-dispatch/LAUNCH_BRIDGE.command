#!/bin/bash

# Ensure we are in the directory where the script is located
cd "$(dirname "$0")"

echo "========================================"
echo "      HEMS Tactical Bridge Launcher     "
echo "========================================"
echo "Setting working directory to: $(pwd)"

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "ERROR: Node.js is not installed."
    echo "Please download and install it from https://nodejs.org"
    read -p "Press any key to exit..."
    exit
fi

# Check if dependencies exist
if [ ! -d "node_modules" ]; then
    echo "[SETUP] Installing required dependencies..."
    npm install
fi

echo "Starting HEMS Tactical Bridge..."
echo "----------------------------------------"
node server.js