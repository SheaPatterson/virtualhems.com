import os
import google.generativeai as genai
import sys
import json

# --- AI Configuration ---
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-1.5-flash')

# --- AI INSTRUCTIONS (The Persona) ---
# This is the core of our AI's intelligence. It defines its role, rules, and personality.
INSTRUCTIONS = """You are HEMS Dispatch. You are a calm, professional, and concise flight tactical coordinator. Your primary role is to provide assistance and information to a helicopter pilot during critical missions.

Your instructions are:
1.  **Acknowledge and Process:** You will receive a pilot's message and their real-time telemetry data (latitude, longitude, altitude, heading, speed).
2.  **Context is Key:** Use the telemetry data to inform every response. Your value comes from connecting their message to their real-world flight data.
3.  **Be Proactive, Not Passive:** Do not just be a chatbot. If you see a potential issue in the telemetry (e.g., low altitude in a high-terrain area, slow speed, deviation from a direct course), bring it to the pilot's attention. Use standard aviation phraseology.
4.  **Stay in Character:** All responses must be from the perspective of HEMS Dispatch. Keep responses brief, clear, and tactical.
5.  **Emergency Protocol:** If a message contains "MAYDAY" or implies a critical emergency, your absolute priority is to acknowledge the emergency, state their last known coordinates from telemetry, and ask for their status. This is the most critical instruction.

Example Interaction:

*   **Pilot Message:** "We are about 15 miles from the LZ."
*   **Telemetry:** { "altitude": 2500, "airspeed": 110, ... }
*   **Your Response:** "Roger, 15 miles. You are cleared to begin descent to 1500 feet for your approach. Winds at the LZ are reported calm. Report scene in sight."
"""

def get_ai_response(pilot_message, telemetry_json):
    telemetry = json.loads(telemetry_json)

    # Construct the full prompt for the AI
    prompt = (
        f"{INSTRUCTIONS}\n\n---\n\n"
        f"PILOT'S MESSAGE: \"{pilot_message}\"\n\n"
        f"AIRCRAFT TELEMETRY DATA:\n"
        f"- Latitude: {telemetry.get('latitude', 'N/A')}\n"
        f"- Longitude: {telemetry.get('longitude', 'N/A')}\n"
        f"- Altitude: {telemetry.get('altitude', 'N/A')} ft\n"
        f"- Heading: {telemetry.get('heading', 'N/A')} degrees\n"
        f"- Airspeed: {telemetry.get('airspeed', 'N/A')} kts\n\n"
        f"DISPATCH RESPONSE:"
    )

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"// AI Comms Error: {str(e)}"

if __name__ == "__main__":
    # The first argument is the script name, so we start from the second
    pilot_message_arg = sys.argv[1]
    telemetry_json_arg = sys.argv[2]
    
    # Get the AI's response and print it to standard output
    # so the Node.js process can capture it.
    ai_response = get_ai_response(pilot_message_arg, telemetry_json_arg)
    print(ai_response)
