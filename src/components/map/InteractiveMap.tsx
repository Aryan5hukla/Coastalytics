import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
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

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for different data types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color};" class="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">${icon}</div>`,
    className: 'custom-div-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Real Leaflet map component
function RealMap({ reports, alerts, hazards, resources, selectedLayers }: {
  reports: Report[];
  alerts: Alert[];
  hazards: PredictedHazard[];
  resources: Resource[];
  selectedLayers: string[];
}) {
  // Generate mock coordinates for items that don't have location data
  const getCoordinates = (item: any, index: number) => {
    if (item.location && item.location.coordinates) {
      // Return real coordinates if available (longitude, latitude format in PostGIS)
      console.log(`Report ${item.id} has real coordinates:`, item.location.coordinates);
      return [item.location.coordinates[1], item.location.coordinates[0]];
    }
    // Generate predictable coordinates based on index for items without location
    // This ensures they don't overlap and are consistently placed
    const baseLatitudes = [20.5, 22.3, 19.8, 25.1, 17.6]; // Different cities in India
    const baseLongitudes = [78.9, 77.2, 75.1, 82.3, 83.2];
    
    const lat = baseLatitudes[index % baseLatitudes.length] + (Math.random() - 0.5) * 2;
    const lng = baseLongitudes[index % baseLongitudes.length] + (Math.random() - 0.5) * 2;
    
    console.log(`Report ${item.id} using mock coordinates [${lat}, ${lng}] (index: ${index})`);
    return [lat, lng];
  };

  return (
    <MapContainer 
      center={[20.5937, 78.9629]} // Center of India
      zoom={5} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Citizen Reports */}
      {selectedLayers.includes('reports') && reports.map((report, index) => {
        console.log(`Rendering report ${index + 1}/${reports.length}:`, report.title, report.id);
        const [lat, lng] = getCoordinates(report, index);
        console.log(`Using coordinates [${lat}, ${lng}] for report ${report.id}`);
        return (
          <Marker key={report.id} position={[lat, lng]}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-sm mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                  {report.title}
                </h4>
                <p className="text-xs mb-2">{report.description}</p>
                <div className="text-xs text-gray-600">
                  <div>Type: {report.hazard_type}</div>
                  <div>Status: {report.status}</div>
                  <div>Urgency: {report.urgency_level}/5</div>
                  <div>Reported: {new Date(report.created_at).toLocaleString()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Active Alerts */}
      {selectedLayers.includes('alerts') && alerts.map((alert, index) => {
        const [lat, lng] = getCoordinates(alert, index);
        return (
          <Marker key={alert.id} position={[lat, lng]}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-sm mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-red-500" />
                  {alert.title}
                </h4>
                <p className="text-xs mb-2">{alert.message}</p>
                <div className="text-xs text-gray-600">
                  <div>Priority: {alert.priority}</div>
                  <div>Status: {alert.status}</div>
                  <div>Affected: {alert.affected_population_estimate?.toLocaleString() || 'Unknown'}</div>
                  <div>Created: {new Date(alert.created_at).toLocaleString()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* AI Predictions */}
      {selectedLayers.includes('hazards') && hazards.map((hazard, index) => {
        const [lat, lng] = getCoordinates(hazard, index);
        return (
          <Marker key={hazard.id} position={[lat, lng]}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-sm mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-purple-500" />
                  AI Prediction
                </h4>
                <div className="text-xs text-gray-600">
                  <div>Type: {hazard.hazard_type}</div>
                  <div>Confidence: {Math.round(hazard.confidence_level * 100)}%</div>
                  <div>Predicted: {new Date(hazard.predicted_date).toLocaleString()}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Emergency Resources */}
      {selectedLayers.includes('resources') && resources.map((resource, index) => {
        const [lat, lng] = getCoordinates(resource, index);
        return (
          <Marker key={resource.id} position={[lat, lng]}>
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-bold text-sm mb-2 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-green-500" />
                  {resource.name}
                </h4>
                <div className="text-xs text-gray-600">
                  <div>Type: {resource.type}</div>
                  <div>Capacity: {resource.capacity}</div>
                  <div>Contact: {resource.contact_info}</div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
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

      const reportsList = reportsData.data || [];
      console.log(`Fetched ${reportsList.length} reports for map:`, reportsList);
      
      setReports(reportsList);
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
                <RealMap 
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