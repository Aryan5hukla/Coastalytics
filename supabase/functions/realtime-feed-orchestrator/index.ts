// Real-Time Feed Orchestrator with Your API Keys
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RealTimeFeedData {
  content: string;
  source: string;
  author?: string;
  posted_at?: string;
  url?: string;
  urgency_score: number;
  confidence_score: number;
  keywords: string[];
  sentiment_score: number;
  location?: string;
  media_urls?: string[];
}

// Real-time Twitter integration using your API keys
async function fetchTwitterRealTime(): Promise<RealTimeFeedData[]> {
  const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
  
  if (!bearerToken) {
    console.warn('⚠️ Twitter Bearer Token not found in environment');
    return [];
  }

  console.log('🐦 Fetching real-time Twitter data...');
  
  const feeds: RealTimeFeedData[] = [];
  
  // Enhanced queries for immediate coastal threats
  const twitterQueries = [
    // Emergency alerts and evacuations
    '(tsunami OR "immediate evacuation" OR "coastal emergency") (India OR Chennai OR Mumbai OR Gujarat) -is:retweet lang:en',
    
    // Official weather warnings
    '(from:Indiametdept OR from:ndmaindia OR from:coastguardindia) (cyclone OR tsunami OR storm OR "high waves" OR alert)',
    
    // Breaking coastal news
    '("breaking" OR "urgent" OR "alert") (coastal OR "storm surge" OR "high waves") (India OR Chennai OR Mumbai) -is:retweet',
    
    // Real-time marine conditions
    '("happening now" OR "currently") (coast OR beach OR marine OR waves OR flooding) India -is:retweet'
  ];

  for (const query of twitterQueries) {
    try {
      // Twitter API v2 with enhanced real-time parameters
      const apiUrl = `https://api.twitter.com/2/tweets/search/recent?` +
        `query=${encodeURIComponent(query)}&` +
        `max_results=20&` +
        `tweet.fields=created_at,author_id,public_metrics,entities,context_annotations,geo&` +
        `expansions=author_id,attachments.media_keys&` +
        `user.fields=name,username,verified&` +
        `media.fields=url,preview_image_url&` +
        `sort_order=recency`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'CoastalyticsRealTime/1.0'
        }
      });

      if (!response.ok) {
        console.error(`Twitter API error for query: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Map users for reference
        const usersById: { [key: string]: any } = {};
        if (data.includes?.users) {
          data.includes.users.forEach((user: any) => {
            usersById[user.id] = user;
          });
        }

        // Map media for reference
        const mediaById: { [key: string]: any } = {};
        if (data.includes?.media) {
          data.includes.media.forEach((media: any) => {
            mediaById[media.media_key] = media;
          });
        }

        for (const tweet of data.data) {
          const author = usersById[tweet.author_id];
          const mediaUrls: string[] = [];
          
          // Extract media URLs
          if (tweet.attachments?.media_keys) {
            tweet.attachments.media_keys.forEach((key: string) => {
              const media = mediaById[key];
              if (media?.url || media?.preview_image_url) {
                mediaUrls.push(media.url || media.preview_image_url);
              }
            });
          }

          // Extract location from context
          let location = '';
          if (tweet.context_annotations) {
            const locationEntity = tweet.context_annotations.find((ctx: any) => 
              ctx.domain?.name === 'Place'
            );
            if (locationEntity) {
              location = locationEntity.entity?.name || '';
            }
          }

          // Quick keyword extraction for real-time processing
          const keywords = extractQuickKeywords(tweet.text);
          const urgency = calculateQuickUrgency(tweet.text, author?.verified);
          const sentiment = calculateQuickSentiment(tweet.text);

          feeds.push({
            content: tweet.text,
            source: 'twitter_realtime',
            author: author ? `@${author.username}` : 'Twitter User',
            posted_at: tweet.created_at,
            url: `https://twitter.com/i/status/${tweet.id}`,
            urgency_score: urgency,
            confidence_score: calculateQuickConfidence(keywords, urgency, author?.verified),
            keywords: keywords,
            sentiment_score: sentiment,
            location: location,
            media_urls: mediaUrls
          });
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error fetching Twitter data:', error);
    }
  }

  console.log(`✅ Fetched ${feeds.length} real-time Twitter posts`);
  return feeds;
}

