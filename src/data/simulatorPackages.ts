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
        name: 'X-Plane Plugin (v2.0)',
        description: 'Professional WebSocket-based telemetry bridge for X-Plane 11/12. Real-time bidirectional communication with 10Hz updates.',
        pluginType: 'FlyWithLua Plugin',
        downloads: [
            { version: 'Download Plugin Package (.zip)', url: '/downloads/HEMS_XPlane_Plugin_v2.zip', isScript: false },
            { version: 'Legacy Uplink (.lua)', url: '/downloads/hems-dispatch-xp.lua', isScript: true },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Requirement: FlyWithLua (X-Plane 11 or 12 version).',
            'Extract ZIP and copy "HEMS_Bridge" folder to X-Plane/Resources/plugins/FlyWithLua/Scripts/.',
            'Restart X-Plane - plugin auto-starts WebSocket server on port 8787.',
            'Connect from HEMS web app to begin live tracking.',
        ],
    },
    {
        id: 'hems-dispatch-bridge',
        name: 'Step 2: Tactical Bridge UI',
        description: 'The Standalone "Command Center". Choose the installer that matches your hardware architecture.',
        pluginType: 'Standalone App',
        downloads: [
            { version: 'Windows Installer (Box)', url: 'https://app.box.com/s/8dn32k55blx4isbtmu2pe9j4zpwn2vs9' },
            { version: 'Mac Silicon/ARM (Box)', url: 'https://app.box.com/s/yr29vbkfgi58hbyhc2u062htvnw33qh1' },
            { version: 'Mac Intel (Box)', url: 'https://app.box.com/s/2tlvlms9suw0bm62zo158y6dt5zg2ji0' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Download the correct installer for your OS.',
            'Windows: Run the .exe and follow setup prompts.',
            'Mac: Open the .dmg and drag HEMS Ops to Applications.',
            'Ensure your Firewall allows traffic on local port 8080.',
        ],
    },
    {
        id: 'hems-web-client',
        name: 'Optional: In-Browser Tester',
        description: 'Simulator-independent. Test the system logic directly from this website.',
        pluginType: 'Web Component',
        downloads: [
            { version: 'Open Web Simulator', url: '/simulator-client' },
        ],
        documentationUrl: '/documentation',
        installationSteps: [
            'Click "Open Web Simulator" below.',
            'Enter your API Key to authenticate.',
            'Use this to test Dispatch logic without opening any simulator.',
        ],
    },
];