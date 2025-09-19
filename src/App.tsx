import { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { SettingsProvider } from './contexts/SettingsContext';
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
import SettingsPage from './components/settings/SettingsPage';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  
  const [activeView, setActiveView] = useState(''); // Will be set after auth loads
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewParams, setViewParams] = useState<string>('');
  
  // Refs for components to handle refresh
  const componentRefs = useRef<{ [key: string]: any }>({});

  // Save activeView and viewParams to localStorage whenever they change (but only after initialization)
  useEffect(() => {
    if (isInitialized && user) {
      localStorage.setItem('coastalytics_activeView', activeView);
      if (viewParams) {
        localStorage.setItem('coastalytics_viewParams', viewParams);
      } else {
        localStorage.removeItem('coastalytics_viewParams');
      }
    }
  }, [activeView, viewParams, isInitialized, user]);

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

  // Centralized refresh handler
  const handleRefresh = () => {
    // Simply reload the page to refresh the current view
    window.location.reload();
  };

  // Initialize activeView from localStorage or set default based on user role
  useEffect(() => {
    if (user && profile && !loading && !isInitialized) {
      setAuthView('landing');
      
      // First, try to get saved view and params from localStorage
      const savedView = localStorage.getItem('coastalytics_activeView');
      const savedParams = localStorage.getItem('coastalytics_viewParams');
      
      if (savedView) {
        // Use saved view if it exists
        setActiveView(savedView);
        if (savedParams) {
          setViewParams(savedParams);
        }
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
      localStorage.removeItem('coastalytics_viewParams');
      setActiveView(''); // Will be set when next user logs in
      setViewParams('');
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
      case 'dashboard': return t('page.dashboard.title');
      case 'map': return t('page.map.title');
      case 'reports': return t('page.reports.title');
      case 'report-form': return t('page.reportForm.title');
      case 'reports-map': return t('page.reportsMap.title');
      case 'alerts': return t('page.alerts.title');
      case 'validation': return t('page.validation.title');
      case 'predictions': return t('page.predictions.title');
      case 'social': return t('page.social.title');
      case 'resources': return t('page.resources.title');
      case 'settings': return t('page.settings.title');
      default: return t('page.dashboard.title');
    }
  };

  const getViewSubtitle = (view: string) => {
    switch (view) {
      case 'dashboard': return t('page.dashboard.subtitle');
      case 'map': return t('page.map.subtitle');
      case 'reports': return t('page.reports.subtitle');
      case 'report-form': return t('page.reportForm.subtitle');
      case 'reports-map': return t('page.reportsMap.subtitle');
      case 'alerts': return t('page.alerts.subtitle');
      case 'validation': return t('page.validation.subtitle');
      case 'predictions': return t('page.predictions.subtitle');
      case 'social': return t('page.social.subtitle');
      case 'resources': return t('page.resources.subtitle');
      case 'settings': return t('page.settings.subtitle');
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

    const getTabFromParams = () => {
      if (viewParams) {
        const urlParams = new URLSearchParams(viewParams);
        return urlParams.get('tab');
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
          <SettingsPage 
            initialTab={getTabFromParams() || 'profile'}
            onTabChange={(tab) => {
              // Update URL parameters to preserve tab on refresh
              if (tab !== 'profile') {
                setViewParams(`tab=${tab}`);
              } else {
                setViewParams('');
              }
            }}
          />
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
          onRefresh={handleRefresh}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;