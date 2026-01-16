'use client';

import { useState, useEffect } from 'react';
import { TelemetryData, BridgeStatus } from '../lib/models';
import LiveMap from '../components/LiveMap';
import '../components/LiveMap.css';
import { DispatchTerminal } from '../components/DispatchTerminal';

const StatusDisplay = ({ status }: { status: BridgeStatus | null }) => {
    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">System Status</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="font-bold">Simulator Link:</p>
                    <p className={status?.simConnected ? 'text-green-400' : 'text-red-400'}>
                        {status?.simConnected ? 'CONNECTED' : 'DISCONNECTED'}
                    </p>
                </div>
                <div>
                    <p className="font-bold">Cloud Sync:</p>
                    <p className={status?.cloudConnected ? 'text-green-400' : 'text-red-400'}>
                        {status?.cloudConnected ? 'ENABLED' : 'DISABLED'}
                    </p>
                </div>
            </div>
        </div>
    );
};

const TelemetryDisplay = ({ telemetry }: { telemetry: TelemetryData | null }) => {
    if (!telemetry) {
        return (
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold">Awaiting Telemetry...</h2>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">Aircraft Telemetry</h2>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <p><strong>Lat:</strong> {telemetry.latitude.toFixed(4)}</p>
                <p><strong>Lon:</strong> {telemetry.longitude.toFixed(4)}</p>
                <p><strong>Alt:</strong> {telemetry.altitude.toFixed(0)} ft</p>
                <p><strong>Hdg:</strong> {telemetry.heading.toFixed(0)}°</p>
                <p><strong>Airspeed:</strong> {telemetry.airspeed.toFixed(0)} kts</p>
                <p><strong>V/S:</strong> {telemetry.verticalSpeed.toFixed(0)} fpm</p>
            </div>
        </div>
    );
};

export default function HomePage() {
    const [data, setData] = useState<{ telemetry: TelemetryData | null; status: BridgeStatus | null }>({
        telemetry: null,
        status: null
    });

    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/status');
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                console.error("Bridge connection lost");
            }
        };

        const interval = setInterval(poll, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4">
            <h1 className="text-3xl font-bold text-center mb-4">HEMS Dispatch</h1>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 flex flex-col gap-4">
                    <StatusDisplay status={data.status} />
                    <TelemetryDisplay telemetry={data.telemetry} />
                    <div className="flex-grow min-h-[300px]">
                        <DispatchTerminal />
                    </div>
                </div>
                <div className="md:col-span-2 h-[60vh] md:h-auto">
                    <LiveMap telemetry={data.telemetry} />
                </div>
            </div>
        </div>
    );
}
