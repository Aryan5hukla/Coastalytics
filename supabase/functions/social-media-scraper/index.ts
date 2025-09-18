// Enhanced Social Media Scraper with NLP and Image Analysis
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SocialMention {
  content: string;
  source: string;
  author?: string;
  posted_at?: string;
  url?: string;
  engagement_metrics?: any;
  media_urls?: string[];
  location?: string;
  hashtags?: string[];
  nlp_keywords?: string[];
  nlp_sentiment_score?: number;
  urgency_score?: number;
  has_coastal_imagery?: boolean;
  confidence_score?: number;
}

// Enhanced keyword sets for better NLP detection
const HAZARD_KEYWORDS = {
  tsunami: ['tsunami', 'tidal wave', 'harbor wave', 'seismic sea wave'],
  cyclone: ['cyclone', 'hurricane', 'typhoon', 'tropical storm', 'wind storm'],
  storm_surge: ['storm surge', 'storm tide', 'coastal surge', 'tidal surge'],
  flooding: ['coastal flooding', 'flood', 'inundation', 'water logging', 'flash flood'],
  erosion: ['coastal erosion', 'beach erosion', 'shoreline retreat', 'land loss'],
  waves: ['high waves', 'rough seas', 'heavy swell', 'dangerous waves', 'giant waves'],
  general: ['evacuation', 'emergency', 'disaster', 'warning', 'alert', 'rescue', 'damage']
};

const COASTAL_LOCATIONS = [
  // Major Indian coastal cities
  'mumbai', 'chennai', 'kolkata', 'visakhapatnam', 'kochi', 'goa', 'puri', 'paradip',
  'mangalore', 'thiruvananthapuram', 'pondicherry', 'bhubaneswar', 'surat', 'daman',
  'karwar', 'udupi', 'calicut', 'kannur', 'alappuzha', 'kollam', 'tuticorin',
  'rameswaram', 'cuddalore', 'nagapattinam', 'karaikal', 'yanam', 'machilipatnam',
  'kakinada', 'chittagong', 'cox bazar', 'digha', 'mandarmani', 'bakkhali',
  // Coastal states
  'maharashtra coast', 'goa coast', 'karnataka coast', 'kerala coast', 'tamil nadu coast',
  'andhra pradesh coast', 'odisha coast', 'west bengal coast', 'gujarat coast'
];

const URGENCY_INDICATORS = {
  critical: ['emergency', 'urgent', 'immediate', 'evacuate', 'danger', 'trapped', 'rescue needed'],
  high: ['warning', 'alert', 'caution', 'advisory', 'watch', 'prepare'],
  medium: ['rising', 'increasing', 'approaching', 'expected', 'forecast'],
  low: ['update', 'report', 'information', 'monitoring', 'observation']
};

const SENTIMENT_POSITIVE = ['safe', 'rescued', 'helped', 'recovered', 'improving', 'better', 'calm'];
const SENTIMENT_NEGATIVE = ['disaster', 'damage', 'destroyed', 'lost', 'terrible', 'awful', 'devastated'];

