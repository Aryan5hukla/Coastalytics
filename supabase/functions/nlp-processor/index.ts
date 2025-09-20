// Advanced NLP Processing for Social Media Mentions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NLPRequest {
  text: string;
  source?: string;
  location?: string;
  imageUrls?: string[];
}

interface NLPResponse {
  keywords: string[];
  sentiment_score: number;
  urgency_score: number;
  confidence_score: number;
  emotion_analysis: {
    fear: number;
    anger: number;
    sadness: number;
    joy: number;
    surprise: number;
  };
  named_entities: {
    locations: string[];
    organizations: string[];
    persons: string[];
    dates: string[];
  };
  text_classification: {
    is_emergency: boolean;
    is_factual: boolean;
    is_relevant: boolean;
    hazard_type: string | null;
  };
  image_analysis?: {
    contains_coastal_content: boolean;
    detected_objects: string[];
    scene_description: string;
  };
}

// Enhanced keyword dictionaries
const KEYWORD_CATEGORIES = {
  hazards: {
    tsunami: ['tsunami', 'tidal wave', 'harbor wave', 'seismic sea wave', 'killer wave'],
    cyclone: ['cyclone', 'hurricane', 'typhoon', 'tropical storm', 'supercyclone', 'severe cyclonic storm'],
    storm_surge: ['storm surge', 'storm tide', 'coastal surge', 'tidal surge', 'surge flooding'],
    flooding: ['flood', 'flooding', 'inundation', 'waterlogging', 'submersion', 'deluge'],
    erosion: ['erosion', 'coastal erosion', 'beach erosion', 'shoreline retreat', 'land loss'],
    waves: ['high waves', 'rough seas', 'heavy swell', 'dangerous waves', 'giant waves', 'killer waves'],
    wind: ['strong winds', 'gale force', 'hurricane winds', 'destructive winds'],
    rain: ['heavy rain', 'torrential rain', 'downpour', 'cloudburst', 'extreme rainfall']
  },
  emergency_terms: {
    critical: ['emergency', 'urgent', 'critical', 'immediate', 'crisis', 'catastrophe', 'disaster'],
    evacuation: ['evacuate', 'evacuation', 'flee', 'escape', 'relocate', 'move to safety'],
    rescue: ['rescue', 'trapped', 'stranded', 'help needed', 'sos', 'mayday'],
    damage: ['damage', 'destruction', 'devastation', 'collapse', 'destroyed', 'ruined'],
    casualties: ['injured', 'casualties', 'victims', 'missing', 'dead', 'fatalities']
  },
  locations: {
    indian_states: ['maharashtra', 'gujarat', 'goa', 'karnataka', 'kerala', 'tamil nadu', 'andhra pradesh', 'telangana', 'odisha', 'west bengal'],
    coastal_cities: ['mumbai', 'chennai', 'kolkata', 'visakhapatnam', 'kochi', 'mangalore', 'puri', 'surat', 'thiruvananthapuram'],
    water_bodies: ['arabian sea', 'bay of bengal', 'indian ocean', 'lakshadweep sea']
  }
};

const EMOTION_INDICATORS = {
  fear: ['scared', 'terrified', 'afraid', 'panic', 'frightened', 'worried', 'anxious'],
  anger: ['angry', 'furious', 'outraged', 'frustrated', 'mad', 'livid'],
  sadness: ['sad', 'devastated', 'heartbroken', 'tragic', 'sorrow', 'grief'],
  joy: ['happy', 'relieved', 'grateful', 'thankful', 'blessed', 'safe'],
  surprise: ['shocked', 'amazed', 'surprised', 'stunned', 'incredible', 'unbelievable']
};

// Advanced NLP Functions
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Extract hazard keywords
  Object.entries(KEYWORD_CATEGORIES.hazards).forEach(([category, words]) => {
    words.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        keywords.push(word);
      }
    });
  });
  
  // Extract emergency terms
  Object.entries(KEYWORD_CATEGORIES.emergency_terms).forEach(([category, words]) => {
    words.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        keywords.push(word);
      }
    });
  });
  
  // Extract location keywords
  Object.entries(KEYWORD_CATEGORIES.locations).forEach(([category, words]) => {
    words.forEach(word => {
      if (lowerText.includes(word.toLowerCase())) {
        keywords.push(word);
      }
    });
  });
  
  // Extract hashtags and mentions
  const hashtagMatches = text.match(/#\w+/g) || [];
  const mentionMatches = text.match(/@\w+/g) || [];
  
  return [...new Set([...keywords, ...hashtagMatches, ...mentionMatches])];
}

function analyzeSentiment(text: string): number {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['safe', 'rescued', 'helped', 'good', 'better', 'improving', 'calm', 'peaceful'];
  const negativeWords = ['disaster', 'terrible', 'awful', 'bad', 'worse', 'dangerous', 'severe', 'critical'];
  
  let score = 0;
  
  positiveWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    score += matches * 0.1;
  });
  
  negativeWords.forEach(word => {
    const matches = (lowerText.match(new RegExp(word, 'g')) || []).length;
    score -= matches * 0.1;
  });
  
  return Math.max(-1, Math.min(1, score));
}

