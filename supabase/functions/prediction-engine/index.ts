// Import required modules for Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionAnalysis {
  region: string;
  hazard_type: string;
  confidence_level: number;
  severity_estimate: string;
  contributing_factors: any;
  source_reports: string[];
  source_social_posts: string[];
}

// Define coastal regions for analysis with coordinates
const COASTAL_REGIONS = [
  { 
    name: 'Chennai Coast', 
    keywords: ['chennai', 'tamil nadu', 'marina beach', 'ennore', 'pulicat'], 
    coordinates: [80.2707, 13.0827],
    riskFactors: ['cyclone', 'tsunami', 'storm_surge', 'coastal_erosion']
  },
  { 
    name: 'Mumbai Coast', 
    keywords: ['mumbai', 'maharashtra', 'marine drive', 'bandra', 'versova'], 
    coordinates: [72.8777, 19.0760],
    riskFactors: ['storm_surge', 'flooding', 'coastal_erosion']
  },
  { 
    name: 'Kolkata Coast', 
    keywords: ['kolkata', 'west bengal', 'hooghly', 'diamond harbour', 'sagar'], 
    coordinates: [88.3639, 22.5726],
    riskFactors: ['cyclone', 'storm_surge', 'flooding']
  },
  { 
    name: 'Odisha Coast', 
    keywords: ['odisha', 'puri', 'paradip', 'bhubaneswar', 'gopalpur', 'chilika'], 
    coordinates: [85.8245, 20.2961],
    riskFactors: ['cyclone', 'tsunami', 'storm_surge', 'coastal_erosion', 'flooding']
  },
  { 
    name: 'Kerala Coast', 
    keywords: ['kerala', 'kochi', 'thiruvananthapuram', 'kozhikode', 'alappuzha'], 
    coordinates: [76.2673, 9.9312],
    riskFactors: ['tsunami', 'coastal_erosion', 'flooding', 'storm_surge']
  },
  { 
    name: 'Goa Coast', 
    keywords: ['goa', 'panaji', 'margao', 'calangute', 'baga'], 
    coordinates: [73.8278, 15.2993],
    riskFactors: ['coastal_erosion', 'flooding', 'storm_surge']
  },
  { 
    name: 'Gujarat Coast', 
    keywords: ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'rajkot', 'kandla'], 
    coordinates: [70.0577, 23.0225],
    riskFactors: ['cyclone', 'storm_surge', 'coastal_erosion']
  },
  { 
    name: 'Andhra Pradesh Coast', 
    keywords: ['andhra pradesh', 'visakhapatnam', 'vijayawada', 'guntur', 'kakinada'], 
    coordinates: [82.9739, 17.6868],
    riskFactors: ['cyclone', 'tsunami', 'storm_surge', 'coastal_erosion']
  }
];

// Enhanced hazard type mappings with more keywords
const HAZARD_MAPPINGS = {
  'tsunami': ['tsunami', 'tidal wave', 'seismic wave', 'earthquake', 'tremor', 'sea wave', 'giant wave'],
  'cyclone': ['cyclone', 'hurricane', 'typhoon', 'storm', 'wind', 'spiral', 'depression', 'circulation', 'eye wall'],
  'storm_surge': ['storm surge', 'surge', 'high tide', 'abnormal tide', 'coastal flooding', 'tide surge'],
  'coastal_erosion': ['erosion', 'coastal erosion', 'shoreline retreat', 'beach loss', 'sand loss', 'cliff collapse'],
  'flooding': ['flood', 'flooding', 'inundation', 'waterlogging', 'water level', 'overflow', 'deluge'],
  'other': ['other', 'unknown', 'general', 'emergency', 'disaster', 'calamity']
};

// Seasonal risk multipliers for different months
const SEASONAL_RISK_MULTIPLIERS = {
  cyclone: [0.1, 0.1, 0.2, 0.3, 0.6, 0.8, 0.9, 0.9, 0.8, 1.2, 1.5, 0.4], // Peak: Oct-Nov
  tsunami: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], // Year-round
  storm_surge: [0.3, 0.3, 0.4, 0.6, 0.8, 1.2, 1.5, 1.4, 1.1, 1.3, 1.2, 0.5], // Peak: Monsoon
  flooding: [0.2, 0.2, 0.3, 0.4, 0.9, 1.5, 1.8, 1.7, 1.4, 0.8, 0.4, 0.3], // Peak: Monsoon
  coastal_erosion: [0.7, 0.7, 0.8, 0.9, 1.1, 1.3, 1.4, 1.3, 1.2, 1.1, 0.9, 0.8] // Higher during monsoon
};

