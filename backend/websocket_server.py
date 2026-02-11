"""
WebSocket Server for Simulator Plugins
Bridges WebSocket connections to REST API
"""
import asyncio
import json
import websockets
import requests
from datetime import datetime
from typing import Set

# Configuration
WS_HOST = "0.0.0.0"
WS_PORT_XPLANE = 8787
WS_PORT_MSFS = 8788
API_URL = "http://localhost:8001"

# Connected clients
xplane_clients: Set[websockets.WebSocketServerProtocol] = set()
msfs_clients: Set[websockets.WebSocketServerProtocol] = set()

async def handle_xplane_client(websocket):
    """Handle X-Plane plugin connections"""
    xplane_clients.add(websocket)
    print(f"[X-Plane] Client connected from {websocket.remote_address}")
    
    try:
        # Send welcome message
        await websocket.send(json.dumps({
            "type": "status",
            "status": "connected",
            "simulator": "xplane",
            "version": "2.0.0"
        }))
        
        async for message in websocket:
            try:
                data = json.loads(message)
                await process_message(data, "xplane")
            except json.JSONDecodeError:
                print(f"[X-Plane] Invalid JSON: {message}")
            except Exception as e:
                print(f"[X-Plane] Error processing message: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        print("[X-Plane] Client disconnected")
    finally:
        xplane_clients.remove(websocket)

async def handle_msfs_client(websocket):
    """Handle MSFS plugin connections"""
    msfs_clients.add(websocket)
    print(f"[MSFS] Client connected from {websocket.remote_address}")
    
    try:
        # Send welcome message
        await websocket.send(json.dumps({
            "type": "status",
            "status": "connected",
            "simulator": "msfs",
            "version": "1.0.0"
        }))
        
        async for message in websocket:
            try:
                data = json.loads(message)
                await process_message(data, "msfs")
            except json.JSONDecodeError:
                print(f"[MSFS] Invalid JSON: {message}")
            except Exception as e:
                print(f"[MSFS] Error processing message: {e}")
                
    except websockets.exceptions.ConnectionClosed:
        print("[MSFS] Client disconnected")
    finally:
        msfs_clients.remove(websocket)

async def process_message(data: dict, simulator: str):
    """Process messages from simulator plugins"""
    msg_type = data.get('type')
    
    if msg_type == 'ping':
        # Respond to ping
        return
    
    elif msg_type == 'telemetry':
        # Forward telemetry to REST API
        telemetry_data = data.get('data', {})
        mission_id = telemetry_data.get('missionId')
        
        if mission_id:
            try:
                # Convert to API format
                payload = {
                    'mission_id': mission_id,
                    'latitude': telemetry_data.get('latitude', 0),
                    'longitude': telemetry_data.get('longitude', 0),
                    'altitude_ft': telemetry_data.get('altitudeFt', 0),
                    'ground_speed_kts': telemetry_data.get('groundSpeedKts', 0),
                    'heading_deg': telemetry_data.get('headingDeg', 0),
                    'vertical_speed_ftmin': telemetry_data.get('verticalSpeedFtMin', 0),
                    'fuel_remaining_lbs': telemetry_data.get('fuelRemainingLbs', 0),
                    'time_enroute_minutes': telemetry_data.get('timeEnrouteMinutes', 0),
                    'phase': telemetry_data.get('phase', 'Dispatch'),
                    'engine_status': telemetry_data.get('engineStatus', 'Running')
                }
                
                # Send to REST API (non-blocking)
                asyncio.create_task(send_telemetry_to_api(mission_id, payload))
                
                print(f"[{simulator.upper()}] Telemetry for {mission_id}: {telemetry_data.get('phase')} @ {telemetry_data.get('latitude'):.4f}, {telemetry_data.get('longitude'):.4f}")
                
            except Exception as e:
                print(f"[{simulator.upper()}] Error forwarding telemetry: {e}")

async def send_telemetry_to_api(mission_id: str, payload: dict):
    """Send telemetry to REST API (async)"""
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: requests.put(
                f"{API_URL}/api/missions/{mission_id}/telemetry",
                json=payload,
                timeout=2
            )
        )
    except Exception as e:
        print(f"[API] Error sending telemetry: {e}")

async def broadcast_to_clients(message: dict, simulator: str = "all"):
    """Broadcast message to connected clients"""
    msg_json = json.dumps(message)
    
    if simulator in ["xplane", "all"]:
        for client in xplane_clients.copy():
            try:
                await client.send(msg_json)
            except:
                xplane_clients.discard(client)
    
    if simulator in ["msfs", "all"]:
        for client in msfs_clients.copy():
            try:
                await client.send(msg_json)
            except:
                msfs_clients.discard(client)

async def start_xplane_server():
    """Start X-Plane WebSocket server"""
    async with websockets.serve(handle_xplane_client, WS_HOST, WS_PORT_XPLANE):
        print(f"[X-Plane] WebSocket server running on ws://{WS_HOST}:{WS_PORT_XPLANE}")
        await asyncio.Future()  # run forever

async def start_msfs_server():
    """Start MSFS WebSocket server"""
    async with websockets.serve(handle_msfs_client, WS_HOST, WS_PORT_MSFS):
        print(f"[MSFS] WebSocket server running on ws://{WS_HOST}:{WS_PORT_MSFS}")
        await asyncio.Future()  # run forever

async def main():
    """Start both WebSocket servers"""
    print("="*60)
    print("VirtualHEMS WebSocket Bridge")
    print("="*60)
    print(f"X-Plane Port: {WS_PORT_XPLANE}")
    print(f"MSFS Port: {WS_PORT_MSFS}")
    print(f"API URL: {API_URL}")
    print("="*60)
    print()
    
    # Run both servers concurrently
    await asyncio.gather(
        start_xplane_server(),
        start_msfs_server()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nShutting down...")
