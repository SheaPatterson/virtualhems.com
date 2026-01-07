#!/bin/bash

# Move to the directory where this script is located
cd "$(dirname "$0")"

clear
echo "###########################################################"
echo "#             HEMS TACTICAL BRIDGE v5.2                   #"
echo "#          INITIALIZING SECURE DATA LINK                  #"
echo "###########################################################"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not installed!"
    echo "Please download and install it from: https://nodejs.org/"
    exit
fi

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "[1/2] First time setup: Installing tactical protocols..."
    npm install --quiet
fi

# Open the HUD in the default browser
echo "[2/2] Launching Tactical Bridge..."
sleep 2
open http://localhost:8080

# Start the server
node server.js