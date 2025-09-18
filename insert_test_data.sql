-- Insert test data for AI predictions functionality
-- Run this in Supabase SQL Editor to test the AI prediction system

-- Insert test citizen reports
INSERT INTO reports (
  citizen_id, title, description, location, location_name, hazard_type, urgency_level, nlp_keywords, created_at
) VALUES 
(
  'test-citizen-1',
  'Strong waves and unusual wind patterns at Marina Beach',
  'Observed very strong winds forming a spiral pattern over the Bay of Bengal. Waves are much higher than normal and getting stronger every hour. Fishermen are returning to shore urgently.',
  ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326),
  'Marina Beach, Chennai',
  'cyclone',
  4,
  ARRAY['cyclone', 'strong winds', 'spiral', 'bay of bengal', 'waves', 'fishermen'],
  NOW() - INTERVAL '2 hours'
),
(
  'test-citizen-2', 
  'Coastal flooding risk in Kochi',
  'Water levels rising unusually high at Fort Kochi beach. Local residents reporting abnormal tidal patterns and water entering low-lying areas.',
  ST_SetSRID(ST_MakePoint(76.2673, 9.9312), 4326),
  'Fort Kochi, Kerala',
  'flooding',
  3,
  ARRAY['flooding', 'water levels', 'tidal patterns', 'kochi', 'residents'],
  NOW() - INTERVAL '1 hour'
),
(
  'test-citizen-3',
  'Beach erosion accelerating in Goa',
  'Significant beach erosion observed at Calangute Beach. Sand loss is visible and coastal structures are at risk.',
  ST_SetSRID(ST_MakePoint(73.8278, 15.2993), 4326),
  'Calangute Beach, Goa',
  'coastal_erosion',
  2,
  ARRAY['erosion', 'beach erosion', 'sand loss', 'calangute', 'coastal structures'],
  NOW() - INTERVAL '30 minutes'
);

-- Insert test social media mentions
INSERT INTO social_mentions (
  content, source, author, posted_at, scraped_at, url, nlp_keywords, nlp_sentiment_score, urgency_score
) VALUES
(
  'Massive cyclone forming in Bay of Bengal! Ships advised to return to Chennai port immediately. This looks serious! #CycloneAlert #Chennai #BayOfBengal',
  'Twitter',
  '@WeatherWatch_IN',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '2 hours 30 minutes',
  'https://twitter.com/weatherwatch/status/123456',
  ARRAY['cyclone', 'bay of bengal', 'chennai', 'ships', 'alert'],
  -0.6,
  4.2
),
(
  'Kerala coast experiencing unusual high tides today. Kochi residents should be cautious near coastal areas. #Kerala #HighTide #CoastalAlert',
  'Twitter', 
  '@KeralaWeather',
  NOW() - INTERVAL '1 hour 30 minutes',
  NOW() - INTERVAL '1 hour',
  'https://twitter.com/keralaweather/status/123457',
  ARRAY['kerala', 'high tides', 'kochi', 'coastal', 'cautious'],
  -0.3,
  3.1
),
(
  'Beautiful but concerning: Goa beaches losing sand rapidly this monsoon season. Climate change impact visible! #Goa #BeachErosion #ClimateChange',
  'Instagram',
  '@goa_explorer',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '30 minutes', 
  'https://instagram.com/p/abc123',
  ARRAY['goa', 'beaches', 'sand', 'erosion', 'monsoon'],
  -0.2,
  2.5
),
(
  'Odisha coast alert! Fishermen reporting unusual wave patterns and strong currents near Puri. Storm brewing? #Odisha #Puri #StormAlert',
  'Facebook',
  'Odisha Fishermen Association',
  NOW() - INTERVAL '2 hours 15 minutes',
  NOW() - INTERVAL '2 hours',
  'https://facebook.com/post/456789',
  ARRAY['odisha', 'fishermen', 'waves', 'puri', 'storm', 'currents'],
  -0.4,
  3.8
);

-- Insert a few more diverse reports to trigger different hazard types
INSERT INTO reports (
  citizen_id, title, description, location, location_name, hazard_type, urgency_level, nlp_keywords, created_at
) VALUES 
(
  'test-citizen-4',
  'Unusual seismic activity near Andhra coast',
  'Minor tremors felt along the coast near Visakhapatnam. Local fishermen report strange behavior in sea animals. Earthquake monitoring stations showing increased activity.',
  ST_SetSRID(ST_MakePoint(83.2185, 17.6868), 4326),
  'Visakhapatnam, Andhra Pradesh',
  'tsunami',
  5,
  ARRAY['seismic', 'tremors', 'earthquake', 'visakhapatnam', 'tsunami risk'],
  NOW() - INTERVAL '45 minutes'
),
(
  'test-citizen-5',
  'Storm surge warning for Mumbai coast',
  'Meteorological department issued storm surge warning. High tide combined with strong winds creating dangerous conditions at Marine Drive.',
  ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326),
  'Marine Drive, Mumbai',
  'storm_surge',
  4,
  ARRAY['storm surge', 'mumbai', 'marine drive', 'high tide', 'winds'],
  NOW() - INTERVAL '1 hour 15 minutes'
);

-- Ensure the data is inserted
DO $$
BEGIN
  RAISE NOTICE 'Test data inserted successfully!';
  RAISE NOTICE 'You can now run the AI prediction engine to generate predictions based on this data.';
  RAISE NOTICE 'Use the "Run AI Analysis" button in the AI Predictions view.';
END $$;