// Real-time News API integration using your API key
async function fetchNewsRealTime(): Promise<RealTimeFeedData[]> {
  const apiKey = Deno.env.get('NEWS_API_KEY');
  
  if (!apiKey) {
    console.warn('⚠️ News API key not found in environment');
    return [];
  }

  console.log('📰 Fetching real-time news data...');
  
  const feeds: RealTimeFeedData[] = [];
  
  // Real-time news queries for immediate threats
  const newsQueries = [
    'tsunami India coastal emergency alert',
    'cyclone India landfall warning evacuation',
    'coastal flooding India rescue emergency',
    'storm surge India Mumbai Chennai Gujarat',
    'IMD weather warning India coastal marine'
  ];

  for (const query of newsQueries) {
    try {
      // Last 6 hours for breaking news
      const fromTime = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      
      const apiUrl = `https://newsapi.org/v2/everything?` +
        `q=${encodeURIComponent(query)}&` +
        `language=en&` +
        `sortBy=publishedAt&` +
        `pageSize=10&` +
        `from=${fromTime}&` +
        `domains=timesofindia.indiatimes.com,thehindu.com,indianexpress.com,ndtv.com,hindustantimes.com`;

      const response = await fetch(apiUrl, {
        headers: {
          'X-API-Key': apiKey,
          'User-Agent': 'CoastalyticsRealTime/1.0'
        }
      });

      if (!response.ok) {
        console.error(`News API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.articles && Array.isArray(data.articles)) {
        for (const article of data.articles) {
          const content = `${article.title}\n${article.description || ''}`;
          const keywords = extractQuickKeywords(content);
          const urgency = calculateQuickUrgency(content, false);
          const sentiment = calculateQuickSentiment(content);

          // Filter for coastal relevance
          if (keywords.length > 0) {
            feeds.push({
              content: content,
              source: 'news_realtime',
              author: article.source?.name || 'News Source',
              posted_at: article.publishedAt,
              url: article.url,
              urgency_score: urgency,
              confidence_score: calculateQuickConfidence(keywords, urgency, true),
              keywords: keywords,
              sentiment_score: sentiment,
              media_urls: article.urlToImage ? [article.urlToImage] : []
            });
          }
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Error fetching News API data:', error);
    }
  }

  console.log(`✅ Fetched ${feeds.length} real-time news articles`);
  return feeds;
}

// Quick NLP functions for real-time processing
function extractQuickKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const keywords: string[] = [];
  
  const keywordSets = {
    hazards: ['tsunami', 'cyclone', 'storm surge', 'coastal flooding', 'high waves', 'rough seas'],
    emergency: ['emergency', 'alert', 'warning', 'evacuation', 'urgent', 'immediate', 'danger'],
    locations: ['chennai', 'mumbai', 'kolkata', 'gujarat', 'odisha', 'kerala', 'bay of bengal', 'arabian sea'],
    sources: ['imd', 'incois', 'ndrf', 'coast guard']
  };
  
  Object.values(keywordSets).flat().forEach(keyword => {
    if (lowerText.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  // Extract hashtags
  const hashtags = text.match(/#\w+/g) || [];
  keywords.push(...hashtags);
  
  return [...new Set(keywords)];
}

function calculateQuickUrgency(text: string, isVerified?: boolean): number {
  const lowerText = text.toLowerCase();
  
  let urgency = 1;
  
  if (lowerText.includes('emergency') || lowerText.includes('evacuate') || lowerText.includes('immediate')) urgency = 5;
  else if (lowerText.includes('warning') || lowerText.includes('alert') || lowerText.includes('danger')) urgency = 4;
  else if (lowerText.includes('advisory') || lowerText.includes('caution') || lowerText.includes('watch')) urgency = 3;
  else if (lowerText.includes('forecast') || lowerText.includes('expected') || lowerText.includes('approaching')) urgency = 2;
  
  // Boost for verified sources
  if (isVerified) urgency = Math.min(5, urgency + 1);
  
  return urgency;
}

function calculateQuickSentiment(text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  
  const positive = ['safe', 'rescued', 'helped', 'recovered', 'improving'];
  const negative = ['disaster', 'damage', 'destroyed', 'terrible', 'devastated', 'critical'];
  
  positive.forEach(word => {
    if (lowerText.includes(word)) score += 0.2;
  });
  
  negative.forEach(word => {
    if (lowerText.includes(word)) score -= 0.2;
  });
  
  return Math.max(-1, Math.min(1, score));
}

function calculateQuickConfidence(keywords: string[], urgency: number, isOfficial: boolean): number {
  let confidence = 0.5;
  
  confidence += Math.min(0.3, keywords.length * 0.1);
  confidence += urgency >= 4 ? 0.2 : 0;
  confidence += isOfficial ? 0.2 : 0;
  
  return Math.min(1, confidence);
}

// Main orchestrator function
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting real-time feed orchestration...');
    
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
    );

    // Fetch real-time data from all sources in parallel
    const [twitterFeeds, newsFeeds] = await Promise.all([
      fetchTwitterRealTime(),
      fetchNewsRealTime()
    ]);

    // Combine all feeds
    const allFeeds = [...twitterFeeds, ...newsFeeds];
    
    console.log(`📊 Total feeds collected: ${allFeeds.length}`);
    
    // Filter for high-confidence and relevant content
    const filteredFeeds = allFeeds.filter(feed => 
      feed.confidence_score > 0.4 && feed.keywords.length > 0
    );
    
    console.log(`🎯 High-confidence feeds: ${filteredFeeds.length}`);

    // Sort by urgency and recency
    filteredFeeds.sort((a, b) => {
      if (b.urgency_score !== a.urgency_score) {
        return b.urgency_score - a.urgency_score;
      }
      const timeA = new Date(a.posted_at || 0).getTime();
      const timeB = new Date(b.posted_at || 0).getTime();
      return timeB - timeA;
    });

    // Insert into database if we have data
    if (filteredFeeds.length > 0) {
      const { data, error } = await supabaseClient
        .from('social_mentions')
        .insert(filteredFeeds.map(feed => ({
          content: feed.content,
          source: feed.source,
          author: feed.author,
          posted_at: feed.posted_at,
          url: feed.url,
          nlp_keywords: feed.keywords,
          nlp_sentiment_score: feed.sentiment_score,
          urgency_score: feed.urgency_score,
          scraped_at: new Date().toISOString()
        })));

      if (error) {
        console.error('❌ Database insert error:', error);
        throw error;
      }

      console.log(`✅ Stored ${filteredFeeds.length} real-time feeds in database`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Real-time feed orchestration complete`,
        stats: {
          twitter_feeds: twitterFeeds.length,
          news_feeds: newsFeeds.length,
          total_collected: allFeeds.length,
          high_confidence_stored: filteredFeeds.length,
          average_urgency: filteredFeeds.reduce((sum, f) => sum + f.urgency_score, 0) / filteredFeeds.length || 0,
          critical_alerts: filteredFeeds.filter(f => f.urgency_score >= 4).length
        },
        api_status: {
          twitter_api: twitterFeeds.length > 0 ? 'active' : 'limited',
          news_api: newsFeeds.length > 0 ? 'active' : 'limited'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Real-time feed orchestration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Real-time feed orchestration failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
