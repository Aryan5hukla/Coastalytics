# PowerShell script to start Coastalytics development environment
# Run this script instead of using && commands which don't work in PowerShell

Write-Host "🌊 Starting Coastalytics Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local file not found!" -ForegroundColor Yellow
    Write-Host "Please create .env.local file with your API keys." -ForegroundColor Yellow
    Write-Host "See setup-apis.md for detailed instructions." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Continuing with fallback data..." -ForegroundColor Yellow
    Write-Host ""
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Green
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:5173" -ForegroundColor Blue
Write-Host "🔧 API Functions available via Supabase" -ForegroundColor Blue
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start the development server
npm run dev
