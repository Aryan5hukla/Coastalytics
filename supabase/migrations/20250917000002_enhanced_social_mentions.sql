-- Enhanced Social Mentions and Cron Job Support
-- Migration for real-time NLP and scheduling features

-- Add new columns to social_mentions table for enhanced NLP
ALTER TABLE social_mentions 
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS emotion_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS named_entities JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS text_classification JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS image_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hashtags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';

-- Create cron_jobs table for scheduling
CREATE TABLE IF NOT EXISTS cron_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  schedule VARCHAR(50) NOT NULL, -- cron expression
  function_name VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  last_success BOOLEAN,
  last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cron_job_logs table for execution history
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  success BOOLEAN NOT NULL,
  message TEXT,
  execution_time_ms INTEGER,
  next_scheduled_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create social_media_sources table for tracking different platforms
CREATE TABLE IF NOT EXISTS social_media_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  source_url TEXT,
  api_endpoint TEXT,
  enabled BOOLEAN DEFAULT true,
  rate_limit_per_hour INTEGER DEFAULT 100,
  last_scraped_at TIMESTAMPTZ,
  total_posts_scraped INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create nlp_processing_stats table for monitoring NLP performance
CREATE TABLE IF NOT EXISTS nlp_processing_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  total_processed INTEGER DEFAULT 0,
  high_confidence_count INTEGER DEFAULT 0,
  emergency_detected INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(3,2) DEFAULT 0.0,
  avg_urgency_score DECIMAL(3,2) DEFAULT 0.0,
  avg_sentiment_score DECIMAL(3,2) DEFAULT 0.0,
  processing_errors INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_mentions_confidence ON social_mentions(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_mentions_hashtags ON social_mentions USING GIN (hashtags);
CREATE INDEX IF NOT EXISTS idx_social_mentions_media_urls ON social_mentions USING GIN (media_urls);
CREATE INDEX IF NOT EXISTS idx_social_mentions_emotion ON social_mentions USING GIN (emotion_analysis);
CREATE INDEX IF NOT EXISTS idx_social_mentions_entities ON social_mentions USING GIN (named_entities);

CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON cron_jobs(enabled);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_next_run ON cron_jobs(next_run);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_name ON cron_job_logs(job_name);
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_executed_at ON cron_job_logs(executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_media_sources_platform ON social_media_sources(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_sources_enabled ON social_media_sources(enabled);

CREATE INDEX IF NOT EXISTS idx_nlp_stats_date ON nlp_processing_stats(date DESC);

-- Enable RLS for new tables
ALTER TABLE cron_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cron_job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE nlp_processing_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cron_jobs (only service role can access)
CREATE POLICY "Service role can manage cron jobs" ON cron_jobs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read cron jobs" ON cron_jobs
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for cron_job_logs
CREATE POLICY "Service role can manage cron job logs" ON cron_job_logs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read cron job logs" ON cron_job_logs
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for social_media_sources
CREATE POLICY "Service role can manage social media sources" ON social_media_sources
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read social media sources" ON social_media_sources
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for nlp_processing_stats
CREATE POLICY "Service role can manage NLP stats" ON nlp_processing_stats
  FOR ALL TO service_role USING (true);

CREATE POLICY "Authenticated users can read NLP stats" ON nlp_processing_stats
  FOR SELECT TO authenticated USING (true);

-- Update triggers for timestamp columns
CREATE TRIGGER update_cron_jobs_updated_at 
    BEFORE UPDATE ON cron_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_sources_updated_at 
    BEFORE UPDATE ON social_media_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nlp_processing_stats_updated_at 
    BEFORE UPDATE ON nlp_processing_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default cron jobs
INSERT INTO cron_jobs (name, schedule, function_name, enabled) VALUES
  ('realtime-scraper', '*/15 * * * *', 'realtime-scraper', true),
  ('social-media-scraper', '*/30 * * * *', 'social-media-scraper', true),
  ('cleanup-old-mentions', '0 2 * * *', 'cleanup-old-mentions', true),
  ('nlp-stats-update', '0 1 * * *', 'update-nlp-stats', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default social media sources
INSERT INTO social_media_sources (platform, enabled, rate_limit_per_hour) VALUES
  ('twitter', true, 300),
  ('facebook', true, 200),
  ('instagram', true, 150),
  ('youtube', true, 100),
  ('reddit', true, 500),
  ('news_websites', true, 1000),
  ('rss_feeds', true, 2000),
  ('official_sources', true, 500)
ON CONFLICT DO NOTHING;

-- Function to update NLP processing stats
CREATE OR REPLACE FUNCTION update_nlp_stats()
RETURNS void AS $$
DECLARE
  today DATE := CURRENT_DATE;
  stats_record RECORD;
BEGIN
  -- Calculate daily stats
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE confidence_score > 0.7) as high_confidence,
    COUNT(*) FILTER (WHERE urgency_score >= 4) as emergency,
    AVG(confidence_score) as avg_confidence,
    AVG(urgency_score) as avg_urgency,
    AVG(nlp_sentiment_score) as avg_sentiment
  INTO stats_record
  FROM social_mentions 
  WHERE DATE(created_at) = today;
  
  -- Upsert daily stats
  INSERT INTO nlp_processing_stats (
    date, total_processed, high_confidence_count, emergency_detected,
    avg_confidence_score, avg_urgency_score, avg_sentiment_score
  ) VALUES (
    today, stats_record.total, stats_record.high_confidence, stats_record.emergency,
    stats_record.avg_confidence, stats_record.avg_urgency, stats_record.avg_sentiment
  )
  ON CONFLICT (date) DO UPDATE SET
    total_processed = EXCLUDED.total_processed,
    high_confidence_count = EXCLUDED.high_confidence_count,
    emergency_detected = EXCLUDED.emergency_detected,
    avg_confidence_score = EXCLUDED.avg_confidence_score,
    avg_urgency_score = EXCLUDED.avg_urgency_score,
    avg_sentiment_score = EXCLUDED.avg_sentiment_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending keywords
CREATE OR REPLACE FUNCTION get_trending_keywords(days_back INTEGER DEFAULT 7)
RETURNS TABLE(keyword TEXT, frequency BIGINT, avg_urgency DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    unnest(nlp_keywords) as keyword,
    COUNT(*) as frequency,
    AVG(urgency_score) as avg_urgency
  FROM social_mentions 
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND array_length(nlp_keywords, 1) > 0
  GROUP BY unnest(nlp_keywords)
  HAVING COUNT(*) >= 2
  ORDER BY frequency DESC, avg_urgency DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get real-time alerts (high urgency recent mentions)
CREATE OR REPLACE FUNCTION get_realtime_alerts(hours_back INTEGER DEFAULT 2)
RETURNS TABLE(
  id UUID,
  content TEXT,
  source TEXT,
  urgency_score INTEGER,
  confidence_score DECIMAL,
  keywords TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.id,
    sm.content,
    sm.source,
    sm.urgency_score,
    sm.confidence_score,
    sm.nlp_keywords,
    sm.created_at
  FROM social_mentions sm
  WHERE sm.created_at >= NOW() - (hours_back || ' hours')::INTERVAL
    AND sm.urgency_score >= 4
    AND sm.confidence_score > 0.6
  ORDER BY sm.urgency_score DESC, sm.confidence_score DESC, sm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for dashboard analytics
CREATE OR REPLACE VIEW social_mentions_analytics AS
SELECT 
  DATE(created_at) as date,
  source,
  COUNT(*) as total_mentions,
  AVG(urgency_score) as avg_urgency,
  AVG(confidence_score) as avg_confidence,
  AVG(nlp_sentiment_score) as avg_sentiment,
  COUNT(*) FILTER (WHERE urgency_score >= 4) as high_urgency_count,
  COUNT(*) FILTER (WHERE confidence_score > 0.7) as high_confidence_count
FROM social_mentions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), source
ORDER BY date DESC, source;

-- Grant permissions
GRANT SELECT ON social_mentions_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_keywords(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_realtime_alerts(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_nlp_stats() TO service_role;

-- Final notification
DO $$
BEGIN
  RAISE NOTICE 'Enhanced social mentions migration completed successfully!';
  RAISE NOTICE 'New features: Advanced NLP, cron jobs, real-time analytics';
  RAISE NOTICE 'Functions available: get_trending_keywords(), get_realtime_alerts()';
END $$;
