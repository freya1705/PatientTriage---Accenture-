import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  HelpCircle,
  Zap,
  TrendingDown,
  UserCheck,
  UserX,
  ChevronRight,
  Filter,
  Sparkles,
  CheckCircle2,
  Activity
} from 'lucide-react';

export const SafetySummaryPanel = ({ onSelectFilter, activeFilter = 'ALL' }) => {
  const {
    queueData,
    viewPatientDetail,
    setTrendModalPatient,
    handleSimulateDeterioration,
    handleToggleAttending
  } = useTriage();

  if (!queueData) return null;

  const allPatients = queueData.all_patients || [];
  const kpis = queueData.kpis || {};
  const total = allPatients.length;

  // Derive prioritized NEXT ACTIONS
  const nextActions = [];

  // 1. Deteriorating patients
  allPatients
    .filter((p) => p.trajectory_status in { RAPID_DETERIORATION: true, WORSENING: true })
    .forEach((p) => {
      nextActions.push({
        id: `det-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        badge: 'ESCALATE',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        title: `Reassess ${p.id}`,
        subtitle: p.latest_vitals?.spo2 ? `SpO₂ falling ${p.latest_vitals.spo2}% (${p.chief_complaint})` : p.chief_complaint,
        timeInfo: `Waiting ${p.total_waiting_mins}m`,
        priorityScore: p.action_priority_score,
        actionLabel: 'Reassess',
        patient: p
      });
    });

  // 2. Missing data / uncertainty
  allPatients
    .filter((p) => p.is_uncertain)
    .forEach((p) => {
      nextActions.push({
        id: `unc-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        badge: 'VERIFY',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        title: `Verify ${p.id}`,
        subtitle: p.uncertainty_reasons?.[0] || 'Missing SpO₂/BP on arrival',
        timeInfo: `Confidence ${p.current_confidence}%`,
        priorityScore: p.action_priority_score,
        actionLabel: 'Acquire',
        patient: p
      });
    });

  // 3. Stale observations
  allPatients
    .filter((p) => p.safety_status === 'EXPIRED')
    .forEach((p) => {
      nextActions.push({
        id: `stale-${p.id}`,
        patientId: p.id,
        patientName: p.name,
        badge: 'EXPIRED',
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
        title: `Review ${p.id}`,
        subtitle: `Observation stale (${p.elapsed_since_vital}m ago)`,
        timeInfo: `Level ${p.display_triage_level}`,
        priorityScore: p.action_priority_score,
        actionLabel: 'Re-Check',
        patient: p
      });
    });

  // Sort next actions by priority score
  nextActions.sort((a, b) => b.priorityScore - a.priorityScore);

  // Compute Overall Safety Confidence Scale (Low / Medium / High)
  const avgConfidence = total > 0
    ? Math.round(allPatients.reduce((acc, p) => acc + (p.current_confidence || 80), 0) / total)
    : 80;

  const confidenceTier = avgConfidence >= 75 ? 'HIGH CONFIDENCE' : avgConfidence >= 55 ? 'MODERATE CONFIDENCE' : 'LOW CONFIDENCE';

  return (
    <aside className="w-full lg:w-80 xl:w-88 space-y-4 shrink-0 select-none">
      {/* 1. SAFETY SUMMARY METRICS CARD */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Safety Summary
            </h2>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Real-time
          </span>
        </div>

        {/* Clean 5-Row Clinical Grid */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50">
            <span className="text-slate-600 font-medium">Patients monitored</span>
            <span className="font-bold text-slate-900">{total}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-rose-50/60 border border-rose-100">
            <span className="text-rose-800 font-semibold">Need immediate attention</span>
            <span className="font-bold text-rose-700">{kpis.escalations_due || 0}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-amber-50/60 border border-amber-100">
            <span className="text-amber-800 font-medium">Reassessment due (Stale)</span>
            <span className="font-bold text-amber-700">{kpis.reassessments_due || 0}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-purple-50/60 border border-purple-100">
            <span className="text-purple-800 font-medium">Uncertain data (Unknown ≠ Safe)</span>
            <span className="font-bold text-purple-700">{kpis.uncertain_cases || 0}</span>
          </div>

          <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50">
            <span className="text-slate-600 font-medium">Critical unattended</span>
            <span className="font-bold text-slate-900">
              {allPatients.filter((p) => !p.is_attended && p.display_triage_level <= 2).length}
            </span>
          </div>
        </div>

        {/* Safety Confidence Analytical Scale */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Safety Confidence</span>
            <span className="font-bold text-slate-900">{avgConfidence}% &bull; {confidenceTier}</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                avgConfidence >= 75
                  ? 'bg-emerald-500'
                  : avgConfidence >= 55
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${avgConfidence}%` }}
            />
          </div>

          <div className="flex justify-between text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {/* 2. NEXT ACTIONS LIST ("What do I need to do right now?") */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Next Actions Due ({nextActions.length})
          </h3>
          <span className="text-[10px] text-slate-400">Prioritized</span>
        </div>

        <div className="space-y-2">
          {nextActions.slice(0, 5).map((action, idx) => (
            <div
              key={action.id}
              className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/50 transition-all space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs text-slate-900">
                    {idx + 1}. {action.title}
                  </span>
                </div>
                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${action.badgeColor}`}>
                  {action.badge}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 line-clamp-1">
                {action.subtitle}
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>{action.timeInfo}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setTrendModalPatient(action.patient)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] transition-colors"
                  >
                    {action.actionLabel}
                  </button>
                  <button
                    onClick={() => viewPatientDetail(action.patientId)}
                    className="p-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px]"
                    title="Open full record"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {nextActions.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-700">All Waiting Patients Stable</p>
              <p className="text-[10px]">No pending escalations or stale observations.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. QUICK STATION FILTERS & DEMO TRIGGER */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Station Filter
          </span>
          <Filter className="w-3.5 h-3.5 text-slate-400" />
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => onSelectFilter && onSelectFilter('ALL')}
            className={`py-1.5 px-2 rounded-lg border text-left text-xs font-medium transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ED ({total})
          </button>

          <button
            onClick={() => onSelectFilter && onSelectFilter('UNATTENDED')}
            className={`py-1.5 px-2 rounded-lg border text-left text-xs font-medium transition-colors ${
              activeFilter === 'UNATTENDED'
                ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unattended ({allPatients.filter((p) => !p.is_attended).length})
          </button>

          <button
            onClick={() => onSelectFilter && onSelectFilter('PEDIATRIC')}
            className={`py-1.5 px-2 rounded-lg border text-left text-xs font-medium transition-colors ${
              activeFilter === 'PEDIATRIC'
                ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            👶 Pediatric ({allPatients.filter((p) => p.age < 16).length})
          </button>

          <button
            onClick={() => onSelectFilter && onSelectFilter('GERIATRIC')}
            className={`py-1.5 px-2 rounded-lg border text-left text-xs font-medium transition-colors ${
              activeFilter === 'GERIATRIC'
                ? 'bg-cyan-50 border-cyan-300 text-cyan-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            👴 Geriatric ({allPatients.filter((p) => p.age >= 65).length})
          </button>
        </div>

        {/* 1-Click Presentation Quick Tool */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Judge Demo Triggers
          </span>

          <button
            onClick={() => handleSimulateDeterioration('P-017')}
            className="w-full py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-semibold flex items-center justify-between transition-colors"
          >
            <span>⚡ Drop SpO₂ on P-017 (96→89%)</span>
            <ChevronRight className="w-3 h-3 text-rose-500" />
          </button>

          <button
            onClick={() => handleToggleAttending('P-002')}
            className="w-full py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium flex items-center justify-between transition-colors"
          >
            <span>👩⚕️ Toggle Attending on P-002</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>
  );
};
