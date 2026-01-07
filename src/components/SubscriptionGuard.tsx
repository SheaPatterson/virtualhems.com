import React from 'react';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Loader2, Zap, ShieldCheck, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Outlet } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface SubscriptionGuardProps {
  children?: React.ReactNode;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { profile, isLoading: isProfileLoading } = useProfileManagement();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();

  const isLoading = isProfileLoading || isRoleLoading;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verifying Service Level...</p>
      </div>
    );
  }

  const isSubscribed = profile?.is_subscribed ?? false;

  // Grant access if the user is subscribed OR is an admin
  if (isSubscribed || isAdmin) {
    return children ? <>{children}</> : <Outlet />;
  }

  // If not subscribed and not an admin, show the upsell page
  return (
    <div className="container mx-auto p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="border-4 border-primary/50 bg-primary/5 shadow-2xl overflow-hidden rounded-[2.5rem]">
        <CardHeader className="text-center p-10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-4 border-primary/20 mb-6">
              <Zap className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-primary">
            Premium Access Required
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2 max-w-xl mx-auto">
            This feature is part of the <strong>HEMS OPS-CENTER Premium</strong> subscription, designed for the most dedicated simulation pilots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 text-center bg-background/50 p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                  <h3 className="font-bold text-lg">Your Current Plan Includes:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Pilot Directory Access</li>
                      <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Mission History Logbook</li>
                      <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-green-500" /> Safety Incident Reporting</li>
                  </ul>
              </div>
              <div className="space-y-4 p-6 rounded-2xl bg-primary/10 border-2 border-primary/20">
                  <h3 className="font-bold text-lg text-primary">Upgrade to Unlock:</h3>
                  <ul className="space-y-2 text-sm">
                      <li className="flex items-center font-semibold"><ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Mission Planning & Dispatch</li>
                      <li className="flex items-center font-semibold"><ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Live Flight Following</li>
                      <li className="flex items-center font-semibold"><ShieldCheck className="w-4 h-4 mr-2 text-primary" /> AI Tactical Controller Comms</li>
                      <li className="flex items-center font-semibold"><ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Simulator Client Access</li>
                  </ul>
              </div>
          </div>
          <Button asChild size="lg" className="h-16 px-14 text-lg font-black italic uppercase shadow-xl transition-transform hover:scale-105 rounded-2xl">
            <Link to="/pricing">
              Upgrade to Premium
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;