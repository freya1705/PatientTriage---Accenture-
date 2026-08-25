import React from 'react';
import { TriageProvider, useTriage } from './context/TriageContext';
import { Navbar } from './components/Navbar';
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2 ${
              toastMessage.type === 'error'
                ? 'bg-red-950 text-red-300 border-red-800 shadow-red-950/50'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950 text-amber-300 border-amber-800 shadow-amber-950/50'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800 shadow-emerald-950/50'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'intake' && <IntakePage />}
        {activeTab === 'about-scoring' && <AboutScoringPage />}
        {activeTab === 'evaluation' && <EvaluationPage />}
        {activeTab === 'patient-detail' && <PatientDetailPage />}
        {activeTab === 'audit' && <AuditPage />}
        {activeTab === 'privacy' && <PrivacyPage />}
      </main>

      {/* Global Interactive Modals */}
      <OverrideModal />
      <WhyExplanationModal />
      <VitalTrendModal />

      {/* Clean Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          PatientTriage.ai &bull; Accenture Innovation Challenge 2026 Prototype &bull; Clinical Decision-Support &amp; Continuous Safety Intelligence
        </p>
      </footer>
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
