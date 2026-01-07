import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Zap, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const SubscriptionManager: React.FC = () => {
    const { profile, isLoading, initiateCustomerPortal, isInitiatingPortal } = useProfileManagement();
    
    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    const isSubscribed = profile?.is_subscribed ?? false;

    return (
        <Card className={isSubscribed ? "border-2 border-green-600/50 bg-green-600/5" : "border-2 border-destructive/50 bg-destructive/5"}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary" /> Subscription Status
                </CardTitle>
                <CardDescription>Manage your access to premium operational features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <span className="font-bold">Access Level:</span>
                    <Badge 
                        className={isSubscribed ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-destructive/90"}
                    >
                        {isSubscribed ? 'PREMIUM OPS-CENTER' : 'BASIC ACCESS'}
                    </Badge>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    {isSubscribed ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className={isSubscribed ? "text-green-600 font-medium" : "text-destructive font-medium"}>
                        {isSubscribed ? 'Subscription is Active.' : 'Subscription is Inactive.'}
                    </span>
                </div>

                {!isSubscribed && (
                    <Button asChild variant="default" className={cn("w-full bg-primary hover:bg-primary/90")}>
                        <Link to="/pricing">
                            <Zap className="w-4 h-4 mr-2" /> Secure Access Now
                        </Link>
                    </Button>
                )}
                
                {isSubscribed && (
                    <Button 
                        onClick={() => initiateCustomerPortal()} 
                        disabled={isInitiatingPortal}
                        variant="secondary" 
                        className="w-full"
                    >
                        {isInitiatingPortal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Manage Subscription'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default SubscriptionManager;