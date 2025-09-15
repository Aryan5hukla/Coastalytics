import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import StatsCard from './StatsCard';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Activity,
  Shield,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalReports: 0,
    verifiedReports: 0,
    pendingReports: 0,
    activeAlerts: 0,
    predictedHazards: 0,
    socialMediaPosts: 0,
    resources: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [
        reportsResult,
        verifiedResult,
        pendingResult,
        alertsResult,
        hazardsResult,
        socialResult,
        resourcesResult,
      ] = await Promise.all([
        supabase.from('reports').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('predicted_hazards').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('social_media_posts').select('id', { count: 'exact', head: true }),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      setStats({
        totalReports: reportsResult.count || 0,
        verifiedReports: verifiedResult.count || 0,
        pendingReports: pendingResult.count || 0,
        activeAlerts: alertsResult.count || 0,
        predictedHazards: hazardsResult.count || 0,
        socialMediaPosts: socialResult.count || 0,
        resources: resourcesResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-slate-600 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-slate-600 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Reports"
          value={stats.totalReports}
          icon={AlertTriangle}
          color="blue"
          change="+12% from last week"
          changeType="positive"
        />
        
        <StatsCard
          title="Verified Reports"
          value={stats.verifiedReports}
          icon={CheckCircle}
          color="green"
          change="+8% verification rate"
          changeType="positive"
        />
        
        <StatsCard
          title="Pending Review"
          value={stats.pendingReports}
          icon={Clock}
          color="yellow"
          change="Requires attention"
          changeType="neutral"
        />
        
        <StatsCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={Shield}
          color="red"
          change="Currently dispatched"
          changeType="neutral"
        />
        
        <StatsCard
          title="AI Predictions"
          value={stats.predictedHazards}
          icon={Activity}
          color="purple"
          change="Active forecasts"
          changeType="neutral"
        />
        
        <StatsCard
          title="Social Media Mentions"
          value={stats.socialMediaPosts}
          icon={Users}
          color="blue"
          change="+24% today"
          changeType="positive"
        />
        
        <StatsCard
          title="Emergency Resources"
          value={stats.resources}
          icon={MapPin}
          color="green"
          change="Ready for deployment"
          changeType="positive"
        />
        
        <StatsCard
          title="System Status"
          value="Operational"
          icon={TrendingUp}
          color="green"
          change="All systems online"
          changeType="positive"
        />
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-md">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">New verified report from Chennai coastal area</p>
                <p className="text-slate-400 text-xs">5 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-md">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">AI prediction generated for Odisha coast</p>
                <p className="text-slate-400 text-xs">15 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-md">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">INCOIS warning received for Andhra Pradesh</p>
                <p className="text-slate-400 text-xs">30 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}