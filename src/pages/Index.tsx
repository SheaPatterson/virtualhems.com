import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { 
    Users, Zap, Database, Activity, 
    DollarSign, Navigation, LogIn, LayoutDashboard, 
    ShieldCheck, MessageSquare, Hospital, Check, X 
} from 'lucide-react';
import { useAuth } from '@/components/AuthGuard';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; badge?: string }> = ({ icon, title, description, badge }) => (
    <Card className="flex flex-col items-start text-left p-8 h-full border-primary/10 hover:border-primary/40 transition-all hover:shadow-2xl bg-card/50 backdrop-blur-md relative overflow-hidden group">
        {badge && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-lg">
                {badge}
            </div>
        )}
        <div className="text-primary mb-6 p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <CardTitle className="text-xl mb-4 font-black uppercase tracking-tighter italic">{title}</CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {description}
        </p>
    </Card>
);

const FeatureListItem: React.FC<{ children: React.ReactNode, included: boolean }> = ({ children, included }) => (
    <li className={`flex items-start space-x-3 ${!included && "text-muted-foreground line-through opacity-60"}`}>
        {included ? <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />}
        <span>{children}</span>
    </li>
);

const Index = () => {
    const { user } = useAuth();
    const videoUrl = "https://orhfcrrydmgxradibbqb.supabase.co/storage/v1/object/public/operational-assets/assets/1766281947169-uq0mpp.mp4";

    const logos = [
        { src: "/logos/xp12.png", alt: "X-Plane 12" },
        { src: "/logos/msfs2024.png", alt: "MSFS 2024" },
        { src: "/logos/msfs2020.png", alt: "MSFS 2020" },
        { src: "/logos/xp11.png", alt: "X-Plane 11" },
    ];

    return (
        <div className="bg-background min-h-screen selection:bg-primary/30 font-sans overflow-x-hidden">
            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-24 pb-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,165,0,0.05)_0%,transparent_70%)] pointer-events-none" />
                
                <header className="text-center space-y-10 relative z-10">
                    <div className="flex justify-center">
                        <div className="p-2 bg-primary/5 rounded-[3rem] shadow-[0_0_50px_rgba(255,165,0,0.1)] border border-primary/20 relative group">
                            <img 
                                src="/logo-main.png" 
                                alt="HEMS Simulation Logo" 
                                className="w-48 h-48 md:w-64 md:h-64 object-contain transition-all duration-1000 group-hover:scale-105" 
                            />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest border-4 border-background whitespace-nowrap">
                                Operational Environment v4.2
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="inline-flex items-center space-x-3 text-primary bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
                            <Activity className="w-4 h-4 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Global HEMS Data Link</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-foreground italic uppercase leading-[0.8] mb-4">
                            HEMS <span className="text-primary text-shadow-primary">OPS-CENTER</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-tight opacity-80">
                            Professional-grade flight following and mission coordination for the serious flight simulation pilot.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                        {!user ? (
                            <Button asChild size="lg" className="text-lg h-16 px-14 shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 bg-primary text-primary-foreground font-black italic rounded-2xl">
                                <Link to="/login">
                                    <LogIn className="w-5 h-5 mr-2" /> Start Your Tour of Duty
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="text-lg h-16 px-14 shadow-2xl hover:shadow-primary/20 transition-all hover:scale-105 bg-primary text-primary-foreground font-black italic rounded-2xl">
                                    <Link to="/dashboard">
                                        <LayoutDashboard className="w-5 h-5 mr-2" /> Access Command Center
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="text-lg h-16 px-10 border-2 font-black italic rounded-2xl bg-background/50 backdrop-blur-sm">
                                    <Link to="/pricing">
                                        <DollarSign className="w-4 h-4 mr-1" /> Premium Access
                                    </Link>
                                </Button>
                            </div>
                        )}
                        <Button asChild variant="outline" size="lg" className="text-lg h-16 px-14 border-2 font-bold uppercase tracking-widest hover:bg-muted rounded-2xl bg-background/50 backdrop-blur-sm">
                            <Link to="/documentation">
                                View SOPs
                            </Link>
                        </Button>
                    </div>
                </header>
            </div>

            <div className="w-full bg-muted/30 border-y border-border/50 py-12 mb-10 overflow-hidden">
                <div className="container mx-auto px-4">
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8">
                        Validated Cross-Platform Support
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {logos.map((logo) => (
                            <img 
                                key={logo.alt} 
                                src={logo.src} 
                                alt={logo.alt} 
                                className="h-8 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <section className="container mx-auto px-4 py-24">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center space-x-2 text-primary">
                                <div className="h-px w-8 bg-primary" />
                                <span className="text-xs font-black uppercase tracking-widest">The Mission Cycle</span>
                            </div>
                            <h2 className="text-5xl font-black italic uppercase leading-[0.9] tracking-tighter">
                                TOTAL FLIGHT <br />
                                <span className="text-primary">SYNCHRONIZATION</span>
                            </h2>
                        </div>
                        
                        <div className="space-y-6 text-muted-foreground font-medium">
                            <p className="text-lg leading-relaxed">
                                HEMS OPS-CENTER isn't just a flight logger—it's a complete ecosystem that bridges the gap between your simulation software and real-world air medical operations.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-foreground font-black uppercase text-sm">
                                        <Zap className="w-4 h-4 text-primary" />
                                        <span>Instant Setup</span>
                                    </div>
                                    <p className="text-xs">Uplink established via a single Lua script or WASM package. No complex configuration required.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-foreground font-black uppercase text-sm">
                                        <Activity className="w-4 h-4 text-primary" />
                                        <span>Live Comms</span>
                                    </div>
                                    <p className="text-xs">Interactive AI Dispatchers guide you through every phase of the mission with contextual radio calls.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-foreground font-black uppercase text-sm">
                                        <Navigation className="w-4 h-4 text-primary" />
                                        <span>Route Logic</span>
                                    </div>
                                    <p className="text-xs">3-leg circuit verification ensures you have the fuel and weather minimums to complete the life-saving mission.</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-foreground font-black uppercase text-sm">
                                        <Database className="w-4 h-4 text-primary" />
                                        <span>Global Assets</span>
                                    </div>
                                    <p className="text-xs">Access a curated database of regional landing zones, trauma center briefings, and visual packages.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="aspect-video rounded-[3rem] overflow-hidden border-2 border-primary/20 shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-black relative group">
                            <video 
                                src={videoUrl} 
                                controls 
                                autoPlay 
                                muted 
                                playsInline 
                                loop 
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000" 
                            />
                            <div className="absolute top-8 left-8 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 flex items-center space-x-4 shadow-2xl">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white font-black uppercase tracking-[0.2em] leading-none mb-1">Encrypted Telemetry</span>
                                    <span className="text-[8px] text-primary/80 font-mono uppercase tracking-widest leading-none">Status: Uplink Nominal</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 py-24 border-t border-border/50">
                <div className="text-center mb-20 space-y-4">
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">The Tactical Advantage</p>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">OPERATIONAL CAPABILITIES</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="w-8 h-8" />}
                        title="Mission Dispatcher"
                        description="Generate complex, multi-leg missions with AI-assisted patient scenarios. The system validates your flight plan against fuel, weather, and aircraft performance for a go/no-go decision."
                        badge="Premium"
                    />
                    <FeatureCard
                        icon={<Activity className="w-8 h-8" />}
                        title="Live Flight Following"
                        description="Experience true command center oversight. Your aircraft's position, altitude, and fuel state are streamed in real-time to a global tactical map for all users to see."
                        badge="Premium"
                    />
                    <FeatureCard
                        icon={<MessageSquare className="w-8 h-8" />}
                        title="AI Tactical Controller"
                        description="Engage with a mission-aware AI dispatcher that provides contextual radio calls, weather updates, and patient handoff reports via realistic text-to-speech."
                        badge="Premium"
                    />
                    <FeatureCard
                        icon={<Users className="w-8 h-8" />}
                        title="Personnel Manifest"
                        description="Build your professional pilot identity. Track flight hours, log experience, and showcase your simulator setup in the global pilot directory."
                    />
                    <FeatureCard
                        icon={<Hospital className="w-8 h-8" />}
                        title="Facility Registry"
                        description="Access a curated database of regional hospitals, landing zones, and trauma center briefings with detailed visual briefings and scenery downloads."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="w-8 h-8" />}
                        title="Safety Management (SMS)"
                        description="Document operational hazards and maintenance discrepancies. Our integrated reporting system mirrors professional safety protocols."
                    />
                </div>
            </section>

            {/* New Subscription Section */}
            <section className="container mx-auto px-4 py-24 border-t border-border/50">
                <div className="text-center mb-16 space-y-4">
                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Access Tiers</p>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">Find Your Flight Plan</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
                    <Card className="shadow-lg rounded-3xl h-full flex flex-col">
                        <CardHeader className="p-8">
                            <CardTitle className="text-3xl font-black tracking-tight">Basic Access</CardTitle>
                            <CardDescription className="text-base">
                                <span className="text-4xl font-black text-foreground">$0</span> / month
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 flex-grow">
                            <p className="text-sm mb-6">For casual pilots and community members.</p>
                            <ul className="space-y-4">
                                <FeatureListItem included={true}>Pilot Directory & Profile</FeatureListItem>
                                <FeatureListItem included={true}>View Mission History & Reports</FeatureListItem>
                                <FeatureListItem included={true}>File Safety Incident Reports (SMS)</FeatureListItem>
                                <FeatureListItem included={true}>Access Community Forums</FeatureListItem>
                                <FeatureListItem included={false}>Mission Planning & Dispatch</FeatureListItem>
                                <FeatureListItem included={false}>Live Flight Following & Telemetry</FeatureListItem>
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 bg-muted/30 rounded-b-3xl">
                            <Button variant="outline" className="w-full h-12 text-lg font-bold" disabled>
                                Your Current Plan
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="border-4 border-primary shadow-2xl rounded-3xl relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-black px-6 py-1.5 rounded-bl-2xl uppercase tracking-widest">
                            Recommended
                        </div>
                        <CardHeader className="p-8">
                            <CardTitle className="text-3xl font-black tracking-tight flex items-center">
                                <Zap className="w-6 h-6 mr-2 text-primary" /> Premium
                            </CardTitle>
                            <CardDescription className="text-base">
                                <span className="text-4xl font-black text-primary">$11.99</span> / month
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 flex-grow">
                            <p className="text-sm mb-6">The complete suite for professional-grade simulation.</p>
                            <ul className="space-y-4">
                                <FeatureListItem included={true}><strong>All Basic Features, plus:</strong></FeatureListItem>
                                <FeatureListItem included={true}>Full Mission Planning & Dispatch System</FeatureListItem>
                                <FeatureListItem included={true}>Live Global Flight Following & Telemetry</FeatureListItem>
                                <FeatureListItem included={true}>AI Tactical Controller Comms</FeatureListItem>
                                <FeatureListItem included={true}>In-Browser Simulator Client Access</FeatureListItem>
                            </ul>
                        </CardContent>
                        <CardFooter className="p-8 bg-primary/5 rounded-b-3xl">
                            <Button asChild className="w-full h-14 text-lg font-black italic uppercase shadow-xl">
                                <Link to="/pricing">Upgrade to Premium</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>

            <section className="container mx-auto px-4 py-32">
                <Card className="bg-zinc-950 border-none rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                    <CardContent className="p-16 md:p-24 flex flex-col items-center text-center space-y-10 relative z-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Ready for Dispatch?</h2>
                            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                                Join the elite network of simulation pilots elevating their training environment to professional standards.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
                            <Button asChild size="lg" className="flex-grow h-16 bg-primary text-primary-foreground font-black italic uppercase rounded-2xl shadow-xl hover:scale-105 transition-all">
                                <Link to="/login">Register Personnel</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="flex-grow h-16 border-2 border-white/20 text-white font-black italic uppercase rounded-2xl hover:bg-white/5 transition-all">
                                <Link to="/pricing">View Plans</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};

export default Index;