// Enhanced NLP Processing Functions
function extractKeywords(content: string): string[] {
  const keywords: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Check for hazard keywords
  Object.entries(HAZARD_KEYWORDS).forEach(([category, words]) => {
    words.forEach(keyword => {
      if (lowerContent.includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    });
  });
  
  // Check for location keywords
  COASTAL_LOCATIONS.forEach(location => {
    if (lowerContent.includes(location.toLowerCase())) {
      keywords.push(location);
    }
  });
  
  // Extract hashtags
  const hashtagMatches = content.match(/#\w+/g);
  if (hashtagMatches) {
    keywords.push(...hashtagMatches);
  }
  
  return [...new Set(keywords)]; // Remove duplicates
}

function analyzeSentiment(content: string): number {
  const lowerContent = content.toLowerCase();
  let score = 0;
  
  // Count positive indicators
  SENTIMENT_POSITIVE.forEach(word => {
    if (lowerContent.includes(word)) score += 0.1;
  });
  
  // Count negative indicators
  SENTIMENT_NEGATIVE.forEach(word => {
    if (lowerContent.includes(word)) score -= 0.1;
  });
  
  // Urgency affects sentiment negatively
  Object.values(URGENCY_INDICATORS).flat().forEach(word => {
    if (lowerContent.includes(word)) score -= 0.05;
  });
  
  return Math.max(-1, Math.min(1, score));
}

function analyzeUrgency(content: string): number {
  const lowerContent = content.toLowerCase();
  
  // Check for critical urgency indicators
  if (URGENCY_INDICATORS.critical.some(word => lowerContent.includes(word))) {
    return 5;
  }
  
  // Check for high urgency indicators
  if (URGENCY_INDICATORS.high.some(word => lowerContent.includes(word))) {
    return 4;
  }
  
  // Check for medium urgency indicators
  if (URGENCY_INDICATORS.medium.some(word => lowerContent.includes(word))) {
    return 3;
  }
  
  // Check for low urgency indicators
  if (URGENCY_INDICATORS.low.some(word => lowerContent.includes(word))) {
    return 2;
  }
  
  return 1; // Default low urgency
}

function calculateConfidenceScore(mention: SocialMention): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for more keywords
  if (mention.nlp_keywords && mention.nlp_keywords.length > 0) {
    confidence += mention.nlp_keywords.length * 0.1;
  }
  
  // Higher confidence for location specificity
  if (mention.location) {
    confidence += 0.2;
  }
  
  // Higher confidence for urgency
  if (mention.urgency_score && mention.urgency_score > 3) {
    confidence += 0.2;
  }
  
  // Higher confidence for coastal imagery
  if (mention.has_coastal_imagery) {
    confidence += 0.3;
  }
  
  return Math.min(1, confidence);
}

// Image Analysis Function (Mock implementation)
async function analyzeImageForCoastalContent(imageUrl: string): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Download the image
    // 2. Use computer vision APIs (like Google Vision AI, AWS Rekognition, or Azure Computer Vision)
    // 3. Analyze for coastal features: water, waves, beaches, storms, etc.
    
    // Mock analysis based on URL patterns or metadata
    const lowerUrl = imageUrl.toLowerCase();
    const coastalIndicators = ['beach', 'ocean', 'sea', 'wave', 'coast', 'shore', 'storm', 'flood'];
    
    return coastalIndicators.some(indicator => lowerUrl.includes(indicator));
  } catch (error) {
    console.error('Image analysis error:', error);
    return false;
  }
}

// Enhanced Web Scraping Functions
async function scrapeTwitter(): Promise<SocialMention[]> {
  // In a real implementation, you would use Twitter API v2 or web scraping
  // This is a mock with more realistic data patterns
  
  const mockData: SocialMention[] = [
    {
      content: "🌊 URGENT: Massive waves hitting Chennai Marina Beach! Water reaching the road. People advised to stay away from the shore. #ChennaiAlert #CoastalSafety #Emergency",
      source: "twitter",
      author: "@ChennaiWeatherAlert",
      posted_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      url: "https://twitter.com/ChennaiWeatherAlert/status/" + Math.random().toString().substr(2, 15),
      engagement_metrics: { likes: Math.floor(Math.random() * 1000), retweets: Math.floor(Math.random() * 500) },
      media_urls: ["https://example.com/images/chennai_waves_" + Date.now() + ".jpg"],
      location: "Chennai, Tamil Nadu",
      hashtags: ["#ChennaiAlert", "#CoastalSafety", "#Emergency"]
    },
    {
      content: "Cyclone Biparjoy approaching Gujarat coast. IMD issues red alert for Kutch and Devbhumi Dwarka districts. Evacuation underway. Stay safe! #CycloneBiparjoy #GujaratAlert",
      source: "twitter",
      author: "@IMDWeather",
      posted_at: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      url: "https://twitter.com/IMDWeather/status/" + Math.random().toString().substr(2, 15),
      engagement_metrics: { likes: Math.floor(Math.random() * 2000), retweets: Math.floor(Math.random() * 1000) },
      location: "Gujarat Coast",
      hashtags: ["#CycloneBiparjoy", "#GujaratAlert"]
    },
    {
      content: "Storm surge warning for Odisha coast. Fishermen advised not to venture into sea for next 48 hours. NDRF teams on standby. #OdishaWeather #StormSurge",
      source: "twitter",
      author: "@OdishaDisaster",
      posted_at: new Date(Date.now() - Math.random() * 7200000).toISOString(),
      url: "https://twitter.com/OdishaDisaster/status/" + Math.random().toString().substr(2, 15),
      engagement_metrics: { likes: Math.floor(Math.random() * 800), retweets: Math.floor(Math.random() * 400) },
      location: "Odisha Coast",
      hashtags: ["#OdishaWeather", "#StormSurge"]
    }
  ];
  
  return mockData;
}

