import React from 'react';
import { useTriage } from '../context/TriageContext';
import { Users, AlertTriangle, Clock, HelpCircle, UserCheck, Activity, ShieldAlert } from 'lucide-react';

export const KPICards = () => {
  const { queueData } = useTriage();

  if (!queueData) return null;

  const { kpis, capacity_pressure_percent, surge_active } = queueData;

  const cards = [
    {
      label: 'Active Census',
      value: kpis.total_patients,
      subtext: surge_active ? '3× Surge Volume Active' : 'Normal Volume (20 Base)',
      icon: Users,
      glow: 'from-blue-500/10 to-cyan-500/5 border-cyan-500/30 text-cyan-400',
      badge: `${kpis.total_patients} Patients`,
      badgeColor: 'bg-cyan-950 text-cyan-400 border-cyan-800'
    },
    {
      label: 'Escalations Due',
      value: kpis.escalations_due,
      subtext: 'Vital Deterioration Flagged',
      icon: AlertTriangle,
      glow: 'from-rose-500/10 to-red-500/5 border-rose-500/30 text-rose-400',
      badge: kpis.escalations_due > 0 ? 'Urgent Action' : 'All Clear',
      badgeColor: kpis.escalations_due > 0 ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-slate-900 text-slate-400 border-slate-800'
    },
    {
      label: 'Reassessments Due',
      value: kpis.reassessments_due,
      subtext: 'Safety Status Expired / Stale',
      icon: Clock,
      glow: 'from-amber-500/10 to-yellow-500/5 border-amber-500/30 text-amber-400',
      badge: kpis.reassessments_due > 0 ? 'Stale Data' : 'Fresh',
      badgeColor: kpis.reassessments_due > 0 ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-slate-900 text-slate-400 border-slate-800'
    },
    {
      label: 'Uncertain Cases',
      value: kpis.uncertain_cases,
      subtext: 'Unknown ≠ Safe (Missing Vitals)',
      icon: HelpCircle,
      glow: 'from-purple-500/10 to-indigo-500/5 border-purple-500/30 text-purple-400',
      badge: 'Uncertainty Active',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    {
      label: 'Currently Attended',
      value: kpis.currently_attended,
      subtext: `${kpis.unattended_waiting} Unattended Waiting`,
      icon: UserCheck,
      glow: 'from-emerald-500/10 to-teal-500/5 border-emerald-500/30 text-emerald-400',
      badge: `${Math.round((kpis.currently_attended / (kpis.total_patients || 1)) * 100)}% Coverage`,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Capacity Pressure Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-900 text-cyan-400 border border-cyan-800 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-200">
                Department Continuous Safety &amp; Capacity
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  surge_active
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {surge_active ? 'SURGE PROTOCOL (HIGH LOAD)' : 'STANDARD MONITORING'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live capacity pressure factoring in census acuity load, unattended cases, and observation staleness.
            </p>
          </div>
        </div>

        {/* Meter Gauge */}
        <div className="w-full md:w-80">
          <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
            <span className="text-slate-400">Capacity Pressure:</span>
            <span className={capacity_pressure_percent > 75 ? 'text-red-400 font-bold' : 'text-cyan-400 font-bold'}>
              {capacity_pressure_percent}% {capacity_pressure_percent > 75 ? '(High Congestion)' : '(Normal)'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                capacity_pressure_percent > 80
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-sm shadow-red-500/50'
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
              className={`bg-slate-900/90 backdrop-blur-md border rounded-2xl p-4 bg-gradient-to-br ${card.glow} shadow-sm hover:border-slate-600 transition-all space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">{card.label}</span>
                <Icon className="w-4 h-4 opacity-80" />
              </div>

              <div className="flex items-baseline justify-between">
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {card.value}
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-800/60">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
