const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

// Supabase Edge Function URLs
const SUPABASE_MISSIONS_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1/fetch-active-missions";
const SUPABASE_TELEMETRY_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1/update-telemetry";
const SUPABASE_CHAT_URL = "https://orhfcrrydmgxradibbqb.supabase.co/functions/v1/dispatch-agent";

app.use(cors());
app.use(express.json());
// Use path.join(__dirname, 'ui') to correctly serve static files from the packaged location
app.use(express.static(path.join(__dirname, 'ui')));

let currentTelemetry = null;
let lastHeartbeat = 0;
let currentMissionId = 'HEMS-4220'; // Mock active mission ID

// 1. RECEIVE TELEMETRY FROM X-PLANE
app.post('/telemetry', (req, res) => {
    // Lua script might send mission_id if configured
    if (req.body.mission_id) currentMissionId = req.body.mission_id;

    currentTelemetry = {
        ...req.body,
        timestamp: Date.now()
    };
    lastHeartbeat = Date.now();
    res.status(200).send("OK");
});

// 2. STATUS ENDPOINT FOR UI (Local Telemetry)
app.get('/api/status', (req, res) => {
    // Note: Mission context is now fetched directly by the client via /api/mission-context
    res.json({ 
        simConnected: (Date.now() - lastHeartbeat) < 5000,
        cloudConnected: true, // Assume cloud is reachable
        telemetry: currentTelemetry,
        missionState: null // Removed mock missionState, client fetches real mission
    });
});

// 3. PROXY ENDPOINT TO FETCH REAL MISSION CONTEXT FROM SUPABASE
app.post('/api/mission-context', async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ error: 'API Key required.' });
    }

    try {
        const response = await fetch(SUPABASE_MISSIONS_URL, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[PROXY] Supabase fetch error: ${response.status}`, errorData);
            return res.status(response.status).json({ error: errorData.error || 'Supabase API Error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("[PROXY] Network error fetching mission context:", error);
        res.status(500).json({ error: 'Local network error or Supabase unreachable.' });
    }
});

// 4. PROXY ENDPOINT TO SEND TELEMETRY TO SUPABASE
app.post('/api/telemetry-relay', async (req, res) => {
    const { apiKey, mission_id, ...telemetryData } = req.body;
    if (!apiKey || !mission_id) {
        return res.status(400).json({ error: 'API Key and Mission ID required.' });
    }

    try {
        const response = await fetch(SUPABASE_TELEMETRY_URL, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mission_id, ...telemetryData }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[RELAY] Telemetry relay failed: ${response.status}`, errorText);
            return res.status(response.status).send(errorText);
        }

        const responseText = await response.text();
        res.status(200).send(responseText);
    } catch (error) {
        console.error("[RELAY] Network error during telemetry relay:", error);
        res.status(500).send('Local network error during telemetry relay.');
    }
});

// 5. PROXY ENDPOINT TO SEND CHAT TO SUPABASE DISPATCH AGENT
app.post('/api/chat-relay', async (req, res) => {
    const { apiKey, mission_id, crew_message } = req.body;
    if (!apiKey || !mission_id || !crew_message) {
        return res.status(400).json({ error: 'API Key, Mission ID, and Message required.' });
    }

    try {
        const response = await fetch(SUPABASE_CHAT_URL, {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mission_id, crew_message }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`[CHAT] Chat relay failed: ${response.status}`, errorData);
            return res.status(response.status).json({ error: errorData.error || 'Supabase API Error' });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("[CHAT] Network error during chat relay:", error);
        res.status(500).json({ error: 'Local network error during chat relay.' });
    }
});


app.listen(port, () => {
    // Send a message back to the Electron main process upon successful startup
    if (process.send) {
        process.send('Server started successfully on port 8080.');
    }
    console.log(`\n========================================`);
    console.log(`[SUCCESS] HEMS COMMAND CENTER IS ONLINE`);
    console.log(`[LOCAL] http://localhost:${port}`);
    console.log(`[UPLINK] Awaiting X-Plane Data Link...`);
    console.log(`========================================\n`);
});