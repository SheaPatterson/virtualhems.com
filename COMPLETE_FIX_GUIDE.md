# Complete Fix Guide for VirtualHEMS

## Summary of Issues

### 1. ❌ Data Not Displaying
- **Cause**: Frontend still calling old Supabase API endpoints
- **Status**: ✅ FIXED - Updated `src/integrations/simulator/api.ts` to use AWS backend

### 2. ❌ Simulator Plugins Not Working  
- **Cause**: Plugins expect WebSocket connection, but backend only has REST API
- **Status**: ⚠️ NEEDS WORK - See solutions below

### 3. ❌ Wrong Database Schema
- **Cause**: Agent created new DynamoDB tables instead of migrating Supabase data
- **Status**: ⚠️ MIGRATION NEEDED - See migration steps below

### 4. ❌ Missing Tables
- **Cause**: Only 6 tables created, missing 9+ tables from original Supabase
- **Status**: ⚠️ NEEDS CREATION - See schema update below

## Quick Start (Get App Running)

### Step 1: Set Environment Variables
```bash
# Create .env file (already done)
cat > .env << 'EOF'
VITE_API_URL=http://localhost:8001
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_1c0V6g4OQ
VITE_USER_POOL_CLIENT_ID=682jtce3sr02pne6vf9f0tk8ak
EOF
```

### Step 2: Start Backend Server
```bash
cd backend

# Install dependencies
pip install fastapi uvicorn boto3 python-jose[cryptography] pydantic

# Start server
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Step 3: Verify Backend
```bash
# Health check
curl http://localhost:8001/api/health

# Should return:
# {"status":"healthy","version":"6.0.0","service":"VirtualHEMS Professional API","aws_configured":true}

# Check data endpoints
curl http://localhost:8001/api/hems-bases
curl http://localhost:8001/api/hospitals
curl http://localhost:8001/api/helicopters
```

### Step 4: Start Frontend
```bash
# In new terminal
npm install
npm run dev
```

### Step 5: Test Login
1. Go to http://localhost:5173
2. Click "Login"
3. Create new account (old Supabase accounts won't work)
4. Login with new account

## Data Migration (CRITICAL)

### Option A: Export & Import (Recommended if you have data)

#### 1. Export from Supabase
```bash
cd backend

# Install dependencies
pip install supabase python-dotenv

# Set your Supabase credentials
export SUPABASE_URL="https://orhfcrrydmgxradibbqb.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key-here"

# Run export
python export_supabase_data.py
```

This creates: `supabase_export_YYYYMMDD_HHMMSS.json`

#### 2. Import to DynamoDB
```bash
# Make sure AWS credentials are configured
aws sts get-caller-identity

# Run import
python import_to_dynamodb.py supabase_export_20260210_120000.json
```

### Option B: Fresh Start (If no important data)

```bash
cd backend

# Seed with sample data
python seed_data.py
```

This creates:
- 5 HEMS bases
- 6 hospitals  
- 5 helicopters

## Fix Missing Tables

The current setup is missing these tables:
- user_roles (for admin permissions)
- community_posts
- hospital_scenery
- base_scenery
- incident_reports
- achievements
- mission_radio_logs
- global_dispatch_logs
- content (for legal pages)

### Create Missing Tables Script

Create `backend/create_missing_tables.py`:

```python
import boto3

dynamodb = boto3.client('dynamodb', region_name='us-east-1')

MISSING_TABLES = [
    {
        'TableName': 'VirtualHEMS_UserRoles',
        'KeySchema': [
            {'AttributeName': 'user_id', 'KeyType': 'HASH'},
            {'AttributeName': 'role_id', 'KeyType': 'RANGE'},
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'user_id', 'AttributeType': 'S'},
            {'AttributeName': 'role_id', 'AttributeType': 'S'},
        ],
        'BillingMode': 'PAY_PER_REQUEST'
    },
    {
        'TableName': 'VirtualHEMS_CommunityPosts',
        'KeySchema': [
            {'AttributeName': 'id', 'KeyType': 'HASH'},
        ],
        'AttributeDefinitions': [
            {'AttributeName': 'id', 'AttributeType': 'S'},
            {'AttributeName': 'user_id', 'AttributeType': 'S'},
        ],
        'GlobalSecondaryIndexes': [
            {
                'IndexName': 'user_id-index',
                'KeySchema': [{'AttributeName': 'user_id', 'KeyType': 'HASH'}],
                'Projection': {'ProjectionType': 'ALL'}
            }
        ],
        'BillingMode': 'PAY_PER_REQUEST'
    },
    # Add more tables as needed...
]

