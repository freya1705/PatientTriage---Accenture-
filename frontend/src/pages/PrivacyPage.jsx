import React from 'react';
import { Lock, Shield, Server, FileCheck, CheckCircle2, Building2, AlertCircle } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Privacy-by-Design, Security &amp; Hospital Scalability
            </h1>
            <p className="text-xs text-slate-500">
              Prototype architecture designed with patient data privacy, traceability, and edge safety principles.
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory & Safety Boundary Notice */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Prototype Research &amp; Competition Notice</p>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            PatientTriage.ai is a clinical decision-support prototype evaluated on synthetic physiological cohorts for the Accenture Innovation Challenge. It is not a certified medical device and does not replace professional clinical judgment.
          </p>
        </div>
      </div>

      {/* 4 Privacy & Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Synthetic & Zero PHI */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-cyan-800 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>1. Zero PHI &amp; Synthetic Cohorts</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All 20 baseline clinical scenarios and 40 disaster surge cases are generated from synthetic physiological distributions without any real-world patient records.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside pt-1">
            <li>Zero PII (No SSNs, addresses, real phone numbers)</li>
            <li>Pseudonymized Clinical Identifiers (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">P-001 ... P-060</code>)</li>
            <li>Safe for public demonstrations, hackathon judging, and academic peer review</li>
          </ul>
        </div>

        {/* Edge / On-Prem Deployability */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>2. On-Premise &amp; Air-Gapped Operation</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            PatientTriage.ai runs entirely inside the local hospital network with zero cloud dependencies required for real-time inference.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside pt-1">
            <li>No external API calls to third-party LLMs (eliminating data leakage)</li>
            <li>Sub-15ms deterministic safety evaluation latency</li>
            <li>Resilient during total internet connectivity blackouts</li>
          </ul>
        </div>

        {/* Role-Based Access Control */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-purple-800 font-bold text-xs uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>3. Clinician-in-the-Loop Governance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI recommendations never supersede clinical judgment. All override decisions require clinical role verification and mandatory justification logs.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside pt-1">
            <li>Append-only audit logging designed for clinical traceability and accountability</li>
            <li>Counterfactual downgrade guardrail preventing inadvertent under-triage</li>
            <li>Designed in alignment with EU AI Act high-risk transparency principles</li>
          </ul>
        </div>

        {/* Scalability Roadmap */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-2">
          <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>4. Scalable Hospital Deployment Profiles</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Demonstrates architectural scalability from small rural emergency centers to Level-1 multi-facility trauma networks.
          </p>
          <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside pt-1">
            <li>Level-1 Academic Trauma Center: 500+ visits/day, tighter 15-min staleness timeouts</li>
            <li>Community / Rural Emergency Center: Telemedicine escalations and conservative safety bounds</li>
            <li>3× Surge Mode ready for disaster casualty influx</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