function determineHazardType(keywords: string[], content: string): string {
  const lowerContent = content.toLowerCase();
  
  for (const [hazardType, terms] of Object.entries(HAZARD_MAPPINGS)) {
    if (terms.some(term => lowerContent.includes(term) || keywords.includes(term))) {
      return hazardType;
    }
  }
  
  return 'other';
}

function calculateConfidence(
  reportCount: number, 
  socialMentionCount: number, 
  avgUrgency: number, 
  hazardType: string, 
  region: any,
  timeWindow: number = 4
): number {
  // Enhanced confidence calculation with multiple factors
  
  // Data volume factor (0-1)
  const totalData = reportCount + socialMentionCount;
  const dataVolume = Math.min(totalData / 15, 1); // Increased threshold for better confidence
  
  // Urgency factor (0-1)
  const urgencyFactor = Math.min(avgUrgency / 5, 1);
  
  // Seasonal factor based on current month
  const currentMonth = new Date().getMonth();
  const seasonalMultiplier = SEASONAL_RISK_MULTIPLIERS[hazardType]?.[currentMonth] || 1;
  const seasonalFactor = Math.min(seasonalMultiplier, 1.5) / 1.5; // Normalize to 0-1
  
  // Regional risk factor (check if hazard type is common in this region)
  const regionalRisk = region.riskFactors?.includes(hazardType) ? 1 : 0.5;
  
  // Time consistency factor (more data over time = higher confidence)
  const timeConsistencyFactor = Math.min(timeWindow / 8, 1); // 8 hours = max consistency
  
  // Combined confidence score
  const baseConfidence = dataVolume * 0.3 + urgencyFactor * 0.25 + seasonalFactor * 0.2;
  const adjustedConfidence = baseConfidence * regionalRisk * (0.7 + timeConsistencyFactor * 0.3);
  
  return Math.min(Math.max(adjustedConfidence, 0.1), 0.95); // Keep between 0.1 and 0.95
}

function determineSeverity(
  urgencyScore: number, 
  reportCount: number, 
  socialMentionCount: number, 
  confidence: number,
  hazardType: string
): string {
  // Enhanced severity determination
  const totalReports = reportCount + socialMentionCount;
  
  // High-risk hazard types get elevated severity
  const highRiskHazards = ['tsunami', 'cyclone'];
  const isHighRiskHazard = highRiskHazards.includes(hazardType);
  
  // Critical: High urgency, significant data, high confidence
  if ((urgencyScore >= 4 && totalReports >= 5 && confidence >= 0.7) || 
      (isHighRiskHazard && urgencyScore >= 3.5 && confidence >= 0.6)) {
    return 'Critical';
  }
  
  // High: Moderate urgency with good data support
  if ((urgencyScore >= 3 && totalReports >= 3 && confidence >= 0.5) || 
      (isHighRiskHazard && urgencyScore >= 2.5 && confidence >= 0.4)) {
    return 'High';
  }
  
  // Medium: Some urgency with supporting data
  if ((urgencyScore >= 2 && totalReports >= 2) || 
      (confidence >= 0.4 && totalReports >= 3)) {
    return 'Medium';
  }
  
  return 'Low';
}

