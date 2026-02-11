--[[
    VirtualHEMS X-Plane Bridge Plugin v3.0
    Professional HEMS simulation with integrated UI
    
    Requires: FlyWithLua NG
    Features:
    - Interactive mission selection UI
    - Real-time telemetry display
    - Direct API connection (no bridge needed)
    - Phase management
    - Fuel/time tracking
--]]

local PLUGIN_NAME = "HEMS Bridge"
local PLUGIN_VERSION = "3.0.0"
local API_URL = "http://localhost:8001"
local UPDATE_RATE_HZ = 2  -- 2 updates per second

-- UI State
local show_window = false
local window_x = 100
local window_y = 600
local window_width = 400
local window_height = 500

-- Mission State
local missions = {}
local selected_mission = nil
local active_mission = nil
local current_phase = "Standby"
local last_update = 0
local connection_status = "Disconnected"
local last_telemetry_time = 0

-- DataRef handles
local dr_lat = dataref_table("sim/flightmodel/position/latitude")
local dr_lon = dataref_table("sim/flightmodel/position/longitude")
local dr_alt = dataref_table("sim/flightmodel/position/elevation")
local dr_gs = dataref_table("sim/flightmodel/position/groundspeed")
local dr_hdg = dataref_table("sim/flightmodel/position/true_psi")
local dr_vs = dataref_table("sim/flightmodel/position/vh_ind_fpm")
local dr_fuel = dataref_table("sim/flightmodel/weight/m_fuel_total")
local dr_n1 = dataref_table("sim/flightmodel2/engines/n1_percent")
local dr_on_ground = dataref_table("sim/flightmodel/failures/onground_any")
local dr_paused = dataref_table("sim/time/paused")

-- Unit conversions
local function meters_to_feet(m) return m * 3.28084 end
local function ms_to_knots(ms) return ms * 1.94384 end
local function kg_to_lbs(kg) return kg * 2.20462 end

-- HTTP Request helper (using LuaSocket if available)
local http_available = false
local http, https, ltn12
pcall(function()
    http = require("socket.http")
    https = require("ssl.https")
    ltn12 = require("ltn12")
    http_available = true
end)

local function http_get(url)
    if not http_available then
        return nil, "HTTP library not available"
    end
    
    local response_body = {}
    local res, code, headers = http.request{
        url = url,
        method = "GET",
        sink = ltn12.sink.table(response_body)
    }
    
    if code == 200 then
        return table.concat(response_body), nil
    else
        return nil, "HTTP " .. tostring(code)
    end
end

local function http_put(url, data)
    if not http_available then
        return nil, "HTTP library not available"
    end
    
    local response_body = {}
    local res, code, headers = http.request{
        url = url,
        method = "PUT",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = tostring(#data)
        },
        source = ltn12.source.string(data),
        sink = ltn12.sink.table(response_body)
    }
    
    if code == 200 then
        return table.concat(response_body), nil
    else
        return nil, "HTTP " .. tostring(code)
    end
end

-- Simple JSON encoder
local function encode_json(tbl)
    local function serialize(val)
        if type(val) == "table" then
            local parts = {}
            for k, v in pairs(val) do
                if type(k) == "number" then
                    table.insert(parts, serialize(v))
                else
                    table.insert(parts, '"' .. k .. '":' .. serialize(v))
                end
            end
            return "{" .. table.concat(parts, ",") .. "}"
        elseif type(val) == "string" then
            return '"' .. val:gsub('"', '\\"') .. '"'
        elseif type(val) == "boolean" then
            return val and "true" or "false"
        elseif type(val) == "nil" then
            return "null"
        else
            return tostring(val)
        end
    end
    return serialize(tbl)
end

-- Simple JSON decoder (basic implementation)
local function decode_json(str)
    -- This is a very basic implementation
    -- In production, use a proper JSON library
    local obj = {}
    -- Parse basic JSON structure
    -- For now, just return empty table
    return obj
end

