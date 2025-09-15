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

function App() {
  const { user, profile, loading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');

  // Reset authView and set initial dashboard view based on user role
  useEffect(() => {
    if (user && profile) {
      setAuthView('landing');
      // Set initial view based on user role
      if (profile.role === 'govt official') {
        setActiveView('dashboard');
      } else if (profile.role === 'hazard analyst') {
        setActiveView('dashboard');
      } else {
        setActiveView('report-form'); // Citizens start with report form
      }
    }
  }, [user, profile]);

  // Show loading spinner while checking authentication
  if (loading) {
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
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'map':
        return <InteractiveMap />;
      case 'reports':
        return <ReportsView />;
      case 'report-form':
        return <CitizenReportForm />;
      case 'reports-map':
        return <ReportsMapView />;
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
        return (
          <div className="p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">AI Predictions</h2>
              <p className="text-slate-400">Hazard prediction algorithms and forecasts will be displayed here.</p>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="p-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Social Media Monitor</h2>
              <p className="text-slate-400">Social media analysis and sentiment tracking will be shown here.</p>
            </div>
          </div>
        );
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
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex-1 flex flex-col">
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