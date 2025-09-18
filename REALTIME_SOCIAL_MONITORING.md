# Real-time Social Media Monitoring with AI/NLP

## 🌊 Overview

The enhanced Coastalytics platform now includes a comprehensive real-time social media monitoring system that uses advanced NLP, web scraping, and image analysis to detect and analyze coastal hazard-related content from multiple sources.

## ✨ Features

### 🧠 Advanced NLP Processing
- **Keyword Extraction**: Automatically identifies coastal hazard keywords, emergency terms, and location names
- **Sentiment Analysis**: Analyzes emotional tone of social media posts
- **Emotion Detection**: Identifies fear, anger, sadness, joy, and surprise in content
- **Named Entity Recognition**: Extracts locations, organizations, and persons
- **Text Classification**: Determines if content is emergency-related, factual, or relevant
- **Confidence Scoring**: Assigns confidence levels to processed content

### 🔍 Multi-Platform Web Scraping
- **Social Media Platforms**: Twitter, Facebook, Instagram, YouTube, Reddit
- **News Sources**: Major Indian news websites and RSS feeds
- **Official Sources**: IMD, INCOIS, NDMA, and other government agencies
- **Real-time Data**: Continuous monitoring with configurable intervals
- **Rate Limiting**: Respects platform limitations and best practices

### 📸 Image Analysis
- **Coastal Content Detection**: Identifies images related to coastal phenomena
- **Object Recognition**: Detects waves, storms, flooding, and coastal features
- **Scene Description**: Generates descriptions of detected coastal events

### ⚡ Real-time Filtering & Analytics
- **Dynamic Filters**: Filter by urgency, confidence, source, keywords, sentiment, and time
- **Trending Analysis**: Identifies trending keywords and topics
- **Analytics Dashboard**: Real-time statistics and insights
- **Auto-refresh**: Continuous updates with configurable intervals

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Sources   │    │   Edge Functions │    │   Supabase DB   │
│                 │    │                 │    │                 │
│ • Twitter       │───▶│ • NLP Processor │───▶│ • social_mentions│
│ • Facebook      │    │ • Real-time     │    │ • cron_jobs     │
│ • News Sites    │    │   Scraper       │    │ • processing_   │
│ • RSS Feeds     │    │ • Scheduled     │    │   stats         │
│ • Official APIs │    │   Scraper       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Frontend App   │    │   Real-time     │
                       │                 │    │  Subscriptions  │
                       │ • Filters       │◀───│                 │
                       │ • Analytics     │    │ • Live Updates  │
                       │ • Visualizations│    │ • Push Notifs   │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment

### Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Project linked to Supabase: `supabase link --project-ref your-project-ref`

### Quick Deploy
```bash
# Make script executable and run
chmod +x deploy-functions.sh
./deploy-functions.sh
```

### Manual Deployment
```bash
# Deploy individual functions
supabase functions deploy nlp-processor
supabase functions deploy realtime-scraper
supabase functions deploy social-media-scraper
supabase functions deploy scheduled-scraper

# Run database migrations
supabase migration up
```

## 📊 Database Schema

### Enhanced Tables

#### `social_mentions` (Enhanced)
```sql
- id: UUID (Primary Key)
- content: TEXT (Post content)
- source: VARCHAR(50) (Platform name)
- author: VARCHAR(255) (Author handle/name)
- posted_at: TIMESTAMPTZ (Original post time)
- scraped_at: TIMESTAMPTZ (When scraped)
- url: TEXT (Original post URL)
- nlp_keywords: TEXT[] (Extracted keywords)
- nlp_sentiment_score: DECIMAL(-1 to 1)
- urgency_score: INTEGER (1-5 scale)
- confidence_score: DECIMAL (0-1 scale)
- emotion_analysis: JSONB (Fear, anger, etc.)
- named_entities: JSONB (Locations, orgs, people)
- text_classification: JSONB (Emergency, factual flags)
- hashtags: TEXT[] (Extracted hashtags)
- media_urls: TEXT[] (Associated media)
- engagement_metrics: JSONB (Likes, shares, etc.)
```

