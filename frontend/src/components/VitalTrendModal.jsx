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
import { TrendingDown, Activity, Plus, Zap, X } from 'lucide-react';

export const VitalTrendModal = () => {
  const { trendModalPatient, setTrendModalPatient, fetchQueue, showToast } = useTriage();
  const [patientDetail, setPatientDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quick New Vitals Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHR, setNewHR] = useState(90);
  const [newSBP, setNewSBP] = useState(120);
  const [newDBP, setNewDBP] = useState(80);
  const [newSpO2, setNewSpO2] = useState(96);
  const [newRR, setNewRR] = useState(18);

  const loadDetail = async (id) => {
    try {
      setLoading(true);
      const data = await api.getPatientDetail(id);
      setPatientDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trendModalPatient) {
      loadDetail(trendModalPatient.id);
    }
  }, [trendModalPatient]);

  if (!trendModalPatient) return null;

  const handleAddVitals = async (e) => {
    e.preventDefault();
    try {
      await api.addVitals(trendModalPatient.id, {
        heart_rate: parseInt(newHR),
        systolic_bp: parseInt(newSBP),
        diastolic_bp: parseInt(newDBP),
        spo2: parseInt(newSpO2),
        resp_rate: parseInt(newRR),
        recorded_by: 'Bedside Observation'
      });
      await loadDetail(trendModalPatient.id);
      await fetchQueue();
      setShowAddForm(false);
      showToast('✓ New vital signs logged. Safety status refreshed to VALID.', 'success');
    } catch (err) {
      showToast('Failed to record vitals', 'error');
    }
  };

  const handleSimulateDrop = async () => {
    try {
      await api.simulateDeterioration(trendModalPatient.id);
      await loadDetail(trendModalPatient.id);
      await fetchQueue();
      showToast('📉 Acute drop simulated! Trajectory updated in real-time.', 'warning');
    } catch (err) {
      showToast('Simulation failed', 'error');
    }
  };

  const chartData = (patientDetail?.vital_history || []).map((v) => ({
    time: `T+${v.timestamp_mins}m`,
    heart_rate: v.heart_rate,
    systolic_bp: v.systolic_bp,
    spo2: v.spo2,
    resp_rate: v.resp_rate
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Vital Trajectory & Deterioration Monitor
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{trendModalPatient.id}</strong> — {trendModalPatient.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTrendModalPatient(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Status Ribbon */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Trajectory</span>
              <div
                className={`text-sm font-black mt-0.5 ${
                  patientDetail?.trajectory_status === 'RAPID_DETERIORATION'
                    ? 'text-red-400'
                    : patientDetail?.trajectory_status === 'WORSENING'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {patientDetail?.trajectory_status || 'STABLE'}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Safety Expiry</span>
              <div
                className={`text-sm font-black mt-0.5 ${
                  patientDetail?.safety_status === 'EXPIRED' ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {patientDetail?.safety_status || 'VALID'}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Deterioration Score</span>
              <div className="text-sm font-black text-cyan-400 mt-0.5">
                +{patientDetail?.deterioration_score || 0} pts
              </div>
            </div>
          </div>

          {/* Recharts Vital Trajectory Chart */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200">
                Continuous Physiological Trends (SpO₂, HR, SBP)
              </span>
              <span className="text-[11px] text-slate-400">Time progression (minutes)</span>
            </div>
            <div className="h-56 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="heart_rate" name="Heart Rate (bpm)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="systolic_bp" name="Systolic BP (mmHg)" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No vital history records found.
                </div>
              )}
            </div>
          </div>

          {/* Deterioration Reasons Alert */}
          {patientDetail?.deterioration_reasons && patientDetail.deterioration_reasons.length > 0 && (
            <div className="p-3 bg-red-950/30 border border-red-800/60 rounded-xl space-y-1">
              <span className="text-xs font-bold text-red-400">⚠️ Active Deterioration Alerts:</span>
              <ul className="text-xs text-red-200/90 list-disc list-inside space-y-0.5">
                {patientDetail.deterioration_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form to Add New Repeat Observation */}
          {showAddForm ? (
            <form onSubmit={handleAddVitals} className="p-4 bg-slate-950 rounded-xl border border-cyan-800/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-300">Record Fresh Bedside Vitals</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400">SpO2 (%)</label>
                  <input
                    type="number"
                    value={newSpO2}
                    onChange={(e) => setNewSpO2(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">HR (bpm)</label>
                  <input
                    type="number"
                    value={newHR}
                    onChange={(e) => setNewHR(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">SBP (mmHg)</label>
                  <input
                    type="number"
                    value={newSBP}
                    onChange={(e) => setNewSBP(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">DBP (mmHg)</label>
                  <input
                    type="number"
                    value={newDBP}
                    onChange={(e) => setNewDBP(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">RR (/min)</label>
                  <input
                    type="number"
                    value={newRR}
                    onChange={(e) => setNewRR(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
                >
                  Save Vitals & Refresh Expiry
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Record Repeat Vitals</span>
              </button>

              <button
                onClick={handleSimulateDrop}
                className="py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-300 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate Deterioration</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={() => setTrendModalPatient(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
