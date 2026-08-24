import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const TriageContext = createContext(null);

export const TriageProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'intake', 'patient-detail', 'audit', 'privacy'
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [surgeActive, setSurgeActive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Active Modals
  const [overrideModalPatient, setOverrideModalPatient] = useState(null);
  const [whyModalPatient, setWhyModalPatient] = useState(null);
  const [trendModalPatient, setTrendModalPatient] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchQueue = useCallback(async () => {
    try {
      const data = await api.getLiveQueue();
      setQueueData(data);
      setSurgeActive(data.surge_active);
    } catch (err) {
      console.error('Failed to fetch live queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(fetchQueue, 5000); // 5 sec live polling
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchQueue, autoRefresh]);

  const handleToggleSurge = async () => {
    const nextState = !surgeActive;
    try {
      setLoading(true);
      await api.toggleSurge(nextState);
      setSurgeActive(nextState);
      await fetchQueue();
      showToast(
        nextState
          ? '🚨 3X Surge Activated: 60 Patients in ED. Action queue compressed to Top Interventions.'
          : 'Standard ED volume restored (20 baseline benchmark patients).',
        nextState ? 'warning' : 'success'
      );
    } catch (err) {
      showToast('Error toggling surge mode', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    try {
      setLoading(true);
      await api.resetBenchmark();
      await fetchQueue();
      showToast('System reset to original 20 benchmark clinical patients.', 'success');
    } catch (err) {
      showToast('Failed to reset dataset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDeterioration = async (patientId) => {
    try {
      const res = await api.simulateDeterioration(patientId);
      await fetchQueue();
      showToast(`📉 SpO₂ drop & HR spike simulated on ${patientId}. Patient escalated in Action Queue!`, 'warning');
    } catch (err) {
      showToast('Simulation failed', 'error');
    }
  };

  const handleToggleAttending = async (patientId) => {
    try {
      const res = await api.toggleAttending(patientId);
      await fetchQueue();
      showToast(
        res.is_attended
          ? `👩⚕️ Attending physician assigned to ${patientId} (Attention Gap discounted)`
          : `Patient ${patientId} marked unattended (Returned to central action queue)`,
        'info'
      );
    } catch (err) {
      showToast('Toggle failed', 'error');
    }
  };

  const viewPatientDetail = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab('patient-detail');
  };

  return (
    <TriageContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedPatientId,
        setSelectedPatientId,
        queueData,
        loading,
        surgeActive,
        autoRefresh,
        setAutoRefresh,
        fetchQueue,
        handleToggleSurge,
        handleResetData,
        handleSimulateDeterioration,
        handleToggleAttending,
        viewPatientDetail,
        overrideModalPatient,
        setOverrideModalPatient,
        whyModalPatient,
        setWhyModalPatient,
        trendModalPatient,
        setTrendModalPatient,
        toastMessage,
        showToast
      }}
    >
      {children}
    </TriageContext.Provider>
  );
};

export const useTriage = () => useContext(TriageContext);
