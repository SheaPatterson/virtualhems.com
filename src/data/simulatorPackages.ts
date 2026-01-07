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
        id: 'hems-dispatch-bridge',
        name: 'HEMS Tactical Bridge v5.2 (External)',
        description: 'High-performance React-based bridge. Uses a dedicated background process to stream telemetry without impacting simulator frame rates.',
        pluginType: 'Standalone Node/Vite App',
        downloads: [
            { version: 'Download Bridge Source (.zip)', url: '/downloads/hems-dispatch' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Download and extract the bridge folder.',
            'Ensure Node.js is installed on your machine.',
            'Run "npm install" and "npm start" within the folder.',
            'Connect via your API Key from the Personnel Profile.',
        ],
    },
    {
        id: 'hems-web-client',
        name: 'HEMS Web Simulator Client v5.2',
        description: 'Built-in browser simulator for testing and training without an external simulator running.',
        pluginType: 'Internal Web App',
        downloads: [
            { version: 'Launch Simulator Client', url: '/simulator-client' },
        ],
        documentationUrl: '/simulator-client',
        installationSteps: [
            'Launch the client and select an active mission.',
            'Toggle "Engage Tactical Link" to simulate telemetry.',
        ],
    },
];