import React from 'react';
import { useTriage } from '../context/TriageContext';
import {
  Info,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  TrendingDown,
  X
} from 'lucide-react';

export const WhyExplanationModal = () => {
  const { whyModalPatient, setWhyModalPatient } = useTriage();

  if (!whyModalPatient) return null;

  const p = whyModalPatient;
  const isPediatric = p.age < 16;
  const isGeriatric = p.age >= 65;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Decision Explainability &amp; Rationale
              </h2>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{p.id} — {p.name}</strong> ({p.age}y, {p.gender})
              </p>
            </div>
          </div>

          <button
            onClick={() => setWhyModalPatient(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Core Summary Snapshot */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Triage Urgency</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Level {p.display_triage_level} &bull; {p.triage_category}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Action Score</span>
            <div className="text-sm font-bold text-cyan-800 mt-0.5">
              {p.action_priority_score} pts
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Confidence</span>
            <div className={`text-sm font-bold mt-0.5 ${p.current_confidence < 60 ? 'text-purple-700' : 'text-emerald-700'}`}>
              {p.current_confidence}%
            </div>
          </div>
        </div>

        {/* 2. Primary Rationale */}
        <div className="p-3.5 rounded-lg bg-cyan-50/60 border border-cyan-200 text-xs space-y-1">
          <span className="font-bold text-cyan-900 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-700" />
            <span>Primary Safety Rationale for Current Rank:</span>
          </span>
          <p className="text-slate-800 font-medium leading-relaxed pl-5">
            {p.primary_action_reason || p.primary_rationale}
          </p>
        </div>

        {/* 3. Clinical Factors Contributing */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
            Contributing Physiological &amp; Operational Factors:
          </span>

          <div className="space-y-1.5">
            {(p.contributing_factors || []).map((factor, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 flex items-center space-x-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                <span className="leading-snug">{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Age-Specific Rule Applied */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-900 block">
            {isPediatric ? '👶 Pediatric Physiological Model (<16y)' : isGeriatric ? '👴 Geriatric Vulnerability Model (≥65y)' : '🧑 Adult Standard Emergency Model'}
          </span>
          <p className="text-slate-600 text-[11px]">
            {isPediatric
              ? 'Calibrated with age-specific vital ranges for infants and toddlers. Heightened sensitivity to fever, stridor, and respiratory distress.'
              : isGeriatric
              ? 'Calibrated for blunted febrile responses (hypothermia alerts for occult sepsis) and higher susceptibility to occult shock with low systolic BP.'
              : 'Evaluated against standard clinical shock parameters and presenting symptom acuity.'}
          </p>
        </div>

        {/* 5. Uncertainty Breakdown if applicable */}
        {p.is_uncertain && (
          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
            <span className="font-bold flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>Uncertainty Penalty Applied ("Unknown ≠ Safe")</span>
            </span>
            <ul className="text-[11px] text-purple-900 list-disc list-inside space-y-0.5">
              {(p.uncertainty_reasons || []).map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setWhyModalPatient(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
};
