import React from 'react';
import { useBarangay } from '../context/BarangayContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  UserCheck,
  GitFork,
  BarChart3,
  Shield,
  Settings,
  HelpCircle,
  FileCheck2,
  FolderOpen,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen = false,
  onClose,
}) => {
  const { currentUser, transactions } = useBarangay();
  const isAdmin = currentUser?.role === 'admin';

  const pendingRequests = transactions.filter((t) => t.status === 'Pending').length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    description: string;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & quick stats',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: FileText,
      badge: pendingRequests > 0 ? pendingRequests : undefined,
      description: 'Document requests & processing',
    },
    {
      id: 'residents',
      label: 'Residents Directory',
      icon: Users,
      description: 'Profiles & address records',
    },
    {
      id: 'officials',
      label: 'Staff & Officials',
      icon: UserCheck,
      description: 'Barangay personnel directory',
    },
    {
      id: 'org-chart',
      label: 'Organizational Chart',
      icon: GitFork,
      description: 'Hierarchical leadership map',
    },
    {
      id: 'reports',
      label: 'Demographics & Reports',
      icon: BarChart3,
      description: 'Population & financial audits',
    },
  ];

  // Admin exclusive navigation
  if (isAdmin) {
    navItems.push({
      id: 'users',
      label: 'User Accounts',
      icon: Shield,
      badge: 'Admin',
      description: 'System login & permissions',
    });
  }

  navItems.push({
    id: 'settings',
    label: 'System & Backup',
    icon: Settings,
    description: 'Offline database & settings',
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 lg:top-14 bottom-0 left-0 z-40 lg:z-20 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white text-sm">Barangay Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose?.();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Admin'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500 text-slate-900 font-extrabold'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Help / Offline Status Box */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Offline Database Ready</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All resident records & documents are safely saved locally in your browser storage.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
