#!/bin/bash
# HEMS Tactical Bridge Launcher for macOS/Linux

# Navigate to the directory where the script is located
cd "$(dirname "$0")"

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is required but not found. Please install Node.js to run the bridge."
    exit 1
fi

# Start the server
echo "Starting HEMS Tactical Bridge Server..."
node server.js