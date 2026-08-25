import React from 'react';
import { useTriage } from '../context/TriageContext';
import { Users, AlertTriangle, Clock, HelpCircle, UserCheck, Activity } from 'lucide-react';

export const KPICards = () => {
  const { queueData } = useTriage();

  if (!queueData) return null;

  const { kpis, capacity_pressure_percent, surge_active } = queueData;

  const cards = [
    {
      label: 'Active Census',
      value: kpis.total_patients,
      subtext: surge_active ? '3× Surge Active' : 'Normal Capacity (20 Base)',
      icon: Users,
      badge: `${kpis.total_patients} Pts`,
      badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200'
    },
    {
      label: 'Escalations Due',
      value: kpis.escalations_due,
      subtext: 'Vital Deterioration Flagged',
      icon: AlertTriangle,
      badge: kpis.escalations_due > 0 ? 'Urgent Action' : 'All Clear',
      badgeStyle: kpis.escalations_due > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      label: 'Reassessments Due',
      value: kpis.reassessments_due,
      subtext: 'Safety Status Expired / Stale',
      icon: Clock,
      badge: kpis.reassessments_due > 0 ? 'Stale Data' : 'Fresh',
      badgeStyle: kpis.reassessments_due > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
    },
    {
      label: 'Uncertain Cases',
      value: kpis.uncertain_cases,
      subtext: 'Unknown ≠ Safe (Missing Vitals)',
      icon: HelpCircle,
      badge: 'Uncertainty Active',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      label: 'Physician Attended',
      value: kpis.currently_attended,
      subtext: `${kpis.unattended_waiting} Unattended Waiting`,
      icon: UserCheck,
      badge: `${Math.round((kpis.currently_attended / (kpis.total_patients || 1)) * 100)}% Coverage`,
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Capacity Pressure Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Emergency Department Capacity &amp; Surveillance Load
              </h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  surge_active
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {surge_active ? 'SURGE PROTOCOL (HIGH LOAD)' : 'STANDARD MONITORING'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live capacity pressure factoring in census acuity load, unattended cases, and observation staleness.
            </p>
          </div>
        </div>

        {/* Meter Gauge */}
        <div className="w-full md:w-72">
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span className="text-slate-500">Capacity Pressure:</span>
            <span className={capacity_pressure_percent > 75 ? 'text-rose-700 font-bold' : 'text-slate-900 font-bold'}>
              {capacity_pressure_percent}% {capacity_pressure_percent > 75 ? '(High Congestion)' : '(Normal)'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacity_pressure_percent > 80
                  ? 'bg-rose-500'
                  : capacity_pressure_percent > 50
                  ? 'bg-amber-500'
                  : 'bg-cyan-600'
              }`}
              style={{ width: `${capacity_pressure_percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-slate-300 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 truncate">{card.label}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              <div className="flex items-baseline justify-between pt-0.5">
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${card.badgeStyle}`}>
                  {card.badge}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 truncate pt-1 border-t border-slate-100">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
