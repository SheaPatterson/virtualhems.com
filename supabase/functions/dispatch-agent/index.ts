// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

/**
 * HEMS TACTICAL AGENT v2.5
 * Identity: Regional Dispatcher (Sector 4)
 * Persona: Professional, clipped, safety-oriented. Uses military-standard alphabet and flight jargon.
 */

function generateTacticalResponse(mission: any, msg: string): string {
    const input = msg.toUpperCase();
    const callsign = mission?.callsign || "HEMS UNIT";
    const phase = mission?.tracking?.phase || "Dispatch";
    const dest = mission?.destination?.name?.toUpperCase() || "THE FACILITY";
    const pickup = mission?.pickup?.name?.toUpperCase() || "THE SCENE";

    // 1. SYSTEM EVENT TRIGGERS (Automated calls from simulator)
    if (input.includes("EVENT_WAYPOINT_REACHED")) {
        const wpName = input.split(':')[1] || "NEXT FIX";
        if (phase === 'Enroute Pickup') return `${callsign}, DISPATCH COPIES REACHED ${wpName}. RADAR SHOWS YOU 5 MILES FROM ${pickup}. ADVISE ON SCENE.`;
        if (phase === 'Enroute Dropoff') return `${callsign}, COPIES ${wpName}. ${dest} CENTER IS ALERTED. TRAUMA TEAM STANDING BY ON FREQUENCY 124.0.`;
        return `${callsign}, DISPATCH COPIES ${wpName}. MAINTAIN CURRENT HEADING.`;
    }

    if (input.includes("EVENT_LOW_FUEL")) {
        return `[URGENT] ${callsign}, DISPATCH NOTING LOW FUEL STATE. ADVISE STATUS AND NEAREST ALTERNATE IF REQUIRED. SAFETY PROTOCOL 4-B IN EFFECT.`;
    }

    // 2. EMERGENCY OVERRIDE
    if (input.includes("MAYDAY") || input.includes("PAN-PAN") || input.includes("ENGINE FAILURE")) {
        return `[CRITICAL] ${callsign}, DISPATCH COPIES MAYDAY. ALL UNITS STANDBY. ${callsign}, ADVISE POSITION, SOULS, AND NATURE OF EMERGENCY. SAR IS BEING TASKED.`;
    }

    // 3. PHASE-SPECIFIC TACTICAL RADIO
    switch (phase) {
        case 'Dispatch':
            if (input.includes("LIFTING") || input.includes("AIRBORNE")) {
                return `ROGER ${callsign}. MARKS YOU OFF THE DECK AT ${mission.origin.name.toUpperCase()} AT ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}Z. CLEARED DIRECT ${pickup}. WINDS 240 AT 12. SQUAWK 4220.`;
            }
            return `${callsign}, DATA UPLINK VERIFIED. MISSION PROFILE: ${mission.mission_type.toUpperCase()}. ADVISE WHEN READY FOR LIFT.`;

        case 'At Scene/Transfer':
            if (input.includes("PATIENT LOADED") || input.includes("LIFTING")) {
                return `COPY ${callsign}. CLOCK STARTING ON CLINICAL TRANSPORT. CLEARED DIRECT ${dest}. EXPEDITE AS REQUIRED. REPORT 5 MILES OUT.`;
            }
            return `${callsign}, DISPATCH COPIES. STANDING BY FOR DEPARTURE CALL FROM ${pickup}. GROUND EMS HAS BEEN DISMISSED.`;

        case 'At Hospital':
            if (input.includes("OFF THE DECK") || input.includes("RETURNING")) {
                return `AFFIRMATIVE ${callsign}. CLINICAL MISSION LOGGED. CLEARED RETURN TO BASE. SQUAWK VFR. REPORT ON THE GROUND.`;
            }
            return `${callsign}, DISPATCH COPIES HANDOFF. STANDING BY FOR DEPARTURE. GOOD WORK ON THE LOAD.`;

        default:
            // Dynamic interaction based on key terms
            if (input.includes("WEATHER") || input.includes("METAR")) return `${callsign}, REGIONAL METAR SHOWS VFR. VISIBILITY 10SM. ALTIMETER 29.98.`;
            if (input.includes("RECON") || input.includes("LZ")) return `${callsign}, ${pickup} LZ IS VERIFIED. WATCH FOR LIGHTING AT THE NORTHWEST CORNER. WINDS FAVORING NORTHERN APPROACH.`;
            
            return `DISPATCH COPIES, ${callsign}. CONTINUE PER MISSION PROTOCOL.`;
    }
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
        const { data: mapping } = await supabaseAdmin.from('user_api_keys').select('user_id').eq('api_key', pluginApiKey).single();
        if (mapping) userId = mapping.user_id;
    }

    if (!userId) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

    const { mission_id, crew_message } = await req.json();

    const { data: mission } = await supabaseAdmin.from('missions').select('*').eq('mission_id', mission_id).single();

    const responseText = generateTacticalResponse(mission, crew_message);

    // Filter out "Internal Event" messages from the public visible radio log
    if (!crew_message.startsWith('EVENT_')) {
        await supabaseAdmin.from('mission_radio_logs').insert([
            { mission_id, sender: 'Crew', message: crew_message, user_id: userId, callsign: mission?.callsign || 'UNIT' }
        ]);
    }

    await supabaseAdmin.from('mission_radio_logs').insert([
        { mission_id, sender: 'Dispatcher', message: responseText, user_id: userId, callsign: 'DISPATCH' }
    ]);

    return new Response(JSON.stringify({ response_text: responseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});