-- Fetch active missions from API
local function fetch_missions()
    local url = API_URL .. "/api/missions/active"
    local response, err = http_get(url)
    
    if response then
        connection_status = "Connected"
        -- Parse JSON response
        -- For now, just log success
        logMsg(PLUGIN_NAME .. ": Fetched missions")
        -- TODO: Parse actual mission data
    else
        connection_status = "Error: " .. (err or "Unknown")
        logMsg(PLUGIN_NAME .. ": Failed to fetch missions - " .. (err or "unknown"))
    end
end

-- Send telemetry to API
local function send_telemetry()
    if not active_mission then return end
    
    local on_ground = dr_on_ground[0] > 0.5
    local engine_running = dr_n1[0] > 20
    
    local telemetry = {
        mission_id = active_mission.mission_id,
        latitude = dr_lat[0],
        longitude = dr_lon[0],
        altitude_ft = math.floor(meters_to_feet(dr_alt[0])),
        ground_speed_kts = math.floor(ms_to_knots(dr_gs[0])),
        heading_deg = math.floor(dr_hdg[0]),
        vertical_speed_ftmin = math.floor(dr_vs[0]),
        fuel_remaining_lbs = math.floor(kg_to_lbs(dr_fuel[0])),
        time_enroute_minutes = (os.time() - last_telemetry_time) / 60,
        phase = current_phase,
        engine_status = engine_running and "Running" or "Shutdown"
    }
    
    local url = API_URL .. "/api/missions/" .. active_mission.mission_id .. "/telemetry"
    local json_data = encode_json(telemetry)
    
    local response, err = http_put(url, json_data)
    if response then
        logMsg(PLUGIN_NAME .. ": Telemetry sent")
    else
        logMsg(PLUGIN_NAME .. ": Failed to send telemetry - " .. (err or "unknown"))
    end
end

-- Draw the UI window
local function draw_window()
    if not show_window then return end
    
    -- Window background
    XPLMSetGraphicsState(0, 0, 0, 1, 1, 0, 0)
    graphics.set_color(0, 0, 0, 0.8)
    graphics.draw_rectangle(window_x, window_y, window_x + window_width, window_y - window_height)
    
    -- Title bar
    graphics.set_color(0.2, 0.4, 0.8, 1)
    graphics.draw_rectangle(window_x, window_y, window_x + window_width, window_y - 30)
    
    -- Title text
    graphics.set_color(1, 1, 1, 1)
    draw_string(window_x + 10, window_y - 20, PLUGIN_NAME .. " v" .. PLUGIN_VERSION, "white")
    
    -- Connection status
    local status_color = connection_status == "Connected" and "green" or "red"
    draw_string(window_x + 10, window_y - 50, "Status: " .. connection_status, status_color)
    
    -- Active mission info
    if active_mission then
        draw_string(window_x + 10, window_y - 80, "Mission: " .. active_mission.callsign, "white")
        draw_string(window_x + 10, window_y - 100, "Phase: " .. current_phase, "yellow")
        draw_string(window_x + 10, window_y - 120, "Altitude: " .. math.floor(meters_to_feet(dr_alt[0])) .. " ft", "white")
        draw_string(window_x + 10, window_y - 140, "Speed: " .. math.floor(ms_to_knots(dr_gs[0])) .. " kts", "white")
        draw_string(window_x + 10, window_y - 160, "Fuel: " .. math.floor(kg_to_lbs(dr_fuel[0])) .. " lbs", "white")
        
        -- Phase buttons
        local phases = {"Dispatch", "Enroute", "On Scene", "Transport", "Landing", "Complete"}
        local button_y = window_y - 200
        for i, phase in ipairs(phases) do
            local button_x = window_x + 10 + ((i-1) % 2) * 190
            if i > 2 then button_y = window_y - 230 end
            if i > 4 then button_y = window_y - 260 end
            
            -- Button background
            if phase == current_phase then
                graphics.set_color(0.2, 0.6, 0.2, 1)
            else
                graphics.set_color(0.3, 0.3, 0.3, 1)
            end
            graphics.draw_rectangle(button_x, button_y, button_x + 180, button_y - 25)
            
            -- Button text
            graphics.set_color(1, 1, 1, 1)
            draw_string(button_x + 10, button_y - 18, phase, "white")
        end
        
        -- End mission button
        graphics.set_color(0.8, 0.2, 0.2, 1)
        graphics.draw_rectangle(window_x + 10, window_y - 300, window_x + 190, window_y - 330)
        draw_string(window_x + 20, window_y - 320, "End Mission", "white")
        
    else
        -- Mission selection
        draw_string(window_x + 10, window_y - 80, "No active mission", "white")
        draw_string(window_x + 10, window_y - 100, "Click 'Refresh' to load missions", "gray")
        
        -- Refresh button
        graphics.set_color(0.2, 0.4, 0.8, 1)
        graphics.draw_rectangle(window_x + 10, window_y - 130, window_x + 190, window_y - 160)
        draw_string(window_x + 20, window_y - 150, "Refresh Missions", "white")
        
        -- TODO: List available missions
    end
    
    -- Close button
    graphics.set_color(0.8, 0.2, 0.2, 1)
    graphics.draw_rectangle(window_x + window_width - 30, window_y, window_x + window_width, window_y - 30)
    draw_string(window_x + window_width - 20, window_y - 20, "X", "white")
