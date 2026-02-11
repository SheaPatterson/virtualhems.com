#!/bin/bash

# VirtualHEMS Backend Startup Script

echo "=========================================="
echo "VirtualHEMS Backend Startup"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✓ Python 3 found"

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "⚠️  AWS credentials not configured"
    echo "   Run: aws configure"
    echo ""
fi

# Install dependencies
echo ""
echo "Installing Python dependencies..."
cd backend
pip install -q -r requirements.txt

# Check if seed data exists
echo ""
echo "Checking database..."
python3 -c "
import boto3
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('VirtualHEMS_HemsBases')
try:
    response = table.scan(Limit=1)
    count = response['Count']
    if count == 0:
        print('⚠️  Database is empty. Run: python seed_data.py')
    else:
        print('✓ Database has data')
except Exception as e:
    print(f'⚠️  Database check failed: {e}')
"

# Start the server
echo ""
echo "=========================================="
echo "Starting FastAPI server on port 8001..."
echo "=========================================="
echo ""
echo "API will be available at:"
echo "  http://localhost:8001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

python3 -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