async function scrapeFacebook(): Promise<SocialMention[]> {
  const mockData: SocialMention[] = [
    {
      content: "Coastal flooding reported in Kochi backwaters. Several areas waterlogged. Boats deployed for rescue operations. Residents in low-lying areas advised to move to relief camps.",
      source: "facebook",
      author: "Kerala State Disaster Management Authority",
      posted_at: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      url: "https://facebook.com/KSDMA/posts/" + Math.random().toString().substr(2, 15),
      engagement_metrics: { likes: Math.floor(Math.random() * 1500), shares: Math.floor(Math.random() * 300) },
      location: "Kochi, Kerala"
    },
    {
      content: "High tide alert for Mumbai coastal areas. Marine Drive temporarily closed due to waves overtopping. Citizens advised to avoid coastal routes.",
      source: "facebook",
      author: "Mumbai Police",
      posted_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      url: "https://facebook.com/MumbaiPolice/posts/" + Math.random().toString().substr(2, 15),
      engagement_metrics: { likes: Math.floor(Math.random() * 2000), shares: Math.floor(Math.random() * 500) },
      location: "Mumbai, Maharashtra"
    }
  ];
  
  return mockData;
}

async function scrapeYouTube(): Promise<SocialMention[]> {
  const mockData: SocialMention[] = [
    {
      content: "LIVE: Cyclone updates from Visakhapatnam - Strong winds and rain lashing the coast. Stay indoors and stay safe. Emergency helpline numbers in description.",
      source: "youtube",
      author: "News18 Telugu",
      posted_at: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      url: "https://youtube.com/watch?v=" + Math.random().toString(36).substr(2, 11),
      engagement_metrics: { views: Math.floor(Math.random() * 50000), likes: Math.floor(Math.random() * 1000) },
      media_urls: ["https://example.com/thumbnails/cyclone_live_" + Date.now() + ".jpg"],
      location: "Visakhapatnam, Andhra Pradesh"
    }
  ];
  
  return mockData;
}

async function scrapeInstagram(): Promise<SocialMention[]> {
  const mockData: SocialMention[] = [
    {
      content: "Massive waves at Goa beaches today! 🌊 Lifeguards asking everyone to stay out of water. #GoaBeaches #HighWaves #SafetyFirst",
      source: "instagram",
      author: "@goa_tourism",
      posted_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      url: "https://instagram.com/p/" + Math.random().toString(36).substr(2, 11),
      engagement_metrics: { likes: Math.floor(Math.random() * 3000), comments: Math.floor(Math.random() * 200) },
      media_urls: ["https://example.com/images/goa_waves_" + Date.now() + ".jpg"],
      location: "Goa",
      hashtags: ["#GoaBeaches", "#HighWaves", "#SafetyFirst"]
    }
  ];
  
  return mockData;
}

