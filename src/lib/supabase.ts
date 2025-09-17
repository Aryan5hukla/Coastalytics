import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please create a .env file with:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error('Missing Supabase environment variables. Please check the console for setup instructions.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'hazard analyst' | 'govt official';
  organization: string;
  phone: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  citizen_id: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  location_name: string;
  hazard_type: 'cyclone' | 'tsunami' | 'storm_surge' | 'coastal_erosion' | 'flooding' | 'other';
  status: 'pending' | 'pending_verification' | 'verified' | 'dismissed' | 'unverified_location' | 'irrelevant';
  urgency_level: number;
  media_urls: string[];
  verified_by?: string;
  verification_notes: string;
  nlp_keywords: string[];
  nlp_sentiment_score: number;
  is_location_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  hazard_type: 'cyclone' | 'tsunami' | 'storm_surge' | 'coastal_erosion' | 'flooding' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'active' | 'resolved' | 'cancelled';
  target_area: any; // GeoJSON polygon
  affected_population_estimate: number;
  channels: string[];
  created_by: string;
  approved_by?: string;
  dispatch_time?: string;
  expires_at?: string;
  delivery_stats: Record<string, any>;
  n8n_workflow_id: string;
  created_at: string;
  updated_at: string;
}

export interface PredictedHazard {
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
  created_at: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  contact_phone: string;
  contact_email: string;
  capacity: number;
  is_active: boolean;
  operating_hours: string;
  services_offered: string[];
  created_at: string;
  updated_at: string;
}

export interface SocialMention {
  id: string;
  content: string;
  source: string;
  author?: string;
  posted_at?: string;
  scraped_at: string;
  url?: string;
  engagement_metrics?: Record<string, any>;
  nlp_keywords: string[];
  nlp_sentiment_score: number;
  urgency_score: number;
  created_at: string;
  updated_at: string;
}