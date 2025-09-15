/*
# Citizen Reports API Endpoint

This Supabase Edge Function serves as the primary API endpoint for receiving 
citizen-submitted hazard reports from the mobile application. It handles:

1. Report data validation and sanitization
2. Media file upload processing
3. Location verification against Indian coastal regions
4. Initial NLP processing for content relevance
5. Database insertion with proper security checks

## Features
- Comprehensive input validation
- Automatic geolocation verification
- NLP-based content analysis
- Media file handling and storage
- Real-time database updates
- Error handling and logging

## Usage
POST /functions/v1/citizen-reports
Content-Type: application/json

{
  "citizen_id": "unique_citizen_identifier",
  "title": "Report title",
  "description": "Detailed description of the hazard",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "location_name": "Human-readable location name",
  "hazard_type": "cyclone|tsunami|storm_surge|coastal_erosion|flooding|other",
  "urgency_level": 1-5,
  "media_files": ["base64_encoded_files..."]
}
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ReportPayload {
  citizen_id: string;
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  location_name?: string;
  hazard_type: 'cyclone' | 'tsunami' | 'storm_surge' | 'coastal_erosion' | 'flooding' | 'other';
  urgency_level: number;
  media_files?: string[];
}

// Initialize Supabase client with service role key for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Simple NLP keywords for hazard relevance detection
const HAZARD_KEYWORDS = [
  'cyclone', 'tsunami', 'flood', 'storm', 'wave', 'wind', 'rain', 'water',
  'damage', 'emergency', 'evacuation', 'warning', 'alert', 'disaster',
  'erosion', 'surge', 'coastal', 'sea', 'ocean', 'beach', 'shore'
];

// Indian coastal region bounds (simplified)
const INDIA_COASTAL_BOUNDS = {
  minLat: 6.0, maxLat: 37.6,
  minLng: 68.7, maxLng: 97.25
};

function validateLocation(coordinates: [number, number]): boolean {
  const [lng, lat] = coordinates;
  return (
    lat >= INDIA_COASTAL_BOUNDS.minLat && 
    lat <= INDIA_COASTAL_BOUNDS.maxLat &&
    lng >= INDIA_COASTAL_BOUNDS.minLng && 
    lng <= INDIA_COASTAL_BOUNDS.maxLng
  );
}

function calculateRelevanceScore(text: string): { score: number; keywords: string[] } {
  const words = text.toLowerCase().split(/\s+/);
  const foundKeywords = words.filter(word => 
    HAZARD_KEYWORDS.some(keyword => word.includes(keyword))
  );
  
  const score = Math.min(foundKeywords.length / 3, 1); // Normalize to 0-1
  return { score, keywords: [...new Set(foundKeywords)] };
}

function validateReportData(data: any): ReportPayload | null {
  try {
    // Required fields validation
    if (!data.citizen_id || typeof data.citizen_id !== 'string') return null;
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 5) return null;
    if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) return null;
    if (!data.location?.coordinates || !Array.isArray(data.location.coordinates)) return null;
    if (!data.hazard_type || !['cyclone', 'tsunami', 'storm_surge', 'coastal_erosion', 'flooding', 'other'].includes(data.hazard_type)) return null;
    if (!data.urgency_level || typeof data.urgency_level !== 'number' || data.urgency_level < 1 || data.urgency_level > 5) return null;

    // Coordinate validation
    const [lng, lat] = data.location.coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') return null;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;

    return {
      citizen_id: data.citizen_id.trim(),
      title: data.title.trim(),
      description: data.description.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      location_name: data.location_name?.trim() || '',
      hazard_type: data.hazard_type,
      urgency_level: Math.round(data.urgency_level),
      media_files: Array.isArray(data.media_files) ? data.media_files : []
    };
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    const rawData = await req.json();
    const reportData = validateReportData(rawData);
    
    if (!reportData) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid report data',
          message: 'Please check all required fields and data formats'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate location against Indian coastal regions
    const isLocationValid = validateLocation(reportData.location.coordinates);
    
    // Perform NLP analysis on the report content
    const contentAnalysis = calculateRelevanceScore(
      `${reportData.title} ${reportData.description}`
    );

    // Determine initial status based on validation results
    let initialStatus = 'pending';
    if (!isLocationValid) {
      initialStatus = 'unverified_location';
    } else if (contentAnalysis.score < 0.3) {
      initialStatus = 'irrelevant';
    } else {
      initialStatus = 'pending_verification';
    }

    // Process media files (simplified - in production, you'd upload to storage)
    const mediaUrls: string[] = [];
    if (reportData.media_files && reportData.media_files.length > 0) {
      // Here you would upload files to Supabase Storage and get URLs
      // For now, we'll just simulate this
      for (let i = 0; i < Math.min(reportData.media_files.length, 5); i++) {
        mediaUrls.push(`https://example.com/media/${Date.now()}_${i}.jpg`);
      }
    }

    // Insert report into database
    const { data: insertedReport, error: insertError } = await supabase
      .from('reports')
      .insert({
        citizen_id: reportData.citizen_id,
        title: reportData.title,
        description: reportData.description,
        location: JSON.stringify(reportData.location),
        location_name: reportData.location_name,
        hazard_type: reportData.hazard_type,
        status: initialStatus,
        urgency_level: reportData.urgency_level,
        media_urls: mediaUrls,
        nlp_keywords: contentAnalysis.keywords,
        nlp_sentiment_score: contentAnalysis.score,
        is_location_verified: isLocationValid,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to save report',
          message: 'Please try again later'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        report_id: insertedReport.id,
        status: initialStatus,
        location_verified: isLocationValid,
        relevance_score: contentAnalysis.score,
        message: initialStatus === 'pending_verification' 
          ? 'Report submitted successfully and is pending verification'
          : `Report submitted with status: ${initialStatus}`
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function execution error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your report'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});