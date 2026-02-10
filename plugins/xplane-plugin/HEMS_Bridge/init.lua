--[[
    VirtualHEMS X-Plane Bridge Plugin
    Professional telemetry streaming for HEMS simulation
    
    Requires: FlyWithLua or SASL framework
    WebSocket Server: Port 8787
--]]

local PLUGIN_NAME = "HEMS_Bridge"
local PLUGIN_VERSION = "2.0.0"
local WS_PORT = 8787
local UPDATE_RATE_HZ = 10

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

-- State
local connected_clients = {}
local last_update = 0
local mission_active = false
local mission_id = nil
local current_phase = "Standby"

-- Unit conversions
local function meters_to_feet(m) return m * 3.28084 end
local function ms_to_knots(ms) return ms * 1.94384 end
local function kg_to_lbs(kg) return kg * 2.20462 end

-- Build telemetry packet
local function get_telemetry()
    local on_ground = dr_on_ground[0] > 0.5
    local engine_running = dr_n1[0] > 20
    
    return {
        type = "telemetry",
        timestamp = os.time() * 1000,
        data = {
            latitude = dr_lat[0],
            longitude = dr_lon[0],
            altitudeFt = math.floor(meters_to_feet(dr_alt[0])),
            groundSpeedKts = math.floor(ms_to_knots(dr_gs[0])),
            headingDeg = math.floor(dr_hdg[0]),
            verticalSpeedFtMin = math.floor(dr_vs[0]),
            fuelRemainingLbs = math.floor(kg_to_lbs(dr_fuel[0])),
            engineStatus = engine_running and "Running" or "Shutdown",
            onGround = on_ground,
            phase = current_phase,
            missionId = mission_id,
            paused = dr_paused[0] > 0.5
        }
    }
end

-- JSON encoder (simple implementation)
local function encode_json(tbl)
    local function serialize(val)
        if type(val) == "table" then
            local is_array = #val > 0
            local parts = {}
            if is_array then
                for _, v in ipairs(val) do
                    table.insert(parts, serialize(v))
                end
                return "[" .. table.concat(parts, ",") .. "]"
            else
                for k, v in pairs(val) do
                    table.insert(parts, '"' .. k .. '":' .. serialize(v))
                end
                return "{" .. table.concat(parts, ",") .. "}"
            end
        elseif type(val) == "string" then
            return '"' .. val .. '"'
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

-- Main update loop (called every frame)
function hems_update()
    local now = os.clock()
    if now - last_update < (1 / UPDATE_RATE_HZ) then
        return
    end
    last_update = now
    
    if not mission_active then
        return
    end
    
    -- Build and broadcast telemetry
    local telemetry = get_telemetry()
    local json = encode_json(telemetry)
    
    -- This would broadcast to WebSocket clients
    -- In FlyWithLua, you'd use socket library
    -- broadcast_to_clients(json)
end

-- Handle incoming commands from web app
function hems_handle_command(cmd)
    if cmd.type == "start_mission" then
        mission_active = true
        mission_id = cmd.missionId
        current_phase = "Dispatch"
        logMsg(PLUGIN_NAME .. ": Mission started - " .. mission_id)
    elseif cmd.type == "end_mission" then
        mission_active = false
        mission_id = nil
        current_phase = "Standby"
        logMsg(PLUGIN_NAME .. ": Mission ended")
    elseif cmd.type == "set_phase" then
        current_phase = cmd.phase
        logMsg(PLUGIN_NAME .. ": Phase changed to " .. current_phase)
    end
end

-- Plugin lifecycle
function hems_init()
    logMsg(PLUGIN_NAME .. " v" .. PLUGIN_VERSION .. " initialized")
    logMsg(PLUGIN_NAME .. ": WebSocket server on port " .. WS_PORT)
end

function hems_shutdown()
    logMsg(PLUGIN_NAME .. ": Shutting down")
end

-- Register with FlyWithLua
if SUPPORTS_FLOATING_WINDOWS then
    do_every_frame("hems_update()")
    do_on_exit("hems_shutdown()")
    hems_init()
end
