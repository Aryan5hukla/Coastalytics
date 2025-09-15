# 🌊 Ocean Hazard Citizen Reporting Platform

A comprehensive web application that enables citizens to report ocean hazards and unusual activities with geolocation, media uploads, and real-time monitoring capabilities.

## 🚀 Features

### For Citizens
- **📍 Geolocation-enabled Reporting**: Automatically captures and verifies location data
- **📸 Media Upload**: Support for photos and videos (up to 5 files, 50MB each)
- **🎯 Hazard Classification**: Categorize reports by hazard type (Cyclone, Tsunami, Storm Surge, etc.)
- **⚡ Urgency Levels**: 5-level urgency scale for prioritizing reports
- **🗺️ Interactive Map View**: View all submitted reports on an interactive map
- **📱 Mobile-Friendly**: Responsive design optimized for mobile devices

### For Officials & Analysts
- **✅ Report Validation**: Review and verify citizen submissions
- **📊 Dashboard Analytics**: Real-time monitoring and statistics
- **🚨 Alert Management**: Create and manage emergency alerts
- **🤖 AI Integration**: Hazard prediction and sentiment analysis
- **👥 Role-based Access**: Different interfaces for citizens, analysts, and officials

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time + Storage + Auth)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Geolocation**: HTML5 Geolocation API + OpenCage Geocoding
- **Maps**: PostGIS for spatial data storage

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/                 # Authentication components
│   ├── dashboard/            # Dashboard and analytics
│   ├── layout/              # Header, Sidebar, etc.
│   ├── map/                 # Interactive map components
│   ├── reports/             # Reporting system
│   │   ├── CitizenReportForm.tsx    # Main reporting form
│   │   ├── ReportsMapView.tsx       # Map view of all reports
│   │   └── ReportsView.tsx          # Admin reports management
│   └── alerts/              # Alert management
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities and configurations
└── types/                   # TypeScript type definitions

supabase/
├── migrations/              # Database migrations
└── functions/              # Edge functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- (Optional) OpenCage API key for enhanced geocoding

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ocean-hazard-reporting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENCAGE_API_KEY=your_opencage_api_key  # Optional
   ```

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 Usage Guide

### For Citizens

1. **Sign Up/Login**: Create an account or login as a citizen
2. **Report Hazard**: 
   - Click "Report Hazard" in the sidebar
   - Allow location access for automatic geotagging
   - Select hazard type and set urgency level
   - Add detailed description
   - Upload photos/videos (optional)
   - Submit the report

3. **View Reports**: Use "View Reports" to see all submitted reports on an interactive map

### For Officials

1. **Dashboard**: Monitor real-time statistics and recent activity
2. **Report Management**: Review, verify, or dismiss citizen reports
3. **Alert System**: Create emergency alerts for affected areas
4. **Validation Queue**: Process pending reports for verification

## 🗄️ Database Schema

### Key Tables

- **`user_profiles`**: User information with role-based access
- **`reports`**: Citizen-submitted hazard reports with geolocation
- **`alerts`**: Official emergency alerts
- **`incois_warnings`**: External warning system integration
- **`predicted_hazards`**: AI-generated hazard predictions

### Report Status Flow
```
pending → pending_verification → verified/dismissed
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-based Authentication**: Citizen, Analyst, Official roles
- **Media Storage Security**: Secure file upload with size limits
- **Geolocation Verification**: Location accuracy validation

## 🌐 API Integration

### Geolocation Services
- HTML5 Geolocation API for precise location capture
- OpenCage Geocoding API for reverse geocoding (optional)
- PostGIS for spatial data queries and analysis

### Media Storage
- Supabase Storage for secure file uploads
- Automatic file organization by user and timestamp
- Public URL generation for media access

## 📊 Monitoring & Analytics

- Real-time report statistics
- Hazard type distribution analysis
- Geographic clustering of reports
- Response time tracking
- User engagement metrics

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=            # Supabase project URL
VITE_SUPABASE_ANON_KEY=       # Supabase anonymous key
VITE_OPENCAGE_API_KEY=        # OpenCage geocoding key (optional)
```

### Supabase Setup
1. Create a new Supabase project
2. Enable Authentication with email/password
3. Set up Storage bucket named 'media'
4. Apply the provided database migrations
5. Configure RLS policies for security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `/docs` folder
- Review the Supabase setup guide

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] AI-powered hazard prediction
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with emergency services
- [ ] Offline report capability
- [ ] Social media monitoring

---

Built with ❤️ for coastal community safety
