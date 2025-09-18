-- Create social_mentions table for storing scraped social media data
CREATE TABLE IF NOT EXISTS social_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', 'youtube', etc.
  author VARCHAR(255),
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  url TEXT,
  engagement_metrics JSONB DEFAULT '{}',
  nlp_keywords TEXT[] DEFAULT '{}',
  nlp_sentiment_score DECIMAL(3,2) DEFAULT 0.0,
  urgency_score INTEGER DEFAULT 1, -- 1-5 scale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_social_mentions_posted_at ON social_mentions(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_mentions_source ON social_mentions(source);
CREATE INDEX IF NOT EXISTS idx_social_mentions_scraped_at ON social_mentions(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_mentions_urgency ON social_mentions(urgency_score DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE social_mentions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read social mentions
CREATE POLICY "Allow authenticated users to read social mentions" ON social_mentions
  FOR SELECT TO authenticated USING (true);

-- Create policy to allow service role to insert/update social mentions
CREATE POLICY "Allow service role to manage social mentions" ON social_mentions
  FOR ALL TO service_role USING (true);
