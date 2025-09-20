# PowerShell script to test API integrations
# This script helps verify that your API keys are working correctly

Write-Host "🔍 Testing Coastalytics API Integrations..." -ForegroundColor Cyan
Write-Host ""

# Check .env.local file
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your API keys first." -ForegroundColor Red
    Write-Host "See setup-apis.md for instructions." -ForegroundColor Red
    exit 1
}

# Load environment variables (basic check)
$envContent = Get-Content ".env.local" -Raw
Write-Host "📋 Checking API Keys Configuration:" -ForegroundColor Yellow

# Check for Twitter API
if ($envContent -match "TWITTER_BEARER_TOKEN=.*[a-zA-Z0-9]") {
    Write-Host "✅ Twitter Bearer Token: Configured" -ForegroundColor Green
} else {
    Write-Host "❌ Twitter Bearer Token: Missing or empty" -ForegroundColor Red
}

# Check for News API
if ($envContent -match "NEWS_API_KEY=.*[a-zA-Z0-9]") {
    Write-Host "✅ News API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "❌ News API Key: Missing or empty" -ForegroundColor Red
}

# Check for YouTube API (optional)
if ($envContent -match "YOUTUBE_API_KEY=.*[a-zA-Z0-9]") {
    Write-Host "✅ YouTube API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  YouTube API Key: Optional - not configured" -ForegroundColor Yellow
}

# Check for Supabase
if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL=.*") {
    Write-Host "✅ Supabase URL: Configured" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase URL: Missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 To test the actual API calls:" -ForegroundColor Cyan
Write-Host "1. Start the dev server: .\start-dev.ps1" -ForegroundColor White
Write-Host "2. Open http://localhost:5173" -ForegroundColor White
Write-Host "3. Go to Dashboard -> Social Media Monitoring" -ForegroundColor White
Write-Host "4. Check browser console for API responses" -ForegroundColor White
Write-Host ""
Write-Host "📊 Look for messages like:" -ForegroundColor Cyan
Write-Host "- '📊 Scraped X Twitter, Y News API articles'" -ForegroundColor White
Write-Host "- If you see 'Using fallback data', APIs need configuration" -ForegroundColor White
