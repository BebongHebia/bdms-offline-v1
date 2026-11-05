import React, { useState } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Award,
  Building,
  CheckCircle,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToForgot: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToForgot }) => {
  const { login, barangayInfo } = useBarangay();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Login failed. Please check your credentials.');
      }
    }, 350);
  };

  const handleQuickDemo = (role: 'admin' | 'clerk') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else {
      setUsername('clerk');
      setPassword('password123');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-800/20 overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-tr from-emerald-900 via-teal-900 to-slate-900 text-white p-7 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 mx-auto mb-3 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 text-emerald-400" />
            </div>
          </div>

          <p className="text-[11px] uppercase tracking-widest text-emerald-300 font-semibold font-sans">
            Republic of the Philippines
          </p>
          <h2 className="text-xl font-extrabold tracking-tight mt-0.5 font-serif">
            {barangayInfo.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Barangay Document Management System
          </p>
          <div className="inline-block mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Offline Edition v2.4
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin or clerk"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={onNavigateToForgot}
                  className="text-emerald-700 hover:text-emerald-800 font-medium hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to System</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 text-center mb-2 font-medium">
              Quick Test Credentials (Pre-seeded Accounts):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 text-xs block">Admin Account</span>
                <span className="text-[10px] text-slate-500 block">User: admin / pass: password123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('clerk')}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all cursor-pointer"
              >
                <span className="font-bold text-slate-900 text-xs block">Clerk Account</span>
                <span className="text-[10px] text-slate-500 block">User: clerk / pass: password123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Municipal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-[10px] text-slate-500">
          Barangay San Isidro • City of Quezon City • NCR, Philippines
          <br />
          For technical assistance, contact the Barangay IT Helpdesk.
        </div>
      </div>
    </div>
  );
};
