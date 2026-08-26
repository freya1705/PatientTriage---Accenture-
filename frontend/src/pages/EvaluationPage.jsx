import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  Sparkles,
  Info
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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Empirical Evaluation: Traditional Static Triage vs. PatientTriage.ai
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                20 Benchmark Cohort
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Measurable clinical &amp; operational impact comparison across 5 systematic failure modes.
            </p>
          </div>
        </div>

        <button
          onClick={loadEvaluation}
          disabled={loading}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          title="Re-run evaluation simulation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Cohort Failure Mode Distribution */}
      {data?.benchmark_summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-semibold text-rose-700 uppercase">Cat A: Resuscitation</span>
            <div className="text-lg font-bold text-slate-900">
              {data.benchmark_summary.failure_mode_breakdown.immediate_danger_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-001, P-003, P-014</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-semibold text-amber-700 uppercase">Cat B: Hidden / Age</span>
            <div className="text-lg font-bold text-slate-900">
              {data.benchmark_summary.failure_mode_breakdown.hidden_age_danger_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-007, P-008, P-009</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-semibold text-purple-700 uppercase">Cat C: Incomplete Data</span>
            <div className="text-lg font-bold text-slate-900">
              {data.benchmark_summary.failure_mode_breakdown.missing_info_uncertain_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-010, P-011</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-semibold text-rose-700 uppercase">Cat D: Deteriorating</span>
            <div className="text-lg font-bold text-slate-900">
              {data.benchmark_summary.failure_mode_breakdown.deterioration_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-015, P-017</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-semibold text-cyan-800 uppercase">Cat E: Attention Gap</span>
            <div className="text-lg font-bold text-slate-900">
              {data.benchmark_summary.failure_mode_breakdown.attention_gap_stale_count} Cases
            </div>
            <span className="text-[10px] text-slate-400">P-002, P-016</span>
          </div>
        </div>
      )}

      {/* Side-by-Side Impact Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          Measurable Performance Metrics: Baseline vs. PatientTriage.ai
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Performance Dimension</th>
                <th className="py-2.5 px-4 text-rose-700">Traditional Static Triage (Baseline)</th>
                <th className="py-2.5 px-4 text-cyan-800">PatientTriage.ai (Continuous Safety)</th>
                <th className="py-2.5 px-4 text-emerald-700">Measured Impact / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {(data?.metrics_comparison || []).map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">
                    {m.metric_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center space-x-1.5 text-rose-700">
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>{m.traditional_baseline}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    <div className="flex items-center space-x-1.5 text-cyan-800">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-cyan-600" />
                      <span>{m.patient_triage_ai}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-700">
                    {m.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Evaluation Disclaimer */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-2 text-[11px] text-slate-500 mt-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            *Results reflect simulated evaluations across 20 synthetic clinical benchmark scenarios for the Accenture Innovation Challenge. Real-world deployment requires prospective clinical trial validation.
          </span>
        </div>
      </div>
    </div>
  );
};
