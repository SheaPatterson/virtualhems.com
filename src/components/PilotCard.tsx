import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, User, MapPin, Globe, Linkedin, MessageCircle, Activity, Star, Clock, Zap } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePilotRank } from '@/utils/pilotRankUtils';
import { usePilotSummary, useActiveMissions } from '@/hooks/useMissions';
import { cn } from '@/lib/utils';

interface PilotCardProps {
    profile: Profile;
}

const PilotCard: React.FC<PilotCardProps> = ({ profile }) => {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'HEMS Crew Member';
    const initials = (profile.first_name?.[0] || '') + (profile.last_name?.[0] || '');

    // Fetch real stats from the summary hook
    const stats = usePilotSummary(profile.id);
    const { data: activeMissions } = useActiveMissions();
    
    const rank = calculatePilotRank(stats.count);
    const totalHours = (stats.totalMinutes / 60).toFixed(1);
    
    // Check if pilot is currently flying
    const activeMission = activeMissions?.find(m => m.user_id === profile.id);
    const isOnDuty = !!activeMission;

    return (
        <Card className={cn(
            "hover:shadow-2xl transition-all border-l-4 group bg-card/40 backdrop-blur-sm overflow-hidden relative",
            isOnDuty ? "border-green-600" : "border-primary"
        )}>
            <CardContent className="p-6 flex flex-col space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="relative">
                            <Avatar className="h-20 w-20 border-4 border-background shadow-lg transition-transform group-hover:rotate-3">
                                <AvatarImage src={profile.avatar_url || undefined} alt={fullName} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black italic">{initials || <User />}</AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background shadow-sm flex items-center justify-center text-white",
                                rank.color
                            )}>
                                <Star className="w-2.5 h-2.5 fill-current" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black tracking-tighter uppercase italic leading-none">{fullName}</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <Badge className={cn("text-[9px] uppercase font-black tracking-widest px-2 py-0 border-none", rank.color)}>
                                    {rank.title}
                                </Badge>
                                {isOnDuty && (
                                    <Badge className="bg-green-600 text-[9px] uppercase font-black tracking-widest px-2 py-0 animate-pulse border-none">
                                        ON DUTY
                                    </Badge>
                                )}
                                {profile.location && (
                                    <span className="flex items-center text-[10px] font-bold text-muted-foreground uppercase">
                                        <MapPin className="w-3 h-3 mr-1 text-primary" /> {profile.location}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {isOnDuty ? (
                        <div className="p-2 bg-green-500/10 rounded-full">
                            <Activity className="w-6 h-6 text-green-600 animate-[pulse_2s_infinite]" />
                        </div>
                    ) : (
                        <Activity className="w-6 h-6 text-primary/20 shrink-0 group-hover:text-primary transition-colors" />
                    )}
                </div>

                {profile.bio && (
                    <div className="relative">
                        <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2 pl-4 border-l-2 border-primary/20">
                            "{profile.bio}"
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1 flex items-center">
                            <Zap className="w-2 h-2 mr-1 text-primary" /> Service Record
                        </p>
                        <div className="flex items-center text-xs font-bold italic justify-between">
                            <span className="text-muted-foreground">Dispatches:</span>
                            <span className="font-mono text-primary">{stats.count}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1 flex items-center">
                            <Clock className="w-2 h-2 mr-1 text-primary" /> Air Time
                        </p>
                        <div className="flex items-center text-xs font-bold italic justify-between">
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="font-mono text-primary">{totalHours}</span>
                        </div>
                    </div>
                </div>

                {isOnDuty && activeMission && (
                    <div className="p-3 bg-green-600/5 rounded-xl border border-green-600/20 animate-in fade-in zoom-in duration-500">
                        <p className="text-[8px] font-black uppercase text-green-700 dark:text-green-400 tracking-[0.2em] mb-1">Active Assignment</p>
                        <p className="text-xs font-bold italic flex items-center justify-between">
                            <span>{activeMission.missionId}</span>
                            <span className="text-muted-foreground">Enroute {activeMission.destination.name}</span>
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                    <div className="flex items-center space-x-3">
                        {profile.social_links?.linkedin && (
                            <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        )}
                        {profile.social_links?.website && (
                            <a href={profile.social_links.website} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Globe className="w-4 h-4" />
                            </a>
                        )}
                        {profile.social_links?.discord && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-muted-foreground hover:text-primary cursor-help transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="font-bold">Discord: {profile.social_links.discord}</TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    
                    <div className="flex items-center text-[10px] font-black font-mono text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        <Mail className="w-3 h-3 mr-2" />
                        {profile.email_public || 'SECURE'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PilotCard;