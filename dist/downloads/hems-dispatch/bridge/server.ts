// @ts-ignore
import express, { Request, Response } from 'express';
// @ts-ignore
import cors from 'cors';
import { TelemetryData, BridgeStatus } from '../core/models';

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

let currentTelemetry: TelemetryData | null = null;
let lastHeartbeat = 0;

// 1. RECEIVE FROM X-PLANE (Lua script)
app.post('/telemetry', (req: Request, res: Response) => {
    currentTelemetry = {
        ...req.body,
        timestamp: Date.now()
    };
    lastHeartbeat = Date.now();
    res.status(200).send("OK");
});

// 2. SEND TO WEB UI
app.get('/api/status', (_req: Request, res: Response) => {
    const status: BridgeStatus = {
        simConnected: (Date.now() - lastHeartbeat) < 5000,
        cloudConnected: true, // Simplified
        activeMissionId: null,
        lastPacketReceived: lastHeartbeat
    };
    res.json({ status, telemetry: currentTelemetry });
});

app.listen(port, () => {
    console.log(`[HEMS BRIDGE] Local server active at http://localhost:${port}`);
});