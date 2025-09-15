import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, Shield, Eye, EyeOff, User, Building, Phone, Mail, CheckCircle } from 'lucide-react';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'citizen' as 'citizen' | 'hazard analyst' | 'govt official',
    organization: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setNeedsEmailConfirmation(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (formData.role !== 'citizen' && !formData.organization.trim()) {
      setError('Organization is required');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        role: formData.role,
        organization: formData.organization,
        phone: formData.phone,
      });
      
      // Check if user was signed in immediately or needs email confirmation
      if (result.session) {
        // User was signed in immediately
        setSuccess(true);
      } else if (result.user) {
        // User created but needs email confirmation
        setNeedsEmailConfirmation(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Clear organization when role changes to citizen
      if (field === 'role' && value === 'citizen') {
        newData.organization = '';
      }
      return newData;
    });
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'citizen':
        return 'Submit hazard reports and receive emergency alerts';
      case 'hazard analyst':
        return 'Monitor and validate citizen reports, analyze hazard data';
      case 'govt official':
        return 'Create alerts, coordinate emergency responses, access dashboards';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500/20 rounded-full mb-4">
            <Shield className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Join Coastal Hazard Monitor
          </h1>
          <p className="text-slate-400 text-sm">
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              required
              autoComplete="name"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
              placeholder="Your full name"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
            >
              <option value="citizen">Citizen</option>
              <option value="hazard analyst">Hazard Analyst</option>
              <option value="govt official">Government Official</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              {getRoleDescription(formData.role)}
            </p>
          </div>

          {/* Organization - Only for non-citizen roles */}
          {formData.role !== 'citizen' && (
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-slate-300 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Organization
              </label>
              <input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                required
                autoComplete="organization"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
                placeholder="Your organization or agency"
              />
            </div>
          )}

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              autoComplete="tel"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-300 text-sm">
                  Account created successfully! Redirecting to your {formData.role === 'citizen' ? 'citizen' : formData.role} dashboard...
                </p>
              </div>
            </div>
          )}

          {needsEmailConfirmation && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-300 text-sm font-medium mb-1">Check your email!</p>
                <p className="text-blue-300 text-xs">
                  We've sent a confirmation link to <strong>{formData.email}</strong>. 
                  Please check your email and click the link to activate your account, then return here to sign in.
                </p>
                <button
                  onClick={onSwitchToLogin}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-xs underline"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
