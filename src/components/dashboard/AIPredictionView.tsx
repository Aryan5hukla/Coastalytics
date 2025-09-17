import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Brain, TrendingUp, Clock, MapPin, AlertTriangle, RefreshCw, Play, Pause, Zap } from 'lucide-react';

interface PredictedHazard {
  id: string;
  hazard_type: 'cyclone' | 'tsunami' | 'storm_surge' | 'coastal_erosion' | 'flooding' | 'other';
  predicted_area: any; // GeoJSON polygon
  confidence_level: number;
  severity_estimate: string;
  prediction_window_hours: number;
  contributing_factors: Record<string, any>;
  source_reports: string[];
  source_social_posts: string[];
  algorithm_version: string;
  predicted_at: string;
  valid_until: string;
  is_active: boolean;
}

const AIPredictionView: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictedHazard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [triggeringPrediction, setTriggeringPrediction] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchPredictions();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('predictions_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'predicted_hazards' 
        }, 
        () => {
          fetchPredictions();
        }
      )
      .subscribe();

    // Auto-refresh every 5 minutes
    const interval = autoRefresh ? setInterval(() => {
      fetchPredictions();
    }, 5 * 60 * 1000) : null;

    return () => {
      subscription.unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('predicted_hazards')
        .select('*')
        .eq('is_active', true)
        .order('predicted_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPredictions(data || []);
      setLastUpdate(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const triggerPredictionEngine = async () => {
    try {
      setTriggeringPrediction(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('prediction-engine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;
      
      // Refresh predictions after triggering
      setTimeout(() => {
        fetchPredictions();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger prediction engine');
    } finally {
      setTriggeringPrediction(false);
    }
  };

  const getHazardIcon = (hazardType: string) => {
    switch (hazardType) {
      case 'tsunami':
        return '🌊';
      case 'cyclone':
        return '🌀';
      case 'storm_surge':
        return '⛈️';
      case 'flooding':
        return '💧';
      case 'coastal_erosion':
        return '🏖️';
      default:
        return '⚠️';
    }
  };

  const getHazardColor = (hazardType: string) => {
    switch (hazardType) {
      case 'tsunami':
        return 'border-red-500';
      case 'cyclone':
        return 'border-purple-500';
      case 'storm_surge':
        return 'border-orange-500';
      case 'flooding':
        return 'border-sky-500';
      case 'coastal_erosion':
        return 'border-yellow-500';
      default:
        return 'border-slate-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-400 bg-red-500/20 border border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/20 border border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/20 border border-green-500/30';
      default:
        return 'text-slate-400 bg-slate-500/20 border border-slate-500/30';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400 bg-green-500/20 border border-green-500/30';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
    if (confidence >= 0.4) return 'text-orange-400 bg-orange-500/20 border border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border border-red-500/30';
  };

  const formatTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const endTime = new Date(validUntil);
    const diffInHours = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (diffInHours < 1) return 'Expires soon';
    if (diffInHours < 24) return `${diffInHours}h remaining`;
    const days = Math.floor(diffInHours / 24);
    return `${days}d ${diffInHours % 24}h remaining`;
  };

  if (loading) {
    return (
      <div className="p-6 h-screen flex flex-col">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <Brain className="mr-2" />
            AI Predictions
          </h2>
          <div className="space-y-4 flex-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-slate-600 rounded-lg p-4">
                <div className="h-6 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-600 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 h-screen flex flex-col">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <Brain className="mr-2" />
            AI Predictions
          </h2>
          <div className="text-red-400 text-center py-4 flex flex-col items-center justify-center flex-1">
            <AlertTriangle className="mx-auto mb-2" />
            <p>Error loading predictions: {error}</p>
            <button 
              onClick={fetchPredictions}
              className="mt-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center text-white">
          <Brain className="mr-2" />
          AI Predictions
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-400">
            Last update: {lastUpdate}
          </span>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-1 rounded transition-colors ${autoRefresh ? 'text-green-400 hover:bg-green-500/20' : 'text-slate-400 hover:bg-slate-700'}`}
              title={autoRefresh ? "Disable auto-refresh" : "Enable auto-refresh"}
            >
              {autoRefresh ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button 
              onClick={triggerPredictionEngine}
              disabled={triggeringPrediction}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white rounded transition-colors flex items-center space-x-1"
              title="Trigger AI prediction analysis"
            >
              <Zap size={14} className={triggeringPrediction ? 'animate-pulse' : ''} />
              <span className="text-xs">
                {triggeringPrediction ? 'Analyzing...' : 'Run AI Analysis'}
              </span>
            </button>
            <button 
              onClick={fetchPredictions}
              className="p-1 hover:bg-slate-700 rounded transition-colors"
              title="Refresh predictions"
            >
              <RefreshCw size={16} className="text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {predictions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center h-full">
            <Brain className="mx-auto mb-4 opacity-50" size={48} />
            <p className="text-lg mb-2">No active predictions</p>
            <p className="text-sm mb-4">AI predictions will appear here when ocean hazards are detected</p>
            <div className="text-xs text-slate-500 max-w-md">
              <p className="mb-2">🌊 The AI analyzes citizen reports and social media mentions to predict:</p>
              <div className="grid grid-cols-2 gap-2 text-left">
                <span>🌀 Cyclones</span>
                <span>🌊 Tsunamis</span>
                <span>⛈️ Storm Surges</span>
                <span>🏖️ Coastal Erosion</span>
                <span>💧 Coastal Flooding</span>
                <span>⚠️ Other Hazards</span>
              </div>
              <p className="mt-3 text-center">
                Click "Run AI Analysis" to trigger prediction generation
              </p>
            </div>
          </div>
        ) : (
          predictions.map((prediction) => (
            <div 
              key={prediction.id}
              className={`border-l-4 rounded-lg p-4 bg-slate-700/50 ${getHazardColor(prediction.hazard_type)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getHazardIcon(prediction.hazard_type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg capitalize text-white">
                      {prediction.hazard_type.replace('_', ' ')} Event Predicted
                    </h3>
                    <p className="text-sm text-slate-400">
                      {prediction.contributing_factors?.region || 'Coastal Area'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(prediction.severity_estimate)}`}>
                    {prediction.severity_estimate} Risk
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Confidence</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(prediction.confidence_level)}`}>
                      {Math.round(prediction.confidence_level * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Validity</p>
                    <p className="text-xs font-medium text-slate-300">{formatTimeRemaining(prediction.valid_until)}</p>
                  </div>
                </div>
              </div>

              {prediction.contributing_factors && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-2">Analysis Factors:</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-wrap gap-1">
                      {prediction.contributing_factors.report_count > 0 && (
                        <span className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded border border-sky-500/30">
                          📊 {prediction.contributing_factors.report_count} reports
                        </span>
                      )}
                      {prediction.contributing_factors.social_mention_count > 0 && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                          📱 {prediction.contributing_factors.social_mention_count} mentions
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {prediction.contributing_factors.avg_urgency && (
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30">
                          🚨 {Math.round(prediction.contributing_factors.avg_urgency * 10) / 10}/5 urgency
                        </span>
                      )}
                      {prediction.contributing_factors.regional_risk_level && (
                        <span className={`px-2 py-1 text-xs rounded border ${
                          prediction.contributing_factors.regional_risk_level === 'High' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          🌍 {prediction.contributing_factors.regional_risk_level} risk area
                        </span>
                      )}
                    </div>
                  </div>
                  {prediction.contributing_factors.seasonal_factor && (
                    <div className="text-xs text-slate-400">
                      <span className="mr-2">🗓️ Seasonal factor: {(prediction.contributing_factors.seasonal_factor * 100).toFixed(0)}%</span>
                      {prediction.contributing_factors.primary_keywords && prediction.contributing_factors.primary_keywords.length > 0 && (
                        <span>🔍 Keywords: {prediction.contributing_factors.primary_keywords.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center">
                  <MapPin size={12} className="mr-1" />
                  Prediction Window: {prediction.prediction_window_hours}h
                </span>
                <span>
                  Algorithm: {prediction.algorithm_version}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {predictions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-600 text-xs text-slate-400 flex-shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-1">🤖 AI Analysis:</p>
              <p>Predictions combine citizen reports, social media mentions, seasonal patterns, and regional risk factors.</p>
            </div>
            <div>
              <p className="font-medium mb-1">📊 Confidence Levels:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">80%+ High</span>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">60-80% Moderate</span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">40-60% Low</span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">&lt;40% Very Low</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIPredictionView;
