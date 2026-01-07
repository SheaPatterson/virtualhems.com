import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, LayoutDashboard, Zap, History, FileText, Users, MapPin, Download, BookOpen, Settings, Hospital, Code, MessageSquare, Image, Satellite, Map, Activity, Plane, Shield, Megaphone, HeartPulse, DollarSign, Book, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { signOut } from '@/integrations/supabase/auth';
import { useAuth } from './AuthGuard';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    public?: boolean;
    premium?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const operationSections: NavSection[] = [
    {
        title: "Flight Operations",
        items: [
            { href: '/dashboard', label: 'Operations Command', icon: LayoutDashboard },
            { href: '/generate', label: 'Mission Dispatcher', icon: Zap, premium: true },
            { href: '/logbook', label: 'Personal Logbook', icon: Book },
            { href: '/live-tracking', label: 'Tactical Flight Following', icon: Satellite, premium: true },
            { href: '/mission-history', label: 'Mission Archive', icon: History },
        ],
    },
    {
        title: "Safety & Compliance",
        items: [
            { href: '/incident-reports', label: 'Safety Management System', icon: Shield },
            { href: '/flight-planning', label: 'Flight Guides & SOPs', icon: Plane, public: true },
            { href: '/documentation', label: 'Technical Manual', icon: BookOpen, public: true },
        ],
    },
    {
        title: "Regional Assets",
        items: [
            { href: '/hospital-directory', label: 'Facility Registry', icon: Hospital },
            { href: '/helicopter-bases', label: 'HEMS Bases', icon: MapPin },
            { href: '/operational-map', label: 'Regional Tactical Map', icon: Map },
            { href: '/hospital-scenery', label: 'LZ Visual Gallery', icon: Image },
        ],
    },
    {
        title: "Community & Tools",
        items: [
            { href: '/pilot-directory', label: 'Personnel Manifest', icon: Users },
            { href: '/plugins', label: 'Tactical Integration Hub', icon: Code, public: true },
            { href: '/downloads', label: 'Resource Library', icon: Download, public: true },
            { href: '/community', label: 'Crew Q&A Board', icon: MessageSquare },
            { href: '/discord', label: 'Discord Community', icon: MessageSquare },
        ],
    },
];

const adminSections: NavSection[] = [
    {
        title: "HQ Command",
        items: [
            { href: '/admin/overview', label: 'Admin Hub', icon: Settings },
            { href: '/admin/live-ops', label: 'Live Operations', icon: Activity },
            { href: '/admin/notams', label: 'NOTAM Broadcast', icon: Megaphone },
            { href: '/admin/permission', label: 'RBAC Security', icon: Shield },
        ],
    },
    {
        title: "Asset Management",
        items: [
            { href: '/admin/aircraft', label: 'Aircraft Fleet', icon: Plane },
            { href: '/admin/crew-bases', label: 'Crew Bases', icon: MapPin },
            { href: '/admin/hospitals', label: 'Facility Registry', icon: Hospital },
            { href: '/admin/hospital-scenery', label: 'Scenery Assets', icon: Image },
            { href: '/admin/content', label: 'Content Engine', icon: FileText },
            { href: '/admin/downloads', label: 'Download Assets', icon: Download },
        ],
    }
];

const MobileSidebarLink: React.FC<{ href: string; label: string; icon: React.ElementType; onLinkClick: () => void; isLocked?: boolean }> = ({ href, label, icon: Icon, onLinkClick, isLocked }) => {
    const location = useLocation();
    const isActive = !isLocked && (location.pathname === href || (href === '/dashboard' && location.pathname === '/'));

    return (
        <Link
            to={isLocked ? '/pricing' : href}
            onClick={onLinkClick}
            className={cn(
                "flex items-center p-3 rounded-md text-base font-medium transition-colors",
                isActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : isLocked
                    ? "text-muted-foreground/50 hover:bg-primary/5"
                    : "text-foreground hover:bg-muted hover:text-primary"
            )}
        >
            <Icon className="w-5 h-5 mr-3" />
            <span className={cn(isLocked && "line-through")}>{label}</span>
            {isLocked && <Lock className="w-4 h-4 ml-auto text-primary" />}
        </Link>
    );
};

const MobileNav: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { isAdmin } = useUserRole();
    const { profile } = useProfileManagement();
    const isSubscribed = profile?.is_subscribed ?? false;
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        setIsOpen(false);
    };

    const handleLinkClick = () => {
        setIsOpen(false);
    };

    const isAdminRoute = location.pathname.startsWith('/admin');
    const sections = isAdminRoute ? adminSections : operationSections;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden relative z-[40]">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 flex flex-col z-[1000]">
                <SheetHeader className="p-6 pb-2 border-b">
                    <SheetTitle className="flex items-center space-x-3">
                        <HeartPulse className="h-10 w-10 text-primary" />
                        <span className="text-xl font-black italic tracking-tighter uppercase text-primary text-shadow-primary">HEMS Ops</span>
                    </SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="flex-grow px-4 mt-4">
                    <nav className="space-y-6 pb-6">
                        {sections.map((section) => (
                            <div key={section.title} className="space-y-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 mb-1 opacity-60">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => {
                                        const isVisible = user ? true : item.public;
                                        if (!isVisible) return null;
                                        
                                        const isLocked = item.premium && !isSubscribed && !isAdmin;
                                        return (
                                            <MobileSidebarLink 
                                                key={item.href} 
                                                {...item} 
                                                onLinkClick={handleLinkClick}
                                                isLocked={isLocked}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        
                        {user && isAdmin && (
                            <>
                                <Separator className="my-4 opacity-50" />
                                <MobileSidebarLink
                                    href={isAdminRoute ? '/dashboard' : '/admin/overview'}
                                    label={isAdminRoute ? 'Exit HQ Command' : 'Enter HQ Command'}
                                    icon={isAdminRoute ? LayoutDashboard : Settings}
                                    onLinkClick={handleLinkClick}
                                />
                            </>
                        )}
                    </nav>
                </ScrollArea>
                
                <div className="p-4 border-t bg-muted/20 space-y-3">
                    {!user ? (
                        <>
                            <Button asChild className="w-full h-12 bg-primary font-black italic shadow-xl hover:shadow-primary/20 transition-all rounded-xl">
                                <Link to="/pricing" onClick={handleLinkClick}>
                                    <DollarSign className="w-4 h-4 mr-2" /> SECURE ACCESS
                                </Link>
                            </Button>
                            <Button asChild variant="link" className="w-full text-xs text-muted-foreground">
                                <Link to="/login" onClick={handleLinkClick}>
                                    Already a member? Log In
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleSignOut} variant="outline" className="w-full font-bold uppercase text-xs tracking-widest">
                            <LogOut className="w-4 h-4 mr-2" /> DISCONNECT
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MobileNav;