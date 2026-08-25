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
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Clinical Audit &amp; Regulatory Governance Ledger
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  HIPAA &amp; GDPR Article 30
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Immutable chronological ledger recording AI inferences, uncertainty detections, and clinician overrides.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors self-start sm:self-auto"
            title="Refresh Audit Logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, role, action..."
                value={search}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 w-56"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:border-cyan-600"
            >
              <option value="ALL">All Event Types</option>
              <option value="CLINICIAN_OVERRIDE">Clinician Overrides</option>
              <option value="NEW_PATIENT_INTAKE">Patient Intakes</option>
              <option value="VITAL_SIGNS_UPDATED">Vital Sign Updates</option>
              <option value="RAPID_DETERIORATION_ALERT">Deterioration Alerts</option>
              <option value="SURGE_MODE_ACTIVATED">Surge Events</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredLogs.length} audit entries
          </span>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-2">Patient ID</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Clinician Role</th>
                <th className="py-2.5 px-4">Action Rationale / Payload</th>
                <th className="py-2.5 px-2">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-2 font-bold text-cyan-800 whitespace-nowrap">
                    {log.patient_id || 'SYSTEM'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        log.event_type === 'CLINICIAN_OVERRIDE'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : log.event_type === 'RAPID_DETERIORATION_ALERT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {log.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                    {log.clinician_role}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-md truncate">
                    {log.action_rationale}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-slate-800 whitespace-nowrap">
                    {log.outcome}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
