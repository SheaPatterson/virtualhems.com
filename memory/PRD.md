# VirtualHEMS Professional Platform - PRD

## Original Problem Statement
Enhance VirtualHEMS GitHub app to professional standards:
- Migrate from Supabase to AWS services
- Rebuild X-Plane plugin professionally
- Create MSFS SimConnect plugin (pending)
- Fix user profile display issues
- Prepare for professional training center use

## Architecture

### Backend (AWS)
- **Auth**: Amazon Cognito (User Pool: us-east-1_1c0V6g4OQ)
- **Database**: DynamoDB (6 tables: Users, Missions, Telemetry, HemsBases, Hospitals, Helicopters)
- **Storage**: S3 (virtualhems-assets-223759445135)
- **AI**: AWS Bedrock (Claude 3 Sonnet for dispatch)
- **API**: FastAPI on port 8001

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- AWS Cognito authentication
- WebSocket plugin communication

### Plugins
- **X-Plane**: FlyWithLua WebSocket bridge (port 8787)
- **MSFS**: SimConnect SDK (pending implementation)

## What's Been Implemented (Feb 10, 2026)

### Phase 1: AWS Backend
- [x] Cognito User Pool + Identity Pool
- [x] DynamoDB tables with initial data
- [x] S3 bucket with CORS
- [x] FastAPI backend with AWS integration
- [x] Health check and config endpoints

### Phase 2: Frontend Migration
- [x] AuthGuard using Cognito
- [x] Login/Register with email verification
- [x] Profile management hooks
- [x] Global polyfill fix for Cognito SDK

### Phase 3: X-Plane Plugin
- [x] FlyWithLua Lua script
- [x] WebSocket-based client (XPlanePlugin.ts)
- [x] React hook (useXPlanePlugin)
- [x] Downloadable plugin package

## Backlog (P0/P1/P2)

### P0 - Critical
- [ ] MSFS SimConnect plugin
- [ ] User profile name display fix verification
- [ ] End-to-end mission flow testing

### P1 - High Priority
- [ ] Standalone native apps (replace Electron)
- [ ] iPad/mobile responsive optimization
- [ ] Real-time telemetry WebSocket relay

### P2 - Nice to Have
- [ ] AWS Polly TTS for radio comms
- [ ] CloudFront CDN for assets
- [ ] Professional installer packages (.msi/.pkg)

## User Personas
1. **Training Center Operator**: Needs reliable, professional-grade integration
2. **Sim Enthusiast**: Wants immersive HEMS simulation experience
3. **Flight Instructor**: Uses for student training scenarios

## Next Tasks
1. MSFS SimConnect plugin development
2. Profile display verification
3. Mission creation/tracking end-to-end test
4. Mobile/iPad UI optimization
