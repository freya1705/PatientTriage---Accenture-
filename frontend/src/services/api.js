import axios from 'axios';

const API_BASE = '/api';

export const api = {
  // Queue & Dashboard
  getLiveQueue: async () => {
    const res = await axios.get(`${API_BASE}/queue/live`);
    return res.data;
  },

  // Patients
  getPatients: async () => {
    const res = await axios.get(`${API_BASE}/patients`);
    return res.data;
  },

  getPatientDetail: async (id) => {
    const res = await axios.get(`${API_BASE}/patients/${id}`);
    return res.data;
  },

  intakePatient: async (payload) => {
    const res = await axios.post(`${API_BASE}/patients`, payload);
    return res.data;
  },

  assessPatientSandbox: async (payload) => {
    const res = await axios.post(`${API_BASE}/triage/assess`, payload);
    return res.data;
  },

  addVitals: async (id, vitalsData) => {
    const res = await axios.post(`${API_BASE}/patients/${id}/vitals`, vitalsData);
    return res.data;
  },

  overrideTriage: async (id, overrideData) => {
    const res = await axios.post(`${API_BASE}/patients/${id}/override`, overrideData);
    return res.data;
  },

  toggleAttending: async (id) => {
    const res = await axios.post(`${API_BASE}/patients/${id}/toggle-attend`);
    return res.data;
  },

  simulateDeterioration: async (id) => {
    const res = await axios.post(`${API_BASE}/patients/${id}/simulate-deterioration`);
    return res.data;
  },

  resetBenchmark: async () => {
    const res = await axios.post(`${API_BASE}/patients/reset`);
    return res.data;
  },

  // Surge
  toggleSurge: async (active) => {
    const res = await axios.post(`${API_BASE}/surge/toggle`, { active });
    return res.data;
  },

  getSurgeStatus: async () => {
    const res = await axios.get(`${API_BASE}/surge/status`);
    return res.data;
  },

  // Audit
  getAuditLogs: async (limit = 100, patientId = null) => {
    const params = { limit };
    if (patientId) params.patient_id = patientId;
    const res = await axios.get(`${API_BASE}/audit/logs`, { params });
    return res.data;
  }
};
