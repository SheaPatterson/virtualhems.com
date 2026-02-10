# VirtualHEMS Professional Platform - PRD

## Original Problem Statement
Enhance VirtualHEMS GitHub app to professional standards:
- Migrate from Supabase to AWS services
- Rebuild X-Plane plugin professionally  
- Create MSFS SimConnect plugin
- Fix user profile display issues
- Prepare for professional training center use
- Create dedicated desktop apps for Mac/Windows
- Mobile/iPad support

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
- **X-Plane**: FlyWithLua WebSocket bridge (port 8787) - READY
- **MSFS**: SimConnect SDK + WebSocket (port 8788) - READY

## What's Been Implemented

### Phase 1: AWS Backend (Feb 10, 2026)
- [x] Cognito User Pool + Identity Pool
- [x] DynamoDB tables with initial data
- [x] S3 bucket with CORS
- [x] FastAPI backend with AWS integration
- [x] Health check and config endpoints

### Phase 2: Frontend Migration (Feb 10, 2026)
- [x] AuthGuard using Cognito
- [x] Login/Register with email verification
- [x] Profile management hooks
- [x] Global polyfill fix for Cognito SDK

### Phase 3: X-Plane Plugin (Feb 10, 2026)
- [x] FlyWithLua Lua script (HEMS_Bridge)
- [x] WebSocket-based client (XPlanePlugin.ts)
- [x] React hook (useXPlanePlugin)
- [x] Downloadable plugin package (.zip)

### Phase 4: MSFS Plugin (Feb 10, 2026)
- [x] C# .NET SimConnect wrapper
- [x] WebSocket bridge (port 8788)
- [x] System tray application
- [x] React hook (useMSFSPlugin)
- [x] Downloadable plugin package (.zip)

### Phase 5: Downloads Page (Feb 10, 2026)
- [x] Professional Downloads page at /downloads
- [x] Tabbed interface (X-Plane / MSFS)
- [x] Clear installation instructions
- [x] Direct download links working
- [x] Sidebar navigation updated

## Backlog (P0/P1/P2)

### P0 - Critical
- [x] ~~MSFS SimConnect plugin~~ DONE
- [x] ~~Downloads page with clear instructions~~ DONE
- [ ] End-to-end mission flow testing with plugins

### P1 - High Priority  
- [ ] Standalone native desktop apps (Windows/Mac)
- [ ] iPad/mobile responsive optimization
- [ ] Real-time telemetry WebSocket relay to cloud

### P2 - Nice to Have
- [ ] Native iOS/Android apps
- [ ] AWS Polly TTS for radio comms
- [ ] CloudFront CDN for assets
- [ ] Professional installer packages (.msi/.pkg)

## User Personas
1. **Training Center Operator**: Professional-grade integration
2. **Sim Enthusiast**: Immersive HEMS simulation
3. **Flight Instructor**: Student training scenarios

## Next Tasks
1. Build standalone Windows desktop app
2. Build standalone macOS desktop app
3. Mobile/iPad responsive optimization
4. End-to-end mission testing
