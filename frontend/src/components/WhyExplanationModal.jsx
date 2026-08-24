import React from 'react';
import { useTriage } from '../context/TriageContext';
import { HelpCircle, AlertOctagon, Activity, Clock, ShieldCheck, X } from 'lucide-react';

export const WhyExplanationModal = () => {
  const { whyModalPatient, setWhyModalPatient } = useTriage();

  if (!whyModalPatient) return null;

  const p = whyModalPatient;
  const isPediatric = p.age < 16;
  const isGeriatric = p.age >= 65;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Explainable AI & Safety Rationale
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{p.id}</strong> ({p.name})
              </p>
            </div>
          </div>
          <button
            onClick={() => setWhyModalPatient(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Top Recommendation Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Assigned Decision
              </span>
              <div className="text-lg font-black text-white mt-0.5">
                Level {p.display_triage_level} — {p.triage_category}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Action Priority Score
              </span>
              <div className="text-xl font-black text-cyan-400">
                {p.action_priority_score} pts
              </div>
            </div>
          </div>

          {/* 1. Age-Aware Threshold Calibration */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Age-Stratified Physiological Baseline</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <p>
                <strong className="text-white">Active Demographic Profile: </strong>
                {isPediatric && '👶 Pediatric Profile (Age < 16) — Heightened sensitivity for respiratory rate (>30) and high fever in toddlers.'}
                {isGeriatric && '👴 Geriatric Profile (Age ≥ 65) — Calibrated for blunted fever responses, occult hypothermic sepsis, and atypical cardiac presentations.'}
                {!isPediatric && !isGeriatric && '🧑 Adult Profile (Age 16-64) — Standard physiological shock indices applied.'}
              </p>
            </div>
          </div>

          {/* 2. Uncertainty-as-Risk Engine ("Unknown != Safe") */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <AlertOctagon className="w-4 h-4 text-purple-400" />
              <span>2. Uncertainty & Data Quality Penalties ("Unknown ≠ Safe")</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>Data Completeness & Confidence:</span>
                <strong className={p.current_confidence < 60 ? 'text-amber-400' : 'text-emerald-400'}>
                  {p.current_confidence}% (Uncertainty: {p.uncertainty_score}%)
                </strong>
              </div>
              {p.is_uncertain ? (
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/60 text-purple-200 text-[11px]">
                  ⚠️ <strong>Asymmetric Safety Rule Triggered:</strong> Critical vital signs or historical records are missing. The system intentionally blocks safe/low-priority assumptions and enforces clinical verification.
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">
                  ✓ Objective vital signs and prior medical records provide high baseline confidence.
                </p>
              )}
            </div>
          </div>

          {/* 3. Dynamic Confidence Decay & Observation Staleness */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>3. Dynamic Confidence Decay & Safety Expiry (⏳)</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>Total Waiting Time:</span>
                <strong className="text-white">{p.total_waiting_mins} minutes</strong>
              </div>
              <div className="flex justify-between">
                <span>Time Since Last Vital Sign Recorded:</span>
                <strong className={p.elapsed_since_vital > 25 ? 'text-amber-400' : 'text-white'}>
                  {p.elapsed_since_vital} minutes ago
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Safety Expiry Status:</span>
                <strong className={p.safety_status === 'EXPIRED' ? 'text-red-400' : 'text-emerald-400'}>
                  {p.safety_status}
                </strong>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                Core principle: <em>"Safety must be continuously re-earned through observation."</em> Initial confidence decays over time without repeat assessment.
              </p>
            </div>
          </div>

          {/* 4. Attention Gap Score Formula */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>4. Attention Gap Score Computation</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300 font-mono text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>+ Clinical Baseline Risk ({p.risk_score}%):</span>
                <span>+{(p.risk_score * 0.4).toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ Vital Deterioration Score:</span>
                <span>+{(p.deterioration_score * 1.2).toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>+ Observation Staleness Score:</span>
                <span>+{(p.staleness_score * 1.1).toFixed(1)} pts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>- Clinical Coverage Discount (Doctor Present):</span>
                <span className={p.is_attended ? 'text-emerald-400' : 'text-slate-500'}>
                  {p.is_attended ? '-45.0 pts (Covered)' : '0.0 pts (Unattended Waiting)'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-cyan-300 pt-1 border-t border-slate-800">
                <span>= Composite Action Rank Score:</span>
                <span>{p.action_priority_score} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={() => setWhyModalPatient(null)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
};
