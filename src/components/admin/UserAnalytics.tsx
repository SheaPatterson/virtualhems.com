import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, UserCheck, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const UserAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['userAnalytics'],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get users with complete profiles
      const { count: completeProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('first_name', 'is', null)
        .not('last_name', 'is', null)
        .not('bio', 'is', null);

      // Get recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Get active users (users with missions in last 30 days)
      const { data: activeMissions } = await supabase
        .from('missions')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const activeUserIds = new Set(activeMissions?.map(m => m.user_id) || []);
      const activeUsers = activeUserIds.size;

      // Calculate completion rate
      const completionRate = totalUsers ? Math.round((completeProfiles || 0) / totalUsers * 100) : 0;

      return {
        totalUsers: totalUsers || 0,
        completeProfiles: completeProfiles || 0,
        recentUsers: recentUsers || 0,
        activeUsers,
        completionRate
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            Registered accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {analytics?.completionRate || 0}%
            <Badge variant={analytics?.completionRate && analytics.completionRate > 70 ? "default" : "secondary"} className="text-xs">
              {analytics?.completeProfiles || 0}/{analytics?.totalUsers || 0}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete profiles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.recentUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            New users (30 days)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Pilots</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
          <p className="text-xs text-muted-foreground">
            Flying (30 days)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;