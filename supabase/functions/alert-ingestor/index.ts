// Import required modules for Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertData {
  title: string;
  message: string;
  hazard_type: string;
  priority: string;
  status: string;
  source_url?: string;
  issued_at?: string;
}

// Mock function to scrape INCOIS alerts
async function scrapeINCOISAlerts(): Promise<AlertData[]> {
  // In a real implementation, this would use fetch() to get the actual INCOIS website
  // and parse the HTML for alert information
  
  const mockAlerts: AlertData[] = [
    {
      title: "Tsunami Advisory for East Coast",
      message: "A tsunami advisory has been issued for the entire east coast of India following a 7.2 magnitude earthquake in the Bay of Bengal. Coastal communities are advised to stay alert and follow local evacuation procedures if necessary.",
      hazard_type: "tsunami",
      priority: "high",
      status: "active",
      source_url: "https://incois.gov.in/alerts/tsunami-advisory-001",
      issued_at: new Date().toISOString()
    },
    {
      title: "High Wave Alert - West Coast",
      message: "High waves of 3-4 meters expected along the west coast due to strong westerly winds. Fishermen are advised not to venture into the sea for the next 24 hours.",
      hazard_type: "other",
      priority: "medium",
      status: "active",
      source_url: "https://incois.gov.in/alerts/high-wave-alert-002",
      issued_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    }
  ];
  
  return mockAlerts;
}

// Mock function to scrape IMD alerts
async function scrapeIMDAlerts(): Promise<AlertData[]> {
  const mockAlerts: AlertData[] = [
    {
      title: "Cyclone Warning - Bay of Bengal",
      message: "A low pressure area in the Bay of Bengal is likely to intensify into a cyclonic storm within the next 48 hours. Coastal districts of Odisha and West Bengal should remain on high alert.",
      hazard_type: "cyclone",
      priority: "critical",
      status: "active",
      source_url: "https://mausam.imd.gov.in/cyclone-warning-001",
      issued_at: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
    }
  ];
  
  return mockAlerts;
}

function determineTargetArea(message: string): any {
  // Simple logic to determine affected area based on message content
  // In a real implementation, this would be more sophisticated
  
  const defaultArea = {
    type: "Polygon",
    coordinates: [[[77.0, 8.0], [77.0, 22.0], [90.0, 22.0], [90.0, 8.0], [77.0, 8.0]]]
  };
  
  if (message.toLowerCase().includes('east coast')) {
    return {
      type: "Polygon",
      coordinates: [[[80.0, 8.0], [80.0, 22.0], [90.0, 22.0], [90.0, 8.0], [80.0, 8.0]]]
    };
  } else if (message.toLowerCase().includes('west coast')) {
    return {
      type: "Polygon", 
      coordinates: [[[68.0, 8.0], [68.0, 22.0], [78.0, 22.0], [78.0, 8.0], [68.0, 8.0]]]
    };
  }
  
  return defaultArea;
}

function estimateAffectedPopulation(hazardType: string, priority: string): number {
  // Simple estimation based on hazard type and priority
  const basePopulation = {
    'tsunami': 5000000,
    'cyclone': 3000000,
    'storm_surge': 1000000,
    'flooding': 2000000,
    'other': 500000
  };
  
  const priorityMultiplier = {
    'low': 0.1,
    'medium': 0.3,
    'high': 0.6,
    'critical': 1.0
  };
  
  const base = basePopulation[hazardType as keyof typeof basePopulation] || 500000;
  const multiplier = priorityMultiplier[priority as keyof typeof priorityMultiplier] || 0.3;
  
  return Math.floor(base * multiplier);
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

    console.log('Starting alert ingestion...')

    // Scrape alerts from different sources
    const incoisAlerts = await scrapeINCOISAlerts();
    const imdAlerts = await scrapeIMDAlerts();
    
    // Combine all alerts
    const allAlerts = [...incoisAlerts, ...imdAlerts];
    
    console.log(`Found ${allAlerts.length} alerts to process`)

    // Process and format alerts for database
    const processedAlerts = allAlerts.map(alert => ({
      title: alert.title,
      message: alert.message,
      hazard_type: alert.hazard_type,
      priority: alert.priority,
      status: alert.status,
      target_area: determineTargetArea(alert.message),
      affected_population_estimate: estimateAffectedPopulation(alert.hazard_type, alert.priority),
      channels: ['web', 'sms', 'social_media'], // Default channels
      created_by: 'system-ingestor',
      dispatch_time: alert.issued_at || new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      delivery_stats: {
        source_url: alert.source_url,
        ingested_at: new Date().toISOString()
      },
      n8n_workflow_id: `auto-${Date.now()}`, // Auto-generated workflow ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Check for duplicate alerts (based on title and recent creation)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingAlerts } = await supabaseClient
      .from('alerts')
      .select('title')
      .gte('created_at', oneHourAgo);

    const existingTitles = new Set(existingAlerts?.map(a => a.title) || []);
    
    // Filter out duplicates
    const newAlerts = processedAlerts.filter(alert => !existingTitles.has(alert.title));

    if (newAlerts.length > 0) {
      // Insert new alerts into database
      const { data, error } = await supabaseClient
        .from('alerts')
        .insert(newAlerts);

      if (error) {
        console.error('Error inserting alerts:', error)
        throw error
      }

      console.log(`Successfully ingested ${newAlerts.length} new alerts`)
    } else {
      console.log('No new alerts to ingest (all were duplicates)')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${allAlerts.length} alerts, inserted ${newAlerts.length} new ones`,
        total_found: allAlerts.length,
        new_alerts: newAlerts.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in alert-ingestor:', error)
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
