import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  BarChart3,
  Map,
  AlertTriangle,
  Users,
  Settings,
  Shield,
  CheckCircle,
  Activity,
  Database,
  LogOut,
  User
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { profile, signOut } = useAuth();

  const analystMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'map', label: 'Interactive Map', icon: Map },
    { id: 'reports', label: 'Citizen Reports', icon: AlertTriangle },
    { id: 'predictions', label: 'AI Predictions', icon: Activity },
    { id: 'social', label: 'Social Media', icon: Users },
  ];

  const officialMenuItems = [
    ...analystMenuItems,
    { id: 'validation', label: 'Validation Queue', icon: CheckCircle },
    { id: 'alerts', label: 'Alert Management', icon: Shield },
    { id: 'resources', label: 'Emergency Resources', icon: Database },
  ];

  const menuItems = profile?.role === 'govt official' 
    ? officialMenuItems 
    : analystMenuItems;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-slate-800 min-h-screen flex flex-col border-r border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Coastal Monitor</h1>
            <p className="text-xs text-slate-400">
              {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400 border-r-2 border-sky-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Settings */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.full_name || profile?.email}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {profile?.organization}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => onViewChange('settings')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'settings'
                ? 'bg-sky-500/20 text-sky-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-red-600/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}