#### `cron_jobs` (New)
```sql
- id: UUID (Primary Key)
- name: VARCHAR(100) (Job identifier)
- schedule: VARCHAR(50) (Cron expression)
- function_name: VARCHAR(100) (Edge function to call)
- enabled: BOOLEAN (Job status)
- last_run: TIMESTAMPTZ (Last execution)
- next_run: TIMESTAMPTZ (Next scheduled run)
- last_success: BOOLEAN (Success status)
- last_message: TEXT (Execution message)
```

#### `nlp_processing_stats` (New)
```sql
- date: DATE (Stats date)
- total_processed: INTEGER (Total posts processed)
- high_confidence_count: INTEGER (High-confidence posts)
- emergency_detected: INTEGER (Emergency posts)
- avg_confidence_score: DECIMAL (Average confidence)
- avg_urgency_score: DECIMAL (Average urgency)
- avg_sentiment_score: DECIMAL (Average sentiment)
```

## 🔧 Configuration

### Environment Variables
Set these in your Supabase Edge Functions environment:

```bash
# Required
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Optional for enhanced features
OPENAI_API_KEY=your-openai-key  # For advanced NLP
GOOGLE_VISION_API_KEY=your-google-vision-key  # For image analysis
TWITTER_BEARER_TOKEN=your-twitter-token  # For Twitter API
```

### Cron Schedule Configuration
Default schedules (customizable in database):
- **Real-time Scraper**: Every 15 minutes (`*/15 * * * *`)
- **Social Media Scraper**: Every 30 minutes (`*/30 * * * *`)
- **Cleanup Job**: Daily at 2 AM (`0 2 * * *`)
- **Stats Update**: Daily at 1 AM (`0 1 * * *`)

## 📋 API Reference

### Edge Functions

#### 1. NLP Processor (`/functions/v1/nlp-processor`)
Processes text content with advanced NLP analysis.

**Request:**
```json
{
  "text": "High waves hitting Chennai coast! Evacuation needed.",
  "source": "twitter",
  "imageUrls": ["https://example.com/image.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keywords": ["high waves", "Chennai", "evacuation"],
    "sentiment_score": -0.7,
    "urgency_score": 5,
    "confidence_score": 0.9,
    "emotion_analysis": {
      "fear": 0.8,
      "anger": 0.2
    },
    "named_entities": {
      "locations": ["Chennai"],
      "organizations": []
    },
    "text_classification": {
      "is_emergency": true,
      "is_factual": true,
      "hazard_type": "waves"
    }
  }
}
```

#### 2. Real-time Scraper (`/functions/v1/realtime-scraper`)
Performs comprehensive web scraping from multiple sources.

**Request:**
```json
{
  "triggered_by": "scheduler"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully scraped and processed 15 posts",
  "scraped_count": 20,
  "processed_count": 15,
  "sources": ["twitter", "news_websites", "rss_feeds"]
}
```

#### 3. Scheduled Scraper (`/functions/v1/scheduled-scraper`)
Manages cron job execution and cleanup tasks.

**Response:**
```json
{
  "success": true,
  "message": "Scheduler completed. 2/2 jobs executed successfully",
  "executed_jobs": [
    {"job": "realtime-scraper", "success": true},
    {"job": "cleanup-old-mentions", "success": true}
  ]
}
```

### Database Functions

#### Get Trending Keywords
```sql
SELECT * FROM get_trending_keywords(7);  -- Last 7 days
```

#### Get Real-time Alerts
```sql
SELECT * FROM get_realtime_alerts(2);  -- Last 2 hours
```

## 🎛️ Frontend Features

### Advanced Filtering
- **Urgency Level**: Filter by urgency score (1-5)
- **Confidence Score**: Filter by AI confidence (0-1)
- **Time Range**: Last hour, 6 hours, 24 hours, 7 days
- **Sources**: Select specific platforms
- **Keywords**: Search in content, keywords, hashtags
- **Sentiment**: Positive, negative, neutral

