import React, { useState, useEffect } from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  ShieldCheck,
  User,
  LogOut,
  Clock,
  Sparkles,
  Search,
  Bell,
  RefreshCw,
  HardDriveDownload,
  Users,
  CheckCircle,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate, currentPage }) => {
  const { currentUser, setCurrentUser, users, logout, barangayInfo, transactions, exportDatabaseJson } = useBarangay();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live Philippine clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = transactions.filter((t) => t.status === 'Pending').length;

  const handleRoleSwitch = (targetRole: 'admin' | 'clerk') => {
    const targetUser = users.find((u) => u.role === targetRole) || users[0];
    setCurrentUser(targetUser);
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-slate-900 border-b border-slate-800 text-white shadow-md print:hidden flex items-center">
      <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white leading-tight">
                  {barangayInfo.name}
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Offline BDMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide font-medium">
                Document Request & Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Notification */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-slate-300 text-[11px]">
              {currentTime || 'PST (GMT+8)'}
            </span>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={() => onNavigate('transactions')}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/30 transition-colors cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-medium text-[11px]">
                {pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}
              </span>
            </button>
          )}
        </div>

        {/* Right: Quick Role Switcher, Database Export & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Switcher Pill */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                currentUser?.role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Admin role with user management permissions"
            >
              Admin
            </button>
            <button
              onClick={() => handleRoleSwitch('clerk')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                currentUser?.role === 'clerk'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Clerk role for transaction processing"
            >
              Clerk
            </button>
          </div>

          {/* Backup Database Quick Button */}
          <button
            onClick={exportDatabaseJson}
            className="hidden xl:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium transition-colors"
            title="Download full JSON database snapshot"
          >
            <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Backup</span>
          </button>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 p-1.5 pr-2.5 rounded-xl border border-slate-700 transition-colors text-left"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
                  {currentUser?.fullName?.[0] || 'U'}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-none text-white max-w-[120px] truncate">
                  {currentUser?.fullName}
                </p>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {currentUser?.role}
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-white truncate">{currentUser?.fullName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{currentUser?.email}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>ID: {currentUser?.idNo}</span>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => onNavigate('residents')}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    Resident Directory
                  </button>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => onNavigate('users')}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      Manage System Users
                    </button>
                  )}

                  <button
                    onClick={() => onNavigate('settings')}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <HardDriveDownload className="w-4 h-4 text-teal-400" />
                    Offline Database & Backup
                  </button>
                </div>

                <div className="p-1 border-t border-slate-800">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Log Out of System
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
