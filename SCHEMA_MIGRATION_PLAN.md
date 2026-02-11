# Supabase to DynamoDB Schema Migration Plan

## Problem
The agent created NEW DynamoDB tables with a different schema instead of:
1. Migrating existing Supabase data
2. Maintaining schema compatibility with the frontend code

## Original Supabase Tables (from code analysis)

### Core Tables
1. **profiles** - User profiles
   - id (uuid, primary key)
   - first_name, last_name
   - avatar_url
   - email
   - location, bio, simulators, experience
   - social_links (jsonb)
   - api_key
   - is_admin (boolean)
   - is_subscribed (boolean)
   - created_at, updated_at

2. **missions** - Flight missions
   - id (uuid, primary key)
   - mission_id (text, unique identifier like "HEMS-ABC123")
   - user_id (uuid, foreign key to profiles)
   - callsign
   - mission_type
   - hems_base (jsonb)
   - helicopter (jsonb)
   - crew (jsonb array)
   - origin, pickup, destination (jsonb)
   - patient_age, patient_gender, patient_weight_lbs
   - patient_details, medical_response
   - waypoints (jsonb array)
   - live_data (jsonb)
   - tracking (jsonb) - contains telemetry data
   - status (text: 'active', 'completed', 'cancelled')
   - performance_score (numeric)
   - created_at, updated_at

3. **hems_bases** - HEMS base locations
   - id (uuid, primary key)
   - name
   - location
   - faa_identifier
   - latitude, longitude (numeric)
   - contact
   - helicopter_id (uuid, foreign key)
   - created_at

4. **hospitals** - Hospital directory
   - id (uuid, primary key)
   - name
   - city
   - faa_identifier
   - latitude, longitude (numeric)
   - is_trauma_center (boolean)
   - trauma_level (integer)
   - created_at

5. **helicopters** - Aircraft fleet
   - id (uuid, primary key)
   - model
   - registration
   - fuel_capacity_lbs (numeric)
   - cruise_speed_kts (numeric)
   - fuel_burn_rate_lb_hr (numeric)
   - maintenance_status (text: 'FMC', 'AOG')
   - image_url
   - created_at

### Additional Tables
6. **user_roles** - Role-based access control
   - user_id (uuid)
   - role_id (text: 'admin', 'user')

7. **community_posts** - Community forum
   - id (uuid)
   - title, content
   - user_id (uuid)
   - created_at

8. **hospital_scenery** - Hospital scenery packages
   - id (uuid)
   - hospital_id (uuid)
   - image_urls (text array)
   - description
   - created_at

9. **base_scenery** - Base scenery packages
   - id (uuid)
   - base_id (uuid)
   - image_urls (text array)
   - description
   - created_at

10. **incident_reports** - Safety reports
    - id (uuid)
    - status, resolution
    - created_at

11. **achievements** - User achievements
    - id (uuid)
    - user_id (uuid)
    - type
    - created_at

12. **mission_radio_logs** - Mission communications
    - id (uuid)
    - mission_id (text)
    - sender, message, callsign
    - timestamp

13. **global_dispatch_logs** - Global dispatch logs
    - id (uuid)
    - sender, message
    - timestamp

14. **content** - Dynamic content (legal, docs)
    - id (uuid)
    - slug (unique)
    - title, body
    - updated_at

15. **logs** - System logs
    - Various fields for logging

## Current DynamoDB Tables (WRONG)

The agent created only 6 tables:
1. VirtualHEMS_Missions
2. VirtualHEMS_Telemetry (separate from missions - WRONG)
3. VirtualHEMS_Users (should be "profiles")
4. VirtualHEMS_HemsBases
5. VirtualHEMS_Hospitals
6. VirtualHEMS_Helicopters

**Missing tables**: user_roles, community_posts, hospital_scenery, base_scenery, incident_reports, achievements, radio logs, content, logs

## Schema Incompatibilities

### Field Name Mismatches
| Supabase (snake_case) | DynamoDB (camelCase) | Frontend Expects |
|----------------------|---------------------|------------------|
| first_name | first_name | first_name |
| last_name | last_name | last_name |
| faa_identifier | faaIdentifier | faa_identifier |
| fuel_capacity_lbs | fuelCapacityLbs | fuel_capacity_lbs |
| cruise_speed_kts | cruiseSpeedKts | cruise_speed_kts |
| is_trauma_center | isTraumaCenter | is_trauma_center |
| trauma_level | traumaLevel | trauma_level |
| maintenance_status | maintenanceStatus | maintenance_status |

### Structural Issues
1. **Telemetry**: Supabase stores in `missions.tracking` (jsonb), DynamoDB has separate table
2. **User ID**: Supabase uses Cognito `sub` as profile ID, DynamoDB uses separate user_id
3. **Timestamps**: Supabase uses `created_at`, DynamoDB uses `createdAt`

## Migration Strategy

### Option 1: Export from Supabase → Import to DynamoDB (RECOMMENDED)
1. Export all data from Supabase using their API
2. Transform schema to match DynamoDB structure
3. Import into DynamoDB tables
4. Update frontend to use consistent field names

### Option 2: Keep Supabase, Add AWS Services
1. Keep Supabase for database
2. Use AWS Cognito for auth only
3. Use AWS Bedrock for AI features
4. Minimal migration needed

### Option 3: Migrate to AWS Amplify (BEST LONG-TERM)
1. Use Amplify DataStore with GraphQL
2. Define schema once, auto-generate API
3. Built-in real-time sync
4. Offline support
5. Automatic conflict resolution

## Immediate Action Required

### Step 1: Export Supabase Data
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Export data
supabase db dump --data-only > supabase_data.sql
```

### Step 2: Create Migration Script
Need a Python script to:
1. Connect to Supabase
2. Fetch all data from each table
3. Transform field names (snake_case → match frontend expectations)
4. Insert into DynamoDB with correct schema

### Step 3: Update DynamoDB Schema
Add missing tables and fix field names to match Supabase

### Step 4: Update Backend API
Ensure FastAPI endpoints return data in the format frontend expects

## Questions for You

1. **Do you have Supabase credentials?** (Project URL, API keys)
2. **How much data exists?** (number of users, missions, etc.)
3. **Preference**: 
   - Migrate everything to DynamoDB?
   - Keep Supabase and just add AWS auth?
   - Migrate to AWS Amplify (cleanest but most work)?
4. **Downtime acceptable?** Can we take the app offline during migration?

## Next Steps

Once you provide:
- Supabase project URL
- Supabase service role key (for data export)
- Your preference (Option 1, 2, or 3)

I can create:
1. Data export script
2. Schema transformation script
3. DynamoDB import script
4. Updated backend API to match schema
5. Frontend updates if needed
