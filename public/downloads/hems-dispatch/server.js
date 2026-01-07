const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

let currentTelemetry = null;
let lastHeartbeat = 0;
let currentMissionId = null;

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

// 2. STATUS ENDPOINT FOR UI
app.get('/api/status', (req, res) => {
    res.json({ 
        simConnected: (Date.now() - lastHeartbeat) < 5000,
        telemetry: currentTelemetry,
        missionId: currentMissionId
    });
});

// 3. CHAT RELAY TO SUPABASE DISPATCH AGENT
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    // In a production environment, we would use the user's API key here.
    // For now, we simulate a response or proxy if the key is provided in a config.
    console.log(`[RADIO] PILOT: ${message}`);
    
    // Simulating dispatcher acknowledgment for local mode
    // You can extend this to call the Supabase Edge Function directly
    const mockResponse = "DISPATCH COPIES. STANDING BY FOR PROGRESS REPORT.";
    
    res.json({ response: mockResponse });
});

app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`[SUCCESS] HEMS COMMAND CENTER IS ONLINE`);
    console.log(`[LOCAL] http://localhost:${port}`);
    console.log(`[UPLINK] Awaiting X-Plane Data Link...`);
    console.log(`========================================\n`);
});