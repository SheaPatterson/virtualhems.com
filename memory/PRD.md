# VirtualHEMS Professional Platform - PRD

## Original Problem Statement
Enhance VirtualHEMS GitHub app to professional standards:
- Migrate from Supabase to AWS services ✓
- Rebuild X-Plane plugin professionally ✓
- Create MSFS SimConnect plugin ✓
- Fix user profile display issues
- Create dedicated desktop apps for Mac/Windows (pending)
- Mobile/iPad support ✓

## Architecture

### Backend (AWS)
- **Auth**: Amazon Cognito (User Pool: us-east-1_1c0V6g4OQ)
- **Database**: DynamoDB (6 tables)
- **Storage**: S3 bucket
- **AI**: AWS Bedrock (Claude 3 Sonnet)
- **API**: FastAPI on port 8001

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- AWS Cognito authentication
- PWA-enabled (installable on iPad/desktop)

### Plugins
- **X-Plane**: FlyWithLua WebSocket bridge (port 8787) - READY
- **MSFS**: SimConnect SDK + WebSocket (port 8788) - READY

## Implemented Features

### Phase 1-4: Backend & Plugins (Feb 10, 2026)
- [x] AWS infrastructure (Cognito, DynamoDB, S3)
- [x] FastAPI backend with AWS integration
- [x] X-Plane Plugin v2.0 with WebSocket
- [x] MSFS SimConnect Plugin v1.0

### Phase 5: Downloads & PWA (Feb 10, 2026)
- [x] Professional Downloads page at /downloads
- [x] X-Plane download: /downloads/HEMS_XPlane_Plugin_v2.zip
- [x] MSFS download: /downloads/HEMS_MSFS_Plugin_v1.zip
- [x] iPad EFB View at /efb
- [x] PWA manifest for home screen installation
- [x] Apple touch icon and meta tags
- [x] Homepage "Download Plugins" button
- [x] yarn.lock regenerated for deployment

## Download Locations
- X-Plane: `/public/downloads/HEMS_XPlane_Plugin_v2.zip`
- MSFS: `/public/downloads/HEMS_MSFS_Plugin_v1.zip`

## PWA Installation
- iPad: Safari → Share → Add to Home Screen
- Desktop: Browser install button or Menu → Install App
- Direct EFB URL: /efb (requires login)

## Note: New Account Required
Migration to AWS Cognito means users must create new accounts - old Supabase data not migrated.

## Backlog

### P0 - Critical
- [x] ~~Fix deployment lockfile error~~ DONE
- [x] ~~Downloads page with clear instructions~~ DONE
- [x] ~~iPad EFB view~~ DONE

### P1 - High Priority  
- [ ] Standalone Windows desktop app (.exe)
- [ ] Standalone macOS desktop app (.dmg)
- [ ] End-to-end mission flow testing

### P2 - Nice to Have
- [ ] Native iOS/Android apps
- [ ] AWS Polly TTS for radio comms
- [ ] Profile name display verification
