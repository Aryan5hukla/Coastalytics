import React, { useState, useEffect } from 'react';
import { supabase, Alert } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Shield, 
  Plus, 
  Send, 
  Edit, 
  Trash2, 
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function AlertsView() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusColors = {
    draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    resolved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  useEffect(() => {
    fetchAlerts();
    
    // Set up real-time subscription for alerts
    const subscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'alerts' 
        }, 
        () => {
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Partial<Alert>) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .insert({
          ...alertData,
          created_by: profile?.id,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      fetchAlerts();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const updateAlertStatus = async (alertId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'active') {
        updateData.dispatch_time = new Date().toISOString();
        updateData.approved_by = profile?.id;
      }

      const { error } = await supabase
        .from('alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) throw error;
      
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="space-y-3">
                <div className="h-5 bg-slate-600 rounded w-3/4"></div>
                <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                <div className="h-3 bg-slate-600 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and manage emergency alerts for coastal hazards
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAlerts}
            className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          {profile?.role === 'official' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Alerts Banner */}
      {alerts.filter(alert => alert.status === 'active').length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Zap className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-300">
                  {alerts.filter(alert => alert.status === 'active').length} Active Alert(s)
                </h3>
                <p className="text-red-200 text-sm">
                  Critical alerts are currently active and being broadcast to affected populations.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-300">
                  {alerts.filter(alert => alert.status === 'active').length}
                </div>
                <div className="text-xs text-red-400">LIVE</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {(['active', 'draft', 'resolved', 'cancelled'] as const).map(status => {
          const count = alerts.filter(alert => alert.status === status).length;
          return (
            <div key={status} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm capitalize">{status} Alerts</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <div className={`p-2 rounded-lg ${statusColors[status]}`}>
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[alert.priority]}`}>
                    {alert.priority.toUpperCase()}
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusColors[alert.status]}`}>
                    {alert.status.toUpperCase()}
                  </div>
                </div>
                
                <p className="text-slate-300 mb-3">{alert.message}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {alert.hazard_type}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {alert.affected_population_estimate.toLocaleString()} affected
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDate(alert.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-1" />
                    {alert.channels.join(', ')}
                  </div>
                </div>
              </div>
              
              {profile?.role === 'official' && (
                <div className="flex space-x-2 ml-4">
                  {alert.status === 'draft' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'active')}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors flex items-center space-x-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Dispatch</span>
                    </button>
                  )}
                  {alert.status === 'active' && (
                    <button
                      onClick={() => updateAlertStatus(alert.id, 'resolved')}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {alerts.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">No alerts found</p>
            <p className="text-slate-400 text-sm">Create your first alert to get started</p>
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <CreateAlertModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createAlert}
        />
      )}
    </div>
  );
}

function CreateAlertModal({ 
  onClose, 
  onSubmit 
}: { 
  onClose: () => void; 
  onSubmit: (data: Partial<Alert>) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    hazard_type: 'cyclone',
    priority: 'medium',
    affected_population_estimate: 0,
    channels: ['sms', 'push'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_area: {
        type: 'MultiPolygon',
        coordinates: [] // This would be populated by map selection
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Alert</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md text-white p-3 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-md text-white p-3 focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hazard Type
                </label>
                <select
                  value={formData.hazard_type}
                  onChange={(e) => setFormData({ ...formData, hazard_type: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md text-white p-3 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="cyclone">Cyclone</option>
                  <option value="tsunami">Tsunami</option>
                  <option value="storm_surge">Storm Surge</option>
                  <option value="coastal_erosion">Coastal Erosion</option>
                  <option value="flooding">Flooding</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-md text-white p-3 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Estimated Affected Population
              </label>
              <input
                type="number"
                value={formData.affected_population_estimate}
                onChange={(e) => setFormData({ ...formData, affected_population_estimate: parseInt(e.target.value) })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md text-white p-3 focus:ring-sky-500 focus:border-sky-500"
                min="0"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-md transition-colors"
              >
                Create Alert
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}