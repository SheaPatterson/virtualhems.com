export interface SimulatorDownload {
    version: string; 
    url: string;
}

export interface SimulatorPackage {
    id: string;
    name: string;
    description: string;
    pluginType: string;
    downloads: SimulatorDownload[];
    documentationUrl: string;
    installationSteps: string[];
}

export const simulatorPackages: SimulatorPackage[] = [
    {
        id: 'hems-dispatch-xp',
        name: 'X-Plane Dispatch Connector v5.2 (Lua)',
        description: 'Single-file tactical link with non-blocking network core. Eliminates simulator stutter during transmission.',
        pluginType: 'FlyWithLua Script',
        downloads: [
            { version: 'Download v5.2 (.lua)', url: '/downloads/hems-dispatch-xp/hems-dispatch-xp.lua' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Requires FlyWithLua installed in X-Plane.',
            'Move the .lua file to your Scripts folder.',
            'Edit the file to include your API Key.',
        ],
    },
    {
        id: 'hems-external-bridge',
        name: 'HEMS Pro External Bridge v5.2 (Node.js)',
        description: 'High-performance external gateway. Uses WebSockets for real-time telemetry without affecting sim FPS.',
        pluginType: 'Node.js Application',
        downloads: [
            { version: 'Download Source (GitHub)', url: 'https://github.com' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Requires Node.js v18+ installed on your machine.',
            'Download the source and run "npm install".',
            'Configure your .env with your HEMS Security Token.',
            'Run "npm start" alongside X-Plane.',
        ],
    },
    {
        id: 'hems-web-client',
        name: 'HEMS Web Simulator Client v5.2',
        description: 'Built-in browser simulator for testing and training without X-Plane running.',
        pluginType: 'Internal Web App',
        downloads: [
            { version: 'Launch Simulator Client', url: '/simulator-client' },
        ],
        documentationUrl: '/simulator-client',
        installationSteps: [
            'Launch the client and select an active mission.',
            'Toggle "Engage Auto-Fly" to simulate telemetry.',
        ],
    },
];