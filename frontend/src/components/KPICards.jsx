import React from 'react';
import { useTriage } from '../context/TriageContext';
import { Users, AlertTriangle, Clock, HelpCircle, UserCheck, Activity } from 'lucide-react';

export const KPICards = () => {
  const { queueData } = useTriage();

  if (!queueData) return null;

  const { kpis, capacity_pressure_percent, surge_active } = queueData;

  const cards = [
    {
      label: 'Active ED Patients',
      value: kpis.total_patients,
      subtext: surge_active ? '3× Surge Mode Active' : 'Normal Volume (20 Benchmarks)',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      label: 'Escalations Due',
      value: kpis.escalations_due,
      subtext: 'Deteriorating / Urgent Attention',
      icon: AlertTriangle,
      color: 'from-red-500/20 to-rose-500/10 text-red-400 border-red-500/30'
    },
    {
      label: 'Reassessments Due',
      value: kpis.reassessments_due,
      subtext: 'Safety Status Expired / Stale',
      icon: Clock,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30'
    },
    {
      label: 'Uncertain Cases',
      value: kpis.uncertain_cases,
      subtext: 'Unknown ≠ Safe (Missing Vitals)',
      icon: HelpCircle,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30'
    },
    {
      label: 'Currently Attended',
      value: kpis.currently_attended,
      subtext: `${kpis.unattended_waiting} Unattended in Queue`,
      icon: UserCheck,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Capacity Pressure Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-200">
                Emergency Department Operating State
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  surge_active
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {surge_active ? 'SURGE PROTOCOL (HIGH LOAD)' : 'STANDARD OPERATION'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live capacity pressure based on total census, acuity load, and unattended deteriorating cases.
            </p>
          </div>
        </div>

        {/* Meter Gauge */}
        <div className="w-full md:w-72">
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
            <span>Capacity Pressure</span>
            <span className={capacity_pressure_percent > 75 ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold'}>
              {capacity_pressure_percent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacity_pressure_percent > 80
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : capacity_pressure_percent > 50
                  ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500'
              }`}
              style={{ width: `${capacity_pressure_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-slate-900/90 border rounded-xl p-3.5 bg-gradient-to-br ${card.color} shadow-sm hover:border-slate-600 transition-all`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{card.label}</span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>
              <div className="text-2xl font-black tracking-tight text-white mb-0.5">
                {card.value}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
