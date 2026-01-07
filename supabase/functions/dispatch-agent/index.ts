// @ts-nocheck
import { serve } from "https://deno.land.std@0.190.0/http/server.ts";
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
 * 5. Keywords: Look for keywords but respond based on the broader context of the message and mission phase.
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

    // 2. Standard Requests (Weather, Fuel, Nav)
    if (input.includes("WEATHER") || input.includes("METAR")) {
        return `${callsign}, regional METAR for Western PA indicates widespread VFR. Clear skies and light winds. Watch for valley fog near the rivers after sunset.`;
    }
    if (input.includes("FUEL") || input.includes("ENDURANCE")) {
        const fuel = mission?.tracking?.fuelRemainingLbs || 0;
        const burnRate = mission?.helicopter?.fuel_burn_rate_lb_hr || 450;
        const endurance = Math.floor((fuel / burnRate) * 60);
        return `${callsign}, dispatch shows ${fuel} lbs remaining. Calculated endurance is approximately ${endurance} minutes.`;
    }
    if (input.includes("SAY AGAIN") || input.includes("REPEAT")) {
        return `DISPATCH, I SAY AGAIN... (Previous transmission would be repeated here). How do you copy, ${callsign}?`;
    }

    // 3. Phase-Specific Logic
    switch (phase) {
        case 'Dispatch':
            if (input.includes("LIFTING") || input.includes("DEPARTING")) {
                return `ROGER ${callsign}. CLEARED FOR DEPARTURE. PROCEED DIRECT TO ${pickup}. REPORT ESTABLISHED ENROUTE.`;
            }
            return `${callsign}, DISPATCH STANDING BY. ADVISE WHEN YOU ARE LIFTING.`;

        case 'Enroute Pickup':
            if (input.includes("ON SCENE") || input.includes("LANDED AT PICKUP")) {
                return `COPY ${callsign}. DISPATCH MARKS YOU ON THE DECK AT ${pickup}. ADVISE PATIENT LOAD STATUS AND LIFT-OFF TIME.`;
            }
            if (input.includes("REQUESTING FLIGHT FOLLOWING")) {
                return `${callsign}, RADAR CONTACT. SQUAWK 4321. PROCEED ON COURSE. ADVISE OF ANY DEVIATIONS.`;
            }
            return `${callsign}, DISPATCH COPIES. CONTINUE TO ${pickup}. REPORT 5 MILES OUT.`;

        case 'At Scene/Transfer':
            if (input.includes("LIFTING FROM SCENE") || input.includes("PATIENT ON BOARD")) {
                return `ROGER ${callsign}, PATIENT ON BOARD. CLEARED DIRECT TO ${dest}. REPORT ETA WHEN ABLE.`;
            }
            return `${callsign}, DISPATCH STANDING BY FOR PATIENT UPDATE AND DEPARTURE.`;

        case 'Enroute Dropoff':
            if (input.includes("ON FINAL") || input.includes("APPROACHING HOSPITAL")) {
                return `COPY ${callsign}. ${dest} HAS BEEN NOTIFIED OF YOUR FINAL APPROACH. REPORT ON THE PAD.`;
            }
            return `${callsign}, DISPATCH COPIES. CONTINUE TO ${dest}. ADVISE ANY CHANGES TO PATIENT CONDITION.`;

        case 'At Hospital':
            if (input.includes("PATIENT HANDOFF COMPLETE") || input.includes("CLEAR OF HOSPITAL")) {
                return `ROGER ${callsign}. PATIENT HANDOFF COMPLETE. YOU ARE CLEARED TO RETURN TO BASE. REPORT DEPARTING.`;
            }
            return `${callsign}, DISPATCH STANDING BY FOR HANDOFF CONFIRMATION.`;

        case 'Returning to Base':
            if (input.includes("ON THE GROUND") || input.includes("SHUTTING DOWN")) {
                return `COPY ${callsign}. DISPATCH MARKS YOU SECURE AT BASE. MISSION COMPLETE. GOOD WORK.`;
            }
            return `${callsign}, DISPATCH COPIES. WELCOME HOME. REPORT ON THE GROUND.`;
        
        case 'Complete':
            return `${callsign}, THIS MISSION IS LOGGED AS COMPLETE. NO FURTHER COMMS REQUIRED ON THIS CHANNEL.`;
    }

    // 4. General Fallback
    return `DISPATCH COPIES, ${callsign}. STANDING BY.`;
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