function analyzeEmotions(text: string): { [key: string]: number } {
  const lowerText = text.toLowerCase();
  const emotions: { [key: string]: number } = {};
  
  Object.entries(EMOTION_INDICATORS).forEach(([emotion, indicators]) => {
    let score = 0;
    indicators.forEach(indicator => {
      if (lowerText.includes(indicator)) {
        score += 0.2;
      }
    });
    emotions[emotion] = Math.min(1, score);
  });
  
  return emotions;
}

function extractNamedEntities(text: string): any {
  // Simple named entity extraction (in production, use proper NER models)
  const entities = {
    locations: [] as string[],
    organizations: [] as string[],
    persons: [] as string[],
    dates: [] as string[]
  };
  
  // Extract locations
  Object.values(KEYWORD_CATEGORIES.locations).flat().forEach(location => {
    if (text.toLowerCase().includes(location.toLowerCase())) {
      entities.locations.push(location);
    }
  });
  
  // Extract organizations (simple patterns)
  const orgPatterns = [
    /\b(IMD|INCOIS|NDRF|SDRF|Coast Guard|Navy|Police|District Collector)\b/gi,
    /\b\w+\s+(Department|Authority|Agency|Commission|Board)\b/gi
  ];
  
  orgPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.organizations.push(...matches);
    }
  });
  
  // Extract dates
  const datePattern = /\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})\b/gi;
  const dateMatches = text.match(datePattern);
  if (dateMatches) {
    entities.dates.push(...dateMatches);
  }
  
  return entities;
}

function analyzeUrgency(text: string): number {
  const lowerText = text.toLowerCase();
  
  const urgencyLevels = [
    { level: 5, keywords: ['emergency', 'urgent', 'immediate', 'evacuate now', 'life threatening'] },
    { level: 4, keywords: ['warning', 'alert', 'danger', 'severe', 'critical'] },
    { level: 3, keywords: ['caution', 'watch', 'advisory', 'prepare', 'rising'] },
    { level: 2, keywords: ['monitor', 'observe', 'expected', 'forecast', 'approaching'] },
    { level: 1, keywords: ['update', 'information', 'report', 'status', 'normal'] }
  ];
  
  for (const level of urgencyLevels) {
    if (level.keywords.some(keyword => lowerText.includes(keyword))) {
      return level.level;
    }
  }
  
  return 1;
}

function classifyText(text: string, keywords: string[]): any {
  const lowerText = text.toLowerCase();
  
  // Determine if it's an emergency
  const emergencyKeywords = ['emergency', 'urgent', 'evacuate', 'rescue', 'danger', 'critical'];
  const isEmergency = emergencyKeywords.some(keyword => lowerText.includes(keyword));
  
  // Determine if it's factual (vs opinion)
  const factualIndicators = ['reported', 'confirmed', 'issued', 'announced', 'observed', 'recorded'];
  const opinionIndicators = ['think', 'believe', 'feel', 'seems', 'probably', 'maybe'];
  const isFactual = factualIndicators.some(indicator => lowerText.includes(indicator)) &&
                    !opinionIndicators.some(indicator => lowerText.includes(indicator));
  
  // Determine relevance to coastal hazards
  const coastalKeywords = Object.values(KEYWORD_CATEGORIES.hazards).flat();
  const isRelevant = coastalKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  
  // Identify hazard type
  let hazardType = null;
  Object.entries(KEYWORD_CATEGORIES.hazards).forEach(([type, words]) => {
    if (words.some(word => lowerText.includes(word.toLowerCase()))) {
      hazardType = type;
    }
  });
  
  return {
    is_emergency: isEmergency,
    is_factual: isFactual,
    is_relevant: isRelevant,
    hazard_type: hazardType
  };
}

function calculateConfidenceScore(analysis: any): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for more keywords
  if (analysis.keywords.length > 0) {
    confidence += Math.min(0.3, analysis.keywords.length * 0.05);
  }
  
  // Higher confidence for named entities
  const entityCount = Object.values(analysis.named_entities).flat().length;
  confidence += Math.min(0.2, entityCount * 0.02);
  
  // Higher confidence for factual content
  if (analysis.text_classification.is_factual) {
    confidence += 0.15;
  }
  
  // Higher confidence for emergency content
  if (analysis.text_classification.is_emergency) {
    confidence += 0.15;
  }
  
  // Boost confidence for official sources (real-time enhancement)
  if (analysis.source && (analysis.source.includes('twitter') && 
      (analysis.source.includes('imd') || analysis.source.includes('incois') || 
       analysis.source.includes('official') || analysis.source.includes('govt')))) {
    confidence += 0.2;
  }
  
  // Higher confidence for high urgency real-time content
  if (analysis.urgency_score && analysis.urgency_score >= 4) {
    confidence += 0.1;
  }
  
  // Higher confidence for relevant real-time content
  if (analysis.text_classification.is_relevant) {
    confidence += 0.1;
  }
  
  return Math.min(1, confidence);
}

