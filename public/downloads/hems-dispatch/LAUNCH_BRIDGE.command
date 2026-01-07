#!/bin/bash

# Move to the script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

clear
echo "========================================"
echo "      HEMS Tactical Bridge Launcher     "
echo "========================================"
echo "Location: $DIR"

# 1. Check for Node.js
if ! command -v node &> /dev/null
then
    echo ""
    echo "CRITICAL ERROR: Node.js is not installed."
    echo "Please install it from https://nodejs.org"
    echo "----------------------------------------"
    read -p "Press Enter to exit..."
    exit
fi

# 2. Check for dependencies
if [ ! -d "node_modules" ]; then
    echo "[SYSTEM] First run detected. Installing dependencies..."
    npm install --no-audit --no-fund
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies. Check your internet connection."
        read -p "Press Enter to exit..."
        exit
    fi
fi

# 3. Launch Server
echo "[SUCCESS] Dependencies verified."
echo "Starting HEMS Tactical Bridge..."
echo "----------------------------------------"

node server.js

# 4. If the server crashes, keep window open
echo ""
echo "----------------------------------------"
echo "Bridge server has stopped."
read -p "Press Enter to close this window..."