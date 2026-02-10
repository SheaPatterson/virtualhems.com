# VirtualHEMS MSFS SimConnect Plugin

Professional-grade telemetry bridge for Microsoft Flight Simulator 2020/2024.

## Features

- Native SimConnect SDK integration
- Real-time telemetry streaming (10Hz)
- WebSocket server on port 8788
- System tray application
- Auto-detect MSFS
- Automatic reconnection

## Requirements

- Windows 10/11 (64-bit)
- Microsoft Flight Simulator 2020 or 2024
- .NET 6.0 Runtime

## Installation

1. Download and extract the ZIP file
2. Run `HEMS_MSFS_Bridge.exe`
3. App appears in system tray (orange helicopter icon)
4. Launch MSFS - connection is automatic
5. Start a mission in VirtualHEMS web app

## Architecture

```
┌─────────────────┐     SimConnect      ┌─────────────────┐
│      MSFS       │◄───────────────────►│  HEMS Bridge    │
│   (Simulator)   │                     │  (System Tray)  │
└─────────────────┘                     └────────┬────────┘
                                                 │ WebSocket
                                                 │ Port 8788
                                                 ▼
                                        ┌─────────────────┐
                                        │  HEMS Web App   │
                                        │  (React/Vite)   │
                                        └─────────────────┘
```

## SimConnect Variables

| Variable | Description |
|----------|-------------|
| PLANE LATITUDE | Aircraft latitude |
| PLANE LONGITUDE | Aircraft longitude |
| PLANE ALTITUDE | Altitude MSL (feet) |
| GROUND VELOCITY | Ground speed (knots) |
| PLANE HEADING DEGREES TRUE | True heading |
| VERTICAL SPEED | Vertical speed (ft/min) |
| FUEL TOTAL QUANTITY | Total fuel (gallons) |
| ENG N1 RPM:1 | Engine N1 % |

## Troubleshooting

- **Bridge not connecting**: Ensure MSFS is running and no firewall blocks port 8788
- **No telemetry**: Check that you're in a flight (not menu/loading)
- **High CPU**: Lower update rate in settings (right-click tray icon)
