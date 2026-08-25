import React from 'react';
import { useTriage } from '../context/TriageContext';
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
import { TrendingDown, Activity, AlertTriangle, X, Zap } from 'lucide-react';

export const VitalTrendModal = () => {
  const {
    trendModalPatient,
    setTrendModalPatient,
    handleSimulateDeterioration,
    viewPatientDetail
  } = useTriage();

  if (!trendModalPatient) return null;

  const p = trendModalPatient;
  const history = p.vital_history || [];

  const chartData = history.map((v) => ({
    time: `${v.minutes_ago}m ago`,
    SpO2: v.spo2,
    HR: v.heart_rate,
    SBP: v.systolic_bp,
    RR: v.resp_rate
  }));

  const isDeteriorating = p.trajectory_status === 'RAPID_DETERIORATION' || p.trajectory_status === 'WORSENING';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-lg border ${isDeteriorating ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Vital Trajectory &amp; Rate-of-Change
                </h2>
                {isDeteriorating && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                    DETERIORATION DETECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{p.id} — {p.name}</strong> ({p.chief_complaint})
              </p>
            </div>
          </div>

          <button
            onClick={() => setTrendModalPatient(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vital Trajectory Graph */}
        <div className="h-64 w-full bg-slate-50 p-2 rounded-xl border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[40, 175]} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line type="monotone" dataKey="SpO2" stroke="#0284c7" strokeWidth={2.5} name="SpO₂ (%)" />
              <Line type="monotone" dataKey="HR" stroke="#e11d48" strokeWidth={2} name="Heart Rate (bpm)" />
              <Line type="monotone" dataKey="SBP" stroke="#d97706" strokeWidth={1.5} name="Systolic BP" />
              <Line type="monotone" dataKey="RR" stroke="#7c3aed" strokeWidth={1.5} name="Resp Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latest Readings Strip */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">SpO₂ Oxygen</span>
            <div className={`text-base font-bold mt-0.5 ${p.latest_vitals?.spo2 && p.latest_vitals.spo2 < 92 ? 'text-rose-700' : 'text-slate-900'}`}>
              {p.latest_vitals?.spo2 ? `${p.latest_vitals.spo2}%` : 'MISSING'}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Heart Rate</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {p.latest_vitals?.heart_rate ?? '—'} <span className="text-xs font-normal text-slate-500">bpm</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Blood Pressure</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {p.latest_vitals?.systolic_bp ? `${p.latest_vitals.systolic_bp}/${p.latest_vitals.diastolic_bp}` : '—'}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Resp Rate</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {p.latest_vitals?.resp_rate ?? '—'} <span className="text-xs font-normal text-slate-500">/min</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => handleSimulateDeterioration(p.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Deterioration</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setTrendModalPatient(null);
                viewPatientDetail(p.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold transition-colors"
            >
              Open Full Record &amp; Add Vitals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
