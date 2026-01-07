import { Card } from '@/components/ui/card';
import { BookOpen, Terminal, Cpu, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Separator } from '@/components/ui/separator';

const Documentation = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-12">
      <PageHeader 
        title="Tactical Integration Hub"
        description="Official technical protocols for the HEMS Tactical Bridge v5.2 Environment."
        icon={BookOpen}
      />

      {/* Quick Start Checklist */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">Installation Path Hierarchy</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-2 border-primary/20 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Terminal className="w-12 h-12 text-primary" /></div>
                <h4 className="font-black text-primary uppercase text-xs mb-3">INSIDE SIMULATOR</h4>
                <p className="text-xs font-bold mb-2">The Lua Uplink Script</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Place the <code className="font-mono text-primary">.lua</code> file in your <span className="italic">FlyWithLua/Scripts</span> folder. This handles data transmission only.
                </p>
            </Card>
            <Card className="p-6 border-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><Cpu className="w-12 h-12" /></div>
                <h4 className="font-black uppercase text-xs mb-3">OUTSIDE SIMULATOR (DESKTOP)</h4>
                <p className="text-xs font-bold mb-2">The Tactical Bridge App</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Keep this folder on your Desktop. Launch it via the <code className="font-mono">.bat</code> (Windows) or <code className="font-mono">.command</code> (Mac) file. This is your primary mission window.
                </p>
            </Card>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="prose prose-orange dark:prose-invert max-w-none space-y-12">
          {/* Section 1: UI Options */}
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2">Interface Options</h2>
            <p>
              The HEMS ecosystem provides two distinct ways to monitor your flight data in real-time:
            </p>
            <div className="grid md:grid-cols-2 gap-6 not-prose mt-6">
                <Card className="p-6 bg-muted/30 border-2 flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cpu w-5 h-5 text-primary"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v4"/><path d="M12 16v-4"/><path d="M8 12h4"/><path d="M16 12h-4"/><path d="M12 2v-2"/><path d="M12 24v-2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M12 4h.01"/><path d="M12 20h.01"/><path d="M4 12h.01"/><path d="M20 12h.01"/></svg>
                        <h4 className="font-black text-sm uppercase">Tactical Bridge (Desktop)</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-grow">
                        A high-fidelity standalone application for your second monitor. Best for complex mission coordination, viewing regional traffic, and managing AI Dispatcher radio comms.
                    </p>
                </Card>
                <Card className="p-6 bg-muted/30 border-2 flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tablet w-5 h-5 text-primary"><rect width="18" height="22" x="3" y="1" rx="2" ry="2"/><line x1="12" x2="12" y1="17" y2="17"/></svg>
                        <h4 className="font-black text-sm uppercase">Cockpit EFB (Tablet)</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-grow">
                        A browser-based mobile interface optimized for iPads and tablets. Includes simplified mapping, patient medical reports, and interactive mission checklists.
                    </p>
                </Card>
            </div>
          </div>

          {/* Section 2: Audio Enhancement */}
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2 mt-12">Audio Enhancement (TTS)</h3>
            <p>
              The Dispatch Agent now uses a high-quality Text-to-Speech (TTS) service architecture for realistic radio calls, replacing generic system voices. For the full radio effect, you need to provide a short audio file for static:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><code className="font-mono">/public/audio/radio_static.mp3</code>: Place a short static/click sound here. This is used for the PTT click and release effect.</li>
              <li><code className="font-mono">/public/audio/dispatch_response.mp3</code>: The server uses a placeholder URL pointing to this file to simulate the high-quality voice response. For a real deployment, you would integrate a service like ElevenLabs here.</li>
            </ul>
          </div>

          {/* Section 3: Launching */}
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2">Launching the System</h2>
            <ol className="space-y-4">
              <li>
                  <strong>Start X-Plane:</strong> Ensure FlyWithLua is active and your script is loaded.
              </li>
              <li>
                  <strong>Open the Bridge:</strong> Run the launcher file in your desktop Bridge folder.
              </li>
              <li>
                  <strong>Verify Link:</strong> Look for the <span className="text-[#00ff41] font-bold">SIM_LINK_ACTIVE</span> status indicator in the top right of the Bridge window.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;