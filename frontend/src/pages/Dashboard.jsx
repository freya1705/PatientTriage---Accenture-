import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { KPICards } from '../components/KPICards';
import { ActionQueue } from '../components/ActionQueue';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  TrendingDown,
  Info,
  UserCheck,
  UserX,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

export const Dashboard = () => {
  const {
    queueData,
    loading,
    fetchQueue,
    viewPatientDetail,
    setWhyModalPatient,
    setTrendModalPatient,
    setOverrideModalPatient,
    handleSimulateDeterioration,
    handleToggleAttending
  } = useTriage();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [failureCatFilter, setFailureCatFilter] = useState('ALL');

  if (loading && !queueData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Activity className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Loading live emergency safety intelligence...</p>
        </div>
      </div>
    );
  }

  const allPatients = queueData?.all_patients || [];

  const failureCategories = [
    { id: 'ALL', label: 'All Cases' },
    { id: 'CAT_A', label: 'Cat A: Resuscitation Overrides' },
    { id: 'CAT_B', label: 'Cat B: Hidden / Age Danger' },
    { id: 'CAT_C', label: 'Cat C: Unknown ≠ Safe' },
    { id: 'CAT_D', label: 'Cat D: Deteriorating' },
    { id: 'CAT_E', label: 'Cat E: Attention Gap' }
  ];

  const filteredPatients = allPatients.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.chief_complaint.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      levelFilter === 'ALL' || p.display_triage_level.toString() === levelFilter;

    const matchesCategory =
      failureCatFilter === 'ALL' || p.failure_mode_category?.code === failureCatFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* KPI Section */}
      <KPICards />

      {/* Hero: Live Action Priority Queue */}
      <ActionQueue />

      {/* Complete Patient Census Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight">
              All Monitored Emergency Patients ({allPatients.length})
            </h2>
            <p className="text-xs text-slate-400">
              Complete surveillance census categorized across the 5 failure modes of traditional triage.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, ID, complaint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-56"
              />
            </div>

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Levels</option>
              <option value="1">Level 1 (Immediate)</option>
              <option value="2">Level 2 (Emergent)</option>
              <option value="3">Level 3 (Urgent)</option>
              <option value="4">Level 4 (Less Urgent)</option>
              <option value="5">Level 5 (Non-Urgent)</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchQueue}
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh live census"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 5 Failure Mode Quick Filter Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold text-[11px] shrink-0 mr-1 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Failure Mode Filter:</span>
          </span>
          {failureCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFailureCatFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] shrink-0 transition-all ${
                failureCatFilter === cat.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-2">Failure Mode Category</th>
                <th className="py-3 px-2">Triage Level</th>
                <th className="py-3 px-3">Chief Complaint</th>
                <th className="py-3 px-2">Latest SpO₂</th>
                <th className="py-3 px-2">Safety State</th>
                <th className="py-3 px-2">Coverage</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                    <span className="text-cyan-400">{p.id}</span>
                    <div className="text-[11px] font-normal text-slate-400">{p.name}</div>
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        p.failure_mode_category?.color || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {p.failure_mode_category?.badge || 'Standard'}
                    </span>
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        p.display_triage_level === 1
                          ? 'bg-red-950 text-red-300 border-red-800'
                          : p.display_triage_level === 2
                          ? 'bg-orange-950 text-orange-300 border-orange-800'
                          : p.display_triage_level === 3
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      L{p.display_triage_level} {p.is_overridden ? '✏️' : ''}
                    </span>
                  </td>

                  <td className="py-3 px-3 max-w-xs truncate font-medium text-slate-200">
                    {p.chief_complaint}
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    {p.latest_vitals?.spo2 ? (
                      <span className={p.latest_vitals.spo2 < 92 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {p.latest_vitals.spo2}%
                      </span>
                    ) : (
                      <span className="text-purple-400 font-bold">MISSING</span>
                    )}
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        p.safety_status === 'EXPIRED'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : p.safety_status === 'EXPIRING_SOON'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {p.safety_status}
                    </span>
                  </td>

                  <td className="py-3 px-2 whitespace-nowrap">
                    {p.is_attended ? (
                      <span className="text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
                        <UserCheck className="w-3 h-3" />
                        <span>Attended</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px] flex items-center space-x-1">
                        <UserX className="w-3 h-3" />
                        <span>Waiting</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => setWhyModalPatient(p)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-400"
                        title="Explain AI decision"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setTrendModalPatient(p)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-amber-400"
                        title="Vital trend trajectory"
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleSimulateDeterioration(p.id)}
                        className="p-1 rounded bg-red-950 text-red-400 hover:bg-red-900"
                        title="Simulate Deterioration"
                      >
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => viewPatientDetail(p.id)}
                        className="p-1 rounded bg-cyan-950 text-cyan-400 hover:bg-cyan-900"
                        title="View detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
