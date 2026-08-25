import React, { useState } from 'react';
import { TriageProvider, useTriage } from './context/TriageContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { IntakePage } from './pages/IntakePage';
import { AboutScoringPage } from './pages/AboutScoringPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { AuditPage } from './pages/AuditPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { OverrideModal } from './components/OverrideModal';
import { WhyExplanationModal } from './components/WhyExplanationModal';
import { VitalTrendModal } from './components/VitalTrendModal';

const AppContent = () => {
  const { activeTab, toastMessage } = useTriage();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-x-hidden">
      {/* 1. Left Zone: Navigation Rail */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Workspace (Center + Header + Modals) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Workspace Top Header */}
        <Header />

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 animate-bounce">
            <div
              className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 ${
                toastMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : toastMessage.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'intake' && <IntakePage />}
          {activeTab === 'about-scoring' && <AboutScoringPage />}
          {activeTab === 'evaluation' && <EvaluationPage />}
          {activeTab === 'patient-detail' && <PatientDetailPage />}
          {activeTab === 'audit' && <AuditPage />}
          {activeTab === 'privacy' && <PrivacyPage />}
        </main>

        {/* Minimalist Clinical Footer */}
        <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-400">
          <p>
            PatientTriage.ai &bull; Continuous Safety Layer for Emergency Departments &bull; Accenture Innovation Challenge 2026
          </p>
        </footer>
      </div>

      {/* Global Modals */}
      <OverrideModal />
      <WhyExplanationModal />
      <VitalTrendModal />
    </div>
  );
};

export default function App() {
  return (
    <TriageProvider>
      <AppContent />
    </TriageProvider>
  );
}
