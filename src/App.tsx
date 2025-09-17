import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import LandingPage from './components/LandingPage';
import LoginForm from './components/auth/LoginForm';
import SignUpForm from './components/auth/SignUpForm';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardOverview from './components/dashboard/DashboardOverview';
import InteractiveMap from './components/map/InteractiveMap';
import ReportsView from './components/reports/ReportsView';
import CitizenReportForm from './components/reports/CitizenReportForm';
import ReportsMapView from './components/reports/ReportsMapView';
import AlertsView from './components/alerts/AlertsView';
import AIPredictionView from './components/dashboard/AIPredictionView';
import SocialMentionsFeed from './components/dashboard/SocialMentionsFeed';

function App() {
  const { user, profile, loading } = useAuth();
  
  const [activeView, setActiveView] = useState(''); // Will be set after auth loads
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewParams, setViewParams] = useState<string>('');

  // Save activeView to localStorage whenever it changes (but only after initialization)
  useEffect(() => {
    if (isInitialized && user) {
      localStorage.setItem('coastalytics_activeView', activeView);
    }
  }, [activeView, isInitialized, user]);

  // Enhanced navigation function to handle view with parameters
  const navigateToView = (viewWithParams: string) => {
    if (viewWithParams.includes('?')) {
      const [view, params] = viewWithParams.split('?');
      setActiveView(view);
      setViewParams(params);
    } else {
      setActiveView(viewWithParams);
      setViewParams('');
    }
  };

  // Initialize activeView from localStorage or set default based on user role
  useEffect(() => {
    if (user && profile && !loading && !isInitialized) {
      setAuthView('landing');
      
      // First, try to get saved view from localStorage
      const savedView = localStorage.getItem('coastalytics_activeView');
      
      if (savedView) {
        // Use saved view if it exists
        setActiveView(savedView);
      } else {
        // Set default view to dashboard for all users if no saved view
        setActiveView('dashboard');
      }
      
      setIsInitialized(true);
    }
    
    // Reset when user logs out
    if (!user && !loading) {
      setIsInitialized(false);
      localStorage.removeItem('coastalytics_activeView');
      setActiveView(''); // Will be set when next user logs in
    }
  }, [user, profile, loading, isInitialized]);

  // Show loading spinner while checking authentication or initializing
  if (loading || (user && !isInitialized)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication flow if user is not authenticated
  if (!user) {
    switch (authView) {
      case 'landing':
        return (
          <LandingPage
            onGetStarted={() => setAuthView('signup')}
            onSignIn={() => setAuthView('login')}
          />
        );
      case 'login':
        return (
          <LoginForm onSwitchToSignUp={() => setAuthView('signup')} />
        );
      case 'signup':
        return (
          <SignUpForm onSwitchToLogin={() => setAuthView('login')} />
        );
      default:
        return (
          <LandingPage
            onGetStarted={() => setAuthView('signup')}
            onSignIn={() => setAuthView('login')}
          />
        );
    }
  }

  // Main dashboard interface
  const getViewTitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'map': return 'Interactive Map';
      case 'reports': return 'Citizen Reports';
      case 'report-form': return 'Report Ocean Hazard';
      case 'reports-map': return 'Reports Map View';
      case 'alerts': return 'Alert Management';
      case 'validation': return 'Validation Queue';
      case 'predictions': return 'AI Predictions';
      case 'social': return 'Social Media Monitor';
      case 'resources': return 'Emergency Resources';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getViewSubtitle = (view: string) => {
    switch (view) {
      case 'dashboard': return 'Real-time monitoring and system overview';
      case 'map': return 'Interactive coastal hazard visualization';
      case 'reports': return 'Citizen-submitted hazard reports and validation';
      case 'report-form': return 'Submit a new ocean hazard report with location and media';
      case 'reports-map': return 'View all submitted reports on an interactive map';
      case 'alerts': return 'Create and manage emergency alerts';
      case 'validation': return 'Review and verify pending reports';
      case 'predictions': return 'AI-generated hazard predictions and forecasts';
      case 'social': return 'Social media sentiment and keyword analysis';
      case 'resources': return 'Emergency resources and shelter locations';
      default: return '';
    }
  };

  const renderActiveView = () => {
    // Parse view parameters
    const getFilterFromParams = () => {
      if (viewParams) {
        const urlParams = new URLSearchParams(viewParams);
        return urlParams.get('status');
      }
      return null;
    };

    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview onNavigate={navigateToView} />;
      case 'map':
        return <InteractiveMap />;
      case 'reports':
        return <ReportsView initialStatusFilter={getFilterFromParams()} />;
      case 'report-form':
        return <CitizenReportForm />;
      case 'reports-map':
        return <ReportsMapView initialStatusFilter={getFilterFromParams()} />;
      case 'alerts':
        return <AlertsView />;
      case 'validation':
        return (
          <div className="p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Validation Queue</h2>
              <p className="text-slate-400">Report validation interface will be implemented here.</p>
            </div>
          </div>
        );
      case 'predictions':
        return <AIPredictionView />;
      case 'social':
        return <SocialMentionsFeed />;
      case 'resources':
        return (
          <div className="p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Emergency Resources</h2>
              <p className="text-slate-400">Emergency resources and shelter management will be available here.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
              <p className="text-slate-400">User preferences and system configuration options.</p>
            </div>
          </div>
        );
      default:
        return <DashboardOverview onNavigate={navigateToView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="ml-64 flex flex-col min-h-screen">
        <Header 
          title={getViewTitle(activeView)}
          subtitle={getViewSubtitle(activeView)}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;