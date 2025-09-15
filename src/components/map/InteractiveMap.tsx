import React, { useState, useEffect, useRef } from 'react';
import { supabase, Report, Alert, PredictedHazard, Resource } from '../../lib/supabase';
import { 
  Layers, 
  Filter, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  MapPin,
  AlertTriangle,
  Shield,
  Activity,
  Building
} from 'lucide-react';

// Mock map component since we can't use actual Mapbox without API key
function MockMap({ reports, alerts, hazards, resources, selectedLayers }: {
  reports: Report[];
  alerts: Alert[];
  hazards: PredictedHazard[];
  resources: Resource[];
  selectedLayers: string[];
}) {
  return (
    <div className="relative w-full h-full bg-slate-700 rounded-lg overflow-hidden">
      {/* Mock coastline */}
      <svg className="absolute inset-0 w-full h-full">
        <path
          d="M0,200 Q100,150 200,180 Q300,220 400,190 Q500,160 600,200 Q700,240 800,210 Q900,180 1000,220 L1000,400 L0,400 Z"
          fill="#1e293b"
          stroke="#0ea5e9"
          strokeWidth="2"
        />
      </svg>

      {/* Map overlay with data points */}
      <div className="absolute inset-4">
        {/* Reports */}
        {selectedLayers.includes('reports') && reports.slice(0, 10).map((report, index) => (
          <div
            key={report.id}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full border-2 border-yellow-600 cursor-pointer hover:scale-150 transition-transform"
            style={{
              left: `${20 + (index * 80) % 800}px`,
              top: `${100 + Math.sin(index) * 50 + 100}px`,
            }}
            title={`Report: ${report.title}`}
          >
            <div className="absolute -top-1 -left-1">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        ))}

        {/* Active Alerts */}
        {selectedLayers.includes('alerts') && alerts.slice(0, 5).map((alert, index) => (
          <div
            key={alert.id}
            className="absolute w-8 h-8 bg-red-500/30 rounded-full border-2 border-red-500 animate-pulse cursor-pointer"
            style={{
              left: `${100 + (index * 150) % 700}px`,
              top: `${80 + Math.cos(index) * 40 + 120}px`,
            }}
            title={`Alert: ${alert.title}`}
          >
            <Shield className="w-4 h-4 text-red-400 absolute top-1 left-1" />
          </div>
        ))}

        {/* Predicted Hazards */}
        {selectedLayers.includes('hazards') && hazards.slice(0, 3).map((hazard, index) => (
          <div
            key={hazard.id}
            className="absolute w-12 h-12 bg-purple-500/20 rounded-full border-2 border-purple-500 cursor-pointer"
            style={{
              left: `${200 + (index * 200) % 600}px`,
              top: `${120 + index * 30 + 80}px`,
            }}
            title={`Prediction: ${hazard.hazard_type} (${Math.round(hazard.confidence_level * 100)}% confidence)`}
          >
            <Activity className="w-6 h-6 text-purple-400 absolute top-1.5 left-1.5" />
          </div>
        ))}

        {/* Resources */}
        {selectedLayers.includes('resources') && resources.slice(0, 8).map((resource, index) => (
          <div
            key={resource.id}
            className="absolute w-4 h-4 bg-green-400 rounded-full border-2 border-green-600 cursor-pointer hover:scale-125 transition-transform"
            style={{
              left: `${50 + (index * 100) % 800}px`,
              top: `${150 + Math.sin(index * 2) * 30 + 80}px`,
            }}
            title={`Resource: ${resource.name}`}
          >
            <Building className="w-3 h-3 text-green-400 absolute -top-0.5 -left-0.5" />
          </div>
        ))}
      </div>

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded">
        Mock Map View - Indian Coastal Regions
      </div>
    </div>
  );
}

export default function InteractiveMap() {
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [hazards, setHazards] = useState<PredictedHazard[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedLayers, setSelectedLayers] = useState(['reports', 'alerts', 'hazards', 'resources']);
  const [loading, setLoading] = useState(true);

  const layers = [
    { id: 'reports', label: 'Citizen Reports', icon: AlertTriangle, color: 'text-yellow-400' },
    { id: 'alerts', label: 'Active Alerts', icon: Shield, color: 'text-red-400' },
    { id: 'hazards', label: 'AI Predictions', icon: Activity, color: 'text-purple-400' },
    { id: 'resources', label: 'Emergency Resources', icon: Building, color: 'text-green-400' },
  ];

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      
      const [reportsData, alertsData, hazardsData, resourcesData] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('alerts').select('*').eq('status', 'active'),
        supabase.from('predicted_hazards').select('*').eq('is_active', true),
        supabase.from('resources').select('*').eq('is_active', true),
      ]);

      setReports(reportsData.data || []);
      setAlerts(alertsData.data || []);
      setHazards(hazardsData.data || []);
      setResources(resourcesData.data || []);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLayer = (layerId: string) => {
    setSelectedLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        {/* Map Controls */}
        <div className="lg:w-80 space-y-6">
          {/* Layer Controls */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Layers className="w-5 h-5 mr-2" />
              Map Layers
            </h3>
            <div className="space-y-3">
              {layers.map(layer => {
                const Icon = layer.icon;
                const isSelected = selectedLayers.includes(layer.id);
                
                return (
                  <label key={layer.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleLayer(layer.id)}
                      className="w-4 h-4 text-sky-500 border-slate-600 rounded focus:ring-sky-500 focus:ring-2 bg-slate-700"
                    />
                    <Icon className={`w-4 h-4 ${layer.color}`} />
                    <span className="text-slate-300 text-sm">{layer.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Time Range
                </label>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-md text-white text-sm p-2 focus:ring-sky-500 focus:border-sky-500">
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Custom range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hazard Type
                </label>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-md text-white text-sm p-2 focus:ring-sky-500 focus:border-sky-500">
                  <option>All Types</option>
                  <option>Cyclone</option>
                  <option>Tsunami</option>
                  <option>Storm Surge</option>
                  <option>Coastal Erosion</option>
                  <option>Flooding</option>
                </select>
              </div>
            </div>
          </div>

          {/* Map Stats */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Current View
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Reports:</span>
                <span className="text-yellow-400">{reports.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Alerts:</span>
                <span className="text-red-400">{alerts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Predictions:</span>
                <span className="text-purple-400">{hazards.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resources:</span>
                <span className="text-green-400">{resources.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-sky-400" />
                Interactive Coastal Map
              </h3>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchMapData}
                  className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-md transition-colors flex items-center space-x-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            
            <div className="h-full">
              {loading ? (
                <div className="flex items-center justify-center h-full bg-slate-700 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mb-4"></div>
                    <p className="text-slate-400">Loading map data...</p>
                  </div>
                </div>
              ) : (
                <MockMap 
                  reports={reports}
                  alerts={alerts}
                  hazards={hazards}
                  resources={resources}
                  selectedLayers={selectedLayers}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}