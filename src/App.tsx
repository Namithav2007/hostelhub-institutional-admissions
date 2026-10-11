import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AdmissionsPage } from './pages/AdmissionsPage.tsx';
import { RoomsPage } from './pages/RoomsPage.tsx';
import { AllocationsPage } from './pages/AllocationsPage.tsx';
import { FeesPage } from './pages/FeesPage.tsx';
import { MaintenancePage } from './pages/MaintenancePage.tsx';
import { VisitorsPage } from './pages/VisitorsPage.tsx';
import { OccupancyReportsPage } from './pages/OccupancyReportsPage.tsx';
import { UsersPage } from './pages/UsersPage.tsx';
import { AuditLogsPage } from './pages/AuditLogsPage.tsx';
import { StudentProfilePage } from './pages/StudentProfilePage.tsx';
import { ReceiptModal } from './components/common/ReceiptModal.tsx';
import { api } from './services/api.ts';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeReceiptData, setActiveReceiptData] = useState<any | null>(null);

  const handleOpenReceipt = async (receiptNum: string) => {
    try {
      const data = await api.getReceipt(receiptNum);
      setActiveReceiptData(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Initializing HostelHub Portal...</p>
        </div>
      </div>
    );
  }

  // Not logged in and selecting login or protected tab
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1">
          {currentTab === 'rooms' ? (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <RoomsPage />
            </div>
          ) : currentTab === 'admissions' ? (
            <div className="max-w-7xl mx-auto px-4 py-8">
              <AdmissionsPage />
            </div>
          ) : (
            <LoginPage onSuccess={() => setCurrentTab('dashboard')} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardPage onSelectTab={setCurrentTab} onOpenReceipt={handleOpenReceipt} />
          )}
          {currentTab === 'admissions' && <AdmissionsPage />}
          {currentTab === 'rooms' && <RoomsPage />}
          {currentTab === 'allocations' && <AllocationsPage />}
          {currentTab === 'fees' && <FeesPage onOpenReceipt={handleOpenReceipt} />}
          {currentTab === 'maintenance' && <MaintenancePage />}
          {currentTab === 'visitors' && <VisitorsPage />}
          {currentTab === 'occupancy' && <OccupancyReportsPage />}
          {currentTab === 'users' && <UsersPage />}
          {currentTab === 'audit' && <AuditLogsPage />}
          {currentTab === 'profile' && <StudentProfilePage />}
          {currentTab === 'login' && <LoginPage onSuccess={() => setCurrentTab('dashboard')} />}
        </main>
      </div>

      {activeReceiptData && (
        <ReceiptModal
          receiptData={activeReceiptData}
          onClose={() => setActiveReceiptData(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
