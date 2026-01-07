-- HEMS TACTICAL UPLINK v5.2
-- Place this in X-Plane 12/Resources/plugins/FlyWithLua/Scripts/

local bridge_url = "http://localhost:8080/telemetry" -- Default Bridge Port
local last_update = 0
local update_rate = 2.0 -- 2Hz update for stability

-- DataRefs to monitor
local dr_lat = dataref_table("sim/flightmodel/position/latitude")
local dr_lon = dataref_table("sim/flightmodel/position/longitude")
local dr_alt = dataref_table("sim/flightmodel/position/elevation")
local dr_spd = dataref_table("sim/flightmodel/position/groundspeed")
local dr_hdg = dataref_table("sim/flightmodel/position/true_psi")
local dr_fuel = dataref_table("sim/flightmodel/weight/m_fuel_total")

function send_hems_telemetry()
    local now = os.clock()
    if now - last_update < update_rate then return end
    last_update = now

    -- Construct JSON payload
    local data = string.format(
        '{"latitude":%f,"longitude":%f,"altitudeFt":%d,"groundSpeedKts":%d,"headingDeg":%d,"fuelRemainingLbs":%d}',
        dr_lat[0], 
        dr_lon[0], 
        dr_alt[0] * 3.28084, 
        dr_spd[0] * 1.94384, 
        dr_hdg[0], 
        dr_fuel[0] * 2.20462
    )

    -- Non-blocking POST (requires FlyWithLua socket support)
    -- If local bridge is not running, this fails silently
    pcall(function()
        http.post(bridge_url, data)
    end)
end

do_often("send_hems_telemetry()")