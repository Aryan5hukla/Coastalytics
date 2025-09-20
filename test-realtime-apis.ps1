# Test Real-Time API Integration with Your Keys
# Run this script to verify that your Twitter and News API keys are working

Write-Host "🚀 Testing Real-Time API Integration" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
    Write-Host "Please create .env.local with your API keys:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "VITE_SUPABASE_URL=https://seusgfxjonduzsrtoqyy.supabase.co"
    Write-Host "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXNnZnhqb25kdXpzcnRvcXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NTQ4NTQsImV4cCI6MjA3MzQzMDg1NH0.taXUpvk-PE86Y_ZOw0Xjh0U82WXz5uhtuFGO-Cb3IR0"
    Write-Host "TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAI7i4AEAAAAA%2FKLAEUm02Lax9EmxaoshK4aaXcg%3DjE75KaccvL2fNZpxpPxgXGuyovfraNdM22mqc8erNGAnUyHd2f"
    Write-Host "NEWS_API_KEY=1e768b9762d64ab0bd49a7a49e982d5c"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🔑 Testing API Keys..." -ForegroundColor Yellow

# Test Twitter API
Write-Host ""
Write-Host "🐦 Testing Twitter API..." -ForegroundColor Blue
$twitterBearer = "AAAAAAAAAAAAAAAAAAAAAI7i4AEAAAAA%2FKLAEUm02Lax9EmxaoshK4aaXcg%3DjE75KaccvL2fNZpxpPxgXGuyovfraNdM22mqc8erNGAnUyHd2f"
$twitterUrl = "https://api.twitter.com/2/tweets/search/recent?query=tsunami%20OR%20cyclone%20India&max_results=5"

try {
    $response = Invoke-RestMethod -Uri $twitterUrl -Headers @{
        "Authorization" = "Bearer $twitterBearer"
        "Content-Type" = "application/json"
    } -Method GET

    if ($response.data -and $response.data.Count -gt 0) {
        Write-Host "✅ Twitter API working! Found $($response.data.Count) recent tweets" -ForegroundColor Green
        Write-Host "   Latest tweet: $($response.data[0].text.Substring(0, [Math]::Min(100, $response.data[0].text.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Twitter API connected but no recent tweets found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Twitter API Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*401*") {
        Write-Host "   This usually means the Bearer Token is invalid" -ForegroundColor Yellow
    }
}

# Test News API
Write-Host ""
Write-Host "📰 Testing News API..." -ForegroundColor Blue
$newsApiKey = "1e768b9762d64ab0bd49a7a49e982d5c"
$newsUrl = "https://newsapi.org/v2/everything?q=tsunami%20OR%20cyclone%20India&pageSize=5&sortBy=publishedAt"

try {
    $response = Invoke-RestMethod -Uri $newsUrl -Headers @{
        "X-API-Key" = $newsApiKey
    } -Method GET

    if ($response.articles -and $response.articles.Count -gt 0) {
        Write-Host "✅ News API working! Found $($response.articles.Count) recent articles" -ForegroundColor Green
        Write-Host "   Latest article: $($response.articles[0].title)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ News API connected but no recent articles found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ News API Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*401*") {
        Write-Host "   This usually means the API key is invalid" -ForegroundColor Yellow
    }
}

# Test Supabase connection
Write-Host ""
Write-Host "🗄️ Testing Supabase connection..." -ForegroundColor Blue
$supabaseUrl = "https://seusgfxjonduzsrtoqyy.supabase.co/rest/v1/social_mentions?limit=1"
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNldXNnZnhqb25kdXpzcnRvcXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NTQ4NTQsImV4cCI6MjA3MzQzMDg1NH0.taXUpvk-PE86Y_ZOw0Xjh0U82WXz5uhtuFGO-Cb3IR0"

try {
    $response = Invoke-RestMethod -Uri $supabaseUrl -Headers @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    } -Method GET

    Write-Host "✅ Supabase connection working!" -ForegroundColor Green
    if ($response -and $response.Count -gt 0) {
        Write-Host "   Found existing social mentions data" -ForegroundColor Gray
    } else {
        Write-Host "   Database table exists but is empty (this is normal for first run)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Supabase Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Integration Test Summary" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "If all APIs are working, your real-time feed should be active!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run dev" -ForegroundColor White
Write-Host "2. Open: http://localhost:5173" -ForegroundColor White
Write-Host "3. Go to Dashboard → Social Media Monitoring" -ForegroundColor White
Write-Host "4. Click the ⚡ button to test real-time updates" -ForegroundColor White
Write-Host ""
Write-Host "The system will automatically:" -ForegroundColor Cyan
Write-Host "• Fetch live Twitter posts about coastal hazards" -ForegroundColor White
Write-Host "• Pull breaking news from Indian news sources" -ForegroundColor White
Write-Host "• Analyze content with enhanced NLP" -ForegroundColor White
Write-Host "• Display real-time alerts and urgency scores" -ForegroundColor White

