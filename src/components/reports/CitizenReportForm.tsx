import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import {
  MapPin,
  Camera,
  Video,
  Upload,
  X,
  AlertTriangle,
  Send,
  Loader2,
  CheckCircle,
  Navigation,
  Image as ImageIcon
} from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

export default function CitizenReportForm() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hazardType: 'other' as const,
    urgencyLevel: 3
  });
  
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const hazardTypes = [
    { value: 'cyclone', label: 'Cyclone/Hurricane', icon: '🌀' },
    { value: 'tsunami', label: 'Tsunami', icon: '🌊' },
    { value: 'storm_surge', label: 'Storm Surge', icon: '⚡' },
    { value: 'coastal_erosion', label: 'Coastal Erosion', icon: '🏖️' },
    { value: 'flooding', label: 'Flooding', icon: '💧' },
    { value: 'other', label: 'Other Ocean Hazard', icon: '⚠️' }
  ];

  // Get user's current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        try {
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          // Only try geocoding if we have a valid API key
          const apiKey = import.meta.env.VITE_OPENCAGE_API_KEY;
          if (apiKey && apiKey !== 'demo') {
            try {
              const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
              );
              
              if (response.ok) {
                const data = await response.json();
                if (data.results && data.results[0]) {
                  address = data.results[0].formatted;
                }
              }
            } catch (geocodeError) {
              console.log('Geocoding failed, using coordinates:', geocodeError);
              // Continue with coordinates as address
            }
          }
          
          setLocation({
            latitude,
            longitude,
            accuracy,
            address
          });
        } catch (error) {
          // Set location without address if everything fails
          setLocation({
            latitude,
            longitude,
            accuracy,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Handle file selection
  const handleFileSelect = (files: FileList | null, type: 'image' | 'video') => {
    if (!files) return;
    
    const newFiles: MediaFile[] = [];
    
    Array.from(files).forEach(file => {
      if (mediaFiles.length + newFiles.length >= 5) return; // Limit to 5 files
      
      const preview = URL.createObjectURL(file);
      newFiles.push({ file, preview, type });
    });
    
    setMediaFiles(prev => [...prev, ...newFiles]);
  };

  // Remove media file
  const removeMediaFile = (index: number) => {
    setMediaFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Upload media files to Supabase storage
  const uploadMediaFiles = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];
    
    setMediaUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const mediaFile of mediaFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${mediaFile.file.name.split('.').pop()}`;
        const filePath = `reports/${user?.id}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, mediaFile.file);
        
        if (error) {
          console.error('Storage upload error:', error);
          if (error.message.includes('Bucket not found')) {
            throw new Error('Media storage is not configured. Please contact the administrator.');
          }
          throw error;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    } finally {
      setMediaUploading(false);
    }
    
    return uploadedUrls;
  };

  // Submit report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      setLocationError('Please get your current location first');
      return;
    }
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload media files first (if any)
      let mediaUrls: string[] = [];
      
      if (mediaFiles.length > 0) {
        try {
          mediaUrls = await uploadMediaFiles();
        } catch (uploadError: any) {
          // If media upload fails, ask user if they want to continue without media
          const continueWithoutMedia = confirm(
            `Failed to upload media files: ${uploadError.message}\n\nDo you want to submit the report without media files?`
          );
          
          if (!continueWithoutMedia) {
            return;
          }
          // Continue with empty media URLs
        }
      }
      
      // Create the report
      const { error } = await supabase
        .from('reports')
        .insert({
          citizen_id: user?.id || 'anonymous',
          title: formData.title.trim(),
          description: formData.description.trim(),
          location: {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
          },
          location_name: location.address || '',
          hazard_type: formData.hazardType,
          urgency_level: formData.urgencyLevel,
          media_urls: mediaUrls,
          status: 'pending'
        });
      
      if (error) throw error;
      
      setSubmitted(true);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          hazardType: 'other',
          urgencyLevel: 3
        });
        setLocation(null);
        setMediaFiles([]);
        setSubmitted(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error submitting report:', error);
      alert(`Error submitting report: ${error.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center max-w-md w-full">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted!</h2>
          <p className="text-slate-300 mb-4">
            Thank you for reporting this ocean hazard. Your report has been submitted and will be reviewed by our team.
          </p>
          <div className="text-sm text-slate-400">
            Redirecting back to form...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
            <h1 className="text-2xl font-bold text-white mb-2">Report Ocean Hazard</h1>
            <p className="text-blue-100">Help keep our coastal communities safe by reporting hazards and unusual ocean activities</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                  Location
                </h3>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4 mr-2" />
                  )}
                  Get Location
                </button>
              </div>

              {location ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-medium">Location obtained</p>
                      <p className="text-green-200 text-sm">{location.address}</p>
                      <p className="text-green-200/70 text-xs">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        {location.accuracy && ` (±${Math.round(location.accuracy)}m)`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : locationError ? (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium">Location Error</p>
                      <p className="text-red-200 text-sm">{locationError}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-medium">Location Required</p>
                      <p className="text-yellow-200 text-sm">Please allow location access to geotag your report</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hazard Type */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Hazard Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {hazardTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, hazardType: type.value as any }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.hazardType === type.value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-slate-300">
                Report Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the hazard (e.g., 'Large waves hitting shore')"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-300">
                Detailed Description *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about what you observed, when it started, severity, etc."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Urgency Level */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                Urgency Level: {formData.urgencyLevel}/5
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Low</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgencyLevel: parseInt(e.target.value) }))}
                  className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-xs text-slate-400">High</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Minor concern</span>
                <span>Immediate danger</span>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-300">
                  Photos & Videos (Optional)
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'image')}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, 'video')}
                className="hidden"
              />

              {/* Media Preview */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="relative group">
                      {media.type === 'image' ? (
                        <img
                          src={media.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={media.preview}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMediaFile(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {media.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-400">
                You can upload up to 5 photos or videos. Max file size: 50MB per file.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !location || mediaUploading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Report...
                </>
              ) : mediaUploading ? (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Uploading Media...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
