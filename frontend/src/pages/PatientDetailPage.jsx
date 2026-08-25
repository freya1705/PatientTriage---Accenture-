import React, { useState, useEffect } from 'react';
import { useTriage } from '../context/TriageContext';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  ArrowLeft,
  Activity,
  Clock,
  ShieldAlert,
  UserCheck,
  UserX,
  TrendingDown,
  FileText,
  Plus,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const PatientDetailPage = () => {
  const {
    selectedPatientId,
    setActiveTab,
    setOverrideModalPatient,
    handleSimulateDeterioration,
    handleToggleAttending,
    showToast
  } = useTriage();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Vitals inline form
  const [showAddVitals, setShowAddVitals] = useState(false);
  const [hr, setHr] = useState(90);
  const [sbp, setSbp] = useState(120);
  const [dbp, setDbp] = useState(80);
  const [spo2, setSpo2] = useState(96);
  const [rr, setRr] = useState(18);
  const [temp, setTemp] = useState(37.0);

  const loadPatient = async () => {
    if (!selectedPatientId) return;
    try {
      setLoading(true);
      const data = await api.getPatientDetail(selectedPatientId);
      setPatient(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading patient details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatient();
  }, [selectedPatientId]);

  const handleAddVitals = async (e) => {
    e.preventDefault();
    try {
      await api.addVitals(selectedPatientId, {
        heart_rate: parseInt(hr),
        systolic_bp: parseInt(sbp),
        diastolic_bp: parseInt(dbp),
        spo2: parseInt(spo2),
        resp_rate: parseInt(rr),
        temperature: parseFloat(temp),
        recorded_by: 'Staff RN Bedside'
      });
      setShowAddVitals(false);
      await loadPatient();
      showToast('Vitals recorded. Safety validity refreshed to VALID.', 'success');
    } catch (err) {
      showToast('Failed to add vitals', 'error');
    }
  };

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 text-cyan-700 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading patient dossier...</p>
        </div>
      </div>
    );
  }

  const chartData = (patient.vital_history || []).map((v) => ({
    time: `${v.minutes_ago}m ago`,
    SpO2: v.spo2,
    HR: v.heart_rate,
    SBP: v.systolic_bp,
    RR: v.resp_rate
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Command Center</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSimulateDeterioration(patient.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate SpO₂ Drop</span>
          </button>

          <button
            onClick={() => setOverrideModalPatient(patient)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            Override Triage
          </button>
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm shrink-0">
            {patient.id}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-900">
                {patient.name}
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                {patient.gender}, {patient.age} years old
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Chief Complaint: <strong className="text-slate-800">{patient.chief_complaint}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Triage Level</span>
            <div className="text-sm font-bold text-slate-900">
              Level {patient.display_triage_level} {patient.is_overridden ? '(Overridden)' : ''}
            </div>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Safety Confidence</span>
            <div className={`text-sm font-bold ${patient.current_confidence < 60 ? 'text-purple-700' : 'text-emerald-700'}`}>
              {patient.current_confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Vital Trajectory Graph & Add Vitals */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Continuous Vital Trajectory &amp; Rate-of-Change
            </h2>
            <p className="text-xs text-slate-500">
              Monitors vital deterioration deltas to trigger proactive escalation.
            </p>
          </div>

          <button
            onClick={() => setShowAddVitals(!showAddVitals)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-700" />
            <span>Record Bedside Vitals</span>
          </button>
        </div>

        {/* Add Vitals Inline Form */}
        {showAddVitals && (
          <form onSubmit={handleAddVitals} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enter Repeat Vital Signs (Refreshes Safety Validity to 100%)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">HR (bpm)</label>
                <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">SBP</label>
                <input type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">DBP</label>
                <input type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">SpO₂ (%)</label>
                <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">RR (/min)</label>
                <input type="number" value={rr} onChange={(e) => setRr(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Temp (°C)</label>
                <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setShowAddVitals(false)} className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900">Cancel</button>
              <button type="submit" className="px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded text-xs font-semibold">Save Vitals</button>
            </div>
          </form>
        )}

        {/* Recharts Trajectory Graph */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[40, 180]} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="SpO2" stroke="#0284c7" strokeWidth={2.5} name="SpO₂ (%)" />
              <Line type="monotone" dataKey="HR" stroke="#e11d48" strokeWidth={2} name="Heart Rate (bpm)" />
              <Line type="monotone" dataKey="SBP" stroke="#d97706" strokeWidth={1.5} name="Systolic BP" />
              <Line type="monotone" dataKey="RR" stroke="#7c3aed" strokeWidth={1.5} name="Resp Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
