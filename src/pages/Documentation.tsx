import { Card } from '@/components/ui/card';
import { BookOpen, ShieldCheck, Terminal, Cpu, Zap, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';
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
            <h2 className="text-2xl font-black uppercase italic tracking-tight">X-Plane Quick Start Checklist</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><Zap className="w-12 h-12" /></div>
                <h4 className="font-black text-primary uppercase text-xs mb-3">1. The Engine</h4>
                <p className="text-xs font-bold mb-4">Install X-Plane Web API</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Download the "X-Plane Web API" plugin from GitHub/Forums. This allows external apps to read your flight data.</p>
            </Card>
            <Card className="p-6 border-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><Terminal className="w-12 h-12" /></div>
                <h4 className="font-black text-primary uppercase text-xs mb-3">2. The Pipe</h4>
                <p className="text-xs font-bold mb-4">HEMS Lua Uplink</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Download the .lua script from our <Link to="/plugins" className="underline">Hub</Link> and drop it into your FlyWithLua Scripts folder.</p>
            </Card>
            <Card className="p-6 border-2 border-primary bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><Cpu className="w-12 h-12" /></div>
                <h4 className="font-black text-primary uppercase text-xs mb-3">3. The HUD</h4>
                <p className="text-xs font-bold mb-4">HEMS Tactical Bridge</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Download the Bridge UI (.zip), extract it, and run "npm start". This is your tactical mission window.</p>
            </Card>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="prose prose-orange dark:prose-invert max-w-none space-y-12">
          {/* Section 1: Core Architecture */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">Technical Overview</h2>
            <p>
              The HEMS Bridge acts as a <strong>Sidecar Process</strong>. It establishes a local link with your simulator's Web API and a secure cloud uplink with the HEMS OPS-CENTER.
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
                    <p className="text-[10px] text-muted-foreground">Uses high-speed REST protocols for real-time positional data.</p>
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
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">Bridge Setup</h2>
            <ol className="space-y-4">
              <li>
                  <strong>Extract & Install:</strong> Once downloaded, navigate to the folder in your terminal and run:
                  <div className="bg-black text-[#00ff41] p-3 rounded-lg font-mono text-xs mt-2">npm install && npm start</div>
              </li>
              <li>
                  <strong>Secure Auth:</strong> Enter your <strong>Unique API Key</strong> found on your <Link to="/user" className="text-primary font-bold hover:underline">Personnel Profile</Link> into the Bridge UI.
              </li>
              <li>
                  <strong>Port Conflict:</strong> The Bridge defaults to port <strong>8080</strong>. If this port is occupied, the app will ask to use the next available port.
              </li>
            </ol>
          </div>

          {/* Section 4: EFB Integration */}
          <div>
            <h2 className="text-3xl font-black uppercase italic tracking-tight border-b-2 border-primary/20 pb-2">Tablet / EFB Sync</h2>
            <p>
              Use the <strong>EFB Mode</strong> for a secondary flight display on your iPad or Android tablet.
            </p>
            <div className="bg-muted p-6 rounded-2xl border flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-full"><Zap className="w-6 h-6 text-primary" /></div>
                <div className="space-y-2">
                    <p className="font-bold uppercase text-xs">Zero-Config Mobile Link:</p>
                    <p className="text-sm text-muted-foreground">Navigate to your mission tracking page and scan the QR code. This creates a direct link to your active telemetry stream.</p>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Documentation;