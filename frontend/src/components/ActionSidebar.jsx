import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  HelpCircle,
  Zap,
  TrendingDown,
  ShieldCheck,
  UserCheck,
  UserX,
  Activity,
  ArrowRight,
  Flame,
  ChevronRight,
  Filter,
  Sparkles,
  Sliders
} from 'lucide-react';

export const ActionSidebar = ({ onSelectFilter, activeFilter = 'ALL' }) => {
  const {
    queueData,
    viewPatientDetail,
    setWhyModalPatient,
    setTrendModalPatient,
    handleSimulateDeterioration,
    handleToggleAttending,
    handleToggleSurge,
    handleResetData,
    surgeActive
  } = useTriage();

  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'scales' | 'demo'

  if (!queueData) return null;

  const allPatients = queueData.all_patients || [];
  const total = allPatients.length;

  // 1. Compute dynamic prioritized action tasks from patient data
  const tasks = [];

  // Urgent deterioration tasks
  allPatients
    .filter((p) => p.trajectory_status in { RAPID_DETERIORATION: true, WORSENING: true })
    .forEach((p) => {
      tasks.push({
        id: `det-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        type: 'DETERIORATION',
        badge: '🔴 Urgent Deterioration',
        badgeColor: 'bg-red-950/80 text-red-300 border-red-800',
        title: `SpO₂ drop / tachycardia on ${p.id}`,
        description: p.primary_action_reason || 'Vital signs falling below safety margins.',
        priorityScore: p.action_priority_score,
        actionLabel: 'Reassess Vitals',
        actionType: 'TREND',
        patient: p
      });
    });

  // Stale safety expiry tasks
  allPatients
    .filter((p) => p.safety_status === 'EXPIRED')
    .forEach((p) => {
      tasks.push({
        id: `stale-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        type: 'STALE',
        badge: '🟠 Safety Expired',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800',
        title: `Observation expired on ${p.id} (${p.elapsed_since_vital}m ago)`,
        description: `Exceeded max safe wait time for Level ${p.display_triage_level}.`,
        priorityScore: p.action_priority_score,
        actionLabel: 'Update Vitals',
        actionType: 'TREND',
        patient: p
      });
    });

  // Missing data / uncertain cases
  allPatients
    .filter((p) => p.is_uncertain)
    .forEach((p) => {
      tasks.push({
        id: `unc-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        type: 'UNCERTAIN',
        badge: '⚠️ Unknown ≠ Safe',
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-800',
        title: `Verify missing data on ${p.id}`,
        description: p.uncertainty_reasons?.[0] || 'Missing SpO₂/BP or zero EHR on file.',
        priorityScore: p.action_priority_score,
        actionLabel: 'Acquire Data',
        actionType: 'DETAIL',
        patient: p
      });
    });

  // Sort tasks by priority
  tasks.sort((a, b) => b.priorityScore - a.priorityScore);

  // 2. Compute Percentage Scales
  const freshCount = allPatients.filter((p) => p.safety_status === 'VALID').length;
  const freshPercent = total > 0 ? Math.round((freshCount / total) * 100) : 100;

  const attendedCount = allPatients.filter((p) => p.is_attended).length;
  const attendedPercent = total > 0 ? Math.round((attendedCount / total) * 100) : 0;

  const completeDataCount = allPatients.filter((p) => !p.is_uncertain).length;
  const completeDataPercent = total > 0 ? Math.round((completeDataCount / total) * 100) : 100;

  const stableCount = allPatients.filter((p) => p.trajectory_status === 'STABLE').length;
  const stablePercent = total > 0 ? Math.round((stableCount / total) * 100) : 100;

  // Composite Department Safety Health Index (0 - 100%)
  const safetyHealthIndex = Math.max(
    15,
    Math.round(
      (freshPercent * 0.35) +
      (completeDataPercent * 0.25) +
      (stablePercent * 0.25) +
      ((attendedPercent > 40 ? 40 : attendedPercent) * 0.15)
    )
  );

  return (
    <aside className="w-full lg:w-88 xl:w-96 space-y-4 shrink-0">
      {/* 1. ED Safety Health Index Card with Visual Scales */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden">
        {/* Soft Background Glow */}
        <div
          className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-25 pointer-events-none ${
            safetyHealthIndex >= 75
              ? 'bg-emerald-500'
              : safetyHealthIndex >= 50
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
        />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                ED Safety Health Index
              </h3>
              <p className="text-[10px] text-slate-400">Continuous Waiting Room Safety Score</p>
            </div>
          </div>

          <span
            className={`text-sm font-black px-2 py-0.5 rounded-lg border ${
              safetyHealthIndex >= 75
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : safetyHealthIndex >= 50
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}
          >
            {safetyHealthIndex}%
          </span>
        </div>

        {/* Master Safety Progress Bar */}
        <div className="mt-3 space-y-1.5 relative z-10">
          <div className="flex justify-between text-[11px] font-semibold text-slate-300">
            <span>Overall Department Safety</span>
            <span className={safetyHealthIndex < 60 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
              {safetyHealthIndex >= 75 ? 'Optimal Safety' : safetyHealthIndex >= 50 ? 'Moderate Hazard' : 'Critical Hazard'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                safetyHealthIndex >= 75
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  : safetyHealthIndex >= 50
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-rose-600 to-red-400'
              }`}
              style={{ width: `${safetyHealthIndex}%` }}
            />
          </div>
        </div>

        {/* 3 Detailed Breakdown Percentage Scales */}
        <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-slate-800/80 text-[10px] relative z-10">
          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/60">
            <span className="text-slate-400 block truncate">Fresh Vitals</span>
            <div className="text-xs font-bold text-white mt-0.5">{freshPercent}%</div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-cyan-400" style={{ width: `${freshPercent}%` }} />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/60">
            <span className="text-slate-400 block truncate">Physician Covered</span>
            <div className="text-xs font-bold text-white mt-0.5">{attendedPercent}%</div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-emerald-400" style={{ width: `${attendedPercent}%` }} />
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/60">
            <span className="text-slate-400 block truncate">Data Quality</span>
            <div className="text-xs font-bold text-white mt-0.5">{completeDataPercent}%</div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-purple-400" style={{ width: `${completeDataPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side Panel Tabs Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Actions Due ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('filter')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'filter'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Station Filters</span>
            </button>

            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'demo'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Tools</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Tasks / Action Items Due */}
        {activeTab === 'tasks' && (
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {tasks.length > 0 ? (
              tasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${task.badgeColor}`}>
                      {task.badge}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {task.patientId}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {task.title}
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {task.description}
                  </p>

                  <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {task.patientName}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setTrendModalPatient(task.patient)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors"
                      >
                        {task.actionLabel}
                      </button>
                      <button
                        onClick={() => viewPatientDetail(task.patientId)}
                        className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-400 text-[10px] font-bold"
                        title="Open dossier"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto opacity-70" />
                <p className="font-bold text-slate-400">All Patients Stable &amp; Monitored</p>
                <p className="text-[11px]">No urgent deterioration or safety expiries detected.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Station & Cohort Quick Filters */}
        {activeTab === 'filter' && (
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Filter Emergency Department Wings:
            </span>

            <button
              onClick={() => onSelectFilter && onSelectFilter('ALL')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>All Active Patients</span>
              <span className="text-[11px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">{total}</span>
            </button>

            <button
              onClick={() => onSelectFilter && onSelectFilter('UNATTENDED')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                activeFilter === 'UNATTENDED'
                  ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <UserX className="w-3.5 h-3.5 text-amber-400" />
                <span>Unattended in Waiting Room</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                {allPatients.filter((p) => !p.is_attended).length}
              </span>
            </button>

            <button
              onClick={() => onSelectFilter && onSelectFilter('PEDIATRIC')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                activeFilter === 'PEDIATRIC'
                  ? 'bg-pink-950/60 border-pink-700 text-pink-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>👶 Pediatric Wing (&lt;16y)</span>
              <span className="text-[11px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                {allPatients.filter((p) => p.age < 16).length}
              </span>
            </button>

            <button
              onClick={() => onSelectFilter && onSelectFilter('GERIATRIC')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                activeFilter === 'GERIATRIC'
                  ? 'bg-amber-950/60 border-amber-700 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>👴 Geriatric Wing (≥65y)</span>
              <span className="text-[11px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                {allPatients.filter((p) => p.age >= 65).length}
              </span>
            </button>

            <button
              onClick={() => onSelectFilter && onSelectFilter('ATTENDED')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                activeFilter === 'ATTENDED'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Doctor Assigned (Covered)</span>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded">{attendedCount}</span>
            </button>
          </div>
        )}

        {/* TAB 3: 1-Click Interactive Demo Triggers */}
        {activeTab === 'demo' && (
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click Judge Presentation Triggers:
            </span>

            <button
              onClick={() => handleSimulateDeterioration('P-017')}
              className="w-full p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-200 font-bold text-left flex items-center space-x-2 transition-all"
            >
              <Zap className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <div className="text-xs">⚡ Drop SpO₂ on P-017 (96% → 89%)</div>
                <div className="text-[10px] font-normal text-red-300/80">Surfaces P-017 to Rank #1 on Action Queue</div>
              </div>
            </button>

            <button
              onClick={() => handleToggleAttending('P-002')}
              className="w-full p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-200 font-bold text-left flex items-center space-x-2 transition-all"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs">👩⚕️ Toggle Attended on P-002</div>
                <div className="text-[10px] font-normal text-emerald-300/80">Demonstrates Attention Gap (-45 pts)</div>
              </div>
            </button>

            <button
              onClick={handleToggleSurge}
              className="w-full p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800 text-purple-200 font-bold text-left flex items-center space-x-2 transition-all"
            >
              <Flame className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs">🚨 Toggle 3× Surge Mode ({surgeActive ? '60' : '20'} Patients)</div>
                <div className="text-[10px] font-normal text-purple-300/80">Compresses to Top Action Queue</div>
              </div>
            </button>

            <button
              onClick={handleResetData}
              className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-center font-semibold text-[11px] transition-colors"
            >
              🔄 Reset to Clean 20 Benchmark Cases
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
