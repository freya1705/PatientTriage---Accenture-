import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Award,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const EvaluationPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEvaluation = async () => {
    try {
      setLoading(true);
      const res = await api.getEvaluationMetrics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvaluation();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Empirical Evaluation: Traditional Static Triage vs. PatientTriage.ai
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                20 Benchmark Cohort
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Measurable clinical &amp; operational impact comparison across 5 systematic failure modes.
            </p>
          </div>
        </div>

        <button
          onClick={loadEvaluation}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
          title="Re-run evaluation simulation"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cohort Failure Mode Distribution */}
      {data?.benchmark_summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-900 border border-red-900/40 rounded-xl">
            <span className="text-[10px] font-bold text-red-400 uppercase">Cat A: Resuscitation</span>
            <div className="text-xl font-black text-white mt-0.5">
              {data.benchmark_summary.failure_mode_breakdown.immediate_danger_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-001, P-003, P-014</span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-amber-900/40 rounded-xl">
            <span className="text-[10px] font-bold text-amber-400 uppercase">Cat B: Hidden / Age</span>
            <div className="text-xl font-black text-white mt-0.5">
              {data.benchmark_summary.failure_mode_breakdown.hidden_age_danger_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-007, P-008, P-009</span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-purple-900/40 rounded-xl">
            <span className="text-[10px] font-bold text-purple-400 uppercase">Cat C: Incomplete Vitals</span>
            <div className="text-xl font-black text-white mt-0.5">
              {data.benchmark_summary.failure_mode_breakdown.missing_info_uncertain_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-010, P-011</span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-rose-900/40 rounded-xl">
            <span className="text-[10px] font-bold text-rose-400 uppercase">Cat D: Deteriorating</span>
            <div className="text-xl font-black text-white mt-0.5">
              {data.benchmark_summary.failure_mode_breakdown.deterioration_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-015, P-017</span>
          </div>

          <div className="p-3.5 bg-slate-900 border border-cyan-900/40 rounded-xl">
            <span className="text-[10px] font-bold text-cyan-400 uppercase">Cat E: Attention Gap</span>
            <div className="text-xl font-black text-white mt-0.5">
              {data.benchmark_summary.failure_mode_breakdown.attention_gap_stale_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-002, P-016</span>
          </div>
        </div>
      )}

      {/* Side-by-Side Impact Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-extrabold text-white">
          Measurable Performance Metrics: Baseline vs. PatientTriage.ai
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Performance Dimension</th>
                <th className="py-3 px-4 text-red-400">Traditional Static Triage (Baseline)</th>
                <th className="py-3 px-4 text-cyan-400">PatientTriage.ai (Continuous Safety)</th>
                <th className="py-3 px-4 text-emerald-400">Measured Impact / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
              {(data?.metrics_comparison || []).map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-white max-w-xs">
                    {m.metric_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <div className="flex items-center space-x-1.5 text-rose-300">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{m.traditional_baseline}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-cyan-300 font-semibold">
                    <div className="flex items-center space-x-1.5 text-cyan-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                      <span>{m.patient_triage_ai}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {m.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Findings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Key Scientific &amp; Operational Takeaways for Judges</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white">1. Real-time Surveillance</span>
            <p className="text-slate-400 text-[11px]">
              Traditional triage fails silently because it assumes patient physiology remains constant after intake. Continuous delta surveillance guarantees deteriorating patients never wait unnoticed.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white">2. Unknown ≠ Safe</span>
            <p className="text-slate-400 text-[11px]">
              By explicitly penalizing missing data, PatientTriage.ai eliminates the common hazard of assigning false low-urgency reassurance to incomplete records.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white">3. Attention Bottleneck Optimization</span>
            <p className="text-slate-400 text-[11px]">
              The Attention Gap formulation prevents clinical over-servicing of already-attended patients while unattended high-need cases are waiting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
