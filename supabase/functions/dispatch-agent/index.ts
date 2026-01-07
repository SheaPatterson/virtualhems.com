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

    // --- Mock Data for Richer Responses ---
    const mockWeather = {
        VFR: "VFR conditions, visibility 10 miles, winds 270 at 8 knots.",
        MVFR: "Marginal VFR reported in the sector. Visibility 3 miles in haze. Proceed with caution.",
        IFR: "IFR conditions. Ceiling 500 feet, visibility 1 mile in fog. Ground stop advised.",
    };
    const currentWinds = "270 at 8 knots";
    const currentTraffic = "One fixed-wing aircraft reported 10 miles north, altitude 3,000 feet.";
    const currentWeather = mockWeather.VFR; // Default to VFR

    // 1. EMERGENCY PROTOCOLS (Highest Priority)
    if (input.includes("MAYDAY") || input.includes("EMERGENCY") || input.includes("ENGINE FAILURE") || input.includes("FIRE")) {
        return `[ALERT] ${callsign}, DISPATCH COPIES MAYDAY. ALL STATIONS STANDBY. ADVISE POSITION, SOULS ON BOARD, AND NATURE OF EMERGENCY. EMERGENCY SERVICES IN THE SECTOR NOTIFIED.`;
    }

    // 2. LZ RECON & FACILITY DATA
    if (input.includes("LZ") || input.includes("BRIEFING") || input.includes("RECON")) {
        if (phase.includes("Pickup")) {
            return `${callsign}, AFFIRMATIVE. GROUND EMS REPORTS SCENE LZ IS CLEAR. WINDS ARE ${currentWinds}. WATCH FOR POWER LINES ON THE WESTERN APPROACH NEAR THE INTERSECTION.`;
        }
        return `${callsign}, ${dest} REPORTS PAD IS SECURE. BE ADVISED OF ROOFTOP TURBULENCE REPORTED BY PREVIOUS INBOUND UNIT. TRAUMA TEAM IS STANDING BY.`;
    }

    // 3. Standard Requests (Weather, Fuel, Nav)
    if (input.includes("WEATHER") || input.includes("METAR")) {
        return `${callsign}, REGIONAL WEATHER CHECK: ${currentWeather}. ALTIMETER 29.92.`;
    }
    if (input.includes("FUEL") || input.includes("ENDURANCE")) {
        const fuel = mission?.tracking?.fuelRemainingLbs || 0;
        const burnRate = mission?.helicopter?.fuelBurnRateLbHr || 450;
        const enduranceMinutes = Math.floor((fuel / burnRate) * 60);
        return `${callsign}, DISPATCH SHOWS ${fuel} LBS REMAINING. ESTIMATED ENDURANCE IS ${enduranceMinutes} MINUTES. CONFIRM RESERVE FUEL STATUS.`;
    }
    if (input.includes("TRAFFIC")) {
        return `${callsign}, NEGATIVE CONFLICTING TRAFFIC REPORTED. ${currentTraffic}.`;
    }

    // 4. Phase-Specific Tactical Logic
    switch (phase) {
        case 'Dispatch':
            if (input.includes("LIFTING") || input.includes("DEPARTING") || input.includes("AIRBORNE")) {
                return `ROGER ${callsign}. CLOCK IS RUNNING. CLEARED DIRECT TO ${pickup}. SQUAWK 4200. REPORT ESTABLISHED ENROUTE. WINDS ARE ${currentWinds}.`;
            }
            return `${callsign}, MISSION DATA UPLINKED. ADVISE WHEN READY FOR LIFT. CONFIRM CREW AND PATIENT MANIFEST IS COMPLETE.`;

        case 'Enroute Pickup':
            if (input.includes("ON SCENE") || input.includes("LANDED")) {
                return `COPY ${callsign}. MARKS YOU ON THE DECK AT ${pickup}. ADVISE IF HOT LOAD OR COLD LOAD IS ANTICIPATED. PROCEED WITH PATIENT STABILIZATION.`;
            }
            // Proactive check
            if (input.includes("PROGRESS") || input.includes("STATUS")) {
                return `${callsign}, DISPATCH COPIES. CONTINUE TO ${pickup}. EXPECT ARRIVAL IN APPROXIMATELY 5 MINUTES.`;
            }
            return `DISPATCH STANDING BY, ${callsign}. CONTINUE ENROUTE TO ${pickup}.`;

        case 'At Scene/Transfer':
            if (input.includes("LIFTING") || input.includes("PATIENT ON BOARD") || input.includes("DEPARTING")) {
                return `ROGER ${callsign}, PATIENT SECURED. CLEARED DIRECT TO ${dest}. REPORT 5 MILES OUT FROM FACILITY. EXPEDITE AS REQUIRED.`;
            }
            return `${callsign}, DISPATCH STANDING BY FOR DEPARTURE CALL. CONFIRM PATIENT STABILIZATION COMPLETE.`;

        case 'Enroute Dropoff':
            if (input.includes("ON FINAL") || input.includes("APPROACHING") || input.includes("VISUAL")) {
                return `COPY ${callsign}. ${dest} TRAUMA TEAM IS BRIEFED AND STANDING BY ON THE PAD. REPORT VISUAL ON THE FACILITY.`;
            }
            // Proactive check
            if (input.includes("PROGRESS") || input.includes("STATUS")) {
                return `${callsign}, DISPATCH COPIES. CONTINUE TO ${dest}. EXPECT ARRIVAL IN APPROXIMATELY 3 MINUTES.`;
            }
            return `DISPATCH STANDING BY, ${callsign}. CONTINUE ENROUTE TO ${dest}.`;

        case 'At Hospital':
            if (input.includes("HANDOFF COMPLETE") || input.includes("RETURNING")) {
                return `ROGER ${callsign}. MISSION LOGGED AS CLINICALLY COMPLETE. YOU ARE CLEARED TO RETURN TO BASE. SQUAWK VFR.`;
            }
            return `${callsign}, DISPATCH STANDING BY FOR SECURE DEPARTURE FROM ${dest}. CONFIRM PATIENT HANDOFF PROTOCOL COMPLETE.`;

        case 'Returning to Base':
            if (input.includes("ON THE GROUND") || input.includes("SHUTTING DOWN") || input.includes("SECURE")) {
                return `AFFIRMATIVE ${callsign}. WELCOME HOME. DISPATCH LOGGING SORTIE AS COMPLETE. SECURE ALL TELEMETRY.`;
            }
            return `${callsign}, DISPATCH COPIES. CONTINUE TO BASE. REPORT 5 MILES OUT.`;
            
        case 'Complete':
            return `${callsign}, MISSION IS ARCHIVED. NO FURTHER ACTION REQUIRED.`;
    }

    // 5. Default/Fallback Response (More professional)
    return `DISPATCH COPIES, ${callsign}. PLEASE REPEAT YOUR REQUEST WITH CLARITY.`;
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