import React from 'react';
import { useTriage } from '../context/TriageContext';
import {
  Zap,
  TrendingDown,
  UserCheck,
  UserX,
  Info,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const ActionQueue = () => {
  const {
    queueData,
    viewPatientDetail,
    handleSimulateDeterioration,
    handleToggleAttending,
    setOverrideModalPatient,
    setWhyModalPatient,
    setTrendModalPatient,
    surgeActive
  } = useTriage();

  if (!queueData) return null;

  const actionQueue = queueData.top_action_queue || [];

  const getTriageLevelBadge = (level) => {
    switch (level) {
      case 1:
        return { text: 'L1 Immediate', bg: 'bg-red-950 text-red-300 border-red-700' };
      case 2:
        return { text: 'L2 Emergent', bg: 'bg-orange-950 text-orange-300 border-orange-700' };
      case 3:
        return { text: 'L3 Urgent', bg: 'bg-amber-950 text-amber-300 border-amber-700' };
      case 4:
        return { text: 'L4 Less Urgent', bg: 'bg-blue-950 text-blue-300 border-blue-700' };
      case 5:
        return { text: 'L5 Non-Urgent', bg: 'bg-emerald-950 text-emerald-300 border-emerald-700' };
      default:
        return { text: `Level ${level}`, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const getActionBadgeStyle = (badge) => {
    switch (badge) {
      case 'IMMEDIATE':
      case 'ESCALATE':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-soft-pulse';
      case 'REASSESS':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'VERIFY':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'COVERED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-800 text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Live Action Priority Queue
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Attention Gap Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ranked by <strong className="text-slate-300">Need vs. Clinical Attention Gap</strong> — surfaces unattended deteriorating &amp; safety-expired patients before covered cases.
          </p>
        </div>

        {surgeActive && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-800/80 text-xs font-bold text-red-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Surge View: Top Interventions Compressed</span>
          </div>
        )}
      </div>

      {/* Action Items List */}
      <div className="divide-y divide-slate-800/60 mt-2">
        {actionQueue.map((patient, index) => {
          const triageBadge = getTriageLevelBadge(patient.display_triage_level);
          const isPediatric = patient.age < 16;
          const isGeriatric = patient.age >= 65;
          const failureCat = patient.failure_mode_category;

          return (
            <div
              key={patient.id}
              className={`py-4 transition-colors rounded-xl px-3 my-1 ${
                index === 0
                  ? 'bg-red-950/20 border border-red-900/40'
                  : index === 1
                  ? 'bg-amber-950/15 border border-amber-900/30'
                  : 'hover:bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Section: Rank + Patient Basics */}
                <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                      index === 0
                        ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white ring-2 ring-red-400/50'
                        : index === 1
                        ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white'
                        : index === 2
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Patient Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-extrabold text-sm text-white tracking-wide">
                        {patient.id}
                      </span>
                      <span className="text-xs text-slate-400">
                        {patient.name}
                      </span>

                      {/* Failure Mode Badge */}
                      {failureCat && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${failureCat.color}`}
                          title={failureCat.name}
                        >
                          {failureCat.badge}
                        </span>
                      )}

                      {/* Demographic Pill */}
                      {isPediatric && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-950 text-pink-300 border border-pink-800">
                          👶 Pediatric ({patient.age}y)
                        </span>
                      )}
                      {isGeriatric && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                          👴 Geriatric ({patient.age}y)
                        </span>
                      )}
                      {!isPediatric && !isGeriatric && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          🧑 Adult ({patient.age}y)
                        </span>
                      )}

                      {/* Triage Level */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${triageBadge.bg}`}>
                        {triageBadge.text}
                      </span>

                      {/* Override Indicator */}
                      {patient.is_overridden === 1 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700" title={`Overridden by ${patient.override_by}`}>
                          ✏️ Overridden
                        </span>
                      )}

                      {/* Attended / Unattended */}
                      {patient.is_attended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                          <UserCheck className="w-3 h-3" />
                          <span>Dr. Assigned</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
                          <UserX className="w-3 h-3" />
                          <span>Unattended Waiting</span>
                        </span>
                      )}
                    </div>

                    {/* Chief Complaint & Vitals preview */}
                    <div className="text-xs text-slate-300 font-medium line-clamp-1 mb-1">
                      <strong className="text-slate-200">Complaint:</strong> {patient.chief_complaint}
                    </div>

                    {/* Latest Vitals Strip */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>HR: <strong className="text-slate-200">{patient.latest_vitals?.heart_rate ?? '—'}</strong> bpm</span>
                      <span>BP: <strong className="text-slate-200">{patient.latest_vitals?.systolic_bp ? `${patient.latest_vitals.systolic_bp}/${patient.latest_vitals.diastolic_bp}` : '—'}</strong></span>
                      <span>
                        SpO₂:{' '}
                        <strong
                          className={
                            patient.latest_vitals?.spo2 && patient.latest_vitals.spo2 < 92
                              ? 'text-red-400 font-bold'
                              : 'text-slate-200'
                          }
                        >
                          {patient.latest_vitals?.spo2 ? `${patient.latest_vitals.spo2}%` : 'MISSING ⚠️'}
                        </strong>
                      </span>
                      <span>Waited: <strong className="text-slate-200">{patient.total_waiting_mins}m</strong></span>
                      <span>Last Vital: <strong className="text-slate-200">{patient.elapsed_since_vital}m ago</strong></span>
                    </div>
                  </div>
                </div>

                {/* Middle Section: Dynamic Safety State & Why */}
                <div className="lg:w-72 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 shrink-0">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Safety Validity:</span>
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        patient.safety_status === 'EXPIRED'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : patient.safety_status === 'EXPIRING_SOON'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {patient.safety_status === 'EXPIRED' ? '🔴 EXPIRED' : patient.safety_status === 'EXPIRING_SOON' ? '🟠 EXPIRING' : '🟢 VALID'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="font-semibold text-slate-200">
                      {patient.current_confidence}% {patient.current_confidence < 60 && '⚠️'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 font-medium line-clamp-2 border-t border-slate-800/60 pt-1.5">
                    <span className="text-cyan-400 font-bold">Why Now? </span>
                    {patient.primary_action_reason}
                  </div>
                </div>

                {/* Right Section: Action Badge & Interactive Control Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-2 shrink-0">
                  <div className={`px-3 py-1 rounded-lg text-xs font-black border text-center ${getActionBadgeStyle(patient.action_badge)}`}>
                    {patient.action_state}
                  </div>

                  {/* Button Toolbar */}
                  <div className="flex items-center space-x-1.5">
                    {/* Why Button */}
                    <button
                      onClick={() => setWhyModalPatient(patient)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition-colors"
                      title="Explain AI Decision & Uncertainty breakdown"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    {/* Vitals Trend */}
                    <button
                      onClick={() => setTrendModalPatient(patient)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-300 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition-colors"
                      title="View vital history & trajectory graph"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Simulate Deterioration (Demo Star!) */}
                    <button
                      onClick={() => handleSimulateDeterioration(patient.id)}
                      className="p-1.5 rounded-lg bg-red-950/60 text-red-300 hover:bg-red-900 border border-red-800/80 text-xs font-medium transition-colors"
                      title="Simulate SpO2 drop & HR spike to watch rank elevation"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Attended */}
                    <button
                      onClick={() => handleToggleAttending(patient.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-emerald-300 hover:bg-slate-700 border border-slate-700 text-xs font-medium transition-colors"
                      title="Assign/unassign attending clinician"
                    >
                      {patient.is_attended ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>

                    {/* Override Button */}
                    <button
                      onClick={() => setOverrideModalPatient(patient)}
                      className="px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 text-xs font-bold transition-colors"
                    >
                      Override
                    </button>

                    {/* Full Detail */}
                    <button
                      onClick={() => viewPatientDetail(patient.id)}
                      className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 text-xs font-bold transition-colors"
                      title="Open full clinical record"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
