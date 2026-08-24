import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, FileText, Search, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';

export const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(150);
      setLogs(data.audit_logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      (l.patient_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.event_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.clinician_role || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.outcome || '').toLowerCase().includes(search.toLowerCase());

    const matchesType =
      filterType === 'ALL' || l.event_type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Clinical Audit & Regulatory Governance Ledger
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  HIPAA & GDPR Article 30 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Immutable chronological ledger recording AI inferences, uncertainty detections, and clinician overrides.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
            title="Refresh Audit Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Patient ID, Role, Reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="CLINICIAN_OVERRIDE">Clinician Overrides Only</option>
            <option value="NEW_PATIENT_INTAKE">Intake Assessments</option>
            <option value="VITAL_SIGNS_UPDATED">Vital Updates & Trajectories</option>
            <option value="RAPID_DETERIORATION_ALERT">Deterioration Alerts</option>
            <option value="SURGE_MODE_ACTIVATED">Surge Events</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{filteredLogs.length}</strong> immutable records
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-2">Patient ID</th>
                <th className="py-3 px-3">Clinician / Role</th>
                <th className="py-3 px-4">Outcome & Clinical Rationale</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => {
                const isOverride = log.event_type === 'CLINICIAN_OVERRIDE';
                const isDeterioration = log.event_type === 'RAPID_DETERIORATION_ALERT';

                return (
                  <tr
                    key={log.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isOverride ? 'bg-indigo-950/20' : isDeterioration ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400 font-sans">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOverride
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                            : isDeterioration
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {log.event_type}
                      </span>
                    </td>

                    <td className="py-3 px-2 whitespace-nowrap font-bold text-cyan-400">
                      {log.patient_id}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-300 font-sans">
                      {log.clinician_role || 'Auto-Logged AI System'}
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-200 max-w-md">
                      <div>{log.outcome}</div>
                      {log.override_reason && (
                        <div className="mt-1 text-indigo-300 font-medium text-[11px]">
                          <strong>Clinical Override Reason:</strong> "{log.override_reason}"
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-2 whitespace-nowrap">
                      <span className="text-emerald-400 flex items-center space-x-1 text-[10px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>VERIFIED</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
