import { Card } from '@/components/ui/card';
import { BookOpen, Terminal, Cpu, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Separator } from '@/components/ui/separator';

const Documentation = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-12">
      <PageHeader 
        title="Technical Manual"
        description="Official technical protocols for the HEMS Tactical Bridge v5.2 Environment."
        icon={BookOpen}
      />

      {/* Compatibility Matrix */}
      <section className="space-y-6">
        <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-black uppercase italic tracking-tight">System Compatibility</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 border rounded-2xl text-center space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground">X-Plane 11</p>
                <p className="text-sm font-bold text-green-600 uppercase">Optimized</p>
            </div>
            <div className="p-4 bg-muted/50 border rounded-2xl text-center space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground">X-Plane 12</p>
                <p className="text-sm font-bold text-green-600 uppercase">Optimized</p>
            </div>
            <div className="p-4 bg-muted/50 border rounded-2xl text-center space-y-1 opacity-50">
                <p className="text-[10px] font-black uppercase text-muted-foreground">MSFS 2024</p>
                <p className="text-sm font-bold text-primary uppercase">In Beta</p>
            </div>
        </div>
      </section>

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
                    Keep this folder on your Desktop. Launch it via the <code className="font-mono">.bat</code> (Windows) or <code className="font-mono">.command</code> (Mac) file.
                </p>
            </Card>
        </div>
      </section>

      {/* Mac Specific Permissions Section */}
      <section className="space-y-6">
          <div className="flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-black uppercase italic tracking-tight">macOS: Fix Access Privileges</h2>
          </div>
          <div className="space-y-4">
              <div className="p-6 bg-muted/30 border-2 rounded-2xl space-y-6">
                  <div className="space-y-2">
                      <h4 className="font-bold text-sm uppercase text-primary">The Quick Terminal Fix</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                          If you see an error about "appropriate access privileges," you must manually grant permission:
                      </p>
                      <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                          <li>Open the <strong>Terminal</strong> app.</li>
                          <li>Type <code className="bg-black text-[#00ff41] px-2 py-0.5 rounded font-bold">chmod +x </code> <span className="text-red-500 font-black underline">(Ensure there is a SPACE after the x)</span></li>
                          <li>Drag the <code className="font-mono text-foreground">LAUNCH_BRIDGE.command</code> file directly into the window.</li>
                          <li>Press <strong>Enter</strong>.</li>
                      </ol>
                  </div>
                  
                  <Separator />

                  <div>
                      <h4 className="font-bold text-sm mb-1 uppercase text-primary">Bypassing the Security Warning</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                          If macOS says the file is from an unidentified developer:<br />
                          1. <strong>Right-click</strong> the file and select <strong>Open</strong>.<br />
                          2. Click <strong>Open</strong> again in the security pop-up.
                      </p>
                  </div>
              </div>
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
                        <Cpu className="w-5 h-5 text-primary" />
                        <h4 className="font-black text-sm uppercase">Tactical Bridge (Desktop)</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-grow">
                        A high-fidelity standalone application for your second monitor. Best for complex mission coordination, viewing regional traffic, and managing AI Dispatcher radio comms.
                    </p>
                </Card>
                <Card className="p-6 bg-muted/30 border-2 flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-4">
                        <Terminal className="w-5 h-5 text-primary" />
                        <h4 className="font-black text-sm uppercase">Cockpit EFB (Tablet)</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-grow">
                        A browser-based mobile interface optimized for iPads and tablets. Includes simplified mapping, patient medical reports, and interactive mission checklists.
                    </p>
                </Card>
            </div>
          </div>

          {/* Section 2: Launching */}
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tight border-b-2 border-primary/20 pb-2">Launching the System</h2>
            <ol className="space-y-4">
              <li>
                  <strong>Start Simulator:</strong> Ensure your aircraft is on the ramp and FlyWithLua script is active.
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