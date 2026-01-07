-- HEMS TACTICAL UPLINK v5.2
-- Requirement: FlyWithLua
-- Location: X-Plane/Resources/plugins/FlyWithLua/Scripts/

local http = require("socket.http")
local ltn12 = require("ltn12")

-- CONFIGURATION
local BRIDGE_URL = "http://localhost:8080/telemetry"
local UPDATE_INTERVAL = 1.0 -- Seconds between packets
local last_run = 0

-- DATAREFS
dataref("alt_msl", "sim/flightmodel/position/elevation")
dataref("gs_ms", "sim/flightmodel/position/groundspeed")
dataref("hdg_true", "sim/flightmodel/position/true_psi")
dataref("lat", "sim/flightmodel/position/latitude")
dataref("lon", "sim/flightmodel/position/longitude")
dataref("fuel_kg", "sim/flightmodel/weight/m_fuel_total")

function send_hems_telemetry()
    local now = os.clock()
    if now - last_run < UPDATE_INTERVAL then return end
    last_run = now

    -- 1. Gather Data (with unit conversions)
    local data = {
        latitude = lat,
        longitude = lon,
        altitudeFt = alt_msl * 3.28084,
        groundSpeedKts = gs_ms * 1.94384,
        headingDeg = hdg_true,
        fuelRemainingLbs = fuel_kg * 2.20462
    }

    -- 2. Construct JSON String
    local json_payload = string.format(
        '{"latitude":%f,"longitude":%f,"altitudeFt":%d,"groundSpeedKts":%d,"headingDeg":%d,"fuelRemainingLbs":%d}',
        data.latitude, data.longitude, data.altitudeFt, data.groundSpeedKts, data.headingDeg, data.fuelRemainingLbs
    )

    -- 3. POST to Local Bridge
    local response_body = {}
    local res, code, response_headers = http.request({
        url = BRIDGE_URL,
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #json_payload
        },
        source = ltn12.source.string(json_payload),
        sink = ltn12.sink.table(response_body)
    })
end

do_often("send_hems_telemetry()")