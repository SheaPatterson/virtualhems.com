// @ts-ignore
import express, { Request, Response } from 'express';
// @ts-ignore
import cors from 'cors';
import { z } from 'zod';
// @ts-ignore
import sqlite3 from 'sqlite3';
import { TelemetryData, BridgeStatus } from '../renderer/lib/models';
import { getDispatchResponse } from './ai';

const app = express();
const port = 3001;

// --- Database Setup ---
const db = new sqlite3.Database('flight_data.db', (err) => {
    if (err) {
        console.error('[DATABASE] Error opening database:', err.message);
    } else {
        console.log('[DATABASE] Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            altitude REAL NOT NULL,
            heading REAL NOT NULL,
            airspeed REAL NOT NULL,
            verticalSpeed REAL NOT NULL
        )`);
    }
});

app.use(cors());
app.use(express.json());

// --- Data Integrity Mandate: Zod Schema ---
const TelemetrySchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number(),
    heading: z.number(),
    airspeed: z.number(),
    verticalSpeed: z.number(),
    engineRpm: z.number().optional(),
    fuelQuantity: z.number().optional(),
    timestamp: z.number(),
});

let currentTelemetry: TelemetryData | null = null;
let lastHeartbeat = 0;

// 1. RECEIVE FROM SIMULATOR CONNECTORS
app.post('/telemetry', (req: Request, res: Response) => {
    const validationResult = TelemetrySchema.safeParse(req.body);

    if (!validationResult.success) {
        console.error('[HEMS BRIDGE] Invalid telemetry data received:', validationResult.error.flatten());
        return res.status(400).json({
            message: 'Invalid telemetry data format',
            errors: validationResult.error.flatten().fieldErrors,
        });
    }

    const validatedData = validationResult.data;

    // --- Flight Data Recorder ---
    const stmt = db.prepare(`INSERT INTO telemetry (timestamp, latitude, longitude, altitude, heading, airspeed, verticalSpeed) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(
        validatedData.timestamp,
        validatedData.latitude,
        validatedData.longitude,
        validatedData.altitude,
        validatedData.heading,
        validatedData.airspeed,
        validatedData.verticalSpeed
    );
    stmt.finalize();

    currentTelemetry = {
        ...validatedData,
        timestamp: Date.now()
    };
    lastHeartbeat = Date.now();

    res.status(200).send({ message: "Telemetry received and recorded" });
});

// 2. SEND TO WEB UI
app.get('/api/status', (_req: Request, res: Response) => {
    const status: BridgeStatus = {
        simConnected: (Date.now() - lastHeartbeat) < 5000,
        cloudConnected: true, 
        activeMissionId: null,
        lastPacketReceived: lastHeartbeat
    };
    res.json({ status, telemetry: currentTelemetry });
});

// 3. AI DISPATCH
app.post('/api/dispatch', async (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const response = await getDispatchResponse(message, currentTelemetry);

    res.json({ response });
});

app.listen(port, () => {
    console.log(`[HEMS BRIDGE] Local server active at http://localhost:${port}`);
});
