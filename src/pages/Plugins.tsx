import { Code } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { simulatorPackages } from '@/data/simulatorPackages';
import SimulatorPackageCard from '@/components/simulator/SimulatorPackageCard';

const Plugins = () => {
    const { profile } = useProfileManagement();
    const apiKey = profile?.api_key || 'LOGIN_TO_VIEW_KEY';

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-12">
            <PageHeader 
                title="Tactical Integration Hub"
                description="Initialize your flight environment. Current Protocol: v5.2-STABLE"
                icon={Code}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {simulatorPackages.map((pkg) => (
                    <SimulatorPackageCard key={pkg.id} pkg={pkg} apiKey={apiKey} />
                ))}
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