using System;
using System.Collections.Generic;
using System.Text;
using Fleck;
using Newtonsoft.Json;

namespace HEMS_MSFS_Bridge
{
    /// <summary>
    /// WebSocket server for communicating with HEMS web app
    /// </summary>
    public class WebSocketBridge : IDisposable
    {
        private WebSocketServer? _server;
        private readonly List<IWebSocketConnection> _clients = new();
        private readonly object _lock = new();
        private const int PORT = 8788;

        public event Action<string>? OnCommandReceived;
        public event Action<string>? OnLog;

        public int ClientCount => _clients.Count;

        public void Start()
        {
            try
            {
                _server = new WebSocketServer($"ws://0.0.0.0:{PORT}");
                _server.Start(socket =>
                {
                    socket.OnOpen = () =>
                    {
                        lock (_lock)
                        {
                            _clients.Add(socket);
                        }
                        OnLog?.Invoke($"Client connected from {socket.ConnectionInfo.ClientIpAddress}");
                        SendStatus(socket, "connected");
                    };

                    socket.OnClose = () =>
                    {
                        lock (_lock)
                        {
                            _clients.Remove(socket);
                        }
                        OnLog?.Invoke("Client disconnected");
                    };

                    socket.OnMessage = message =>
                    {
                        HandleMessage(message);
                    };

                    socket.OnError = ex =>
                    {
                        OnLog?.Invoke($"WebSocket error: {ex.Message}");
                    };
                });

                OnLog?.Invoke($"WebSocket server started on port {PORT}");
            }
            catch (Exception ex)
            {
                OnLog?.Invoke($"Failed to start WebSocket server: {ex.Message}");
            }
        }

        private void HandleMessage(string message)
        {
            try
            {
                var json = JsonConvert.DeserializeObject<dynamic>(message);
                if (json == null) return;

                string type = json.type?.ToString() ?? "";

                switch (type)
                {
                    case "ping":
                        Broadcast(JsonConvert.SerializeObject(new { type = "pong", timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() }));
                        break;
                    case "start_mission":
                    case "end_mission":
                    case "set_phase":
                        OnCommandReceived?.Invoke(message);
                        break;
                    default:
                        OnLog?.Invoke($"Unknown message type: {type}");
                        break;
                }
            }
            catch (Exception ex)
            {
                OnLog?.Invoke($"Error handling message: {ex.Message}");
            }
        }

        public void BroadcastTelemetry(AircraftData data, string? missionId, string phase)
        {
            var telemetry = new
            {
                type = "telemetry",
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                data = new
                {
                    latitude = data.Latitude,
                    longitude = data.Longitude,
                    altitudeFt = (int)data.AltitudeFt,
                    groundSpeedKts = (int)data.GroundSpeedKts,
                    headingDeg = (int)data.HeadingDeg,
                    verticalSpeedFtMin = (int)data.VerticalSpeedFpm,
                    fuelRemainingLbs = (int)(data.FuelGallons * 6.0), // Convert gallons to lbs (avg 6 lbs/gal for Jet-A)
                    engineStatus = data.EngineN1 > 20 ? "Running" : "Shutdown",
                    onGround = data.OnGround == 1,
                    paused = data.SimPaused == 1,
                    missionId = missionId,
                    phase = phase
                }
            };

            Broadcast(JsonConvert.SerializeObject(telemetry));
        }

        private void SendStatus(IWebSocketConnection socket, string status)
        {
            var msg = JsonConvert.SerializeObject(new
            {
                type = "status",
                status = status,
                simulator = "msfs",
                version = "1.0.0"
            });
            socket.Send(msg);
        }

        public void Broadcast(string message)
        {
            lock (_lock)
            {
                foreach (var client in _clients)
                {
                    try
                    {
                        client.Send(message);
                    }
                    catch { /* Ignore send errors */ }
                }
            }
        }

        public void Stop()
        {
            lock (_lock)
            {
                foreach (var client in _clients)
                {
                    try { client.Close(); } catch { }
                }
                _clients.Clear();
            }
            _server?.Dispose();
            _server = null;
        }

        public void Dispose()
        {
            Stop();
        }
    }
}
