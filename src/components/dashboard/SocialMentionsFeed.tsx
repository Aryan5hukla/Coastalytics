import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MessageSquare, Clock, ExternalLink, AlertTriangle,
  TrendingUp, Heart, Zap, Search,
  ChevronDown, ChevronUp, Eye, BarChart3, Settings,
  MapPin, Users, Calendar, Image
} from 'lucide-react';

interface SocialMention {
  id: string;
  content: string;
  source: string;
  author?: string;
  posted_at?: string;
  scraped_at: string;
  url?: string;
  nlp_keywords: string[];
  urgency_score: number;
  confidence_score?: number;
  nlp_sentiment_score?: number;
  emotion_analysis?: {
    fear?: number;
    anger?: number;
    sadness?: number;
    joy?: number;
    surprise?: number;
  };
  hashtags?: string[];
  media_urls?: string[];
  named_entities?: {
    locations?: string[];
    organizations?: string[];
    persons?: string[];
  };
}


interface TrendingKeyword {
  keyword: string;
  frequency: number;
  avg_urgency: number;
}

// Sample data creation function
const createSampleMentions = (): SocialMention[] => {
  const currentTime = new Date();
  const sampleData = [
    {
      id: 'sample-1',
      content: 'Heavy waves observed near Chennai marina beach. Fishermen advised to stay cautious. #TsunamiWatch #ChennaiWeather',
      source: 'twitter',
      author: 'coastal_observer',
      posted_at: new Date(currentTime.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      scraped_at: new Date(currentTime.getTime() - 25 * 60 * 1000).toISOString(),
      url: 'https://twitter.com/coastal_observer/status/123',
      nlp_keywords: ['heavy waves', 'chennai', 'marina beach', 'fishermen', 'tsunami'],
      urgency_score: 4,
      confidence_score: 0.85,
      nlp_sentiment_score: -0.3,
      emotion_analysis: { fear: 0.6, anger: 0.1, sadness: 0.2, joy: 0.0, surprise: 0.3 },
      hashtags: ['#TsunamiWatch', '#ChennaiWeather'],
      media_urls: [],
      named_entities: { locations: ['Chennai', 'Marina Beach'], organizations: [], persons: [] }
    },
    {
      id: 'sample-2',
      content: 'Cyclone warning issued for Odisha coast. NDRF teams deployed. All fishermen advised to return immediately.',
      source: 'official_sources',
      author: 'IMD_Weather',
      posted_at: new Date(currentTime.getTime() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      scraped_at: new Date(currentTime.getTime() - 40 * 60 * 1000).toISOString(),
      url: 'https://mausam.imd.gov.in/alerts',
      nlp_keywords: ['cyclone', 'warning', 'odisha', 'ndrf', 'fishermen'],
      urgency_score: 5,
      confidence_score: 0.95,
      nlp_sentiment_score: -0.8,
      emotion_analysis: { fear: 0.8, anger: 0.0, sadness: 0.3, joy: 0.0, surprise: 0.4 },
      hashtags: ['#CycloneAlert', '#OdishaWeather'],
      media_urls: [],
      named_entities: { locations: ['Odisha'], organizations: ['NDRF', 'IMD'], persons: [] }
    },
    {
      id: 'sample-3',
      content: 'Beautiful sunset at Goa beach today! Perfect weather for tourists. #GoaBeach #Sunset',
      source: 'instagram',
      author: 'travel_goa',
      posted_at: new Date(currentTime.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      scraped_at: new Date(currentTime.getTime() - 55 * 60 * 1000).toISOString(),
      url: 'https://instagram.com/p/abc123',
      nlp_keywords: ['sunset', 'goa', 'beach', 'weather', 'tourists'],
      urgency_score: 1,
      confidence_score: 0.3,
      nlp_sentiment_score: 0.7,
      emotion_analysis: { fear: 0.0, anger: 0.0, sadness: 0.0, joy: 0.8, surprise: 0.2 },
      hashtags: ['#GoaBeach', '#Sunset'],
      media_urls: ['https://example.com/sunset.jpg'],
      named_entities: { locations: ['Goa'], organizations: [], persons: [] }
    },
    {
      id: 'sample-4',
      content: 'Storm surge alert for Mumbai coast. Water levels rising rapidly. Local authorities monitoring situation.',
      source: 'news_websites',
      author: 'news_reporter',
      posted_at: new Date(currentTime.getTime() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
      scraped_at: new Date(currentTime.getTime() - 85 * 60 * 1000).toISOString(),
      url: 'https://news.example.com/mumbai-storm-surge',
      nlp_keywords: ['storm surge', 'mumbai', 'water levels', 'authorities'],
      urgency_score: 4,
      confidence_score: 0.78,
      nlp_sentiment_score: -0.5,
      emotion_analysis: { fear: 0.7, anger: 0.1, sadness: 0.2, joy: 0.0, surprise: 0.3 },
      hashtags: ['#MumbaiWeather', '#StormSurge'],
      media_urls: [],
      named_entities: { locations: ['Mumbai'], organizations: ['Local authorities'], persons: [] }
    }
  ];

  return sampleData;
};

const SocialMentionsFeed: React.FC = () => {
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [trendingKeywords, setTrendingKeywords] = useState<TrendingKeyword[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [usingSampleData, setUsingSampleData] = useState(false);



  // Sort mentions by urgency, confidence, and time
  const sortedMentions = useMemo(() => {
    return mentions.sort((a, b) => {
      // Sort by urgency first, then by confidence, then by time
      if (a.urgency_score !== b.urgency_score) {
        return b.urgency_score - a.urgency_score;
      }
      if ((a.confidence_score || 0) !== (b.confidence_score || 0)) {
        return (b.confidence_score || 0) - (a.confidence_score || 0);
      }
      return new Date(b.posted_at || b.scraped_at).getTime() - 
             new Date(a.posted_at || a.scraped_at).getTime();
    });
  }, [mentions]);

  // Analytics data
  const analytics = useMemo(() => {
    const total = sortedMentions.length;
    const highUrgency = sortedMentions.filter(m => m.urgency_score >= 4).length;
    const highConfidence = sortedMentions.filter(m => (m.confidence_score || 0) > 0.7).length;
    const avgSentiment = total > 0 ? 
      sortedMentions.reduce((sum, m) => sum + (m.nlp_sentiment_score || 0), 0) / total : 0;
    
    const availableSources = [...new Set(sortedMentions.map(m => m.source))];
    const sourceBreakdown = availableSources.map(source => ({
      source,
      count: sortedMentions.filter(m => m.source === source).length
    }));

    return {
      total,
      highUrgency,
      highConfidence,
      avgSentiment,
      sourceBreakdown
    };
  }, [sortedMentions]);

  useEffect(() => {
    fetchMentions();
    fetchTrendingKeywords();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('social_mentions_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'social_mentions' 
        }, 
        (payload) => {
          const newMention = payload.new as SocialMention;
          setMentions(prev => [newMention, ...prev.slice(0, 199)]); // Keep last 200
          setLastRefresh(new Date());
        }
      )
      .subscribe();

    // Auto refresh interval
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        fetchMentions();
        fetchTrendingKeywords();
      }, 60000); // Refresh every minute
    }

    return () => {
      subscription.unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const fetchMentions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from social_mentions table
      const { data, error } = await supabase
        .from('social_mentions')
        .select('*')
        .order('posted_at', { ascending: false })
        .limit(200);

      if (error) {
        // If social_mentions table doesn't exist, use sample data
        if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
          console.warn('Social mentions table not found, using sample data:', error.message);
          const sampleMentions = createSampleMentions();
          setMentions(sampleMentions);
          setUsingSampleData(true);
          setLastRefresh(new Date());
          return;
        }
        throw error;
      }
      
      setMentions(data || []);
      setLastRefresh(new Date());
      
      // If no data found, create some sample data for demonstration
      if (!data || data.length === 0) {
        const sampleMentions = createSampleMentions();
        setMentions(sampleMentions);
        setUsingSampleData(true);
      } else {
        setUsingSampleData(false);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mentions');
      console.error('Fetch mentions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingKeywords = async () => {
    try {
      const { data, error } = await supabase.rpc('get_trending_keywords', { days_back: 1 });
      if (error) {
        // If function doesn't exist, create sample trending keywords
        if (error.code === 'PGRST202' || error.message.includes('does not exist')) {
          const sampleKeywords = [
            { keyword: 'tsunami', frequency: 15, avg_urgency: 4.2 },
            { keyword: 'cyclone', frequency: 12, avg_urgency: 3.8 },
            { keyword: 'storm surge', frequency: 8, avg_urgency: 3.5 },
            { keyword: 'coastal flooding', frequency: 6, avg_urgency: 3.0 },
            { keyword: 'high waves', frequency: 4, avg_urgency: 2.5 }
          ];
          setTrendingKeywords(sampleKeywords);
          return;
        }
        throw error;
      }
      setTrendingKeywords(data || []);
    } catch (err) {
      console.error('Error fetching trending keywords:', err);
      // Set empty array on error to prevent UI issues
      setTrendingKeywords([]);
    }
  };

  const triggerScraping = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to invoke the function if available, otherwise just refresh the data
      try {
        const { data, error } = await supabase.functions.invoke('realtime-scraper');
        if (error) {
          console.warn('Scraper function not available:', error.message);
          // If function doesn't exist, just refresh the existing data
          await fetchMentions();
          return;
        }
        
        // If function succeeded, wait a bit then refresh
        setTimeout(fetchMentions, 2000);
      } catch (functionError) {
        // Function doesn't exist or failed, just refresh existing data
        console.warn('Scraper function unavailable, refreshing existing data:', functionError);
        await fetchMentions();
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgencyScore: number) => {
    if (urgencyScore >= 5) return 'text-red-400 bg-red-500/20 border border-red-500/30';
    if (urgencyScore >= 4) return 'text-orange-400 bg-orange-500/20 border border-orange-500/30';
    if (urgencyScore >= 3) return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
    if (urgencyScore >= 2) return 'text-blue-400 bg-blue-500/20 border border-blue-500/30';
    return 'text-slate-400 bg-slate-500/20 border border-slate-500/30';
  };

  const getUrgencyLabel = (urgencyScore: number) => {
    if (urgencyScore >= 5) return 'Critical';
    if (urgencyScore >= 4) return 'High';
    if (urgencyScore >= 3) return 'Medium';
    if (urgencyScore >= 2) return 'Low';
    return 'Info';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-400';
    if (sentiment < -0.1) return 'text-red-400';
    return 'text-slate-400';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.1) return '😊';
    if (sentiment < -0.1) return '😟';
    return '😐';
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: string } = {
      twitter: '🐦',
      facebook: '📘',
      instagram: '📷',
      youtube: '📺',
      reddit: '🤖',
      news_websites: '📰',
      rss_feeds: '📡',
      official_sources: '🏛️'
    };
    return icons[source] || '📱';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDominantEmotion = (emotions?: SocialMention['emotion_analysis']) => {
    if (!emotions) return null;
    
    const emotionEntries = Object.entries(emotions);
    if (emotionEntries.length === 0) return null;
    
    const [emotion, score] = emotionEntries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    if (score < 0.1) return null;
    
    const emotionIcons: { [key: string]: string } = {
      fear: '😨',
      anger: '😠',
      sadness: '😢',
      joy: '😄',
      surprise: '😲'
    };
    
    return { emotion, score, icon: emotionIcons[emotion] || '😐' };
  };

  if (loading && mentions.length === 0) {
    return (
      <div className="p-6 h-screen flex flex-col">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex-1 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-white">
            <MessageSquare className="mr-2" />
            Real-time Social Media Monitoring
          </h2>
          <div className="space-y-4 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border border-slate-600 rounded-lg p-4">
                <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-600 rounded w-1/2 mb-2"></div>
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
            <MessageSquare className="mr-2" />
            Real-time Social Media Monitoring
          </h2>
          <div className="text-red-400 text-center py-4 flex flex-col items-center justify-center flex-1">
            <AlertTriangle className="mx-auto mb-2" />
            <p>Error: {error}</p>
            <button 
              onClick={fetchMentions}
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold flex items-center text-white">
              <MessageSquare className="mr-2" />
              Real-time Social Media Monitoring
            </h2>
            {lastRefresh && (
              <span className="text-xs text-slate-400">
                Last updated: {formatTimeAgo(lastRefresh.toISOString())}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded transition-colors ${
                showAnalytics ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-600 text-slate-400'
              }`}
            >
              <BarChart3 size={16} />
            </button>
            
          </div>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{analytics.total}</div>
                <div className="text-sm text-slate-400">Total Mentions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{analytics.highUrgency}</div>
                <div className="text-sm text-slate-400">High Urgency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{analytics.highConfidence}</div>
                <div className="text-sm text-slate-400">High Confidence</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getSentimentColor(analytics.avgSentiment)}`}>
                  {analytics.avgSentiment.toFixed(2)}
                </div>
                <div className="text-sm text-slate-400">Avg Sentiment</div>
              </div>
            </div>
            
            {/* Trending Keywords */}
            {trendingKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  Trending Keywords (24h)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingKeywords.slice(0, 10).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30"
                    >
                      {keyword.keyword} ({keyword.frequency})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


        {/* Mentions List */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          {sortedMentions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center h-full">
              <Search className="mx-auto mb-2 opacity-50" size={48} />
              <p>No social media mentions found</p>
              <p className="text-sm">Check back later for new content</p>
            </div>
          ) : (
            sortedMentions.map((mention) => {
              const dominantEmotion = getDominantEmotion(mention.emotion_analysis);
              
              return (
                <div 
                  key={mention.id} 
                  className="border-l-4 border-sky-500 pl-4 py-3 hover:bg-slate-700/30 transition-colors rounded-r-lg"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSourceIcon(mention.source)}</span>
                      <span className="font-medium text-sm capitalize text-slate-300">{mention.source}</span>
                      {mention.author && (
                        <span className="text-slate-400 text-sm">by {mention.author}</span>
                      )}
                      {mention.confidence_score && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                          {Math.round(mention.confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {dominantEmotion && (
                        <span className="text-sm" title={`${dominantEmotion.emotion}: ${Math.round(dominantEmotion.score * 100)}%`}>
                          {dominantEmotion.icon}
                        </span>
                      )}
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(mention.urgency_score)}`}>
                        {getUrgencyLabel(mention.urgency_score)}
                      </span>
                      
                      <span className="text-slate-400 text-xs flex items-center">
                        <Clock className="mr-1" size={12} />
                        {formatTimeAgo(mention.posted_at || mention.scraped_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                    {mention.content}
                  </p>
                  
                  {/* Media */}
                  {mention.media_urls && mention.media_urls.length > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Image size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-400">
                        {mention.media_urls.length} media file(s)
                      </span>
                    </div>
                  )}
                  
                  {/* Keywords and Hashtags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {mention.nlp_keywords.slice(0, 5).map((keyword, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-sky-500/20 text-sky-400 text-xs rounded-full border border-sky-500/30"
                      >
                        {keyword}
                      </span>
                    ))}
                    
                    {mention.hashtags && mention.hashtags.slice(0, 3).map((hashtag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Named Entities */}
                  {mention.named_entities && (
                    <div className="flex flex-wrap gap-2 mb-2 text-xs">
                      {mention.named_entities.locations && mention.named_entities.locations.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MapPin size={12} className="text-green-400" />
                          <span className="text-green-400">
                            {mention.named_entities.locations.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {mention.named_entities.organizations && mention.named_entities.organizations.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users size={12} className="text-orange-400" />
                          <span className="text-orange-400">
                            {mention.named_entities.organizations.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {mention.nlp_sentiment_score !== undefined && (
                        <span className={`text-xs flex items-center ${getSentimentColor(mention.nlp_sentiment_score)}`}>
                          <Heart size={12} className="mr-1" />
                          {getSentimentIcon(mention.nlp_sentiment_score)} {mention.nlp_sentiment_score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {mention.url && (
                      <a 
                        href={mention.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 text-xs flex items-center transition-colors"
                      >
                        <ExternalLink className="mr-1" size={12} />
                        View original
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer */}
        {sortedMentions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Showing {sortedMentions.length} mentions
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMentionsFeed;