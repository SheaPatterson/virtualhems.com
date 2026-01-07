const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Serve the HUD interface files
app.use(express.static(path.join(__dirname, 'ui')));

let currentTelemetry = null;
let lastHeartbeat = 0;

// 1. RECEIVE FROM X-PLANE (Lua script)
app.post('/telemetry', (req, res) => {
    // Log every packet to the terminal so the user knows it's working
    console.log(`[DATA] Packet received: Alt ${Math.round(req.body.altitudeFt)}ft | GS ${Math.round(req.body.groundSpeedKts)}kts`);
    
    currentTelemetry = {
        ...req.body,
        timestamp: Date.now()
    };
    lastHeartbeat = Date.now();
    res.status(200).send("OK");
});

// 2. SEND TO HUD UI
app.get('/api/status', (req, res) => {
    res.json({ 
        simConnected: (Date.now() - lastHeartbeat) < 5000,
        telemetry: currentTelemetry 
    });
});

app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`[SUCCESS] HEMS Tactical Bridge is ACTIVE.`);
    console.log(`[LINK] Open this in your browser: http://localhost:${port}`);
    console.log(`[UPLINK] Awaiting data from X-Plane...`);
    console.log(`========================================\n`);
});