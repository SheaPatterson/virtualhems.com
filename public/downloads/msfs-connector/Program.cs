using System.Net.Http.Json;
using System.Runtime.InteropServices;
using Microsoft.FlightSimulator.SimConnect;
using Newtonsoft.Json;

// Internal state
SimConnect? simconnect = null;
const int WM_USER_SIMCONNECT = 0x0402;
const string BridgeUrl = "http://localhost:3001/telemetry";
const int UpdateFrequencySeconds = 1;

// Data to request
enum DEFINITIONS
{
    AircraftData,
}

[StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
struct AircraftData
{
    [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
    public string title;
    public double latitude;
    public double longitude;
    public double altitude;
    public double heading;
    public double airspeed;
    public double verticalSpeed;
    public double engineRpm;
    public double fuelQuantity;
}

// Program Entry Point
var timer = new System.Threading.Timer(e => SendData(), null, TimeSpan.Zero, TimeSpan.FromSeconds(UpdateFrequencySeconds));
Console.WriteLine("HEMS Dispatch MSFS Connector v2.0.0");

void SendData()
{
    try
    {
        simconnect?.RequestDataOnSimObjectType(DEFINITIONS.AircraftData, DEFINITIONS.AircraftData, 0, SIMCONNECT_SIMOBJECT_TYPE.USER);
    }
    catch (COMException)
    {
        // Handle disconnection
        if (simconnect != null)
        {
            simconnect.Dispose();
            simconnect = null;
            Console.WriteLine("Sim connection lost. Re-trying...");
        }
    }
    
    // Attempt to reconnect if disconnected
    if (simconnect == null)
    {
        InitializeSimConnect();
    }
}

void InitializeSimConnect()
{
    try
    {
        simconnect = new SimConnect("HEMS Dispatch Connector", IntPtr.Zero, WM_USER_SIMCONNECT, null, 0);

        // Set up data definitions
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "TITLE", null, SIMCONNECT_DATATYPE.STRING256, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "PLANE HEADING DEGREES TRUE", "degrees", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "AIRSPEED INDICATED", "knots", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "VERTICAL SPEED", "feet per minute", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "GENERAL ENG RPM:1", "rpm", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
        simconnect.AddToDataDefinition(DEFINITIONS.AircraftData, "FUEL TOTAL QUANTITY", "gallons", SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);

        simconnect.RegisterDataDefineStruct<AircraftData>(DEFINITIONS.AircraftData);

        simconnect.OnRecvSimobjectData += OnDataReceived;
        simconnect.OnRecvException += OnException;

        Console.WriteLine("Successfully connected to MSFS!");

    }
    catch (COMException)
    {
        // This will happen if the sim is not running
    }
}

async void OnDataReceived(SimConnect sender, SIMCONNECT_RECV_SIMOBJECT_DATA data)
{
    if (data.dwData.Length > 0)
    {
        AircraftData acData = (AircraftData)data.dwData[0];
        var telemetry = new {
            latitude = acData.latitude,
            longitude = acData.longitude,
            altitude = acData.altitude,
            heading = acData.heading,
            airspeed = acData.airspeed,
            verticalSpeed = acData.verticalSpeed,
            engineRpm = acData.engineRpm,
            fuelQuantity = acData.fuelQuantity * 6.7, // Convert gallons to lbs (approx)
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
        };

        using var client = new HttpClient();
        try
        {
            var response = await client.PostAsJsonAsync(BridgeUrl, telemetry);
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Telemetry sent successfully.");
            }
            else
            {
                Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Bridge connection error: {response.StatusCode}");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Bridge connection failed: {e.Message}");
        }
    }
}

void OnException(SimConnect sender, SIMCONNECT_RECV_EXCEPTION data)
{
    Console.WriteLine("SimConnect Exception: " + data.dwException);
}

// Keep the application running
new AutoResetEvent(false).WaitOne();
