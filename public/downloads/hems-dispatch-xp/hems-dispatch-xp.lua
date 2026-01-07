-- HEMS TACTICAL DATA LINK v5.2 (STABLE / NON-BLOCKING)
-- Location: Resources/plugins/FlyWithLua/Scripts/hems-dispatch-xp.lua

local socket = require("socket")
-- Safety check for SSL library
local ssl_available, ssl = pcall(require, "ssl")
local has_ssl_wrap = ssl_available and type(ssl) == "table" and type(ssl.wrap) == "function"

-- ==========================================================
-- USER CONFIGURATION - PASTE YOUR KEY BELOW
-- ==========================================================
local API_KEY = "PASTE_YOUR_KEY_HERE"
local SERVER_HOST = "orhfcrrydmgxradibbqb.supabase.co"
local SERVER_PORT = 443 
-- ==========================================================

-- Internal State
local connection_state = "IDLE" 
local last_update_time = 0
local update_interval = 4 
local tcp_socket = nil
local ssl_socket = nil
local response_buffer = ""

-- Tactical Mission Data
local current_mission_id = "NONE"
local target_node = "STANDBY"
local mission_phase = "IDLE"
local dist_to_target = "0.0"
local fuel_rem_time = "0"
local pt_vitals = "NONE"

-- DataRef Handles
local dr_lat = XPLMFindDataRef("sim/flightmodel/position/latitude")
local dr_lon = XPLMFindDataRef("sim/flightmodel/position/longitude")
local dr_alt = XPLMFindDataRef("sim/flightmodel/position/elevation") 
local dr_gs  = XPLMFindDataRef("sim/flightmodel/position/groundspeed") 
local dr_hdg = XPLMFindDataRef("sim/flightmodel/position/true_psi")
local dr_fuel = XPLMFindDataRef("sim/flightmodel/weight/m_fuel_total") 

function log_hems(msg)
    logMsg("[HEMS OPS] " .. msg)
end

function cleanup_socket()
    if ssl_socket then pcall(function() ssl_socket:close() end) end
    if tcp_socket then pcall(function() tcp_socket:close() end) end
    tcp_socket = nil
    ssl_socket = nil
    connection_state = "IDLE"
end

function draw_hems_status()
    -- Coordinates (Bottom Left)
    local x = 20
    local y = 150
    local width = 240
    local height = 130
    
    -- Draw Background Box (Semi-transparent Black)
    XPLMSetGraphicsState(0,0,0,0,1,1,0)
    glColor4f(0, 0, 0, 0.7)
    glRectf(x - 5, y - height, x + width, y + 5)
    
    -- Text color variables
    local yellow = {1, 1, 0}
    local white = {1, 1, 1}
    local cyan = {0, 1, 1}
    local red = {1, 0, 0}
    local green = {0, 1, 0}
    local magenta = {1, 0, 1}

    -- Header
    draw_string(x, y - 15, ">>> HEMS TACTICAL LINK v5.2", 1, 1, 0)
    
    -- Error State: Missing SSL
    if not has_ssl_wrap then
        draw_string(x, y - 50, "CRITICAL: SSL LIB MISSING", 1, 0, 0)
        draw_string(x, y - 70, "Visit: [App URL]/documentation", 1, 1, 1)
        draw_string(x, y - 85, "for LuaSec install guide.", 1, 1, 1)
        return
    end

    -- Mission Info
    draw_string(x, y - 35, "MISSION:  " .. current_mission_id, 1, 1, 1)
    
    local target_color = (current_mission_id == "NONE") and white or green
    draw_string(x, y - 50, "TARGET:   " .. string.upper(target_node), target_color[1], target_color[2], target_color[3])
    draw_string(x, y - 65, "PHASE:    " .. string.upper(mission_phase), 0, 1, 1)
    
    -- Tactical Metrics
    draw_string(x, y - 85, "DISTANCE: " .. dist_to_target .. " NM", 1, 1, 1)
    
    local endurance = tonumber(fuel_rem_time) or 0
    local end_color = (endurance > 0 and endurance < 30) and red or white
    draw_string(x, y - 100, "ENDURANCE: " .. fuel_rem_time .. " MIN", end_color[1], end_color[2], end_color[3])
    
    draw_string(x, y - 115, "PATIENT:   " .. pt_vitals, 1, 0, 1)
    
    -- Link Heartbeat
    local pulse = (math.sin(os.clock() * 5) > 0) and "*" or " "
    local lnk_color = (connection_state == "IDLE") and red or green
    draw_string(x + width - 35, y - 15, pulse .. " LNK", lnk_color[1], lnk_color[2], lnk_color[3])
