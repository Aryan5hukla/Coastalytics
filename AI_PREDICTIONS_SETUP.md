
# AI Predictions System - Complete Setup & Usage Guide

## 🌊 Ocean Disaster AI Prediction System

The AI prediction system analyzes citizen reports, social media mentions, and historical data to predict ocean-related disasters including cyclones, tsunamis, storm surges, coastal erosion, and flooding.

## 🚀 Features Implemented

### 1. **Enhanced Prediction Engine** (`supabase/functions/prediction-engine/`)
- **Multi-hazard Analysis**: Predicts 6 types of ocean disasters
- **Regional Risk Assessment**: Covers 8 major coastal regions of India
- **Seasonal Pattern Integration**: Adjusts predictions based on seasonal risk factors
- **Confidence Scoring**: Advanced algorithm combining multiple data sources
- **Time-aware Analysis**: Dynamic prediction windows based on hazard type and urgency

### 2. **Intelligent Frontend** (`src/components/dashboard/AIPredictionView.tsx`)
- **Real-time Updates**: Live subscription to database changes
- **Manual Trigger**: Button to run AI analysis on demand
- **Auto-refresh**: Configurable automatic data refresh
- **Detailed Visualization**: Rich display of confidence levels, factors, and metadata
- **Interactive Controls**: Play/pause auto-refresh, manual refresh, and AI trigger

### 3. **Comprehensive Data Model**
- **Confidence Levels**: 0.1 to 0.95 with color-coded visualization
- **Severity Estimates**: Critical, High, Medium, Low with intelligent thresholds
- **Prediction Windows**: Dynamic timeframes (4h for tsunamis, 72h for cyclones)
- **Contributing Factors**: Detailed breakdown of analysis inputs

## 🛠 Setup Instructions

### 1. Database Setup
```sql
-- Run the complete database setup
-- File: setup_complete_database.sql (already created)
```

### 2. Insert Test Data
```sql
-- Run this in Supabase SQL Editor to create test scenarios
-- File: insert_test_data.sql
```

### 3. Environment Variables
Ensure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 How to Test the AI Predictions

### Step 1: Insert Test Data
1. Open Supabase SQL Editor
2. Run the contents of `insert_test_data.sql`
3. This creates sample citizen reports and social media mentions

### Step 2: Trigger AI Analysis
1. Navigate to the Dashboard → AI Predictions view
2. Click the "Run AI Analysis" button (⚡ icon)
3. Wait 2-3 seconds for analysis to complete
4. View generated predictions with confidence levels and details

### Step 3: Monitor Real-time Updates
- Predictions auto-refresh every 5 minutes (toggle with play/pause button)
- Real-time database subscriptions update instantly when new predictions are generated
- Manual refresh available with the refresh button

## 📊 Prediction Types & Details

### Hazard Types Supported:
1. **🌀 Cyclones** - 72h prediction window, peak season Oct-Nov
2. **🌊 Tsunamis** - 4h immediate threat window, year-round risk
3. **⛈️ Storm Surges** - 24h warning window, monsoon peak
4. **💧 Coastal Flooding** - 48h advance warning, monsoon season
5. **🏖️ Coastal Erosion** - 168h (1 week) gradual process monitoring
6. **⚠️ Other Hazards** - 24h general warning window

### Regional Coverage:
- Chennai Coast (Tamil Nadu)
- Mumbai Coast (Maharashtra) 
- Kolkata Coast (West Bengal)
- Odisha Coast
- Kerala Coast
- Goa Coast
- Gujarat Coast
- Andhra Pradesh Coast

### Confidence Level Interpretation:
- **🟢 80%+ (High)**: Strong evidence from multiple sources
- **🟡 60-80% (Moderate)**: Good supporting data
- **🟠 40-60% (Low)**: Some evidence, monitor closely  
- **🔴 <40% (Very Low)**: Weak signals, early warning

## 🔧 API Integration

### Manual Prediction Trigger
```typescript
const triggerPredictions = async () => {
  const { data, error } = await supabase.functions.invoke('prediction-engine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Fetch Active Predictions
```typescript
const { data: predictions } = await supabase
  .from('predicted_hazards')
  .select('*')
  .eq('is_active', true)
  .order('predicted_at', { ascending: false });
```

## 🎨 UI Features

### Interactive Controls:
- **⚡ Run AI Analysis**: Triggers prediction engine manually
- **⏸️/▶️ Auto-refresh**: Toggle automatic data updates
- **🔄 Refresh**: Manual data refresh
- **📊 Detailed Cards**: Rich prediction visualization

### Visual Indicators:
- **Border Colors**: Different hazard types have unique border colors
- **Confidence Badges**: Color-coded confidence levels
- **Severity Tags**: Visual severity indicators
- **Time Remaining**: Dynamic countdown for prediction validity

## 📈 Algorithm Details

### Confidence Calculation Factors:
1. **Data Volume** (30%): Number of reports + social mentions
2. **Urgency Factor** (25%): Average urgency from all sources
3. **Seasonal Factor** (20%): Month-specific risk multipliers
4. **Regional Risk** (Variable): Hazard type compatibility with region
5. **Time Consistency** (Variable): Data consistency over time

### Severity Determination:
- Combines urgency scores, data volume, confidence levels
- Special elevation for high-risk hazards (tsunamis, cyclones)
- Regional and seasonal adjustments

## 🛡️ Security & Performance

- **Row Level Security**: Enabled on all tables
- **Real-time Subscriptions**: Efficient database change tracking
- **Optimized Queries**: Limited result sets and indexed searches
- **Error Handling**: Comprehensive error states and user feedback

## 🚨 Emergency Response Integration

The AI predictions can be integrated with:
- Alert generation systems
- Emergency notification networks
- Resource allocation algorithms
- Evacuation planning systems

## 📱 Mobile Responsiveness

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces

---

## 🎉 Ready to Use!

Your AI prediction system is now fully functional with:
✅ Advanced multi-hazard prediction algorithms
✅ Real-time data processing and updates  
✅ Interactive user interface with manual controls
✅ Comprehensive test data for validation
✅ Production-ready error handling and security

Click "Run AI Analysis" to see the system in action!
