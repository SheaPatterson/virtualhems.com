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
        name: 'X-Plane Lua Uplink v5.2',
        description: 'The "Drag & Drop" component. Connects X-Plane core data to the Tactical Bridge UI.',
        pluginType: 'FlyWithLua Script',
        downloads: [
            { version: 'Download Uplink Script (.lua)', url: '/downloads/hems-dispatch-xp.lua', isScript: true },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Ensure FlyWithLua is installed in X-Plane.',
            'Drop the .lua file into Resources/plugins/FlyWithLua/Scripts/',
            'The script will automatically detect the Bridge UI.',
        ],
    },
    {
        id: 'hems-dispatch-bridge',
        name: 'HEMS Tactical Bridge UI v5.2',
        description: 'The visual "Popup" window. Highly styled mission command center with maps, AI comms, and performance data.',
        pluginType: 'Standalone React App',
        downloads: [
            { version: 'Download Bridge UI (.zip)', url: '/downloads/hems-dispatch' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Extract the zip and run "npm install && npm start".',
            'This window can be used on a second monitor or overlayed.',
            'Connects to X-Plane via the Uplink Script above.',
        ],
    },
];