// Process mentions with enhanced NLP
async function processMentions(mentions: SocialMention[]): Promise<SocialMention[]> {
  const processedMentions = [];
  
  for (const mention of mentions) {
    try {
      // Extract keywords and analyze
      const keywords = extractKeywords(mention.content);
      const sentiment = analyzeSentiment(mention.content);
      const urgency = analyzeUrgency(mention.content);
      
      // Analyze images if present
      let hasCoastalImagery = false;
      if (mention.media_urls && mention.media_urls.length > 0) {
        for (const imageUrl of mention.media_urls) {
          if (await analyzeImageForCoastalContent(imageUrl)) {
            hasCoastalImagery = true;
            break;
          }
        }
      }
      
      const processedMention: SocialMention = {
        ...mention,
        nlp_keywords: keywords,
        nlp_sentiment_score: sentiment,
        urgency_score: urgency,
        has_coastal_imagery: hasCoastalImagery,
        scraped_at: new Date().toISOString()
      };
      
      // Calculate confidence score
      processedMention.confidence_score = calculateConfidenceScore(processedMention);
      
      // Only include mentions with reasonable confidence and relevance
      if (keywords.length > 0 && processedMention.confidence_score > 0.3) {
        processedMentions.push(processedMention);
      }
      
    } catch (error) {
      console.error('Error processing mention:', error);
      // Include unprocessed mention with basic analysis
      processedMentions.push({
        ...mention,
        nlp_keywords: [],
        nlp_sentiment_score: 0,
        urgency_score: 1,
        has_coastal_imagery: false,
        confidence_score: 0.1,
        scraped_at: new Date().toISOString()
      });
    }
  }
  
  return processedMentions;
}

// Main scraping function
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Starting enhanced social media scraping with NLP analysis...')

    // Initialize Supabase client
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

    // Scrape data from multiple sources in parallel
    const [twitterData, facebookData, youtubeData, instagramData] = await Promise.all([
      scrapeTwitter(),
      scrapeFacebook(),
      scrapeYouTube(),
      scrapeInstagram()
    ]);
    
    console.log(`📊 Scraped ${twitterData.length} Twitter, ${facebookData.length} Facebook, ${youtubeData.length} YouTube, ${instagramData.length} Instagram posts`)
    
    // Combine all data
    const allMentions = [...twitterData, ...facebookData, ...youtubeData, ...instagramData];
    
    // Process with enhanced NLP
    const processedMentions = await processMentions(allMentions);
    
    console.log(`🧠 Processed ${processedMentions.length} mentions with NLP analysis`)
    
    // Filter out low-confidence or irrelevant mentions
    const filteredMentions = processedMentions.filter(mention => 
      mention.confidence_score && mention.confidence_score > 0.4
    );
    
    console.log(`🎯 Filtered to ${filteredMentions.length} high-confidence mentions`)

    if (filteredMentions.length > 0) {
      // Insert data into Supabase
      const { data, error } = await supabaseClient
        .from('social_mentions')
        .insert(filteredMentions.map(mention => ({
          content: mention.content,
          source: mention.source,
          author: mention.author,
          posted_at: mention.posted_at,
          url: mention.url,
          engagement_metrics: mention.engagement_metrics || {},
          nlp_keywords: mention.nlp_keywords || [],
          nlp_sentiment_score: mention.nlp_sentiment_score || 0,
          urgency_score: mention.urgency_score || 1,
          scraped_at: mention.scraped_at
        })));

      if (error) {
        console.error('❌ Error inserting social mentions:', error)
        throw error
      }

      console.log(`✅ Successfully stored ${filteredMentions.length} processed social media mentions`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${processedMentions.length} mentions, stored ${filteredMentions.length} high-confidence mentions`,
        scraped_count: allMentions.length,
        processed_count: processedMentions.length,
        stored_count: filteredMentions.length,
        average_confidence: filteredMentions.reduce((sum, m) => sum + (m.confidence_score || 0), 0) / filteredMentions.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error in enhanced social-media-scraper:', error)
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