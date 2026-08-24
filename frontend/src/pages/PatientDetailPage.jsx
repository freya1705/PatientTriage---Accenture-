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

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const chartData = (patient.vital_history || []).map((v) => ({
    time: `T+${v.timestamp_mins}m`,
    heart_rate: v.heart_rate,
    systolic_bp: v.systolic_bp,
    spo2: v.spo2,
    resp_rate: v.resp_rate
  }));

  const handleSaveVitals = async (e) => {
    e.preventDefault();
    try {
      await api.addVitals(patient.id, {
        heart_rate: parseInt(hr),
        systolic_bp: parseInt(sbp),
        diastolic_bp: parseInt(dbp),
        spo2: parseInt(spo2),
        resp_rate: parseInt(rr),
        temperature: parseFloat(temp),
        recorded_by: 'Bedside Observation'
      });
      await loadPatient();
      setShowAddVitals(false);
      showToast('✓ Vitals recorded. Observation staleness reset to 0m.', 'success');
    } catch (err) {
      showToast('Failed to save vitals', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Command Center</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Toggle Attended */}
          <button
            onClick={async () => {
              await handleToggleAttending(patient.id);
              await loadPatient();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
              patient.is_attended
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {patient.is_attended ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
            <span>{patient.is_attended ? 'Assigned: Dr. Present' : 'Assign Attending Physician'}</span>
          </button>

          {/* Clinician Override */}
          <button
            onClick={() => setOverrideModalPatient(patient)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Clinician Override</span>
          </button>
        </div>
      </div>

      {/* Hero Dossier Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-white">{patient.id}</span>
              <span className="text-lg text-slate-300 font-semibold">{patient.name}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {patient.age} years old ({patient.gender})
              </span>
            </div>
            <p className="text-sm font-medium text-slate-300 mt-1">
              <strong className="text-cyan-400">Chief Complaint: </strong>
              {patient.chief_complaint}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-28">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Priority</span>
              <div className="text-lg font-black text-cyan-400 mt-0.5">
                Level {patient.display_triage_level}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center min-w-28">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Action Score</span>
              <div className="text-lg font-black text-white mt-0.5">
                {patient.action_priority_score} pts
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Safety & Risk Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Safety Expiry</span>
            <div className={`text-sm font-bold mt-0.5 ${patient.safety_status === 'EXPIRED' ? 'text-red-400' : 'text-emerald-400'}`}>
              {patient.safety_status}
            </div>
            <span className="text-[10px] text-slate-400">Last Vital: {patient.elapsed_since_vital}m ago</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Dynamic Confidence</span>
            <div className="text-sm font-bold text-white mt-0.5">
              {patient.current_confidence}% {patient.current_confidence < 60 && '⚠️'}
            </div>
            <span className="text-[10px] text-slate-400">Uncertainty: {patient.uncertainty_score}%</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Vital Trajectory</span>
            <div className={`text-sm font-bold mt-0.5 ${patient.trajectory_status !== 'STABLE' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {patient.trajectory_status}
            </div>
            <span className="text-[10px] text-slate-400">Deterioration: +{patient.deterioration_score} pts</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Clinical Attention</span>
            <div className="text-sm font-bold text-cyan-400 mt-0.5">
              {patient.is_attended ? 'Doctor Assigned' : 'Unattended Waiting'}
            </div>
            <span className="text-[10px] text-slate-400">Total Waited: {patient.total_waiting_mins}m</span>
          </div>
        </div>

        {/* Symptoms and History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Reported / Observed Symptoms</h4>
            <div className="flex flex-wrap gap-1.5">
              {patient.symptoms.map((sym, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                  {sym}
                </span>
              ))}
            </div>
            <div className="pt-2 text-slate-400">
              Pain Rating: <strong className="text-white">{patient.pain_score} / 10</strong>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Medical History & Comorbidities</h4>
            {patient.has_medical_history && patient.medical_history.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {patient.medical_history.map((m, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-purple-300 font-medium">
                ⚠️ Zero prior medical records on file (First-time patient — Uncertainty penalty applied)
              </p>
            )}
            <div className="pt-2 text-slate-400">
              Injury Mechanism: <strong className="text-white">{patient.injury_mechanism || 'Non-trauma'}</strong>
            </div>
          </div>
        </div>

        {/* Vital Trajectory Graph */}
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Continuous Physiological Trajectory
              </h4>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={async () => {
                  await handleSimulateDeterioration(patient.id);
                  await loadPatient();
                }}
                className="px-2.5 py-1 rounded-lg bg-red-950 text-red-300 hover:bg-red-900 border border-red-800 text-[11px] font-bold transition-colors flex items-center space-x-1"
              >
                <Zap className="w-3 h-3" />
                <span>Simulate SpO₂ Drop</span>
              </button>

              <button
                onClick={() => setShowAddVitals(!showAddVitals)}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 text-[11px] font-bold transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Record Vitals</span>
              </button>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="heart_rate" name="Heart Rate (bpm)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="systolic_bp" name="Systolic BP (mmHg)" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Inline Add Vitals Form */}
          {showAddVitals && (
            <form onSubmit={handleSaveVitals} className="p-4 bg-slate-900 rounded-xl border border-cyan-700/60 mt-3 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-cyan-300">
                <span>Enter Fresh Bedside Measurement</span>
                <button type="button" onClick={() => setShowAddVitals(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-400">SpO2 (%)</label>
                  <input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">HR (bpm)</label>
                  <input type="number" value={hr} onChange={(e) => setHr(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">SBP</label>
                  <input type="number" value={sbp} onChange={(e) => setSbp(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">DBP</label>
                  <input type="number" value={dbp} onChange={(e) => setDbp(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">RR (/min)</label>
                  <input type="number" value={rr} onChange={(e) => setRr(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Temp (°C)</label>
                  <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
                  Save Vitals & Refresh Expiry
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Patient Audit & Decision History */}
        <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Immutable Clinical Safety & Audit Timeline ({patient.audit_events?.length || 0})
            </h4>
          </div>

          <div className="space-y-2">
            {(patient.audit_events || []).map((ev) => (
              <div key={ev.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{ev.event_type}</span>
                    <span className="text-[10px] text-cyan-400 font-semibold">by {ev.clinician_role || 'System'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{ev.outcome}</p>
                  {ev.override_reason && (
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      <strong>Clinician Rationale:</strong> {ev.override_reason}
                    </p>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
