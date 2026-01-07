// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

/**
 * HEMS DISPATCH AGENT v2 - SYSTEM INSTRUCTIONS:
 * 1. Role: Experienced HEMS dispatcher with deep knowledge of Western PA airspace.
 * 2. Tone: Professional, clear, concise, safety-focused. Use standard aviation phraseology.
 * 3. Context: Be aware of the mission phase. Provide relevant, phase-specific information.
 * 4. Proactive: Offer relevant data (weather, traffic) without being explicitly asked if contextually appropriate.
 */

function generateTacticalResponse(mission: any, msg: string): string {
    const input = msg.toUpperCase();
    const callsign = mission?.callsign || "HEMS UNIT";
    const phase = mission?.tracking?.phase || "Dispatch";
    const dest = mission?.destination?.name?.toUpperCase() || "THE FACILITY";
    const pickup = mission?.pickup?.name?.toUpperCase() || "THE SCENE";

    // 1. EMERGENCY PROTOCOLS (Highest Priority)
    if (input.includes("MAYDAY") || input.includes("EMERGENCY") || input.includes("ENGINE FAILURE") || input.includes("FIRE")) {
        return `[ALERT] ${callsign}, DISPATCH COPIES MAYDAY. ALL STATIONS STANDBY. ADVISE POSITION, SOULS ON BOARD, AND NATURE OF EMERGENCY. EMERGENCY SERVICES IN THE SECTOR NOTIFIED.`;
    }

    // 2. LZ RECON & FACILITY DATA
    if (input.includes("LZ") || input.includes("BRIEFING") || input.includes("RECON")) {
        if (phase.includes("Pickup")) {
            return `${callsign}, GROUND EMS REPORTS SCENE LZ IS CLEAR. WINDS CALM. WATCH FOR POWER LINES ON THE WESTERN APPROACH NEAR THE INTERSECTION.`;
        }
        return `${callsign}, ${dest} REPORTS PAD IS SECURE. BE ADVISED OF ROOFTOP TURBULENCE REPORTED BY PREVIOUS INBOUND UNIT.`;
    }

    // 3. Standard Requests (Weather, Fuel, Nav)
    if (input.includes("WEATHER") || input.includes("METAR")) {
        return `${callsign}, REGIONAL METAR FOR SECTOR 4 INDICATES VFR CONDITIONS. CEILING UNLIMITED. ADVISE IF YOU REQUIRE LOCAL ALTIMETER SETTING.`;
    }
    if (input.includes("FUEL") || input.includes("ENDURANCE")) {
        const fuel = mission?.tracking?.fuelRemainingLbs || 0;
        return `${callsign}, DISPATCH SHOWS ${fuel} LBS REMAINING. ENSURE 20-MINUTE RESERVE FOR RE-ROUTE TO SECONDARY TRAUMA HUB IF REQUIRED.`;
    }

    // 4. Phase-Specific Tactical Logic
    switch (phase) {
        case 'Dispatch':
            if (input.includes("LIFTING") || input.includes("DEPARTING")) {
                return `ROGER ${callsign}. CLOCK IS RUNNING. CLEARED DIRECT TO ${pickup}. SQUAWK 4200. REPORT ESTABLISHED ENROUTE.`;
            }
            return `${callsign}, MISSION DATA UPLINKED. ADVISE WHEN READY FOR LIFT.`;

        case 'Enroute Pickup':
            if (input.includes("ON SCENE") || input.includes("LANDED")) {
                return `COPY ${callsign}. MARKS YOU ON THE DECK AT ${pickup}. ADVISE IF HOT LOAD OR COLD LOAD IS ANTICIPATED.`;
            }
            return `${callsign}, DISPATCH COPIES. CONTINUE TO ${pickup}. MONITOR GROUND FREQ 123.025 FOR SCENE COORDINATION.`;

        case 'At Scene/Transfer':
            if (input.includes("LIFTING") || input.includes("PATIENT ON BOARD")) {
                return `ROGER ${callsign}, PATIENT SECURED. CLEARED DIRECT TO ${dest}. REPORT 5 MILES OUT FROM FACILITY.`;
            }
            return `${callsign}, DISPATCH STANDING BY FOR DEPARTURE CALL.`;

        case 'Enroute Dropoff':
            if (input.includes("ON FINAL") || input.includes("APPROACHING")) {
                return `COPY ${callsign}. ${dest} TRAUMA TEAM IS BRIEFED AND STANDING BY ON THE PAD.`;
            }
            return `${callsign}, DISPATCH COPIES. EXPEDITE AS REQUIRED. WEATHER REMAINS VFR.`;

        case 'At Hospital':
            if (input.includes("HANDOFF COMPLETE") || input.includes("RETURNING")) {
                return `ROGER ${callsign}. MISSION LOGGED AS CLINICALLY COMPLETE. YOU ARE CLEARED TO RETURN TO BASE.`;
            }
            return `${callsign}, DISPATCH STANDING BY FOR SECURE DEPARTURE FROM ${dest}.`;

        case 'Returning to Base':
            if (input.includes("ON THE GROUND") || input.includes("SHUTTING DOWN")) {
                return `COPY ${callsign}. WELCOME HOME. DISPATCH LOGGING SORTIE AS COMPLETE. SECURE ALL TELEMETRY.`;
            }
            return `${callsign}, DISPATCH COPIES. REPORT SECURE AT BASE.`;
    }

    return `DISPATCH COPIES, ${callsign}. STANDING BY ON THIS FREQUENCY.`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    const pluginApiKey = req.headers.get('x-api-key');

    if (authHeader) {
        const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) userId = user.id;
    } else if (pluginApiKey) {
        const { data: mapping } = await supabaseAdmin
            .from('user_api_keys')
            .select('user_id')
            .eq('api_key', pluginApiKey)
            .single();
        if (mapping) userId = mapping.user_id;
    }

    if (!userId) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const { mission_id, crew_message } = await req.json();

    const { data: mission } = await supabaseAdmin
        .from('missions')
        .select('*')
        .eq('mission_id', mission_id)
        .single();

    const responseText = generateTacticalResponse(mission, crew_message);

    // Persistence
    await supabaseAdmin.from('mission_radio_logs').insert([
        { mission_id, sender: 'Crew', message: crew_message, user_id: userId, callsign: mission?.callsign || 'UNIT' },
        { mission_id, sender: 'Dispatcher', message: responseText, user_id: userId, callsign: 'DISPATCH' }
    ]);

    return new Response(JSON.stringify({ response_text: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});