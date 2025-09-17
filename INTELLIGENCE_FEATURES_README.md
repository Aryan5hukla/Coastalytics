# Coastalytics Intelligence Features

This document outlines the new AI-powered intelligence features that have been integrated into the Coastalytics platform. These features provide real-time social media monitoring, AI-driven predictions, and enhanced alert management.

## 🚀 Features Overview

### 1. Social Media Scraper
- **Location**: `supabase/functions/social-media-scraper/index.ts`
- **Purpose**: Continuously monitors social media platforms for coastal hazard-related posts
- **Capabilities**:
  - Scrapes Twitter/X, Facebook, and other platforms
  - Extracts keywords related to coastal hazards
  - Assigns urgency scores based on content analysis
  - Stores data in the `social_mentions` table

### 2. AI Prediction Engine
- **Location**: `supabase/functions/prediction-engine/index.ts`
- **Purpose**: Analyzes citizen reports and social media data to generate hazard predictions
- **Capabilities**:
  - Processes data from multiple sources (citizen reports + social media)
  - Performs basic NLP analysis
  - Generates confidence scores and risk assessments
  - Creates predictions for different coastal regions

### 3. Alert Ingestor
- **Location**: `supabase/functions/alert-ingestor/index.ts`
- **Purpose**: Automatically ingests official alerts from government agencies
- **Capabilities**:
  - Scrapes INCOIS and IMD websites
  - Parses alert content and metadata
  - Prevents duplicate alerts
  - Stores alerts in the database

### 4. Enhanced Dashboard Components

#### Social Mentions Feed
- **Location**: `src/components/dashboard/SocialMentionsFeed.tsx`
- **Features**:
  - Real-time display of social media mentions
  - Urgency classification and keyword highlighting
  - Source attribution and engagement metrics
  - Live updates via Supabase subscriptions

#### AI Prediction View
- **Location**: `src/components/dashboard/AIPredictionView.tsx`
- **Features**:
  - Displays active AI-generated predictions
  - Shows confidence levels and severity estimates
  - Provides contributing factor analysis
  - Real-time updates

#### Enhanced Alerts View
- **Location**: `src/components/alerts/AlertsView.tsx`
- **Features**:
  - Live alert banner for active emergencies
  - Real-time subscription updates
  - Enhanced status tracking
  - Improved visual indicators

## 📦 Database Schema

### New Tables

#### `social_mentions`
```sql
CREATE TABLE social_mentions (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  source VARCHAR(50) NOT NULL,
  author VARCHAR(255),
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  url TEXT,
  engagement_metrics JSONB DEFAULT '{}',
  nlp_keywords TEXT[] DEFAULT '{}',
  nlp_sentiment_score DECIMAL(3,2) DEFAULT 0.0,
  urgency_score INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🛠 Deployment Instructions

### 1. Database Migration
```bash
# Run the migration to create the social_mentions table
supabase db push
```

### 2. Deploy Supabase Functions
```bash
# Deploy all functions
supabase functions deploy social-media-scraper
supabase functions deploy prediction-engine
supabase functions deploy alert-ingestor
```

### 3. Set Up Cron Jobs
Configure Supabase Edge Functions to run on a schedule:
- **Social Media Scraper**: Every 5-10 minutes
- **Prediction Engine**: Every 15 minutes
- **Alert Ingestor**: Every 10 minutes

### 4. Environment Variables
Ensure these environment variables are set in your Supabase project:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔧 Configuration

### Keywords Configuration
The scraper looks for these coastal hazard keywords:
- `tsunami`, `cyclone`, `storm surge`, `coastal flooding`
- `high waves`, `tidal waves`, `coastal erosion`
- Hashtags: `#TsunamiAlert`, `#CycloneWarning`, `#FloodAlert`

### Regional Focus
The system monitors these coastal regions:
- Mumbai, Chennai, Kolkata, Visakhapatnam
- Kochi, Goa, Puri, Paradip, Mangalore
- Thiruvananthapuram, Pondicherry

## 📊 Usage

### For Citizens
- View real-time social media discussions about coastal hazards
- See AI-generated risk predictions for their region
- Receive active alert notifications

### For Officials
- Monitor public sentiment and awareness
- Access AI-driven risk assessments
- Manage and dispatch emergency alerts
- Track prediction accuracy over time

### For Analysts
- Analyze social media trends during hazard events
- Study prediction model performance
- Correlate citizen reports with social media activity

## 🔍 Monitoring and Maintenance

### Function Logs
Monitor Supabase function execution logs for:
- Scraping success/failure rates
- Prediction generation frequency
- Alert ingestion status

### Data Quality
- Review urgency score accuracy
- Validate keyword extraction
- Monitor duplicate alert prevention

### Performance Optimization
- Adjust scraping frequency based on activity
- Fine-tune NLP models for better accuracy
- Optimize database queries for real-time performance

## 🚨 Important Notes

### Mock Data
The current implementation includes mock data for demonstration purposes. In production:
- Replace mock scrapers with actual web scraping logic
- Implement proper API rate limiting
- Add error handling for network failures

### Security Considerations
- Implement proper authentication for function endpoints
- Validate and sanitize scraped content
- Monitor for potential data privacy issues

### Scalability
- Consider implementing Redis caching for high-traffic scenarios
- Set up database connection pooling
- Monitor resource usage and scale accordingly

## 🔗 Related Documentation

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🤝 Contributing

When adding new features:
1. Update this documentation
2. Add appropriate database migrations
3. Include unit tests for functions
4. Update the dashboard components as needed
5. Consider impact on existing user roles and permissions
