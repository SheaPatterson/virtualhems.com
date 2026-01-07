import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ShieldCheck, Info, Terminal, Cpu, Zap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
      <PageHeader 
        title="Tactical Integration Hub"
        description="Official technical protocols for the HEMS Tactical Bridge v5.2 Environment."
        icon={BookOpen}
      />

      <section className="space-y-6">
        <Card className="border-l-4 border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Zap className="w-10 h-10 text-primary shrink-0" />
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase italic text-primary">New: Standalone Bridge Architecture</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We have retired the legacy in-sim Lua scripts. The new <strong>HEMS Tactical Bridge</strong> is a standalone Sidecar application that connects to your simulator and streams telemetry directly to our cloud servers without impacting your simulator's frame rate or stability.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="prose prose-orange dark:prose-invert max-w-none space-y-12">
          {/* Section 1: Core Architecture */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">1. System Architecture</h2>
            <p>
              The Bridge acts as a <strong>Sidecar Process</strong>. It establishes a local link with your simulator's Web API and a secure cloud uplink with the HEMS OPS-CENTER.
            </p>
            <div className="grid md:grid-cols-3 gap-4 not-prose mt-6">
                <Card className="p-4 bg-muted/30 border-2">
                    <Cpu className="w-6 h-6 mb-2 text-primary" />
                    <h4 className="font-bold text-xs uppercase">Zero-Impact</h4>
                    <p className="text-[10px] text-muted-foreground">Networking is handled outside of the simulator thread, eliminating micro-stutters.</p>
                </Card>
                <Card className="p-4 bg-muted/30 border-2">
                    <Terminal className="w-6 h-6 mb-2 text-primary" />
                    <h4 className="font-bold text-xs uppercase">Native Rest</h4>
                    <p className="text-[10px] text-muted-foreground">Uses high-speed REST and WebSocket protocols for real-time positional data.</p>
                </Card>
                <Card className="p-4 bg-muted/30 border-2">
                    <ShieldCheck className="w-6 h-6 mb-2 text-primary" />
                    <h4 className="font-bold text-xs uppercase">Encrypted Link</h4>
                    <p className="text-[10px] text-muted-foreground">TLS 1.3 encryption for all telemetry packets and patient data downlink.</p>
                </Card>
            </div>
          </div>

          {/* Section 2: Installation */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">2. Bridge Installation</h2>
            <p>
              The bridge is a pre-configured React/Node application located in the <strong>Plugins</strong> directory.
            </p>
            <ol className="space-y-4">
              <li>
                  <strong>Download Source:</strong> Access the <code>hems-dispatch.zip</code> from the <Link to="/plugins" className="text-primary font-bold hover:underline">Integration Hub</Link>.
              </li>
              <li>
                  <strong>Environment Setup:</strong> Ensure <a href="https://nodejs.org" target="_blank" className="font-bold text-primary hover:underline">Node.js</a> (v18+) is installed on your Windows/Mac machine.
              </li>
              <li>
                  <strong>Deploy Dependencies:</strong> Open a terminal in the extracted folder and run:
                  <div className="bg-black text-[#00ff41] p-3 rounded-lg font-mono text-xs mt-2">npm install && npm start</div>
              </li>
              <li>
                  <strong>Secure Auth:</strong> Enter your <strong>Unique API Key</strong> found on your <Link to="/user" className="text-primary font-bold hover:underline">Personnel Profile</Link> into the Bridge UI.
              </li>
            </ol>
          </div>

          {/* Section 3: Simulator Link */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">3. Simulator Handshake</h2>
            <p>
              The Bridge requires a local API to be active in your simulator to "pull" the datarefs.
            </p>
            <div className="grid md:grid-cols-2 gap-6 not-prose">
                <Card className="p-6 border-2">
                    <h4 className="font-bold uppercase text-sm mb-2 text-primary">X-Plane 11 / 12</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">Requires the <strong>X-Plane Web API</strong> plugin (port 8086). Ensure "Allow Remote Connections" is checked in the plugin settings.</p>
                    <Badge variant="outline">PORT: 8086</Badge>
                </Card>
                <Card className="p-6 border-2">
                    <h4 className="font-bold uppercase text-sm mb-2 text-primary">MSFS 2020 / 2024</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">Requires the <strong>SimConnect-to-HTTP</strong> bridge or our native WASM package to provide the local data endpoint.</p>
                    <Badge variant="outline">PORT: 8080</Badge>
                </Card>
            </div>
          </div>

          {/* Section 4: EFB Integration */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">4. Tablet / EFB Sync</h2>
            <p>
              Once the Bridge is active and you have dispatched a mission, use the <strong>EFB Mode</strong> for a secondary flight display.
            </p>
            <div className="bg-muted p-6 rounded-2xl border flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-full"><Zap className="w-6 h-6 text-primary" /></div>
                <div className="space-y-2">
                    <p className="font-bold uppercase text-xs">Zero-Config Mobile Link:</p>
                    <p className="text-sm text-muted-foreground">Navigate to your mission tracking page and scan the QR code with your iPad or Android tablet. This creates a direct high-speed websocket link to your active telemetry stream.</p>
                </div>
            </div>
          </div>

          {/* Section 5: Troubleshooting */}
          <div className="pb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2 text-red-600">5. Troubleshooting</h2>
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="bg-red-500/10 p-2 rounded h-fit"><Info className="w-4 h-4 text-red-600" /></div>
                    <div>
                        <p className="font-bold text-sm uppercase">Uplink Status: AUTH_FAILED</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your API key is invalid or has been rotated. Generate a new key in your Profile settings and update the Bridge config.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-red-500/10 p-2 rounded h-fit"><Info className="w-4 h-4 text-red-600" /></div>
                    <div>
                        <p className="font-bold text-sm uppercase">Uplink Status: SIM_OFFLINE</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">The Bridge cannot see your simulator. Verify that the simulator is running and that the local API plugin is active on the correct port.</p>
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