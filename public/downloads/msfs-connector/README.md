# HEMS Dispatch MSFS Connector

This console application connects to a running instance of Microsoft Flight Simulator 2020 using SimConnect, reads aircraft telemetry data, and sends it to the HEMS Dispatch Bridge application.

## Prerequisites

1.  **.NET 6.0 SDK:** You must have the .NET 6.0 SDK installed to build and run this application. You can download it from [the official Microsoft website](https://dotnet.microsoft.com/en-us/download/dotnet/6.0).
2.  **MSFS SimConnect SDK:** The project requires the MSFS SimConnect libraries. The easiest way to get these is to have the MSFS SDK installed. If you have the SDK, the required `Microsoft.FlightSimulator.SimConnect.dll` will be automatically found if it's in a standard location.

## How to Run

1.  **Open a Terminal or Command Prompt:** Navigate to the `msfs-connector` directory where this `README.md` file is located.

2.  **Build the Application:** Run the following command. This will download the necessary packages (like `Newtonsoft.Json`) and compile the code.

    ```bash
    dotnet build
    ```

3.  **Run the Connector:** Once the build is successful, you can run the application with this command:

    ```bash
    dotnet run
    ```

4.  **Start Flying:** Launch Microsoft Flight Simulator. The console window will show "Successfully connected to MSFS!" once it establishes a connection. It will then start sending telemetry data every second. You must keep this console window open while you fly.

## How it Works

*   The application uses a timer to periodically request aircraft data from SimConnect.
*   When data is received, it is formatted into a JSON payload.
*   An HTTP POST request is sent to the HEMS Dispatch Bridge at `http://localhost:3001/telemetry`.
*   The console window provides real-time status updates on the connection to both the simulator and the bridge.
