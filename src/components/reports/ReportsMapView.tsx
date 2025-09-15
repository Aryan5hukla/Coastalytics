import React, { useState, useEffect } from 'react';
import { supabase, Report } from '../../lib/supabase';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ImageIcon,
  Video,
  Navigation,
  Layers
} from 'lucide-react';

export default function ReportsMapView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [mapView, setMapView] = useState(true);

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

  const hazardTypes = [
    { value: 'cyclone', label: 'Cyclone', icon: '🌀', color: 'text-purple-400' },
    { value: 'tsunami', label: 'Tsunami', icon: '🌊', color: 'text-blue-400' },
    { value: 'storm_surge', label: 'Storm Surge', icon: '⚡', color: 'text-yellow-400' },
    { value: 'coastal_erosion', label: 'Coastal Erosion', icon: '🏖️', color: 'text-orange-400' },
    { value: 'flooding', label: 'Flooding', icon: '💧', color: 'text-cyan-400' },
    { value: 'other', label: 'Other', icon: '⚠️', color: 'text-red-400' }
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHazardTypeInfo = (hazardType: string) => {
    return hazardTypes.find(type => type.value === hazardType) || hazardTypes[hazardTypes.length - 1];
  };

  const openLocationInMaps = (report: Report) => {
    if (report.location && report.location.coordinates) {
      const [lng, lat] = report.location.coordinates;
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mb-4 mx-auto"></div>
          <p className="text-slate-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Ocean Hazard Reports</h1>
                <p className="text-blue-100">Real-time citizen reports from coastal communities</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <span className="text-white font-semibold">{filteredReports.length}</span>
                  <span className="text-blue-100 text-sm ml-1">reports</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="pending_verification">Under Review</option>
                  <option value="verified">Verified</option>
                  <option value="dismissed">Dismissed</option>
                </select>
                
                <select
                  value={hazardFilter}
                  onChange={(e) => setHazardFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Hazards</option>
                  {hazardTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => {
            const StatusIcon = statusIcons[report.status as keyof typeof statusIcons];
            const hazardInfo = getHazardTypeInfo(report.hazard_type);
            
            return (
              <div
                key={report.id}
                className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-600 cursor-pointer transform hover:-translate-y-1"
                onClick={() => setSelectedReport(report)}
              >
                {/* Report Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{hazardInfo.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{report.title}</h3>
                        <p className={`text-sm ${hazardInfo.color}`}>{hazardInfo.label}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusColors[report.status as keyof typeof statusColors]}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {report.status.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 text-sm line-clamp-3 mb-4">{report.description}</p>
                  
                  {/* Urgency Level */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Urgency Level</span>
                      <span>{report.urgency_level}/5</span>
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < report.urgency_level ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Media Indicator */}
                  {report.media_urls && report.media_urls.length > 0 && (
                    <div className="flex items-center text-xs text-slate-400 mb-3">
                      <ImageIcon className="w-3 h-3 mr-1" />
                      {report.media_urls.length} media file{report.media_urls.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Report Footer */}
                <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate max-w-32">{report.location_name || 'Location provided'}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(report.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredReports.length === 0 && (
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Reports Found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getHazardTypeInfo(selectedReport.hazard_type).icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedReport.title}</h2>
                      <p className={`text-sm ${getHazardTypeInfo(selectedReport.hazard_type).color}`}>
                        {getHazardTypeInfo(selectedReport.hazard_type).label}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Status and Urgency */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                    <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${statusColors[selectedReport.status as keyof typeof statusColors]}`}>
                      {React.createElement(statusIcons[selectedReport.status as keyof typeof statusIcons], { className: "w-4 h-4 mr-2" })}
                      {selectedReport.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Urgency Level</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < selectedReport.urgency_level ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-semibold">{selectedReport.urgency_level}/5</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                  <p className="text-slate-200 leading-relaxed">{selectedReport.description}</p>
                </div>
                
                {/* Location */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-400">Location</label>
                    {selectedReport.location && (
                      <button
                        onClick={() => openLocationInMaps(selectedReport)}
                        className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        View on Map
                      </button>
                    )}
                  </div>
                  <p className="text-slate-200">{selectedReport.location_name || 'Location provided'}</p>
                  {selectedReport.location && (
                    <p className="text-slate-400 text-sm">
                      {selectedReport.location.coordinates[1].toFixed(6)}, {selectedReport.location.coordinates[0].toFixed(6)}
                    </p>
                  )}
                </div>

                {/* Media Files */}
                {selectedReport.media_urls && selectedReport.media_urls.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-3">Media Files</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedReport.media_urls.map((url, index) => (
                        <div key={index} className="relative group">
                          {url.includes('video') || url.includes('.mp4') || url.includes('.mov') ? (
                            <video
                              src={url}
                              className="w-full h-32 object-cover rounded-lg"
                              controls
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(url, '_blank')}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Reported</label>
                    <p className="text-slate-200 text-sm">{formatDate(selectedReport.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Last Updated</label>
                    <p className="text-slate-200 text-sm">{formatDate(selectedReport.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}