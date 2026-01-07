import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ShieldCheck, Info, Layout, MapPin, Lock } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const Documentation = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <PageHeader 
        title="Tactical Integration Manual"
        description="Official technical protocols for the HEMS OPS-CENTER v4.2 Production Environment."
        icon={BookOpen}
      />

      <section className="space-y-6">
        <Card className="border-l-4 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic">Professional Standards Compliance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The HEMS OPS-CENTER is designed for high-fidelity training. This system utilizes a <strong>Real-Time REST Gateway</strong> to synchronize flight dynamics from X-Plane and MSFS into a centralized dispatch environment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="prose prose-orange dark:prose-invert max-w-none space-y-12">
          {/* Section 1: SSL Fix */}
          <div id="ssl-fix">
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-red-600/20 pb-2 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-red-600" /> SSL Library (LuaSec) Setup
            </h2>
            <div className="bg-red-600/5 border-2 border-red-600/20 p-6 rounded-2xl space-y-4">
                <p className="text-sm font-bold">If you see "SSL LIB MISSING" on your screen, follow these steps:</p>
                <p className="text-sm">
                    X-Plane 11/12 requires the <strong>LuaSec</strong> library to communicate securely with our servers via HTTPS. Many FlyWithLua installations do not include this by default.
                </p>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                    <Card className="p-4 bg-background">
                        <h4 className="font-bold text-xs uppercase mb-2">1. Download Binaries</h4>
                        <p className="text-[10px] text-muted-foreground">Download a pre-compiled version of LuaSec (for Lua 5.1/LuaJIT). You can find these on the X-Plane.org forums or GitHub (LuaSec).</p>
                    </Card>
                    <Card className="p-4 bg-background">
                        <h4 className="font-bold text-xs uppercase mb-2">2. Installation Path</h4>
                        <p className="text-[10px] text-muted-foreground">Place <code>ssl.lua</code> and the binary <code>ssl.dll</code> (Win) or <code>ssl.so</code> (Mac/Linux) into:<br/><code>FlyWithLua/Internals/Modules/</code></p>
                    </Card>
                </div>
                <div className="flex items-start space-x-3 text-xs bg-black/10 p-3 rounded-lg border border-black/10">
                    <Info className="w-4 h-4 mt-0.5 text-primary" />
                    <p>Restart X-Plane or reload scripts (Ctrl+Alt+R) after placing the files. The error message will disappear and the <strong>LNK</strong> indicator will turn green.</p>
                </div>
            </div>
          </div>

          {/* Section 2: System Architecture */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">1. System Architecture</h2>
            <p>
              The plugin acts as a <strong>Tactical Data Link (TDL)</strong>. It establishes an encrypted handshake with the HEMS Edge Gateway using your unique API Key. Once established, the system performs a "Deep Sync" every 4 seconds.
            </p>
            <ul>
              <li><strong>Uplink:</strong> Transmits GPS, Altitude, Ground Speed, Fuel State, and Engine Status.</li>
              <li><strong>Downlink:</strong> Retrieves Active Mission Waypoints, Patient Vitals, and Landing Zone Recon.</li>
              <li><strong>AI Dispatcher:</strong> A state-aware agent that analyzes TDL data to provide contextual radio calls via Text-to-Speech (TTS).</li>
            </ul>
          </div>

          {/* Section 3: Installation */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">2. Installation Guide</h2>
            <h3 className="text-primary uppercase">X-Plane 11 / 12</h3>
            <ol>
              <li>Download the <strong>hems-dispatch-xp.lua</strong> script from the Plugins page.</li>
              <li>Place the file in <code>[X-Plane Path]/Resources/plugins/FlyWithLua/Scripts</code>.</li>
              <li>Open the script with Notepad++ or VS Code and find the line <code>local API_KEY = "..."</code>.</li>
              <li>Paste your key from the dashboard into those quotes.</li>
            </ol>
            <h3 className="text-primary uppercase">MSFS 2020 / 2024</h3>
            <p>
              Download the <strong>HEMS-Connector-WASM</strong> package and move it into your <code>Community</code> folder. Launch the in-sim toolbar and authenticate via the generated QR code.
            </p>
          </div>

          {/* Section 4: EFB Integration */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">3. EFB / Tablet Integration</h2>
            <p>
              The HEMS OPS-CENTER provides a dedicated <strong>Electronic Flight Bag (EFB)</strong> interface, perfect for a second monitor or a tablet like an iPad. This eliminates the need for third-party in-sim browser plugins.
            </p>
            <div className="bg-muted p-6 rounded-2xl border">
                <p className="font-bold uppercase text-xs mb-2">Integration Workflow:</p>
                <ol className="text-sm space-y-2">
                    <li>Once a mission is active, navigate to the <strong>Live Tracking</strong> page for that flight.</li>
                    <li>Click the <strong className="text-primary">EFB</strong> button, which displays a QR code.</li>
                    <li>Scan this QR code with your tablet's camera to instantly open the dedicated cockpit view.</li>
                    <li>The EFB will now display a live tactical map, comms panel, checklists, and briefing data, all synced in real-time with your simulator.</li>
                </ol>
            </div>
          </div>

          {/* Section 5: Scenery Development */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">4. Scenery Development (World Editor)</h2>
            <p>
                To maintain the high visual standard of our regional network, we use <strong>World Editor (WED)</strong> to design and export custom landing zones.
            </p>
            <div className="grid md:grid-cols-2 gap-6 not-prose">
                <Card className="p-4 border-2 bg-muted/20">
                    <h4 className="font-bold flex items-center text-sm mb-2 uppercase">
                        <Layout className="w-4 h-4 mr-2 text-primary" /> LZ Design
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Use WED to place "Helipad" objects with correct surface types. Ensure pads are marked as "Transparent" if using custom textures to avoid X-Plane's default flickering.
                    </p>
                </Card>
                <Card className="p-4 border-2 bg-muted/20">
                    <h4 className="font-bold flex items-center text-sm mb-2 uppercase">
                        <MapPin className="w-4 h-4 mr-2 text-primary" /> Metadata
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        All LZs must include an <strong>ICAO Identifier</strong> (e.g., PS12) that matches the HEMS Registry to enable automatic approach briefings in the cockpit EFB.
                    </p>
                </Card>
            </div>
            <p className="mt-4">
                Completed scenery packages should be zipped and uploaded to the <strong>Resource Library</strong> for distribution to the fleet.
            </p>
          </div>

          {/* Section 6: Troubleshooting */}
          <div className="pb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">5. Troubleshooting</h2>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="bg-red-500/10 p-2 rounded h-fit"><Info className="w-4 h-4 text-red-600" /></div>
                    <div>
                        <p className="font-bold text-sm uppercase">Status: No Telemetry Received</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Check your API key. In X-Plane, check the <code>Log.txt</code> in your main folder. Look for "LuaSec Error" which indicates a missing SSL library.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-red-500/10 p-2 rounded h-fit"><Info className="w-4 h-4 text-red-600" /></div>
                    <div>
                        <p className="font-bold text-sm uppercase">Status: AI Dispatcher Mute</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">The AI Agent requires the "Desktop Audio" focus. Ensure your simulator is not running in 'exclusive' fullscreen mode if TTS is failing to initialize.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;