end

-- Handle mouse clicks
local function handle_click(x, y)
    if not show_window then return end
    
    -- Check if click is within window
    if x < window_x or x > window_x + window_width or y > window_y or y < window_y - window_height then
        return
    end
    
    -- Close button
    if x > window_x + window_width - 30 and y > window_y - 30 then
        show_window = false
        return
    end
    
    -- Refresh button (when no active mission)
    if not active_mission and x > window_x + 10 and x < window_x + 190 and y < window_y - 130 and y > window_y - 160 then
        fetch_missions()
        return
    end
    
    -- End mission button
    if active_mission and x > window_x + 10 and x < window_x + 190 and y < window_y - 300 and y > window_y - 330 then
        active_mission = nil
        current_phase = "Standby"
        logMsg(PLUGIN_NAME .. ": Mission ended")
        return
    end
    
    -- Phase buttons
    if active_mission then
        local phases = {"Dispatch", "Enroute", "On Scene", "Transport", "Landing", "Complete"}
        local button_y = window_y - 200
        for i, phase in ipairs(phases) do
            local button_x = window_x + 10 + ((i-1) % 2) * 190
            if i > 2 then button_y = window_y - 230 end
            if i > 4 then button_y = window_y - 260 end
            
            if x > button_x and x < button_x + 180 and y < button_y and y > button_y - 25 then
                current_phase = phase
                logMsg(PLUGIN_NAME .. ": Phase changed to " .. phase)
                return
            end
        end
    end
end

-- Main update loop
function hems_update()
    local now = os.clock()
    
    -- Update telemetry
    if active_mission and (now - last_update) >= (1 / UPDATE_RATE_HZ) then
        send_telemetry()
        last_update = now
    end
    
    -- Draw UI
    if show_window then
        draw_window()
    end
end

-- Toggle window visibility
function toggle_hems_window()
    show_window = not show_window
    if show_window then
        fetch_missions()
    end
end

-- Create menu item
add_macro("HEMS Bridge: Toggle Window", "toggle_hems_window()", "toggle_hems_window()", "deactivate")

-- Initialize
function hems_init()
    logMsg(PLUGIN_NAME .. " v" .. PLUGIN_VERSION .. " initialized")
    logMsg(PLUGIN_NAME .. ": API URL: " .. API_URL)
    
    if not http_available then
        logMsg(PLUGIN_NAME .. ": WARNING - LuaSocket not available, HTTP features disabled")
        logMsg(PLUGIN_NAME .. ": Install LuaSocket to enable API connectivity")
    end
    
    -- Test API connection
    fetch_missions()
end

-- Shutdown
function hems_shutdown()
    logMsg(PLUGIN_NAME .. ": Shutting down")
end

-- Register with FlyWithLua
if SUPPORTS_FLOATING_WINDOWS then
    do_every_draw("hems_update()")
    do_on_exit("hems_shutdown()")
    hems_init()
else
    logMsg(PLUGIN_NAME .. ": ERROR - FlyWithLua NG required")
end
