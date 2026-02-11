# VirtualHEMS Migration & Fix Guide

## 🚨 Critical Issues Found

Your previous AI agent made several mistakes:

1. **Created NEW database tables** instead of migrating your Supabase data
2. **Wrong schema** - DynamoDB tables don't match your Supabase structure
3. **Missing tables** - Only created 6 tables, you need 15+
4. **Frontend still calling Supabase** - API endpoints weren't updated
5. **No WebSocket support** - Simulator plugins can't connect

## ✅ What I Fixed

1. ✅ Created `.env` file with correct API URL
2. ✅ Updated `src/integrations/simulator/api.ts` to use AWS backend
3. ✅ Created migration scripts to export/import your data
4. ✅ Documented all schema differences
5. ✅ Created startup scripts

## 🎯 What You Need to Do

### Step 1: Get Your Supabase Credentials

You need these from your Supabase dashboard:

1. Go to: https://supabase.com/dashboard/project/orhfcrrydmgxradibbqb
2. Settings → API
3. Copy:
   - Project URL: `https://orhfcrrydmgxradibbqb.supabase.co`
   - `service_role` key (NOT the anon key)

### Step 2: Export Your Supabase Data

```bash
# Set your credentials
export SUPABASE_URL="https://orhfcrrydmgxradibbqb.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key-here"

# Install dependencies
cd backend
pip install -r requirements.txt

# Run export
python export_supabase_data.py
```

This creates a JSON file with all your data.

### Step 3: Import to DynamoDB

```bash
# Make sure AWS is configured
aws sts get-caller-identity

# Import the data
python import_to_dynamodb.py supabase_export_YYYYMMDD_HHMMSS.json
```

### Step 4: Start the Backend

```bash
# Easy way
./start_backend.sh

# Or manually
cd backend
python -m uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Step 5: Start the Frontend

```bash
# In a new terminal
npm install
npm run dev
```

### Step 6: Test Everything

Open http://localhost:5173 and:

1. Create a new account (old accounts won't work - different auth system)
2. Login
3. Check if data displays:
   - HEMS bases
   - Hospitals
   - Helicopters
4. Try creating a mission

## 🔧 Troubleshooting

### Backend won't start

```bash
# Check Python version (need 3.8+)
python3 --version

# Check AWS credentials
aws sts get-caller-identity

# Check if port 8001 is in use
lsof -i :8001
```

### Frontend can't connect to backend

```bash
# Verify .env file exists
cat .env

# Should show:
# VITE_API_URL=http://localhost:8001

# Test backend directly
curl http://localhost:8001/api/health
```

### No data displaying

```bash
# Check if tables have data
cd backend
python3 -c "
import boto3
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

tables = ['HemsBases', 'Hospitals', 'Helicopters']
for table_name in tables:
    table = dynamodb.Table(f'VirtualHEMS_{table_name}')
    count = table.scan(Select='COUNT')['Count']
    print(f'{table_name}: {count} items')
"

# If empty, seed with sample data
python seed_data.py
```

### Simulator plugins not working

The plugins need WebSocket support. Two options:

**Option A: Create WebSocket Bridge**
```bash
cd backend
python websocket_bridge.py
```

**Option B: Add WebSocket to Backend**
See `COMPLETE_FIX_GUIDE.md` for code to add to `server.py`

## 📊 Schema Differences

Your Supabase used snake_case (e.g., `first_name`, `faa_identifier`)
The new DynamoDB uses camelCase (e.g., `firstName`, `faaIdentifier`)

The migration scripts handle this conversion automatically.

## 🗂️ Files Created

- `.env` - Environment configuration
- `MIGRATION_FIX.md` - Initial diagnosis
- `SCHEMA_MIGRATION_PLAN.md` - Detailed schema comparison  
- `COMPLETE_FIX_GUIDE.md` - Comprehensive guide
- `backend/export_supabase_data.py` - Export tool
- `backend/import_to_dynamodb.py` - Import tool
- `start_backend.sh` - Easy startup script
- `MIGRATION_README.md` - This file

## 🚀 Quick Commands

```bash
# Export Supabase data
export SUPABASE_SERVICE_KEY="your-key"
cd backend && python export_supabase_data.py

# Import to DynamoDB
python import_to_dynamodb.py supabase_export_*.json

# Start backend
./start_backend.sh

# Start frontend (new terminal)
npm run dev

# Test backend
curl http://localhost:8001/api/health
curl http://localhost:8001/api/hems-bases
```

## ❓ Questions?

Check these files for more details:
- `COMPLETE_FIX_GUIDE.md` - Full troubleshooting guide
- `SCHEMA_MIGRATION_PLAN.md` - Database schema details
- `MIGRATION_FIX.md` - Technical diagnosis

## 🎯 Next Steps After Migration

1. **Test thoroughly** - Create missions, check tracking
2. **Add WebSocket** - For simulator plugins
3. **Create missing tables** - user_roles, community_posts, etc.
4. **Consider Amplify** - Long-term, cleaner solution
5. **Add monitoring** - CloudWatch logs and alarms

## 💡 Important Notes

- **New accounts required** - AWS Cognito is separate from Supabase Auth
- **Data migration is one-way** - Backup Supabase first
- **Plugins need WebSocket** - REST API alone won't work for real-time telemetry
- **Missing tables** - Some features won't work until all tables are created

## 🆘 If You Get Stuck

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify AWS credentials: `aws sts get-caller-identity`
4. Verify backend is running: `curl http://localhost:8001/api/health`
5. Check if data exists in DynamoDB tables

The migration scripts include error handling and will show you exactly what failed.
