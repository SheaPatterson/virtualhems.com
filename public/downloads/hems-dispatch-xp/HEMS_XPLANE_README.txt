# HEMS Dispatch Connector - X-Plane Installation Guide

This script provides a two-way data link between your X-Plane simulator and the HEMS Simulation Operations Center.

## Prerequisites

1.  **FlyWithLua Complete Edition:** Required for HTTPS (LuaSec) and ImGui support.
2.  **Your Unique API Key:** Found on the HEMS Ops Center /user page.

## Installation Steps

1.  **Deployment:** Place the `hems-dispatch-xp.lua` file into your X-Plane installation directory:
    `Resources/plugins/FlyWithLua/Scripts/`

2.  **Configuration:** Open `hems-dispatch-xp.lua` in a text editor. Locate the `HEMS_API_KEY` variable at the top of the file and replace `"YOUR_UNIQUE_API_KEY_HERE"` with your actual API key.

    ```lua
    HEMS_API_KEY = "YOUR_UNIQUE_API_KEY_HERE" 
    ```

3.  **Launch:** Start X-Plane. The script will automatically initialize.

4.  **Operation:** Dispatch a mission using the web Mission Planner. The plugin will automatically detect the active mission and begin sending telemetry updates every 4 seconds.

## Troubleshooting

-   **"UPLINK FAILED" Error:** Check your `HEMS_API_KEY`. Ensure it is copied exactly from the /user page.
-   **No Missions Found:** Ensure you have an active mission dispatched via the web planner and that your user account is correctly authenticated in the web app.