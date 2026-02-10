using System;
using System.Runtime.InteropServices;
using Microsoft.FlightSimulator.SimConnect;

namespace HEMS_MSFS_Bridge
{
    /// <summary>
    /// SimConnect data structures and definitions
    /// </summary>
    public enum DEFINITIONS
    {
        AircraftData
    }

    public enum REQUESTS
    {
        AircraftData
    }

    public enum EVENTS
    {
        SimStart,
        SimStop,
        Paused,
        Unpaused
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
    public struct AircraftData
    {
        public double Latitude;          // degrees
        public double Longitude;         // degrees
        public double AltitudeFt;        // feet
        public double GroundSpeedKts;    // knots
        public double HeadingDeg;        // degrees true
        public double VerticalSpeedFpm;  // feet per minute
        public double FuelGallons;       // total gallons
        public double EngineN1;          // percent
        public int OnGround;             // boolean
        public int SimPaused;            // boolean
    }

    /// <summary>
    /// Manages SimConnect connection and data retrieval
    /// </summary>
    public class SimConnectManager : IDisposable
    {
        private SimConnect? _simConnect;
        private const int WM_USER_SIMCONNECT = 0x0402;
        private bool _connected = false;
        private IntPtr _hwnd;

        public event Action<AircraftData>? OnDataReceived;
        public event Action<bool>? OnConnectionChanged;
        public event Action<string>? OnError;

        public bool IsConnected => _connected;

        public SimConnectManager(IntPtr hwnd)
        {
            _hwnd = hwnd;
        }

        public void Connect()
        {
            try
            {
                _simConnect = new SimConnect("HEMS_MSFS_Bridge", _hwnd, WM_USER_SIMCONNECT, null, 0);

                // Set up event handlers
                _simConnect.OnRecvOpen += SimConnect_OnRecvOpen;
                _simConnect.OnRecvQuit += SimConnect_OnRecvQuit;
                _simConnect.OnRecvException += SimConnect_OnRecvException;
                _simConnect.OnRecvSimobjectData += SimConnect_OnRecvSimobjectData;

                // Register data definition
                RegisterDataDefinition();

                Console.WriteLine("[SimConnect] Connection initiated...");
            }
            catch (COMException ex)
            {
                OnError?.Invoke($"SimConnect connection failed: {ex.Message}");
                _connected = false;
            }
        }

        private void RegisterDataDefinition()
        {
            if (_simConnect == null) return;

            // Define the data we want to receive
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "GROUND VELOCITY", "knots", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE HEADING DEGREES TRUE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "VERTICAL SPEED", "feet per minute", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "FUEL TOTAL QUANTITY", "gallons", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "ENG N1 RPM:1", "percent", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "SIM ON GROUND", "bool", SIMCONNECT_DATATYPE.INT32, 0.0f, SimConnect.SIMCONNECT_UNUSED);
            _simConnect.AddToDataDefinition(DEFINITIONS.AircraftData, "SIM PAUSED", "bool", SIMCONNECT_DATATYPE.INT32, 0.0f, SimConnect.SIMCONNECT_UNUSED);

            // Register the struct
            _simConnect.RegisterDataDefineStruct<AircraftData>(DEFINITIONS.AircraftData);
        }

        public void RequestData()
        {
            if (_simConnect == null || !_connected) return;

            try
            {
                _simConnect.RequestDataOnSimObject(
                    REQUESTS.AircraftData,
                    DEFINITIONS.AircraftData,
                    SimConnect.SIMCONNECT_OBJECT_ID_USER,
                    SIMCONNECT_PERIOD.SIM_FRAME,
                    SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT,
                    0, 0, 0);
            }
            catch (Exception ex)
            {
                OnError?.Invoke($"Data request failed: {ex.Message}");
            }
        }

        public void ReceiveMessage()
        {
            _simConnect?.ReceiveMessage();
        }

        private void SimConnect_OnRecvOpen(SimConnect sender, SIMCONNECT_RECV_OPEN data)
        {
            Console.WriteLine($"[SimConnect] Connected to MSFS: {data.szApplicationName}");
            _connected = true;
            OnConnectionChanged?.Invoke(true);
            RequestData();
        }

        private void SimConnect_OnRecvQuit(SimConnect sender, SIMCONNECT_RECV data)
        {
            Console.WriteLine("[SimConnect] MSFS closed");
            _connected = false;
            OnConnectionChanged?.Invoke(false);
        }

        private void SimConnect_OnRecvException(SimConnect sender, SIMCONNECT_RECV_EXCEPTION data)
        {
            OnError?.Invoke($"SimConnect exception: {data.dwException}");
        }

        private void SimConnect_OnRecvSimobjectData(SimConnect sender, SIMCONNECT_RECV_SIMOBJECT_DATA data)
        {
            if (data.dwRequestID == (uint)REQUESTS.AircraftData)
            {
                var aircraftData = (AircraftData)data.dwData[0];
                OnDataReceived?.Invoke(aircraftData);
            }
        }

        public void Disconnect()
        {
            if (_simConnect != null)
            {
                _simConnect.Dispose();
                _simConnect = null;
                _connected = false;
                OnConnectionChanged?.Invoke(false);
            }
        }

        public void Dispose()
        {
            Disconnect();
        }
    }
}
