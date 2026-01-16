--[[
HEMS Dispatch Uplink for X-Plane
Version: 2.0.0
Author: Gemini
Description: This script reads live flight data and aircraft details from X-Plane 
             and sends it to the HEMS Dispatch Bridge application. It also provides 
             an in-simulator status window.

Installation:
1. Ensure you have the "FlyWithLua" plugin installed.
2. Place this file in your X-Plane `Resources/plugins/FlyWithLua/Scripts` folder.
3. The script requires the "goutye/JSON.lua" library. If not present, download it
   and place it in `Resources/plugins/FlyWithLua/Modules`.
--]]

-- Check for JSON library
local json_lib_path = "Modules/JSON.lua"
if not file_exists(json_lib_path) then
    XPLMDebugString("HEMS Dispatch ERROR: JSON.lua library not found! Please install it.\n")
    return
end
json = require("Modules.JSON")

-- CONFIGURATION
local BRIDGE_URL = "http://localhost:3001/telemetry"
local UPDATE_INTERVAL = 1.0  -- seconds

-- DATAREFS
local lat_ref = find_dataref("sim/flightmodel/position/latitude")
local lon_ref = find_dataref("sim/flightmodel/position/longitude")
local alt_ref = find_dataref("sim/flightmodel/position/elevation") -- Altitude above sea level
local heading_ref = find_dataref("sim/flightmodel/position/true_heading")
local airspeed_ref = find_dataref("sim/flightmodel/position/indicated_airspeed_v2")
local vs_ref = find_dataref("sim/flightmodel/position/vh_ind_fpm")
local eng_rpm_ref = find_dataref("sim/flightmodel/engine/ENGN_N1_") -- Array, we'll take the first
local fuel_qty_ref = find_dataref("sim/flightmodel/weight/m_fuel_total")

-- SCRIPT STATE
local last_update_time = 0
local connection_status = "CONNECTING..."
local status_color = {1.0, 1.0, 0.0} -- Yellow

-- HTTP REQUEST SETUP (using built-in cURL)
local function send_telemetry_data(json_payload)
    local command = string.format(
        "curl -s -X POST -H \"Content-Type: application/json\" --max-time 2 -d '%s' %s",
        json_payload,
        BRIDGE_URL
    )

    -- Using os.execute is not ideal but is the most reliable cross-platform method in default FWL
    -- This is a non-blocking call in the context of X-Plane's main loop
    os.execute(command .. " > /dev/null 2>&1 &") -- Unix-like (macOS, Linux)
    -- For Windows, os.execute is tricky. A dedicated co-routine based socket library would be better,
    -- but for simplicity and compatibility, we rely on curl being in the system's PATH.
end


-- MAIN UPDATE LOOP
function flight_loop_callback(since_last_call)
    local elapsed_time = get_sim_time()
    if (elapsed_time - last_update_time) < UPDATE_INTERVAL then
        return
    end
    last_update_time = elapsed_time

    -- 1. Gather data
    local telemetry_data = {
        latitude = get(lat_ref),
        longitude = get(lon_ref),
        altitude = get(alt_ref) * 3.28084, -- m to ft
        heading = get(heading_ref),
        airspeed = get(airspeed_ref),
        verticalSpeed = get(vs_ref),
        engineRpm = get(eng_rpm_ref, 0), -- get first engine RPM
        fuelQuantity = get(fuel_qty_ref) * 2.20462, -- kg to lbs
        timestamp = os.time()
    }

    -- 2. Convert to JSON
    local json_string = json.encode(telemetry_data)

    -- 3. Send data (asynchronously)
    -- This is a simple fire-and-forget. A more robust solution would check the response.
    -- For this version, we will assume success if the bridge is running.
    -- The bridge itself determines the "simConnected" status based on receiving data.
    send_telemetry_data(json_string)
    
    -- We will update status based on a simple heuristic for the UI.
    -- If we are running, we assume it's attempting to send.
    -- The web UI provides the definitive ground truth.
    connection_status = "UPLINK ACTIVE"
    status_color = {0.0, 1.0, 0.5} -- Green
end

-- IN-SIM STATUS UI
function draw_status_window()
    local screen_w, screen_h = get_screen_size()
    local box_w, box_h = 220, 40
    local x = screen_w - box_w - 20
    local y = screen_h - box_h - 60
    
    -- Draw window
    draw_translucent_dark_box(x, y, box_w, box_h)
    
    -- Draw title
    draw_string(x + 10, y + 22, "HEMS Dispatch Bridge", 1, 1, 1)
    
    -- Draw status
    draw_string(x + 10, y + 8, "Status: " .. connection_status, status_color[1], status_color[2], status_color[3])
end

-- Register callbacks
do_on_avionics_power_on("flight_loop_callback(0)")
do_every_draw("draw_status_window()")

XPLMDebugString("HEMS Dispatch Uplink Script v2.0.0 Loaded.\n")