// Function to determine prediction window based on hazard type and urgency
function getPredictionWindow(hazardType: string, urgency: number, confidence: number): number {
  const baseWindows = {
    'tsunami': 4,    // Immediate threat
    'cyclone': 72,   // 3 days advance warning
    'storm_surge': 24, // 1 day warning
    'flooding': 48,  // 2 days warning
    'coastal_erosion': 168, // 1 week - gradual process
    'other': 24
  };
  
  const baseWindow = baseWindows[hazardType] || 24;
  
  // Adjust based on urgency and confidence
  if (urgency >= 4 && confidence >= 0.7) {
    return Math.max(baseWindow * 0.5, 2); // Shorter window for urgent high-confidence
  } else if (urgency >= 3 && confidence >= 0.5) {
    return baseWindow * 0.75;
  } else if (confidence < 0.3) {
    return baseWindow * 1.5; // Longer window for low confidence
  }
  
  return baseWindow;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting prediction analysis...')

    // Get data from the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    // Fetch recent reports
    const { data: reports, error: reportsError } = await supabaseClient
      .from('reports')
      .select('*')
      .gte('created_at', fourHoursAgo);

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      throw reportsError
    }

    // Fetch recent social media mentions
    const { data: socialMentions, error: socialError } = await supabaseClient
      .from('social_mentions')
      .select('*')
      .gte('scraped_at', fourHoursAgo);

    if (socialError) {
      console.error('Error fetching social mentions:', socialError)
      throw socialError
    }

    console.log(`Analyzing ${reports?.length || 0} reports and ${socialMentions?.length || 0} social mentions`)

    const predictions: any[] = [];

    // Analyze each region
    for (const region of COASTAL_REGIONS) {
      // Filter reports and mentions for this region
      const regionReports = reports?.filter(report => 
        region.keywords.some(keyword => 
          report.location_name?.toLowerCase().includes(keyword) || 
          report.description?.toLowerCase().includes(keyword)
        )
      ) || [];

      const regionMentions = socialMentions?.filter(mention => 
        region.keywords.some(keyword => 
          mention.content?.toLowerCase().includes(keyword)
        )
      ) || [];

      // Skip if no data for this region
      if (regionReports.length === 0 && regionMentions.length === 0) continue;

      // Calculate metrics
      const totalReports = regionReports.length;
      const totalMentions = regionMentions.length;
      
      const avgReportUrgency = regionReports.length > 0 
        ? regionReports.reduce((sum, r) => sum + (r.urgency_level || 1), 0) / regionReports.length
        : 0;
      
      const avgMentionUrgency = regionMentions.length > 0
        ? regionMentions.reduce((sum, m) => sum + (m.urgency_score || 1), 0) / regionMentions.length
        : 0;

      const overallUrgency = Math.max(avgReportUrgency, avgMentionUrgency);

      // Determine hazard type from all content
      const allContent = [
        ...regionReports.map(r => r.description || ''),
        ...regionMentions.map(m => m.content || '')
      ].join(' ');

      const allKeywords = [
        ...regionReports.flatMap(r => r.nlp_keywords || []),
        ...regionMentions.flatMap(m => m.nlp_keywords || [])
      ];

      // Analyze each potential hazard type for this region
      for (const potentialHazard of region.riskFactors) {
        const hazardSpecificContent = allContent;
        const hazardSpecificKeywords = allKeywords.filter(keyword => 
          HAZARD_MAPPINGS[potentialHazard]?.some(term => keyword.toLowerCase().includes(term))
        );

        // Only create prediction if there's evidence for this hazard type
        const hasEvidence = hazardSpecificKeywords.length > 0 || 
          HAZARD_MAPPINGS[potentialHazard]?.some(term => 
            hazardSpecificContent.toLowerCase().includes(term)
          );

        if (!hasEvidence) continue;

        const confidence = calculateConfidence(
          totalReports, 
          totalMentions, 
          overallUrgency, 
          potentialHazard, 
          region,
          4
        );

        // Only create prediction if confidence is above threshold
        if (confidence < 0.2) continue;

        const severity = determineSeverity(
          overallUrgency, 
          totalReports, 
          totalMentions, 
          confidence, 
          potentialHazard
        );

        const predictionWindowHours = getPredictionWindow(
          potentialHazard, 
          overallUrgency, 
          confidence
        );

        // Create detailed prediction area (circular buffer around region center)
        const bufferRadius = 0.5; // ~50km radius
        const [lng, lat] = region.coordinates;
        
        const prediction = {
          hazard_type: potentialHazard,
          predicted_area: {
            type: 'Polygon',
            coordinates: [[
              [lng - bufferRadius, lat - bufferRadius],
              [lng + bufferRadius, lat - bufferRadius],
              [lng + bufferRadius, lat + bufferRadius],
              [lng - bufferRadius, lat + bufferRadius],
              [lng - bufferRadius, lat - bufferRadius]
            ]]
          },
          confidence_level: confidence,
          severity_estimate: severity,
          prediction_window_hours: predictionWindowHours,
          contributing_factors: {
            region: region.name,
            report_count: totalReports,
            social_mention_count: totalMentions,
            avg_urgency: overallUrgency,
            primary_keywords: hazardSpecificKeywords.slice(0, 5),
            seasonal_factor: SEASONAL_RISK_MULTIPLIERS[potentialHazard]?.[new Date().getMonth()] || 1,
            regional_risk_level: region.riskFactors.includes(potentialHazard) ? 'High' : 'Moderate',
            data_freshness_hours: 4,
            analysis_timestamp: new Date().toISOString()
          },
          source_reports: regionReports.map(r => r.id),
          source_social_posts: regionMentions.map(m => m.id),
          algorithm_version: 'v2.0-enhanced',
          predicted_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + predictionWindowHours * 60 * 60 * 1000).toISOString(),
          is_active: true
        };

        predictions.push(prediction);
      }
    }

    // Insert predictions into database
    if (predictions.length > 0) {
      // First, deactivate old predictions
      await supabaseClient
        .from('predicted_hazards')
        .update({ is_active: false })
        .eq('is_active', true);

      // Insert new predictions
      const { data, error } = await supabaseClient
        .from('predicted_hazards')
        .insert(predictions);

      if (error) {
        console.error('Error inserting predictions:', error)
        throw error
      }

      console.log(`Successfully generated ${predictions.length} predictions`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${predictions.length} predictions`,
        predictions: predictions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in prediction-engine:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
