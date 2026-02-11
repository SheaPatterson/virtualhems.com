# VirtualHEMS Migration Fix Guide

## Issues Identified

### 1. Data Not Displaying
**Root Cause**: The frontend is still using old Supabase API endpoints in `src/integrations/simulator/api.ts`

**Evidence**:
- Line 7: `const BASE_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1"`
- The simulator API is calling Supabase Edge Functions instead of the new AWS FastAPI backend
- Frontend uses AWS Cognito for auth but Supabase for data fetching (mismatch)

### 2. Simulator Plugins Not Working
**Root Cause**: Plugins are configured to connect to WebSocket servers (ports 8787/8788) but:
- No WebSocket server is running
- The backend uses REST API, not WebSocket
- Plugins need to be updated to use the new AWS backend API

### 3. Missing Environment Configuration
**Root Cause**: No `.env` file existed to configure `VITE_API_URL`
- Frontend couldn't find the backend API endpoint
- Defaulted to empty string, causing all API calls to fail

## Solutions

### Step 1: Start the Backend Server

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Verify AWS credentials are configured
aws sts get-caller-identity

# Seed the database (if not already done)
python seed_data.py

# Start the FastAPI server
python server.py
```

The server should start on `http://localhost:8001`

### Step 2: Update Frontend Environment

Created `.env` file with:
```
VITE_API_URL=http://localhost:8001
```

### Step 3: Fix Simulator API Integration

The file `src/integrations/simulator/api.ts` needs to be completely rewritten to use the AWS backend instead of Supabase.

**Current (WRONG)**: Uses Supabase Edge Functions
**Should be**: Uses AWS FastAPI endpoints from `src/integrations/aws/api.ts`

### Step 4: Update Simulator Plugins

The plugins need to:
1. Connect to the web app via WebSocket OR
2. Use REST API to send telemetry updates

**Option A (Recommended)**: Create a WebSocket bridge in the frontend
**Option B**: Update plugins to use REST API directly

## Quick Fix Commands

```bash
# 1. Create .env file (already done)
echo "VITE_API_URL=http://localhost:8001" > .env

# 2. Start backend
cd backend
python server.py &

# 3. Start frontend
npm run dev

# 4. Test the connection
curl http://localhost:8001/api/health
```

## Testing Checklist

- [ ] Backend health check returns 200: `curl http://localhost:8001/api/health`
- [ ] Frontend can fetch config: `curl http://localhost:8001/api/config`
- [ ] Login works and returns JWT tokens
- [ ] HEMS bases display: `curl http://localhost:8001/api/hems-bases`
- [ ] Hospitals display: `curl http://localhost:8001/api/hospitals`
- [ ] Helicopters display: `curl http://localhost:8001/api/helicopters`
- [ ] Can create a mission (requires auth token)
- [ ] Simulator plugin can connect (after WebSocket bridge is added)

## Next Steps

1. **Immediate**: Fix `src/integrations/simulator/api.ts` to use AWS backend
2. **Short-term**: Add WebSocket support to backend for real-time telemetry
3. **Long-term**: Consider migrating to AWS Amplify for unified SDK

## Why Not Amplify?

The previous agent used:
- **Cognito** for authentication ✓
- **DynamoDB** for database ✓
- **S3** for storage ✓
- **Bedrock** for AI ✓
- **FastAPI** for backend API

**Amplify would provide**:
- Unified JavaScript SDK for all AWS services
- Automatic API generation from GraphQL schema
- Built-in real-time subscriptions (WebSocket)
- Simplified deployment and hosting

**Migration to Amplify would require**:
1. Install `@aws-amplify/cli` and initialize project
2. Configure Amplify to use existing Cognito/DynamoDB
3. Replace custom FastAPI with Amplify GraphQL API
4. Update frontend to use Amplify SDK instead of custom API client
5. Add Amplify DataStore for offline support

This is a significant refactor but would solve the WebSocket issue and provide better real-time capabilities.
