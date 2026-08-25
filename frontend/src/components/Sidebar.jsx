import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import {
  LayoutDashboard,
  UserPlus,
  BookOpen,
  Award,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, queueData } = useTriage();

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, badge: queueData?.kpis?.escalations_due ? `${queueData.kpis.escalations_due} Alert` : null, badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'intake', label: 'Rapid Intake & Presets', icon: UserPlus },
    { id: 'about-scoring', label: 'About & Scoring', icon: BookOpen },
    { id: 'evaluation', label: 'Baseline vs AI Impact', icon: Award },
    { id: 'audit', label: 'Audit & Governance', icon: FileText },
    { id: 'privacy', label: 'Privacy & Scalability', icon: Lock }
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 z-30 shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top: Brand Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm text-slate-900 tracking-tight">
                    Patient<span className="text-cyan-700">Triage</span>.ai
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    ED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Continuous Safety Layer</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-cyan-700 text-white flex items-center justify-center shadow-sm">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-700' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Clinical Surveillance Status & User Profile */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {/* Live Safety Status */}
        <div className={`p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-emerald-900 block leading-tight truncate">
                AI Safety Active
              </span>
              <span className="text-[10px] text-emerald-700 block truncate">20 pts monitored</span>
            </div>
          )}
        </div>

        {/* User Badge */}
        {!isCollapsed && (
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-slate-800 truncate">Dr. Sarah Chen, MD</div>
              <div className="text-[10px] text-slate-400 truncate">Attending Emergency Physician</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
