import { Loader2, Zap } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useHemsData } from '@/hooks/useHemsData';
import MissionPlanner from "@/components/mission-planning/MissionPlanner";
import PageHeader from '@/components/PageHeader';

const MissionPlanningPage = () => {
  const { hospitals, bases, helicopters, isLoading, isError } = useHemsData();

  if (isLoading) {
    return (
        <div className="container mx-auto max-w-4xl flex flex-col justify-center items-center h-64 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Planner Modules...</p>
        </div>
    );
  }

  if (isError || hospitals.length === 0 || bases.length === 0 || helicopters.length === 0) {
    return (
        <div className="container mx-auto max-w-4xl p-8">
            <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="pt-6 text-center space-y-4">
                    <p className="text-destructive font-bold text-lg">Operational Data Link Failure</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Failed to load essential HEMS data (Hospitals, Bases, or Helicopters). 
                        Please ensure the system database is populated and RLS policies allow read access for authenticated personnel.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8 space-y-8">
        <PageHeader 
            title="Mission Dispatch Planner"
            description="Coordinate emergency scene calls and inter-facility hospital transfers."
            icon={Zap}
        />
        
        <MissionPlanner 
            hospitals={hospitals}
            bases={bases}
            helicopters={helicopters}
        />
    </div>
  );
};

export default MissionPlanningPage;