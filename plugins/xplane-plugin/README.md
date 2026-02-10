# VirtualHEMS X-Plane Plugin

Professional-grade telemetry bridge for X-Plane 11/12.

## Installation

1. Copy the `HEMS_Bridge` folder to your X-Plane `Resources/plugins/` directory
2. Launch X-Plane
3. The plugin auto-starts a WebSocket server on port 8787

## Features

- Real-time telemetry streaming (10Hz)
- Bidirectional communication
- Mission phase tracking
- Automatic reconnection
- Compatible with FlyWithLua

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│   X-Plane 12    │◄──────────────────►│  HEMS Web App   │
│   (Lua Plugin)  │     Port 8787      │  (React/Vite)   │
└─────────────────┘                    └─────────────────┘
```

## DataRefs Used

| DataRef | Description |
|---------|-------------|
| sim/flightmodel/position/latitude | Aircraft latitude |
| sim/flightmodel/position/longitude | Aircraft longitude |
| sim/flightmodel/position/elevation | Altitude MSL (meters) |
| sim/flightmodel/position/groundspeed | Ground speed (m/s) |
| sim/flightmodel/position/true_psi | True heading (degrees) |
| sim/flightmodel/position/vh_ind_fpm | Vertical speed (ft/min) |
| sim/flightmodel/weight/m_fuel_total | Total fuel (kg) |