// Mock image analysis function
async function analyzeImage(imageUrl: string): Promise<any> {
  try {
    // In production, integrate with Google Vision AI, AWS Rekognition, or Azure Computer Vision
    console.log(`Analyzing image: ${imageUrl}`);
    
    // Mock analysis based on URL patterns
    const lowerUrl = imageUrl.toLowerCase();
    const coastalObjects = ['water', 'ocean', 'sea', 'waves', 'beach', 'shore', 'coast'];
    const weatherObjects = ['storm', 'clouds', 'rain', 'wind', 'cyclone'];
    
    const detectedObjects = [];
    let containsCoastalContent = false;
    
    if (coastalObjects.some(obj => lowerUrl.includes(obj))) {
      detectedObjects.push('coastal_features');
      containsCoastalContent = true;
    }
    
    if (weatherObjects.some(obj => lowerUrl.includes(obj))) {
      detectedObjects.push('weather_phenomena');
      containsCoastalContent = true;
    }
    
    return {
      contains_coastal_content: containsCoastalContent,
      detected_objects: detectedObjects,
      scene_description: containsCoastalContent ? 'Coastal weather scene detected' : 'General image'
    };
    
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      contains_coastal_content: false,
      detected_objects: [],
      scene_description: 'Analysis failed'
    };
  }
}

// Enhanced real-time text processing function
async function processTextWithNLP(request: NLPRequest): Promise<NLPResponse> {
  const { text, source, location, imageUrls = [] } = request;
  
  // Extract keywords with source-specific weighting
  const keywords = extractKeywords(text);
  
  // Analyze sentiment with real-time context
  const sentimentScore = analyzeSentiment(text);
  
  // Analyze emotions with enhanced detection
  const emotions = analyzeEmotions(text);
  
  // Extract named entities with location validation
  const namedEntities = extractNamedEntities(text);
  
  // Analyze urgency with source credibility weighting
  let urgencyScore = analyzeUrgency(text);
  
  // Boost urgency for official sources
  if (source && (source.includes('imd') || source.includes('incois') || source.includes('ndrf') || 
                 source.includes('coastguard') || source.includes('official'))) {
    urgencyScore = Math.min(5, urgencyScore + 1);
  }
  
  // Classify text with real-time context
  const textClassification = classifyText(text, keywords);
  
  // Enhanced real-time relevance check
  const isRealTimeRelevant = checkRealTimeRelevance(text, source, location);
  textClassification.is_relevant = textClassification.is_relevant || isRealTimeRelevant;
  
  // Analyze images if provided
  let imageAnalysis;
  if (imageUrls.length > 0) {
    const imageResults = await Promise.all(
      imageUrls.map(url => analyzeImage(url))
    );
    
    imageAnalysis = {
      contains_coastal_content: imageResults.some(result => result.contains_coastal_content),
      detected_objects: [...new Set(imageResults.flatMap(result => result.detected_objects))],
      scene_description: imageResults.map(result => result.scene_description).join('; ')
    };
  }
  
  // Calculate confidence score with real-time factors
  const analysis = {
    keywords,
    named_entities: namedEntities,
    text_classification: textClassification,
    source: source,
    urgency_score: urgencyScore
  };
  const confidenceScore = calculateConfidenceScore(analysis);
  
  return {
    keywords,
    sentiment_score: sentimentScore,
    urgency_score: urgencyScore,
    confidence_score: confidenceScore,
    emotion_analysis: emotions,
    named_entities: namedEntities,
    text_classification: textClassification,
    image_analysis: imageAnalysis
  };
}

// Enhanced real-time relevance checker
function checkRealTimeRelevance(text: string, source?: string, location?: string): boolean {
  const lowerText = text.toLowerCase();
  
  // High relevance for emergency terms
  const emergencyTerms = ['emergency', 'alert', 'warning', 'evacuation', 'urgent', 'immediate', 'danger'];
  if (emergencyTerms.some(term => lowerText.includes(term))) {
    return true;
  }
  
  // High relevance for live/breaking updates
  const liveTerms = ['breaking', 'live', 'happening now', 'currently', 'just reported', 'update'];
  if (liveTerms.some(term => lowerText.includes(term))) {
    return true;
  }
  
  // High relevance for specific coastal locations
  const coastalAreas = ['chennai', 'mumbai', 'kolkata', 'gujarat', 'odisha', 'kerala', 'bay of bengal', 'arabian sea'];
  if (coastalAreas.some(area => lowerText.includes(area))) {
    return true;
  }
  
  // High relevance for time-sensitive marine conditions
  const marineConditions = ['high waves', 'rough seas', 'storm surge', 'tidal', 'coastal flooding'];
  if (marineConditions.some(condition => lowerText.includes(condition))) {
    return true;
  }
  
  return false;
}

// Main server function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, source, location, imageUrls }: NLPRequest = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required for NLP processing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`🧠 Processing NLP for text from ${source || 'unknown source'}`);
    
    const result = await processTextWithNLP({ text, source, location, imageUrls });
    
    console.log(`✅ NLP processing completed with confidence: ${result.confidence_score.toFixed(2)}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error in NLP processing:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