### Real-time Analytics
- **Live Metrics**: Total mentions, high urgency count, confidence levels
- **Trending Keywords**: Most frequent keywords with urgency scores
- **Source Breakdown**: Distribution across platforms
- **Sentiment Trends**: Average sentiment analysis

### Interactive Features
- **Auto-refresh**: Configurable automatic updates
- **Live Indicators**: Real-time status and activity indicators
- **Emotion Analysis**: Emoji indicators for detected emotions
- **Media Detection**: Icons for posts with images/videos
- **Named Entity Display**: Location and organization highlights

## 🔧 Customization

### Adding New Sources
1. Create scraper function in `realtime-scraper/index.ts`
2. Add source configuration to `SCRAPING_TARGETS`
3. Update NLP keywords for source-specific terms
4. Add source icon in frontend component

### Enhancing NLP
1. Extend keyword dictionaries in `nlp-processor/index.ts`
2. Add new emotion categories
3. Integrate external NLP services (OpenAI, Google NLP)
4. Customize confidence scoring algorithms

### Custom Alerts
1. Modify urgency calculation logic
2. Add new classification categories
3. Implement custom notification triggers
4. Create alert routing based on urgency/location

## 📈 Monitoring & Performance

### Key Metrics
- **Processing Rate**: Posts processed per minute
- **Accuracy**: Confidence score distribution
- **Coverage**: Sources actively monitored
- **Latency**: Time from post to processing

### Performance Optimization
- **Batch Processing**: Process multiple posts together
- **Caching**: Cache NLP results for similar content
- **Rate Limiting**: Respect source API limits
- **Parallel Processing**: Concurrent scraping and analysis

### Error Handling
- **Graceful Degradation**: Continue operation if sources fail
- **Retry Logic**: Automatic retry for failed requests
- **Fallback Data**: Mock data when live sources unavailable
- **Error Logging**: Comprehensive error tracking

## 🛠️ Troubleshooting

### Common Issues

#### Functions Not Deploying
```bash
# Check Supabase CLI version
supabase --version

# Re-link project
supabase link --project-ref your-project-ref

# Check function logs
supabase functions logs nlp-processor
```

#### No Data Appearing
1. Check function execution logs
2. Verify database permissions
3. Ensure real-time subscriptions are active
4. Test individual functions manually

#### High Resource Usage
1. Adjust scraping intervals
2. Implement better rate limiting
3. Optimize NLP processing
4. Clean up old data more frequently

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG_MODE=true
```

## 🔒 Security & Privacy

### Data Protection
- **No Personal Data**: Only public social media content
- **Data Retention**: Automatic cleanup of old mentions
- **Access Control**: RLS policies for data access
- **API Security**: Proper authentication and rate limiting

### Compliance
- **Terms of Service**: Respect platform ToS
- **Rate Limiting**: Avoid overwhelming sources
- **User Privacy**: No personal information storage
- **Data Minimization**: Only store relevant content

## 🚀 Future Enhancements

### Planned Features
- **Real-time Notifications**: Push notifications for critical alerts
- **Geographic Clustering**: Spatial analysis of mentions
- **Predictive Analysis**: ML models for hazard prediction
- **Multi-language Support**: NLP for regional languages
- **Advanced Visualizations**: Interactive charts and maps

### Integration Opportunities
- **Alert Systems**: Integration with emergency response systems
- **Weather APIs**: Correlation with meteorological data
- **Government Databases**: Cross-reference with official warnings
- **Mobile Apps**: Push notifications to mobile users

## 📞 Support

For issues, feature requests, or contributions:
1. Check the troubleshooting section above
2. Review function logs in Supabase dashboard
3. Test individual components systematically
4. Document any bugs with reproduction steps

---

**Built with ❤️ for coastal safety and disaster preparedness** 🌊⚡🛡️
