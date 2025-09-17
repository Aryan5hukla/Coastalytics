import React, { useState, useEffect } from 'react';
import { supabase, Report } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Eye,
  ImageIcon
} from 'lucide-react';

interface ReportsViewProps {
  initialStatusFilter?: string;
}

export default function ReportsView({ initialStatusFilter }: ReportsViewProps) {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'all');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    pending_verification: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    verified: 'bg-green-500/20 text-green-400 border-green-500/30',
    dismissed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    unverified_location: 'bg-red-500/20 text-red-400 border-red-500/30',
    irrelevant: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const statusIcons = {
    pending: Clock,
    pending_verification: Eye,
    verified: CheckCircle,
    dismissed: XCircle,
    unverified_location: MapPin,
    irrelevant: XCircle,
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, hazardFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (hazardFilter !== 'all') {
      filtered = filtered.filter(report => report.hazard_type === hazardFilter);
    }

    setFilteredReports(filtered);
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          verified_by: profile?.id,
          verification_notes: notes || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      
      // Refresh reports
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report status:', error);
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-20 bg-slate-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 w-full"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="verified">Verified</option>
              <option value="dismissed">Dismissed</option>
            </select>
            
            <select
              value={hazardFilter}
              onChange={(e) => setHazardFilter(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md text-white px-3 py-2 text-sm focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="all">All Hazards</option>
              <option value="cyclone">Cyclone</option>
              <option value="tsunami">Tsunami</option>
              <option value="storm_surge">Storm Surge</option>
              <option value="coastal_erosion">Coastal Erosion</option>
              <option value="flooding">Flooding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => {
          const StatusIcon = statusIcons[report.status as keyof typeof statusIcons];
          
          return (
            <div
              key={report.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusColors[report.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {report.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-3">{report.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {report.location_name || 'Location not specified'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(report.created_at)}
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {report.hazard_type}
                    </div>
                    {report.media_urls.length > 0 && (
                      <div className="flex items-center">
                        <ImageIcon className="w-4 h-4 mr-1" />
                        {report.media_urls.length} media files
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-400 mb-1">Urgency</div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full mr-1 ${
                            i < report.urgency_level ? 'bg-red-400' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredReports.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">No reports found</p>
            <p className="text-slate-400 text-sm">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{selectedReport.title}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description
                  </label>
                  <p className="text-slate-200">{selectedReport.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Hazard Type
                    </label>
                    <p className="text-slate-200 capitalize">{selectedReport.hazard_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Urgency Level
                    </label>
                    <p className="text-slate-200">{selectedReport.urgency_level}/5</p>
                  </div>
                </div>
                
                {profile?.role === 'official' && selectedReport.status === 'pending_verification' && (
                  <div className="border-t border-slate-700 pt-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Verification Actions</h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateReportStatus(selectedReport.id, 'verified')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                      >
                        Verify Report
                      </button>
                      <button
                        onClick={() => updateReportStatus(selectedReport.id, 'dismissed')}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                      >
                        Dismiss Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}