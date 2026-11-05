import React, { useState } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Send,
  Lock,
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onBackToLogin }) => {
  const { users, resetUserPassword, barangayInfo } = useBarangay();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!targetUser) {
      setError('No registered barangay personnel account found with that email address.');
      return;
    }

    // Generate 6 digit recovery code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setVerificationCode(code); // Pre-fill for offline convenience simulation
    setStep('verify');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificationCode !== generatedCode) {
      setError('Invalid 6-digit verification code entered.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const success = resetUserPassword(email, newPassword);
    if (success) {
      setStep('success');
    } else {
      setError('Password update encountered an issue.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-800/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-tr from-emerald-900 via-teal-900 to-slate-900 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 mx-auto mb-2 flex items-center justify-center border border-emerald-400/30">
            <KeyRound className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold font-serif">Account Recovery</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Barangay Document Management System
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleSendCode} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Enter your registered official email address. The system will verify your identity and generate a password recovery code.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Registered Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. danilo.santos@sanisidro.gov.ph"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Quick prefill helper */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[10px] text-slate-500 font-semibold">Registered staff emails:</p>
                <div className="flex flex-wrap gap-1">
                  {users.map((u) => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => setEmail(u.email)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 hover:border-emerald-500"
                    >
                      {u.email}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Verify Email & Send Code</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
                <p className="font-bold">Recovery Code Generated!</p>
                <p className="mt-0.5">
                  Your 6-digit confirmation token is:{' '}
                  <span className="font-mono font-black text-sm text-emerald-950">
                    {generatedCode}
                  </span>
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  6-Digit Verification Token *
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  placeholder="123456"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-center"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Update Password & Secure Account
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Password Reset Successfully</h3>
              <p className="text-xs text-slate-600">
                Your credentials have been updated in the local security vault. You may now log in with your new password.
              </p>
              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm cursor-pointer"
              >
                Proceed to Login
              </button>
            </div>
          )}

          {step !== 'success' && (
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
