# VirtualHEMS Simulator Plugin Setup Guide v3.0

## 🎮 New Features

### No More Bridge App!
- ✅ Direct API connection from plugins
- ✅ Interactive UI built into simulator
- ✅ Mission selection in-sim
- ✅ Phase management
- ✅ Real-time telemetry display
- ✅ No Electron app needed!

## X-Plane Plugin Setup

### Requirements
- X-Plane 11 or 12
- FlyWithLua NG plugin
- LuaSocket library (for HTTP)

### Installation

#### 1. Install FlyWithLua NG
```bash
# Download from:
https://forums.x-plane.org/index.php?/files/file/38445-flywithlua-ng/

# Extract to:
X-Plane 12/Resources/plugins/FlyWithLua/
```

#### 2. Install LuaSocket (for HTTP connectivity)

**macOS:**
```bash
# Install via Homebrew
brew install luarocks
luarocks install luasocket
```

**Windows:**
```bash
# Download LuaSocket from:
https://github.com/diegonehab/luasocket/releases

# Copy socket.dll and mime.dll to:
X-Plane 12/Resources/plugins/FlyWithLua/Modules/
```

**Linux:**
```bash
sudo apt-get install lua-socket
```

#### 3. Install HEMS Bridge Plugin
```bash
# Copy the plugin file
cp plugins/xplane-plugin/HEMS_Bridge/init.lua \
   "X-Plane 12/Resources/plugins/FlyWithLua/Scripts/"
```

### Usage

1. **Start X-Plane**
   - Plugin loads automatically
   - Check Log.txt for: "HEMS_Bridge v3.0.0 initialized"

2. **Open HEMS Window**
   - Go to: Plugins → FlyWithLua → Macros
   - Click: "HEMS Bridge: Toggle Window"
   - Or assign a keyboard shortcut

3. **Connect to API**
   - Window shows connection status
   - Click "Refresh Missions" to load active missions

4. **Start a Mission**
   - Select mission from list
   - Click "Start Mission"
   - Telemetry begins streaming

5. **Manage Flight Phases**
   - Click phase buttons to update:
     - Dispatch
     - Enroute
     - On Scene
     - Transport
     - Landing
     - Complete

6. **End Mission**
   - Click "End Mission" button
   - Telemetry stops

### UI Layout

```
┌─────────────────────────────────────┐
│ HEMS Bridge v3.0              [X]   │
├─────────────────────────────────────┤
│ Status: Connected                   │
│                                     │
│ Mission: STAT-1 (HEMS-ABC123)      │
│ Phase: Enroute                      │
│ Altitude: 2,500 ft                  │
│ Speed: 120 kts                      │
│ Fuel: 1,200 lbs                     │
│                                     │
│ ┌─────────┐ ┌─────────┐            │
│ │Dispatch │ │ Enroute │            │
│ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐            │
│ │On Scene │ │Transport│            │
│ └─────────┘ └─────────┘            │
│ ┌─────────┐ ┌─────────┐            │
│ │ Landing │ │Complete │            │
│ └─────────┘ └─────────┘            │
│                                     │
│ ┌──────────────┐                   │
│ │ End Mission  │                   │
│ └──────────────┘                   │
└─────────────────────────────────────┘
```

### Configuration

Edit the plugin file to change settings:

```lua
-- At top of init.lua
local API_URL = "http://localhost:8001"  -- Change if API is remote
local UPDATE_RATE_HZ = 2  -- Telemetry updates per second
```

### Troubleshooting

**Window doesn't appear:**
- Check FlyWithLua is installed
- Check Log.txt for errors
- Try restarting X-Plane

**Can't connect to API:**
- Verify backend is running: `curl http://localhost:8001/api/health`
- Check API_URL in plugin
- Check firewall settings

**No missions showing:**
- Create missions in web app first
- Click "Refresh Missions"
- Check backend logs

**LuaSocket not found:**
- Install LuaSocket (see installation steps)
- Restart X-Plane
- Check FlyWithLua/Modules/ folder

---

## MSFS Plugin Setup

### Requirements
- Microsoft Flight Simulator 2020 or 2024
- .NET 6.0 or later
- Visual Studio 2022 (for building)

### Installation

#### 1. Build the Plugin

**Option A: Pre-built (if available)**
```bash
# Download from releases
# Extract HEMS_MSFS_Bridge.exe
```

**Option B: Build from source**
```bash
cd plugins/msfs-plugin/HEMS_MSFS_Bridge

# Restore dependencies
dotnet restore

# Build
dotnet build --configuration Release

# Output will be in:
# bin/Release/net6.0-windows/HEMS_MSFS_Bridge.exe
```

#### 2. Install Dependencies

The plugin needs:
- SimConnect SDK (included with MSFS)
- Fleck (WebSocket library) - auto-installed via NuGet
- Newtonsoft.Json - auto-installed via NuGet

### Usage

1. **Start MSFS**
   - Load any aircraft
   - Get to the main menu or in-flight

2. **Run HEMS Bridge**
   - Double-click `HEMS_MSFS_Bridge.exe`
   - Main window appears

3. **Verify Connection**
   - "SimConnect: Connected" should show green
   - If red, check MSFS is running

4. **Load Missions**
   - Click "Refresh Missions"
   - Available missions appear in list

5. **Start Mission**
   - Select a mission
   - Click "Start Mission"
   - Telemetry begins streaming

6. **Monitor Flight**
   - Live telemetry displays:
     - Altitude
     - Speed
     - Heading
     - Fuel
     - Current phase

7. **Change Phase**
   - Select phase from dropdown
   - Click "Set Phase"