for table_config in MISSING_TABLES:
    try:
        dynamodb.create_table(**table_config)
        print(f"✓ Created {table_config['TableName']}")
    except Exception as e:
        print(f"✗ {table_config['TableName']}: {e}")
```

Run: `python backend/create_missing_tables.py`

## Fix Simulator Plugins

### Problem
Plugins try to connect via WebSocket (ports 8787/8788), but backend only has REST API.

### Solution 1: Add WebSocket to Backend (Recommended)

Update `backend/server.py` to add WebSocket support:

```python
from fastapi import WebSocket, WebSocketManager
import asyncio

# Add WebSocket endpoint
@app.websocket("/ws/telemetry")
async def telemetry_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            # Handle telemetry update
            mission_id = data.get('mission_id')
            # Update mission tracking...
            await websocket.send_json({"status": "ok"})
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()
```

### Solution 2: Create Bridge Server

Create `backend/websocket_bridge.py`:

```python
import asyncio
import websockets
import json
import requests

BACKEND_URL = "http://localhost:8001"

async def handle_client(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        
        # Forward to REST API
        if data.get('type') == 'telemetry':
            mission_id = data['data']['missionId']
            requests.put(
                f"{BACKEND_URL}/api/missions/{mission_id}/telemetry",
                json=data['data']
            )

async def main():
    async with websockets.serve(handle_client, "localhost", 8787):
        print("WebSocket bridge running on ws://localhost:8787")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
```

Run: `python backend/websocket_bridge.py`

### Solution 3: Update Plugins to Use REST API

Modify plugins to POST telemetry directly to:
`http://localhost:8001/api/missions/{mission_id}/telemetry`

## Testing Checklist

### Backend Tests
- [ ] `curl http://localhost:8001/api/health` returns 200
- [ ] `curl http://localhost:8001/api/config` returns AWS config
- [ ] `curl http://localhost:8001/api/hems-bases` returns bases
- [ ] `curl http://localhost:8001/api/hospitals` returns hospitals
- [ ] `curl http://localhost:8001/api/helicopters` returns helicopters

### Frontend Tests
- [ ] Homepage loads
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard displays
- [ ] Can see HEMS bases on map
- [ ] Can see hospitals on map
- [ ] Can create mission
- [ ] Mission appears in active missions

### Simulator Tests
- [ ] X-Plane plugin connects
- [ ] MSFS plugin connects
- [ ] Telemetry updates in real-time
- [ ] Mission tracking displays live data

## Long-Term Recommendations

### 1. Migrate to AWS Amplify
- Unified SDK for all AWS services
- GraphQL API with real-time subscriptions
- Offline support with DataStore
- Automatic conflict resolution
- Simpler deployment

### 2. Add Monitoring
- CloudWatch for logs
- X-Ray for tracing
- Alarms for errors

### 3. Add CI/CD
- GitHub Actions for deployment
- Automated testing
- Staging environment

### 4. Improve Security
- API rate limiting
- Input validation
- CORS configuration
- Secrets management (AWS Secrets Manager)

## Need Help?

If you encounter issues:

1. **Backend not starting**: Check Python dependencies, AWS credentials
2. **Frontend not connecting**: Verify VITE_API_URL in .env
3. **Data not displaying**: Check browser console for API errors
4. **Plugins not working**: Verify WebSocket bridge is running
5. **Migration fails**: Check Supabase credentials and AWS permissions

## Files Created

- ✅ `.env` - Environment configuration
- ✅ `MIGRATION_FIX.md` - Initial diagnosis
- ✅ `SCHEMA_MIGRATION_PLAN.md` - Detailed schema comparison
- ✅ `backend/export_supabase_data.py` - Export tool
- ✅ `backend/import_to_dynamodb.py` - Import tool
- ✅ `COMPLETE_FIX_GUIDE.md` - This file
- ✅ Updated `src/integrations/simulator/api.ts` - Fixed API calls

## Next Steps

1. **Immediate**: Start backend and verify it works
2. **Short-term**: Export and migrate Supabase data
3. **Medium-term**: Add WebSocket support for plugins
4. **Long-term**: Consider Amplify migration
