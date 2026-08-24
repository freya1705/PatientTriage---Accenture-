import React from 'react';
import { Shield, Lock, Server, CheckCircle, Database, Building2, FileCheck } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Privacy-by-Design, Governance & Hospital Scalability
            </h1>
            <p className="text-xs text-slate-400">
              Technical safeguards, synthetic data architecture, and multi-tier emergency department scalability.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Data Privacy & Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>1. Patient Data Protection</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>100% Synthetic Data:</strong> All 60 patient benchmarks utilize mathematically generated physiological profiles without real-world PHI.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Pseudonymous Identifiers:</strong> Internal identifiers (e.g. <code>P-017</code>) decouple clinical data from external identity registries.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Local Edge Deployable:</strong> Self-contained intelligence engine runs on-premise without transmitting patient data to external public cloud LLMs.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Regulatory Governance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
            <FileCheck className="w-5 h-5" />
            <span>2. Clinical Governance & AI Safety</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Human-in-the-Loop Supremacy:</strong> AI solely provides decision-support. Licensed clinicians hold full authority to accept, modify, or override recommendations.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Mandatory Override Rationale:</strong> Every clinician adjustment requires clinical rationale logged to an immutable audit trail.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Asymmetric Uncertainty Bias:</strong> The algorithm explicitly escalates priority under data ambiguity rather than risking silent under-triage.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Hospital Scalability */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Building2 className="w-5 h-5" />
            <span>3. Hospital Tier Scalability</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Level-1 Trauma Centers:</strong> High-volume throughput (500+ visits/day), trauma activation red-flags, and 3x surge compression.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Community & Rural Clinics:</strong> Low-resource mode, telemedicine escalation triggers, and conservative safety expiry windows.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Configurable Policies:</strong> Custom reassessment intervals per triage tier adapted to local nursing staff ratios.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Accenture Round 2 Compliance Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-extrabold text-white">
          Accenture Innovation Challenge 2026 — Prototype Compliance Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">15–20 Simulated Patient Records:</span>
            <span className="text-emerald-400 font-bold">✓ 20 Base + 40 Surge Cases</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Pediatric & Geriatric Calibrated Rules:</span>
            <span className="text-emerald-400 font-bold">✓ Age-Aware Threshold Engine</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Uncertainty & Confidence Indicator:</span>
            <span className="text-emerald-400 font-bold">✓ Dynamic Decay + Unknown ≠ Safe</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Continuous Surveillance & Deterioration:</span>
            <span className="text-emerald-400 font-bold">✓ Live Action Queue & SpO₂ Deltas</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">3× Simulated Surge Mode:</span>
            <span className="text-emerald-400 font-bold">✓ 20 → 60 Patient Influx Mode</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">Clinician Override & Audit Logging:</span>
            <span className="text-emerald-400 font-bold">✓ Full Modal & Immutable Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
