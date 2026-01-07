import SimulatorPackageCard from '@/components/simulator/SimulatorPackageCard';
import { simulatorPackages } from '@/data/simulatorPackages';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Code, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const Plugins = () => {
    const { profile, isLoading } = useProfileManagement();

    if (isLoading) {
        return (
            <div className="flex justify-center p-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-8">
            <PageHeader 
                title="Tactical Integration Hub"
                description="Connect your simulator to the HEMS network for live telemetry and mission data."
                icon={Code}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {simulatorPackages.map(pkg => (
                    <SimulatorPackageCard key={pkg.id} pkg={pkg} apiKey={profile?.api_key || ''} />
                ))}
            </div>
        </div>
    );
};

export default Plugins;