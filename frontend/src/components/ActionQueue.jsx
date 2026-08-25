import React from 'react';
import { useTriage } from '../context/TriageContext';
import {
  Zap,
  TrendingDown,
  UserCheck,
  UserX,
  Info,
  ChevronRight,
  AlertTriangle,
  Clock,
  HelpCircle,
  Activity,
  ShieldCheck
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

  const getTriagePill = (level) => {
    switch (level) {
      case 1:
        return { text: 'L1 Resuscitation', style: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 2:
        return { text: 'L2 Emergency', style: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 3:
        return { text: 'L3 Urgent', style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 4:
        return { text: 'L4 Semi-Urgent', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 5:
        return { text: 'L5 Non-Urgent', style: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { text: `Level ${level}`, style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const getNextBestActionButton = (patient) => {
    const badge = patient.action_badge;
    if (badge === 'ESCALATE' || badge === 'IMMEDIATE') {
      return {
        label: 'REASSESS NOW',
        className: 'bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs',
        action: () => setTrendModalPatient(patient)
      };
    } else if (badge === 'REASSESS' || badge === 'REASSESS_SOON') {
      return {
        label: 'UPDATE VITALS',
        className: 'bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs',
        action: () => setTrendModalPatient(patient)
      };
    } else if (badge === 'VERIFY' || patient.is_uncertain) {
      return {
        label: 'ACQUIRE VITALS',
        className: 'bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs',
        action: () => viewPatientDetail(patient.id)
      };
    } else if (patient.is_attended) {
      return {
        label: 'REVIEW DOSSIER',
        className: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200',
        action: () => viewPatientDetail(patient.id)
      };
    } else {
      return {
        label: 'REVIEW',
        className: 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200',
        action: () => viewPatientDetail(patient.id)
      };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              LIVE ACTION QUEUE
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Ranked by Attention Gap
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients requiring attention now &bull; Surfaces unattended deteriorating cases before attended patients.
          </p>
        </div>

        {surgeActive && (
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Surge Active: Top Interventions Compressed</span>
          </div>
        )}
      </div>

      {/* Patient Cards List */}
      <div className="space-y-2.5">
        {actionQueue.map((patient, index) => {
          const triagePill = getTriagePill(patient.display_triage_level);
          const isPediatric = patient.age < 16;
          const isGeriatric = patient.age >= 65;
          const nextBtn = getNextBestActionButton(patient);
          const isRank1 = index === 0;

          // Attention Gap meter estimation (0-100%)
          const attentionGapPct = Math.min(95, Math.max(20, Math.round(patient.action_priority_score * 0.95)));

          return (
            <div
              key={patient.id}
              className={`rounded-xl border p-3.5 transition-all clinical-card-hover ${
                isRank1
                  ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                  : index === 1
                  ? 'bg-amber-50/20 border-slate-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left Section: Rank + Patient Info + Vitals Delta */}
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  {/* Rank Indicator */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isRank1
                        ? 'bg-rose-700 text-white'
                        : index === 1
                        ? 'bg-slate-800 text-white'
                        : index === 2
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    #{index + 1}
                  </div>

                  {/* Identification & Tags */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900">
                        {patient.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {patient.name}
                      </span>

                      {/* Demographic Tag */}
                      {isPediatric && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                          👶 Pediatric ({patient.age}y)
                        </span>
                      )}
                      {isGeriatric && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          👴 Geriatric ({patient.age}y)
                        </span>
                      )}

                      {/* Triage Level */}
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${triagePill.style}`}>
                        {triagePill.text} {patient.is_overridden ? '✏️' : ''}
                      </span>

                      {/* Clinical Coverage Tag */}
                      {patient.is_attended ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center space-x-1">
                          <UserCheck className="w-2.5 h-2.5" />
                          <span>Dr. Assigned</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center space-x-1">
                          <UserX className="w-2.5 h-2.5" />
                          <span>Unattended</span>
                        </span>
                      )}
                    </div>

                    {/* Chief Complaint */}
                    <div className="text-xs text-slate-700 font-medium line-clamp-1">
                      <span className="text-slate-500">Complaint:</span> {patient.chief_complaint}
                    </div>

                    {/* Vitals Sparkline & Metrics Strip */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      {/* SpO2 or Missing Alert */}
                      <span>
                        SpO₂:{' '}
                        <strong
                          className={
                            patient.latest_vitals?.spo2 && patient.latest_vitals.spo2 < 92
                              ? 'text-rose-700 font-bold'
                              : 'text-slate-800'
                          }
                        >
                          {patient.latest_vitals?.spo2 ? `${patient.latest_vitals.spo2}%` : 'MISSING ⚠️'}
                        </strong>
                        {patient.trajectory_status === 'RAPID_DETERIORATION' && (
                          <span className="text-rose-600 font-bold ml-1">↓ Falling</span>
                        )}
                      </span>

                      <span>HR: <strong className="text-slate-800">{patient.latest_vitals?.heart_rate ?? '—'}</strong> bpm</span>
                      <span>BP: <strong className="text-slate-800">{patient.latest_vitals?.systolic_bp ? `${patient.latest_vitals.systolic_bp}/${patient.latest_vitals.diastolic_bp}` : '—'}</strong></span>
                      <span>Wait: <strong className="text-slate-800">{patient.total_waiting_mins}m</strong></span>
                      <span>Last Vitals: <strong className="text-slate-800">{patient.elapsed_since_vital}m ago</strong></span>
                    </div>
                  </div>
                </div>

                {/* Middle: Attention Gap Meter & Safety Validity */}
                <div className="lg:w-64 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 shrink-0">
                  {/* Attention Gap Visual Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-600">ATTENTION GAP</span>
                      <span className={`font-bold ${attentionGapPct > 70 ? 'text-rose-700' : 'text-slate-700'}`}>
                        {attentionGapPct > 75 ? 'HIGH' : attentionGapPct > 50 ? 'MODERATE' : 'LOW'} ({attentionGapPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          attentionGapPct > 75
                            ? 'bg-rose-500'
                            : attentionGapPct > 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${attentionGapPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Safety Validity & Why Now */}
                  <div className="text-[10px] text-slate-600 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>
                      {patient.safety_status === 'EXPIRED' ? (
                        <strong className="text-rose-700">● Safety Expired</strong>
                      ) : patient.safety_status === 'EXPIRING_SOON' ? (
                        <strong className="text-amber-700">● Expiring Soon</strong>
                      ) : (
                        <strong className="text-emerald-700">● Valid</strong>
                      )}
                    </span>
                    <span>Conf: <strong className="text-slate-800">{patient.current_confidence}%</strong></span>
                  </div>

                  <div className="text-[10px] text-slate-600 line-clamp-1 truncate font-medium">
                    <span className="text-slate-800 font-semibold">Why:</span> {patient.primary_action_reason}
                  </div>
                </div>

                {/* Right: Single Prominent Action Button & Secondary Controls */}
                <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                  {/* Primary Next-Best-Action Button */}
                  <button
                    onClick={nextBtn.action}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${nextBtn.className}`}
                  >
                    {nextBtn.label}
                  </button>

                  {/* Secondary Quick Action Toolbar */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setWhyModalPatient(patient)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Why this decision? (Explainability)"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setTrendModalPatient(patient)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Vital trajectory chart"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setOverrideModalPatient(patient)}
                      className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors"
                      title="Clinician Override"
                    >
                      Override
                    </button>

                    <button
                      onClick={() => viewPatientDetail(patient.id)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Open full dossier"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
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
