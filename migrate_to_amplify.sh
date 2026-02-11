#!/bin/bash

echo "=========================================="
echo "VirtualHEMS - Migrate to AWS Amplify"
echo "=========================================="
echo ""

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "Installing Amplify CLI..."
    npm install -g @aws-amplify/cli
fi

echo "Step 1: Configure AWS credentials"
echo "This will open your browser..."
amplify configure

echo ""
echo "Step 2: Initialize Amplify in your project"
amplify init

echo ""
echo "Step 3: Import existing Cognito"
amplify import auth

echo ""
echo "Step 4: Add GraphQL API"
echo "When prompted:"
echo "  - Select: GraphQL"
echo "  - Authorization: Amazon Cognito User Pool"
echo "  - Advanced settings: Yes"
echo "  - Enable DataStore: Yes"
echo ""
read -p "Press Enter to continue..."
amplify add api

echo ""
echo "Step 5: Copy schema"
mkdir -p amplify/backend/api/virtualhems
cp amplify_schema.graphql amplify/backend/api/virtualhems/schema.graphql

echo ""
echo "Step 6: Deploy to AWS"
echo "This will create all your tables and API..."
amplify push

echo ""
echo "=========================================="
echo "✓ Amplify Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run: npm install aws-amplify @aws-amplify/ui-react"
echo "2. Export your Supabase data (see MIGRATION_README.md)"
echo "3. Import to Amplify (I'll create a script for this)"
echo ""
