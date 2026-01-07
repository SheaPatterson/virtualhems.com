export interface SimulatorDownload {
    version: string; 
    url: string;
    isScript?: boolean;
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
        id: 'xplane-uplink',
        name: 'Step 1: Lua Uplink Script',
        description: 'The "Data Pipe". This tiny script reads your aircraft position and sends it to the Bridge UI.',
        pluginType: 'FlyWithLua Script',
        downloads: [
            { version: 'Download Uplink (.lua)', url: '/downloads/hems-dispatch-xp.lua', isScript: true },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Requirement: FlyWithLua (X-Plane Plugin).',
            'Drag "hems-dispatch-xp.lua" into X-Plane/Resources/plugins/FlyWithLua/Scripts/.',
            'Restart X-Plane to initialize the pipe.',
        ],
    },
    {
        id: 'hems-dispatch-bridge',
        name: 'Step 2: Tactical Bridge UI',
        description: 'The "Popup Window". This is the high-fidelity UI where you view maps, AI comms, and patient data.',
        pluginType: 'Standalone App',
        downloads: [
            { version: 'Download Bridge UI (.zip)', url: '/downloads/hems-dispatch.zip' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Extract the .zip to your desktop.',
            'Windows: Double-click "LAUNCH_BRIDGE.bat".',
            'Mac: Right-Click "LAUNCH_BRIDGE.command" and select "Open".',
            'Enter your API Key into the Bridge UI when prompted.',
        ],
    },
    {
        id: 'hems-web-client',
        name: 'Optional: In-Browser Tester',
        description: 'No download needed. Test the system logic directly from this website.',
        pluginType: 'Web Component',
        downloads: [
            { version: 'Open Web Simulator', url: '/simulator-client' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Click "Open Web Simulator" below.',
            'Enter your API Key to authenticate.',
            'Use this to test Dispatch logic without opening X-Plane.',
        ],
    },
];