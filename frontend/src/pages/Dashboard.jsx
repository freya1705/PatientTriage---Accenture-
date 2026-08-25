import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { KPICards } from '../components/KPICards';
import { ActionQueue } from '../components/ActionQueue';
import { SafetySummaryPanel } from '../components/SafetySummaryPanel';
import {
  Search,
  RefreshCw,
  Eye,
  TrendingDown,
  Info,
  UserCheck,
  UserX,
  Zap,
  Activity,
  Layers,
  PanelRightClose,
  PanelRightOpen
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
    handleSimulateDeterioration
  } = useTriage();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [failureCatFilter, setFailureCatFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [showRightPanel, setShowRightPanel] = useState(true);

  if (loading && !queueData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-2">
          <Activity className="w-8 h-8 text-cyan-700 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading live emergency command center...</p>
        </div>
      </div>
    );
  }

  const allPatients = queueData?.all_patients || [];

  const failureCategories = [
    { id: 'ALL', label: 'All Cases' },
    { id: 'CAT_A', label: 'Cat A: Resuscitation' },
    { id: 'CAT_B', label: 'Cat B: Hidden / Age' },
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

    let matchesStation = true;
    if (stationFilter === 'UNATTENDED') matchesStation = !p.is_attended;
    else if (stationFilter === 'ATTENDED') matchesStation = p.is_attended;
    else if (stationFilter === 'PEDIATRIC') matchesStation = p.age < 16;
    else if (stationFilter === 'GERIATRIC') matchesStation = p.age >= 65;

    return matchesSearch && matchesLevel && matchesCategory && matchesStation;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top KPI Section */}
      <KPICards />

      {/* 2-Zone Workspace (Main Workspace + Right Safety Summary Panel) */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Center Workspace: Live Action Queue & Census Table */}
        <div className="flex-1 w-full space-y-6 min-w-0">
          {/* Hero: Live Action Priority Queue */}
          <ActionQueue />

          {/* Complete Patient Census Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Emergency Patient Census ({filteredPatients.length} of {allPatients.length})
                  </h2>
                  {stationFilter !== 'ALL' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Station: {stationFilter}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Continuous surveillance census organized across the 5 failure modes of traditional triage.
                </p>
              </div>

              {/* Search, Filter, and View Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search ID, name, complaint..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white w-44 sm:w-52"
                  />
                </div>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-cyan-600 focus:bg-white"
                >
                  <option value="ALL">All Levels</option>
                  <option value="1">Level 1 (Immediate)</option>
                  <option value="2">Level 2 (Emergent)</option>
                  <option value="3">Level 3 (Urgent)</option>
                  <option value="4">Level 4 (Semi-Urgent)</option>
                  <option value="5">Level 5 (Non-Urgent)</option>
                </select>

                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hidden lg:flex items-center space-x-1 text-xs"
                  title="Toggle Safety Summary Panel"
                >
                  {showRightPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4 text-cyan-700" />}
                </button>

                <button
                  onClick={fetchQueue}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  title="Refresh census"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5 Failure Mode Quick Filter Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-semibold text-[11px] shrink-0 mr-1 flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Failure Mode:</span>
              </span>
              {failureCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFailureCatFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] shrink-0 transition-all ${
                    failureCatFilter === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Patient Census Table */}
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-2">Failure Mode</th>
                    <th className="py-2.5 px-2">Triage Level</th>
                    <th className="py-2.5 px-3">Chief Complaint</th>
                    <th className="py-2.5 px-2">SpO₂</th>
                    <th className="py-2.5 px-2">Safety State</th>
                    <th className="py-2.5 px-2">Coverage</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <span className="text-cyan-800 font-bold">{p.id}</span>
                        <div className="text-[11px] font-normal text-slate-500">{p.name}</div>
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {p.failure_mode_category?.badge || 'Standard'}
                        </span>
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            p.display_triage_level === 1
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : p.display_triage_level === 2
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : p.display_triage_level === 3
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          L{p.display_triage_level} {p.is_overridden ? '✏️' : ''}
                        </span>
                      </td>

                      <td className="py-3 px-3 max-w-xs truncate font-medium text-slate-800">
                        {p.chief_complaint}
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        {p.latest_vitals?.spo2 ? (
                          <span className={p.latest_vitals.spo2 < 92 ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                            {p.latest_vitals.spo2}%
                          </span>
                        ) : (
                          <span className="text-purple-700 font-semibold">MISSING</span>
                        )}
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            p.safety_status === 'EXPIRED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : p.safety_status === 'EXPIRING_SOON'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {p.safety_status}
                        </span>
                      </td>

                      <td className="py-3 px-2 whitespace-nowrap">
                        {p.is_attended ? (
                          <span className="text-emerald-700 text-[11px] font-semibold flex items-center space-x-1">
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
                            className="p-1 rounded border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Why this decision?"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTrendModalPatient(p)}
                            className="p-1 rounded border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            title="Vital trend trajectory"
                          >
                            <TrendingDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSimulateDeterioration(p.id)}
                            className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            title="Simulate Deterioration"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => viewPatientDetail(p.id)}
                            className="p-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
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

        {/* Right Zone: Persistent Safety Summary Panel */}
        {showRightPanel && (
          <SafetySummaryPanel
            onSelectFilter={(stn) => setStationFilter(stn)}
            activeFilter={stationFilter}
          />
        )}
      </div>
    </div>
  );
};
