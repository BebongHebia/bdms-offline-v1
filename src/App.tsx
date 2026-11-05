import React, { useState } from 'react';
import { BarangayProvider, useBarangay } from './context/BarangayContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ResidentsPage } from './pages/ResidentsPage';
import { StaffOfficialsPage } from './pages/StaffOfficialsPage';
import { OrgChartPage } from './pages/OrgChartPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

const AppContent: React.FC = () => {
  const { currentUser } = useBarangay();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is logged out, handle login or forgot password screens
  if (!currentUser) {
    if (currentPage === 'forgot-password') {
      return <ForgotPasswordPage onBackToLogin={() => setCurrentPage('login')} />;
    }
    return <LoginPage onNavigateToForgot={() => setCurrentPage('forgot-password')} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content area offset for fixed sidebar */}
        <div className="flex-1 lg:pl-64 w-full flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={setCurrentPage}
              onOpenNewTransaction={() => setCurrentPage('transactions')}
              onOpenNewResident={() => setCurrentPage('residents')}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage
              onOpenNewResident={() => setCurrentPage('residents')}
            />
          )}

          {currentPage === 'residents' && (
            <ResidentsPage
              onOpenNewTransactionForResident={(residentId) => {
                setCurrentPage('transactions');
              }}
            />
          )}

          {currentPage === 'officials' && (
            <StaffOfficialsPage
              onNavigateToOrgChart={() => setCurrentPage('org-chart')}
            />
          )}

          {currentPage === 'org-chart' && <OrgChartPage />}

          {currentPage === 'reports' && <ReportsPage />}

          {currentPage === 'users' && (
            currentUser.role === 'admin' ? (
              <UsersPage />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-rose-600 font-bold">Access Restricted</p>
                <p className="text-xs text-slate-500 mt-1">
                  The Users Management module is exclusively available to Administrators.
                </p>
              </div>
            )
          )}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BarangayProvider>
      <AppContent />
    </BarangayProvider>
  );
}
