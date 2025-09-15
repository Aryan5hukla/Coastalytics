import React from 'react';
import { Shield, AlertTriangle, Map, Users, TrendingUp, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Coastal Hazard Monitor</span>
            </div>
            <button
              onClick={onSignIn}
              className="text-slate-300 hover:text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Protect Coastal Communities with
              <span className="text-sky-400 block">AI-Powered Monitoring</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Advanced coastal hazard detection and emergency response system powered by citizen reports, 
              AI predictions, and real-time monitoring for enhanced disaster preparedness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onSignIn}
                className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Comprehensive Hazard Monitoring
            </h2>
            <p className="text-slate-300 text-lg">
              Everything you need to monitor, predict, and respond to coastal hazards
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Alerts</h3>
              <p className="text-slate-400">
                Instant emergency notifications and alert management system
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Map className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Maps</h3>
              <p className="text-slate-400">
                Detailed visualization of hazard zones and affected areas
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Citizen Reports</h3>
              <p className="text-slate-400">
                Community-powered hazard reporting and verification system
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Predictions</h3>
              <p className="text-slate-400">
                Machine learning-powered hazard forecasting and analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Built for Different User Roles
            </h2>
            <p className="text-slate-300 text-lg">
              Tailored interfaces for citizens, hazard analysts, and government officials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Citizens</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Submit hazard reports with photos</li>
                <li>• Receive emergency alerts</li>
                <li>• Track report status</li>
                <li>• Access safety resources</li>
              </ul>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Hazard Analysts</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Monitor incoming citizen reports</li>
                <li>• Validate and verify hazard data</li>
                <li>• Analyze patterns and trends</li>
                <li>• Generate insights and reports</li>
              </ul>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Government Officials</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Create and manage emergency alerts</li>
                <li>• Coordinate response efforts</li>
                <li>• Access real-time dashboard</li>
                <li>• Monitor resource allocation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sky-500/10 border-t border-sky-500/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Enhance Coastal Safety?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join our platform and help protect coastal communities through advanced monitoring and prediction.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2024 Coastal Hazard Monitor. Advanced coastal protection technology.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
