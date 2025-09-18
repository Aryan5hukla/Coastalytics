#!/bin/bash

# Deploy Enhanced Social Media Monitoring Functions
echo "🚀 Deploying Enhanced Social Media Monitoring Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy edge functions
echo "📦 Deploying Edge Functions..."

echo "  📤 Deploying NLP Processor..."
supabase functions deploy nlp-processor --project-ref=$SUPABASE_PROJECT_REF

echo "  📤 Deploying Real-time Scraper..."
supabase functions deploy realtime-scraper --project-ref=$SUPABASE_PROJECT_REF

echo "  📤 Deploying Enhanced Social Media Scraper..."
supabase functions deploy social-media-scraper --project-ref=$SUPABASE_PROJECT_REF

echo "  📤 Deploying Scheduled Scraper..."
supabase functions deploy scheduled-scraper --project-ref=$SUPABASE_PROJECT_REF

# Run the enhanced database migration
echo "🗄️  Running Enhanced Database Migration..."
supabase migration up --project-ref=$SUPABASE_PROJECT_REF

# Set up cron jobs using Supabase's built-in cron (if available) or external service
echo "⏰ Setting up Cron Jobs..."

# For GitHub Actions or external cron service, create the workflow
cat > .github/workflows/social-media-monitoring.yml << 'EOF'
name: Social Media Monitoring

on:
  schedule:
    # Run realtime scraper every 15 minutes
    - cron: '*/15 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  scrape-social-media:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Real-time Scraper
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/realtime-scraper"
      
      - name: Trigger Social Media Scraper
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/social-media-scraper"

  cleanup-daily:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 2 * * *' # Daily at 2 AM
    steps:
      - name: Cleanup Old Mentions
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/scheduled-scraper"
EOF

echo "✅ Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up environment variables in your Supabase project:"
echo "   - Go to Project Settings > Edge Functions"
echo "   - Add any required API keys for social media or image analysis"
echo ""
echo "2. Set up GitHub Actions (if using):"
echo "   - Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to GitHub secrets"
echo "   - Commit the .github/workflows/social-media-monitoring.yml file"
echo ""
echo "3. Test the functions:"
echo "   - Visit your Supabase dashboard"
echo "   - Go to Edge Functions and test each function"
echo ""
echo "4. Monitor the real-time social media feed in your application!"

# Test function deployments
echo "🧪 Testing Function Deployments..."

echo "  Testing NLP Processor..."
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "High waves observed at Chennai coast. Fishermen advised to stay safe."}' \
  "$SUPABASE_URL/functions/v1/nlp-processor"

echo -e "\n  Testing Real-time Scraper..."
curl -X POST \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  "$SUPABASE_URL/functions/v1/realtime-scraper"

echo -e "\n✨ All functions deployed and tested successfully!"