8. **End Mission**
   - Click "End Mission" (red button)
   - Telemetry stops

### UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│ HEMS MSFS Bridge v3.0                                   [_][□][X]│
├──────────────────────────────────────────────────────────────┤
│ Status: Connected          SimConnect: Connected             │
├──────────────────────────────────────────────────────────────┤
│ Available Missions:        │ Live Telemetry                  │
│ ┌────────────────────────┐ │ ┌─────────────────────────────┐│
│ │ STAT-1 (HEMS-ABC123)   │ │ │ Altitude: 2,500 ft          ││
│ │ LIFE-2 (HEMS-DEF456)   │ │ │ Speed: 120 kts              ││
│ │ AIR-3 (HEMS-GHI789)    │ │ │ Heading: 270°               ││
│ │                        │ │ │ Fuel: 1,200 lbs             ││
│ │                        │ │ │ Phase: Enroute              ││
│ │                        │ │ │                             ││
│ └────────────────────────┘ │ │ Change Phase:               ││
│                            │ │ [Enroute ▼] [Set Phase]     ││
│ [Refresh] [Start] [End]    │ └─────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│ Activity Log:                                                │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ [12:34:56] HEMS MSFS Bridge v3.0 initialized            ││
│ │ [12:34:57] API URL: http://localhost:8001               ││
│ │ [12:34:58] Connected to MSFS                            ││
│ │ [12:35:00] Loaded 3 active missions                     ││
│ │ [12:35:15] Mission started: STAT-1                      ││
│ │ [12:35:30] Phase changed to: Enroute                    ││
│ └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Configuration

Edit `appsettings.json` (if exists) or modify source:

```csharp
// In MainWindow.cs
private const string API_URL = "http://localhost:8001";
```

### Troubleshooting

**SimConnect won't connect:**
- Verify MSFS is running
- Check Windows Firewall
- Try running as Administrator
- Reinstall SimConnect SDK

**Can't connect to API:**
- Verify backend is running
- Check API_URL setting
- Test: `curl http://localhost:8001/api/health`

**No missions loading:**
- Create missions in web app
- Click "Refresh Missions"
- Check Activity Log for errors

**Telemetry not updating:**
- Verify mission is started
- Check SimConnect connection
- Look for errors in Activity Log

---

## Testing the Plugins

### 1. Start Backend Services

```bash
cd /Volumes/HUB\ SSD/AWS/virtualhems.com
./start_all.sh
```

This starts:
- Backend API (port 8001)
- WebSocket Bridge (ports 8787, 8788) - not needed for v3.0!
- Frontend (port 8080)

### 2. Create a Test Mission

1. Go to http://localhost:8080
2. Login
3. Go to Mission Planning
4. Create a new mission
5. Note the mission ID

### 3. Test X-Plane Plugin

1. Start X-Plane
2. Load any helicopter
3. Open HEMS Bridge window
4. Click "Refresh Missions"
5. Select your mission
6. Click "Start Mission"
7. Fly around
8. Watch telemetry update in web app

### 4. Test MSFS Plugin

1. Start MSFS
2. Load any helicopter
3. Run HEMS_MSFS_Bridge.exe
4. Click "Refresh Missions"
5. Select your mission
6. Click "Start Mission"
7. Fly around
8. Watch telemetry update in web app

### 5. Verify in Web App

1. Go to Mission Tracking page
2. Select your active mission
3. Watch live telemetry update
4. See aircraft position on map
5. Phase changes reflect in UI

---

## Comparison: Old vs New

### Old System (v2.0)
- ❌ Separate Electron bridge app
- ❌ Complex setup (3 apps running)
- ❌ No in-sim UI
- ❌ WebSocket only
- ❌ Manual mission ID entry

### New System (v3.0)
- ✅ Direct API connection
- ✅ Simple setup (plugin only)
- ✅ Interactive in-sim UI
- ✅ REST API (no WebSocket needed)
- ✅ Mission selection from list
- ✅ Phase management
- ✅ Live telemetry display

---

## Advanced Features

### Custom API URL

For remote servers:

**X-Plane:**
```lua
-- Edit init.lua
local API_URL = "https://your-domain.com"
```

**MSFS:**
```csharp
// Edit MainWindow.cs
private const string API_URL = "https://your-domain.com";
```

### Authentication

If your API requires auth tokens:

**X-Plane:**
```lua
-- Add to http_get/http_put functions
headers = {
    ["Authorization"] = "Bearer YOUR_TOKEN_HERE"
}
```

**MSFS:**
```csharp
// In MainWindow.cs InitializeServices()
_httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_TOKEN");
```

### Telemetry Rate

Adjust update frequency:

**X-Plane:**
```lua
local UPDATE_RATE_HZ = 2  -- 2 updates/second (default)
-- Higher = more data, more CPU
```

**MSFS:**
```csharp
_telemetryTimer.Interval = 500; // milliseconds (default 500ms = 2Hz)
```

---

## Support

### X-Plane Issues
- Check FlyWithLua forums
- Verify LuaSocket installation
- Check X-Plane Log.txt

### MSFS Issues
- Check SimConnect SDK installation
- Run as Administrator
- Check Windows Event Viewer

### API Issues
- Verify backend is running
- Check firewall settings
- Test with curl/Postman

### General Help
- Check Activity/Log windows
- Enable debug logging
- Contact support with logs

---

## Next Steps

1. **Test both plugins**
2. **Customize UI colors/layout** (optional)
3. **Add keyboard shortcuts** (X-Plane)
4. **Deploy to production** (if using remote API)
5. **Add ATC communications** (coming soon)

Enjoy your professional HEMS simulation experience!
