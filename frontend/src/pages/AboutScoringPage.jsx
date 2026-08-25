import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { api } from '../services/api';
import {
  HelpCircle,
  Shield,
  Activity,
  UserCheck,
  Building2,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const AboutScoringPage = () => {
  const { queueData, fetchQueue, showToast } = useTriage();
  const [selectedProfile, setSelectedProfile] = useState(
    queueData?.profile_type || 'LEVEL_1_TRAUMA'
  );
  const [switching, setSwitching] = useState(false);

  const handleProfileSwitch = async (profileType) => {
    try {
      setSwitching(true);
      await api.updateHospitalProfile(profileType);
      setSelectedProfile(profileType);
      await fetchQueue();
      showToast(
        profileType === 'LEVEL_1_TRAUMA'
          ? 'Switched to Urban Academic Level-1 Trauma Center Profile'
          : 'Switched to Community / Rural Emergency Clinic Profile',
        'info'
      );
    } catch (err) {
      showToast('Failed to switch profile', 'error');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Hero Header & Core Philosophy */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accenture Innovation Challenge 2026</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            “Triage is a snapshot. <span className="text-cyan-700">Risk isn't.</span>”
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            PatientTriage.ai is an <strong className="text-slate-900">AI-augmented continuous safety layer</strong> for the emergency waiting room. We don't ask only <em>"Who is sickest at arrival?"</em> We continuously ask: <strong className="text-cyan-800">"Who in the waiting room is no longer safe to keep waiting?"</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-rose-700">❌ Failure Mode 1</span>
              <p className="text-slate-600 text-[11px]">Patient silently deteriorates in the waiting room after initial triage.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-purple-700">❌ Failure Mode 2</span>
              <p className="text-slate-600 text-[11px]">Missing vitals or stale observations are falsely assumed to remain safe.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="font-bold text-amber-700">❌ Failure Mode 3</span>
              <p className="text-slate-600 text-[11px]">Attended critical patients mask unattended deteriorating waiting patients.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Clear 3-Tier Layered Architecture */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              The 3-Tier Clinical Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            We don't call everything "AI." PatientTriage.ai cleanly separates deterministic medical safety rules from statistical AI decision-support and human governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Layer 1: Deterministic Safety */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>1. Deterministic Safety Layer</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Hard clinical rules that bypass statistical scores when life threats appear.
            </p>
            <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
              <li>Deterministic Red Flags (SpO₂ &lt; 85%, SBP &lt; 75, FAST Stroke)</li>
              <li>Toddler high-fever &amp; pediatric stridor triggers</li>
              <li>Counterfactual downgrade safety blocking</li>
            </ul>
          </div>

          {/* Layer 2: AI & Decision-Support */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-800 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>2. AI &amp; Decision-Support Layer</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Synthesizes multidimensional inputs and continuous time signals.
            </p>
            <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
              <li>Continuous Baseline Risk Model (0–100 &amp; ESI 5-Level)</li>
              <li>Uncertainty &amp; Data Completeness ("Unknown ≠ Safe")</li>
              <li>Dynamic Confidence Decay &amp; Safety Expiry (τ_staleness)</li>
              <li>Vital Trend &amp; Rate-of-Change Deterioration Analyzer</li>
              <li>Attention Gap Re-Ranking Engine</li>
            </ul>
          </div>

          {/* Layer 3: Human Clinical Governance */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>3. Human-in-the-Loop Governance</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              AI advises; licensed clinicians decide with full override authority.
            </p>
            <ul className="space-y-1 text-[11px] text-slate-500 list-disc list-inside">
              <li>Full clinician override workflow</li>
              <li>Mandatory clinical rationale recording</li>
              <li>HIPAA &amp; GDPR immutable audit ledger</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Mathematical Formula & Scoring Transparency */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">
              How Scoring is Calculated (Mathematical Breakdown)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every patient's rank in the Live Action Queue is derived transparently using the Attention Gap formulation.
          </p>
        </div>

        {/* Formula Box */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs text-slate-800 overflow-x-auto">
          <code>
            Action Priority Score = (w_r · Baseline Risk + Urgency Weight) + (w_d · Deterioration) + (w_s · Staleness + Wait Penalty) + (w_u · Uncertainty) − (w_c · Clinical Coverage)
          </code>
        </div>

        {/* Table of Weights & Justification */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Component</th>
                <th className="py-2.5 px-2">Symbol</th>
                <th className="py-2.5 px-3">Default Value</th>
                <th className="py-2.5 px-4">Clinical &amp; Operational Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Baseline Clinical Risk</td>
                <td className="py-2.5 px-2 font-mono text-cyan-800">w_r</td>
                <td className="py-2.5 px-3 font-mono">0.40</td>
                <td className="py-2.5 px-4 text-slate-600">
                  Reflects age-adjusted vital sign abnormalities, chief complaint severity, and comorbidity risk (0–100).
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">ESI Urgency Tier Weight</td>
                <td className="py-2.5 px-2 font-mono text-cyan-800">—</td>
                <td className="py-2.5 px-3 font-mono">45 / 35 / 20 / 10 / 5</td>
                <td className="py-2.5 px-4 text-slate-600">
                  Ensures baseline acuity tiering (Level 1 Resuscitation gets +45 pts, Level 5 Non-Urgent gets +5 pts).
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Vital Deterioration Score</td>
                <td className="py-2.5 px-2 font-mono text-cyan-800">w_d</td>
                <td className="py-2.5 px-3 font-mono">1.20 – 1.30</td>
                <td className="py-2.5 px-4 text-slate-600">
                  High multiplier for rate-of-change: an acute drop (e.g. SpO₂ 96% → 89%) forces the patient to surge to the top of the queue.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Observation Staleness</td>
                <td className="py-2.5 px-2 font-mono text-cyan-800">w_s</td>
                <td className="py-2.5 px-3 font-mono">1.10 – 1.20</td>
                <td className="py-2.5 px-4 text-slate-600">
                  Adds penalty when elapsed time exceeds the safe reassessment window (15m for L2, 30m for L3), triggering <em>Safety Expired</em>.
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-900">Uncertainty Penalty</td>
                <td className="py-2.5 px-2 font-mono text-cyan-800">w_u</td>
                <td className="py-2.5 px-3 font-mono">0.25 – 0.40</td>
                <td className="py-2.5 px-4 text-slate-600">
                  <strong>"Unknown ≠ Safe"</strong>: Missing critical vitals (SpO₂, BP) or zero history add priority to force verification rather than silent neglect.
                </td>
              </tr>
              <tr className="hover:bg-slate-50 bg-emerald-50/50">
                <td className="py-2.5 px-3 font-semibold text-emerald-900">Clinical Coverage Discount</td>
                <td className="py-2.5 px-2 font-mono text-emerald-700">w_c</td>
                <td className="py-2.5 px-3 font-mono">-45.0 to -50.0</td>
                <td className="py-2.5 px-4 text-slate-700">
                  <strong>The Attention Gap Offset:</strong> When a physician is actively assigned and present at the bedside, central triage urgency is discounted so unattended deteriorating patients surface first.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Interactive Hospital Profile Switcher */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Configurable Hospital Profile Switcher
              </span>
              <p className="text-[11px] text-slate-500">
                Demonstrates that weights adapt dynamically to institutional scale and resources.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleProfileSwitch('LEVEL_1_TRAUMA')}
                disabled={switching}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedProfile === 'LEVEL_1_TRAUMA'
                    ? 'bg-cyan-700 text-white border-cyan-800 shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                Level-1 Academic Trauma Center
              </button>

              <button
                onClick={() => handleProfileSwitch('COMMUNITY_RURAL')}
                disabled={switching}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedProfile === 'COMMUNITY_RURAL'
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                Community / Rural ED
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. The "Why Accenture?" Enterprise Transformation Story */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900">
            The Accenture Angle: Enterprise Workforce &amp; Safety Transformation
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Traditional healthcare IT simply stores static records in EHR databases. PatientTriage.ai is an <strong className="text-slate-900">operational transformation engine</strong> directly aligned with Accenture's core pillars of enterprise AI delivery:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">1. Human + AI Augmentation</span>
            <p className="text-slate-600 text-[11px]">
              Emergency nurses suffer intense cognitive fatigue and cannot manually monitor 50 waiting patients simultaneously. PatientTriage.ai acts as an automated safety copilot that monitors continuous vitals and alerts staff only when intervention is needed.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">2. Responsible AI by Design</span>
            <p className="text-slate-600 text-[11px]">
              Tuned with asymmetric safety bias: missing data triggers cautious verification rather than false reassurance. Overrides require documented clinical rationale, meeting the highest regulatory compliance standards.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900">3. Operational Bottleneck Resolution</span>
            <p className="text-slate-600 text-[11px]">
              Transforms the emergency queue from an arrival-time list into a dynamically prioritized action pipeline, optimizing physician utilization and reducing adverse waiting room events.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Clinical Safety & Validation Boundary Statement */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Clinical Safety &amp; Validation Boundary Statement</span>
        </div>
        <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200 text-xs text-slate-700 space-y-1.5">
          <p>
            • <strong>Synthetic Demonstration Data:</strong> All 20 baseline patient records and 40 surge influx cases are mathematically generated synthetic profiles containing zero Protected Health Information (PHI).
          </p>
          <p>
            • <strong>Demonstration Parameters:</strong> Scoring weights, reassessment windows, and decay coefficients are prototype decision-support parameters, not clinically validated coefficients.
          </p>
          <p>
            • <strong>Institutional Validation Required:</strong> Production deployment in a hospital requires prospective clinical trials, institutional EHR customization, and local IRB approval.
          </p>
          <p>
            • <strong>Non-Replacement Policy:</strong> Recommendations never supersede the clinical judgment of a licensed physician or triage nurse.
          </p>
        </div>
      </div>
    </div>
  );
};
