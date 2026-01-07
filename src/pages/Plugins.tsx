import { Code, Terminal, Download, Zap, ShieldCheck, ChevronRight, Tablet, Monitor } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProfileManagement } from '@/hooks/useProfileManagement';

const DeploymentStep = ({ num, title, description, badge, children }: any) => (
    <div className="relative pl-12 pb-12 last:pb-0">
        <div className="absolute left-0 top-0 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-black italic shadow-lg shadow-primary/20 z-10">
            {num}
        </div>
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-primary/10" />
        
        <div className="space-y-4">
            <div className="flex items-center space-x-3">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">{title}</h3>
                {badge && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">{badge}</Badge>}
            </div>
            <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">{description}</p>
            <div className="pt-2">{children}</div>
        </div>
    </div>
);

const Plugins = () => {
    const { profile } = useProfileManagement();
    const apiKey = profile?.api_key || 'LOGIN_TO_VIEW_KEY';

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl space-y-12">
            <PageHeader 
                title="Tactical Integration Hub"
                description="Initialize your flight environment. Current Protocol: v5.2-STABLE"
                icon={Code}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-2">
                    <DeploymentStep 
                        num="01" 
                        title="Establish the Data Pipe" 
                        description="The Lua Uplink script is the 'heartbeat' of the system. It reads your aircraft telemetry and streams it to the bridge interface."
                        badge="Sim Side"
                    >
                        <Card className="border-2 border-primary/20 bg-primary/5">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-black rounded-xl"><Terminal className="w-6 h-6 text-primary" /></div>
                                    <div>
                                        <p className="font-bold text-sm">hems-dispatch-xp.lua</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Requires FlyWithLua Plugin</p>
                                    </div>
                                </div>
                                <Button asChild className="h-12 px-8 font-black italic uppercase shadow-xl rounded-xl">
                                    <a href="/downloads/hems-dispatch-xp.lua" download>
                                        <Download className="w-4 h-4 mr-2" /> Get Uplink Script
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </DeploymentStep>

                    <DeploymentStep 
                        num="02" 
                        title="Initialize Tactical Bridge" 
                        description="The new v5.2 Bridge is a standalone cockpit overlay. It handles AI dispatch comms, regional radar, and real-time mapping on your second monitor."
                        badge="Stand-alone"
                    >
                        <Card className="border-2 border-primary/10 bg-card/40 backdrop-blur-sm">
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-muted rounded-xl"><Monitor className="w-6 h-6 text-muted-foreground" /></div>
                                    <div>
                                        <p className="font-bold text-sm">Tactical Bridge UI (Desktop)</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Windows / Mac / Linux (Node.js)</p>
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="h-12 px-8 border-2 font-black italic uppercase rounded-xl">
                                    <a href="/downloads/hems-dispatch" download>
                                        <Download className="w-4 h-4 mr-2" /> Download Bridge UI
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </DeploymentStep>

                    <DeploymentStep 
                        num="03" 
                        title="Secure Authentication" 
                        description="Once the Bridge is running, enter your unique API key to link your simulator session to the Global HEMS Network."
                    >
                        <div className="p-6 bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl space-y-4 max-w-md">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-primary/60 flex items-center">
                                    <ShieldCheck className="w-3 h-3 mr-1" /> Tactical Uplink Token
                                </span>
                                <Link to="/user" className="text-[9px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">Manage Key</Link>
                            </div>
                            <div className="bg-black border border-primary/20 p-3 rounded-lg font-mono text-sm text-primary select-all cursor-copy truncate">
                                {apiKey}
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Keep this key confidential. It identifies your aircraft in the theater.</p>
                        </div>
                    </DeploymentStep>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-primary/5 border-2 border-primary/20 overflow-hidden rounded-[2rem]">
                        <CardContent className="p-8 space-y-6">
                            <div className="p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl">
                                <Tablet className="w-8 h-8 mb-3" />
                                <h4 className="font-black italic uppercase text-lg leading-tight">Going Mobile?</h4>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                                Don't want to run a standalone app? Use the **Cockpit EFB** optimized for iPad/Tablet browsers.
                            </p>
                            <Button asChild variant="link" className="p-0 h-auto text-[10px] font-black uppercase text-primary">
                                <Link to="/documentation" className="flex items-center">
                                    View EFB Protocols <ChevronRight className="w-3 h-3 ml-1" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 rounded-[2rem] bg-zinc-950 text-white overflow-hidden group">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center space-x-3 text-orange-500">
                                <Zap className="w-6 h-6 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">In-Browser Test</span>
                            </div>
                            <h4 className="text-xl font-black italic uppercase tracking-tight">Logic Tester</h4>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Test mission dispatch logic and AI radio comms without launching your simulator.
                            </p>
                            <Button asChild className="w-full bg-white text-black font-black italic uppercase rounded-xl h-12 hover:bg-orange-500 transition-colors">
                                <Link to="/simulator-client">Open Web Tester</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="opacity-50" />

            <div className="bg-muted/30 p-10 rounded-[3rem] border-2 border-dashed flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-black italic uppercase">System Verification</h4>
                    <p className="text-sm text-muted-foreground font-medium max-w-xl">
                        Verify your local bridge is communicating correctly by checking the **Operational Map** on your dashboard after takeoff. Your aircraft should appear as a live track.
                    </p>
                </div>
                <Button asChild variant="outline" className="h-14 px-10 border-2 font-black uppercase rounded-2xl">
                    <Link to="/live-tracking">View Live Theater</Link>
                </Button>
            </div>
        </div>
    );
};

export default Plugins;