end

function process_telemetry()
    if not has_ssl_wrap then return end
    
    local now = os.clock()

    if connection_state == "IDLE" and (now - last_update_time) > update_interval then
        tcp_socket = socket.tcp()
        tcp_socket:settimeout(0)
        local success, err = tcp_socket:connect(SERVER_HOST, SERVER_PORT)
        if success or err == "timeout" then
            connection_state = "CONNECTING"
            last_update_time = now
        else
            cleanup_socket()
        end
    end

    if connection_state == "CONNECTING" then
        local _, writable = socket.select(nil, {tcp_socket}, 0)
        if #writable > 0 then
            local params = { mode = "client", protocol = "tlsv1_2", verify = "none", options = "all" }
            local ok, res = pcall(ssl.wrap, tcp_socket, params)
            if ok then
                ssl_socket = res
                ssl_socket:settimeout(0)
                local hand_ok, hand_err = ssl_socket:dohandshake()
                if hand_ok then connection_state = "SENDING" end
            else
                cleanup_socket()
            end
        elseif (now - last_update_time) > 2 then cleanup_socket() end
    end

    if connection_state == "SENDING" and ssl_socket then
        local fuel_lbs = XPLMGetDataf(dr_fuel) * 2.20462
        local alt_ft = XPLMGetDataf(dr_alt) * 3.28084
        local gs_kts = XPLMGetDataf(dr_gs) * 1.94384
        local payload = string.format('{"latitude":%f,"longitude":%f,"altitudeFt":%d,"groundSpeedKts":%d,"headingDeg":%d,"fuelRemainingLbs":%d}',
            XPLMGetDatad(dr_lat), XPLMGetDatad(dr_lon), math.floor(alt_ft), math.floor(gs_kts), math.floor(XPLMGetDataf(dr_hdg)), math.floor(fuel_lbs))

        local req = "POST /functions/v1/update-telemetry HTTP/1.1\r\nHost: "..SERVER_HOST.."\r\nx-api-key: "..API_KEY.."\r\nContent-Type: application/json\r\nContent-Length: "..string.len(payload).."\r\nConnection: close\r\n\r\n"..payload
        ssl_socket:send(req)
        connection_state = "RECEIVING"
        response_buffer = ""
    end

    if connection_state == "RECEIVING" and ssl_socket then
        local chunk, err, partial = ssl_socket:receive(1024)
        local data = chunk or partial
        if data then response_buffer = response_buffer .. data end
        if err == "closed" then
            local body_start = response_buffer:find("\r\n\r\n")
            if body_start then
                local b = response_buffer:sub(body_start + 4)
                current_mission_id = b:match("ID:([^|]+)") or current_mission_id
                target_node = b:match("TO:([^|]+)") or target_node
                mission_phase = b:match("PHASE:([^|]+)") or mission_phase
                dist_to_target = b:match("DIST:([^|]+)") or dist_to_target
                fuel_rem_time = b:match("REM:([^|]+)") or fuel_rem_time
                pt_vitals = b:match("PT:([^|]+)") or pt_vitals
            end
            cleanup_socket()
        end
    end
end

-- Registration
if dr_lat then
    do_every_frame("process_telemetry()")
    do_every_draw("draw_hems_status()")
end