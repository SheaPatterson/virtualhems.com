using System;
using System.Drawing;
using System.Windows.Forms;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace HEMS_MSFS_Bridge
{
    /// <summary>
    /// Main UI window for HEMS MSFS Bridge
    /// </summary>
    public class MainWindow : Form
    {
        private const string API_URL = "http://localhost:8001";
        
        // UI Controls
        private Label _statusLabel;
        private Label _simStatusLabel;
        private ListBox _missionListBox;
        private Button _refreshButton;
        private Button _startMissionButton;
        private Button _endMissionButton;
        private GroupBox _telemetryGroup;
        private Label _altitudeLabel;
        private Label _speedLabel;
        private Label _headingLabel;
        private Label _fuelLabel;
        private Label _phaseLabel;
        private ComboBox _phaseComboBox;
        private Button _setPhaseButton;
        private TextBox _logTextBox;
        
        // Services
        private SimConnectManager _simConnect;
        private HttpClient _httpClient;
        
        // State
        private JArray _missions = new JArray();
        private JObject? _activeMission = null;
        private string _currentPhase = "Standby";
        private System.Windows.Forms.Timer _updateTimer;
        private System.Windows.Forms.Timer _telemetryTimer;

        public MainWindow()
        {
            InitializeUI();
            InitializeServices();
        }

        private void InitializeUI()
        {
            // Window properties
            this.Text = "HEMS MSFS Bridge v3.0";
            this.Size = new Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            
            // Status bar
            _statusLabel = new Label
            {
                Location = new Point(10, 10),
                Size = new Size(380, 20),
                Text = "Status: Initializing...",
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };
            this.Controls.Add(_statusLabel);
            
            _simStatusLabel = new Label
            {
                Location = new Point(400, 10),
                Size = new Size(380, 20),
                Text = "SimConnect: Disconnected",
                Font = new Font("Segoe UI", 10),
                ForeColor = Color.Red
            };
            this.Controls.Add(_simStatusLabel);
            
            // Mission list
            var missionLabel = new Label
            {
                Location = new Point(10, 40),
                Size = new Size(200, 20),
                Text = "Available Missions:",
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };
            this.Controls.Add(missionLabel);
            
            _missionListBox = new ListBox
            {
                Location = new Point(10, 65),
                Size = new Size(380, 150),
                Font = new Font("Consolas", 9)
            };
            _missionListBox.SelectedIndexChanged += OnMissionSelected;
            this.Controls.Add(_missionListBox);
            
            _refreshButton = new Button
            {
                Location = new Point(10, 220),
                Size = new Size(120, 30),
                Text = "Refresh Missions",
                Font = new Font("Segoe UI", 9)
            };
            _refreshButton.Click += OnRefreshClick;
            this.Controls.Add(_refreshButton);
            
            _startMissionButton = new Button
            {
                Location = new Point(140, 220),
                Size = new Size(120, 30),
                Text = "Start Mission",
                Font = new Font("Segoe UI", 9),
                Enabled = false
            };
            _startMissionButton.Click += OnStartMissionClick;
            this.Controls.Add(_startMissionButton);
            
            _endMissionButton = new Button
            {
                Location = new Point(270, 220),
                Size = new Size(120, 30),
                Text = "End Mission",
                Font = new Font("Segoe UI", 9),
                Enabled = false,
                BackColor = Color.IndianRed
            };
            _endMissionButton.Click += OnEndMissionClick;
            this.Controls.Add(_endMissionButton);
            
            // Telemetry group
            _telemetryGroup = new GroupBox
            {
                Location = new Point(400, 40),
                Size = new Size(380, 210),
                Text = "Live Telemetry",
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };
            this.Controls.Add(_telemetryGroup);
            
            _altitudeLabel = CreateTelemetryLabel(20, "Altitude: --- ft");
            _speedLabel = CreateTelemetryLabel(45, "Speed: --- kts");
            _headingLabel = CreateTelemetryLabel(70, "Heading: ---°");
            _fuelLabel = CreateTelemetryLabel(95, "Fuel: --- lbs");
            _phaseLabel = CreateTelemetryLabel(120, "Phase: Standby");
            
            _telemetryGroup.Controls.Add(_altitudeLabel);
            _telemetryGroup.Controls.Add(_speedLabel);
            _telemetryGroup.Controls.Add(_headingLabel);
            _telemetryGroup.Controls.Add(_fuelLabel);
            _telemetryGroup.Controls.Add(_phaseLabel);
            
            // Phase control
            var phaseControlLabel = new Label
            {
                Location = new Point(10, 165),
                Size = new Size(100, 20),
                Text = "Change Phase:",
                Font = new Font("Segoe UI", 9)
            };
            _telemetryGroup.Controls.Add(phaseControlLabel);
            
            _phaseComboBox = new ComboBox
            {
                Location = new Point(110, 163),
                Size = new Size(150, 25),
                DropDownStyle = ComboBoxStyle.DropDownList,
                Font = new Font("Segoe UI", 9)
            };
            _phaseComboBox.Items.AddRange(new string[] {
                "Dispatch", "Enroute", "On Scene", "Transport", "Landing", "Complete"
            });
            _phaseComboBox.SelectedIndex = 0;
            _telemetryGroup.Controls.Add(_phaseComboBox);
            
            _setPhaseButton = new Button
            {
                Location = new Point(270, 162),
                Size = new Size(100, 27),
                Text = "Set Phase",
                Font = new Font("Segoe UI", 9),
                Enabled = false
            };
            _setPhaseButton.Click += OnSetPhaseClick;
            _telemetryGroup.Controls.Add(_setPhaseButton);
            
            // Log window
            var logLabel = new Label
            {
                Location = new Point(10, 260),
                Size = new Size(100, 20),
                Text = "Activity Log:",
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };
            this.Controls.Add(logLabel);
            
            _logTextBox = new TextBox
            {
                Location = new Point(10, 285),
                Size = new Size(770, 270),
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true,
                Font = new Font("Consolas", 8),
                BackColor = Color.Black,
                ForeColor = Color.LimeGreen
            };
            this.Controls.Add(_logTextBox);
        }

        private Label CreateTelemetryLabel(int y, string text)
        {
            return new Label
            {
                Location = new Point(10, y),
                Size = new Size(360, 20),
                Text = text,
                Font = new Font("Consolas", 10)
            };
        }

        private void InitializeServices()
        {
            // HTTP Client
            _httpClient = new HttpClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(5);
            
            // SimConnect
            _simConnect = new SimConnectManager(this.Handle);
            _simConnect.OnConnectionChanged += OnSimConnectStatusChanged;
            _simConnect.OnDataReceived += OnTelemetryReceived;
            _simConnect.OnError += (msg) => Log($"[ERROR] {msg}");
            
            // Timers
            _updateTimer = new System.Windows.Forms.Timer();
            _updateTimer.Interval = 100;
            _updateTimer.Tick += (s, e) => _simConnect?.ReceiveMessage();
            _updateTimer.Start();
            
            _telemetryTimer = new System.Windows.Forms.Timer();
            _telemetryTimer.Interval = 500; // 2Hz
            _telemetryTimer.Tick += OnTelemetryTick;
            _telemetryTimer.Start();
            
            // Initial connection
            _simConnect.Connect();
            
            // Load missions
            _ = LoadMissionsAsync();
            
            Log("HEMS MSFS Bridge v3.0 initialized");
            Log($"API URL: {API_URL}");
        }

        private void OnSimConnectStatusChanged(bool connected)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<bool>(OnSimConnectStatusChanged), connected);
                return;
            }
            
            _simStatusLabel.Text = connected ? "SimConnect: Connected" : "SimConnect: Disconnected";
            _simStatusLabel.ForeColor = connected ? Color.Green : Color.Red;
            
            if (connected)
            {
                Log("Connected to MSFS");
            }
            else
            {
                Log("Disconnected from MSFS");
            }
        }

        private void OnTelemetryReceived(AircraftData data)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<AircraftData>(OnTelemetryReceived), data);
                return;
            }
            
            _altitudeLabel.Text = $"Altitude: {data.AltitudeFt:F0} ft";
            _speedLabel.Text = $"Speed: {data.GroundSpeedKts:F0} kts";
            _headingLabel.Text = $"Heading: {data.HeadingDeg:F0}°";
            _fuelLabel.Text = $"Fuel: {(data.FuelGallons * 6.0):F0} lbs";
        }

        private async void OnTelemetryTick(object? sender, EventArgs e)
        {
            if (_activeMission == null || _simConnect == null || !_simConnect.IsConnected)
                return;
            
            // Send telemetry to API
            await SendTelemetryAsync();
        }

        private async Task LoadMissionsAsync()
        {
            try
            {
                _statusLabel.Text = "Status: Loading missions...";
                _statusLabel.ForeColor = Color.Orange;
                
                var response = await _httpClient.GetStringAsync($"{API_URL}/api/missions/active");
                var json = JObject.Parse(response);
                _missions = (JArray)(json["missions"] ?? new JArray());
                
                _missionListBox.Items.Clear();
                foreach (var mission in _missions)
                {
                    var callsign = mission["callsign"]?.ToString() ?? "Unknown";
                    var missionId = mission["mission_id"]?.ToString() ?? "Unknown";
                    _missionListBox.Items.Add($"{callsign} ({missionId})");
                }
                
                _statusLabel.Text = $"Status: {_missions.Count} missions available";
                _statusLabel.ForeColor = Color.Green;
                Log($"Loaded {_missions.Count} active missions");
            }
            catch (Exception ex)
            {
                _statusLabel.Text = "Status: Failed to connect to API";
                _statusLabel.ForeColor = Color.Red;
                Log($"[ERROR] Failed to load missions: {ex.Message}");
            }
        }

        private async Task SendTelemetryAsync()
        {
            if (_activeMission == null) return;
            
            try
            {
                var missionId = _activeMission["mission_id"]?.ToString();
                if (string.IsNullOrEmpty(missionId)) return;
                
                var data = _simConnect.GetCurrentData();
                if (data == null) return;
                
                var telemetry = new
                {
                    mission_id = missionId,
                    latitude = data.Latitude,
                    longitude = data.Longitude,
                    altitude_ft = (int)data.AltitudeFt,
                    ground_speed_kts = (int)data.GroundSpeedKts,
                    heading_deg = (int)data.HeadingDeg,
                    vertical_speed_ftmin = (int)data.VerticalSpeedFpm,
                    fuel_remaining_lbs = (int)(data.FuelGallons * 6.0),
                    time_enroute_minutes = 0, // TODO: Calculate
                    phase = _currentPhase,
                    engine_status = data.EngineN1 > 20 ? "Running" : "Shutdown"
                };
                
                var json = JsonConvert.SerializeObject(telemetry);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                await _httpClient.PutAsync($"{API_URL}/api/missions/{missionId}/telemetry", content);
            }
            catch (Exception ex)
            {
                // Silently fail telemetry updates
                System.Diagnostics.Debug.WriteLine($"Telemetry error: {ex.Message}");
            }
        }

        private void OnRefreshClick(object? sender, EventArgs e)
        {
            _ = LoadMissionsAsync();
        }

        private void OnMissionSelected(object? sender, EventArgs e)
        {
            _startMissionButton.Enabled = _missionListBox.SelectedIndex >= 0;
        }

        private void OnStartMissionClick(object? sender, EventArgs e)
        {
            if (_missionListBox.SelectedIndex < 0) return;
            
            _activeMission = (JObject)_missions[_missionListBox.SelectedIndex];
            var callsign = _activeMission["callsign"]?.ToString() ?? "Unknown";
            
            _currentPhase = "Dispatch";
            _phaseLabel.Text = $"Phase: {_currentPhase}";
            _phaseLabel.ForeColor = Color.Yellow;
            
            _startMissionButton.Enabled = false;
            _endMissionButton.Enabled = true;
            _setPhaseButton.Enabled = true;
            _missionListBox.Enabled = false;
            
            Log($"Mission started: {callsign}");
        }

        private void OnEndMissionClick(object? sender, EventArgs e)
        {
            if (_activeMission == null) return;
            
            var callsign = _activeMission["callsign"]?.ToString() ?? "Unknown";
            
            _activeMission = null;
            _currentPhase = "Standby";
            _phaseLabel.Text = "Phase: Standby";
            _phaseLabel.ForeColor = Color.Gray;
            
            _startMissionButton.Enabled = _missionListBox.SelectedIndex >= 0;
            _endMissionButton.Enabled = false;
            _setPhaseButton.Enabled = false;
            _missionListBox.Enabled = true;
            
            Log($"Mission ended: {callsign}");
        }

        private void OnSetPhaseClick(object? sender, EventArgs e)
        {
            if (_phaseComboBox.SelectedItem == null) return;
            
            _currentPhase = _phaseComboBox.SelectedItem.ToString() ?? "Standby";
            _phaseLabel.Text = $"Phase: {_currentPhase}";
            
            Log($"Phase changed to: {_currentPhase}");
        }

        private void Log(string message)
        {
            if (InvokeRequired)
            {
                Invoke(new Action<string>(Log), message);
                return;
            }
            
            var timestamp = DateTime.Now.ToString("HH:mm:ss");
            _logTextBox.AppendText($"[{timestamp}] {message}\r\n");
            _logTextBox.SelectionStart = _logTextBox.Text.Length;
            _logTextBox.ScrollToCaret();
        }

        protected override void WndProc(ref Message m)
        {
            if (m.Msg == 0x0402) // WM_USER_SIMCONNECT
            {
                _simConnect?.ReceiveMessage();
            }
            base.WndProc(ref m);
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            _updateTimer?.Stop();
            _telemetryTimer?.Stop();
            _simConnect?.Dispose();
            _httpClient?.Dispose();
            base.OnFormClosing(e);
        }
    }
}
