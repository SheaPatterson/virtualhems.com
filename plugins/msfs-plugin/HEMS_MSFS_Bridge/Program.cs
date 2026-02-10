using System;
using System.Drawing;
using System.Windows.Forms;
using System.Threading;
using Newtonsoft.Json;

namespace HEMS_MSFS_Bridge
{
    /// <summary>
    /// Main application entry point and system tray management
    /// </summary>
    public class Program : Form
    {
        private NotifyIcon? _trayIcon;
        private ContextMenuStrip? _trayMenu;
        private SimConnectManager? _simConnect;
        private WebSocketBridge? _webSocket;
        private System.Windows.Forms.Timer? _reconnectTimer;
        private System.Windows.Forms.Timer? _dataTimer;

        private string? _currentMissionId;
        private string _currentPhase = "Standby";
        private bool _missionActive = false;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new Program());
        }

        public Program()
        {
            // Hide the form window
            this.WindowState = FormWindowState.Minimized;
            this.ShowInTaskbar = false;
            this.FormBorderStyle = FormBorderStyle.None;
            this.Opacity = 0;

            InitializeTrayIcon();
            InitializeSimConnect();
            InitializeWebSocket();
            InitializeTimers();
        }

        private void InitializeTrayIcon()
        {
            _trayMenu = new ContextMenuStrip();
            _trayMenu.Items.Add("HEMS MSFS Bridge v1.0").Enabled = false;
            _trayMenu.Items.Add(new ToolStripSeparator());
            _trayMenu.Items.Add("SimConnect: Disconnected").Enabled = false;
            _trayMenu.Items.Add("Clients: 0").Enabled = false;
            _trayMenu.Items.Add(new ToolStripSeparator());
            _trayMenu.Items.Add("Reconnect to MSFS", null, OnReconnect);
            _trayMenu.Items.Add("Exit", null, OnExit);

            _trayIcon = new NotifyIcon()
            {
                Icon = SystemIcons.Application, // Would use custom icon in production
                ContextMenuStrip = _trayMenu,
                Text = "HEMS MSFS Bridge",
                Visible = true
            };

            _trayIcon.DoubleClick += (s, e) => ShowStatus();
        }

        private void InitializeSimConnect()
        {
            _simConnect = new SimConnectManager(this.Handle);
            _simConnect.OnConnectionChanged += (connected) =>
            {
                UpdateTrayStatus();
                if (connected)
                {
                    _trayIcon?.ShowBalloonTip(2000, "HEMS Bridge", "Connected to MSFS!", ToolTipIcon.Info);
                }
            };
            _simConnect.OnDataReceived += OnTelemetryReceived;
            _simConnect.OnError += (msg) => Console.WriteLine($"[Error] {msg}");
        }

        private void InitializeWebSocket()
        {
            _webSocket = new WebSocketBridge();
            _webSocket.OnLog += (msg) => Console.WriteLine($"[WS] {msg}");
            _webSocket.OnCommandReceived += OnCommand;
            _webSocket.Start();
        }

        private void InitializeTimers()
        {
            // Reconnect timer - try to connect to MSFS every 5 seconds
            _reconnectTimer = new System.Windows.Forms.Timer();
            _reconnectTimer.Interval = 5000;
            _reconnectTimer.Tick += (s, e) =>
            {
                if (_simConnect != null && !_simConnect.IsConnected)
                {
                    _simConnect.Connect();
                }
            };
            _reconnectTimer.Start();

            // Data timer - process SimConnect messages
            _dataTimer = new System.Windows.Forms.Timer();
            _dataTimer.Interval = 100; // 10Hz
            _dataTimer.Tick += (s, e) => _simConnect?.ReceiveMessage();
            _dataTimer.Start();

            // Initial connection attempt
            _simConnect?.Connect();
        }

        private void OnTelemetryReceived(AircraftData data)
        {
            if (_missionActive)
            {
                _webSocket?.BroadcastTelemetry(data, _currentMissionId, _currentPhase);
            }
        }

        private void OnCommand(string json)
        {
            try
            {
                var cmd = JsonConvert.DeserializeObject<dynamic>(json);
                if (cmd == null) return;

                string type = cmd.type?.ToString() ?? "";

                switch (type)
                {
                    case "start_mission":
                        _missionActive = true;
                        _currentMissionId = cmd.missionId?.ToString();
                        _currentPhase = "Dispatch";
                        Console.WriteLine($"[Mission] Started: {_currentMissionId}");
                        break;

                    case "end_mission":
                        _missionActive = false;
                        _currentMissionId = null;
                        _currentPhase = "Standby";
                        Console.WriteLine("[Mission] Ended");
                        break;

                    case "set_phase":
                        _currentPhase = cmd.phase?.ToString() ?? "Standby";
                        Console.WriteLine($"[Mission] Phase: {_currentPhase}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Command handling: {ex.Message}");
            }
        }

        private void UpdateTrayStatus()
        {
            if (_trayMenu == null) return;

            var simStatus = _simConnect?.IsConnected == true ? "Connected" : "Disconnected";
            var clientCount = _webSocket?.ClientCount ?? 0;

            _trayMenu.Items[2].Text = $"SimConnect: {simStatus}";
            _trayMenu.Items[3].Text = $"Clients: {clientCount}";
        }

        private void ShowStatus()
        {
            var simStatus = _simConnect?.IsConnected == true ? "Connected" : "Disconnected";
            var clientCount = _webSocket?.ClientCount ?? 0;
            MessageBox.Show(
                $"SimConnect: {simStatus}\nWebSocket Clients: {clientCount}\nMission Active: {_missionActive}\nPhase: {_currentPhase}",
                "HEMS MSFS Bridge Status",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information
            );
        }

        private void OnReconnect(object? sender, EventArgs e)
        {
            _simConnect?.Disconnect();
            _simConnect?.Connect();
        }

        private void OnExit(object? sender, EventArgs e)
        {
            _reconnectTimer?.Stop();
            _dataTimer?.Stop();
            _simConnect?.Dispose();
            _webSocket?.Dispose();
            _trayIcon?.Dispose();
            Application.Exit();
        }

        protected override void WndProc(ref Message m)
        {
            // Handle SimConnect messages
            if (m.Msg == 0x0402) // WM_USER_SIMCONNECT
            {
                _simConnect?.ReceiveMessage();
            }
            base.WndProc(ref m);
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (e.CloseReason == CloseReason.UserClosing)
            {
                e.Cancel = true;
                this.Hide();
            }
            else
            {
                _trayIcon?.Dispose();
            }
        }
    }
}
