import React from 'react';
import { useTriage } from '../context/TriageContext';
import { Activity, Flame, RotateCcw, ShieldCheck, UserPlus, ListOrdered, FileText, Lock } from 'lucide-react';

export const Navbar = () => {
  const {
    activeTab,
    setActiveTab,
    surgeActive,
    handleToggleSurge,
    handleResetData,
    loading
  } = useTriage();

  const navItems = [
    { id: 'dashboard', label: 'Live Command Center', icon: ListOrdered },
    { id: 'intake', label: 'Rapid Intake & Presets', icon: UserPlus },
    { id: 'audit', label: 'Audit & Governance', icon: FileText },
    { id: 'privacy', label: 'Privacy & Scalability', icon: Lock }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Patient<span className="text-cyan-400">Triage</span><span className="text-emerald-400">.ai</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Round 2 Pro
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
                Decide First. Watch Continuously. Act in Time.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Controls: Surge Mode & Reset */}
          <div className="flex items-center space-x-2.5">
            {/* Live Indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden sm:inline">LIVE ED</span>
            </div>

            {/* 3x Surge Button */}
            <button
              onClick={handleToggleSurge}
              disabled={loading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 shadow-md ${
                surgeActive
                  ? 'bg-red-600 text-white hover:bg-red-500 ring-2 ring-red-400/50 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white'
              }`}
              title="Simulates 3x sudden mass casualty influx (20 -> 60 patients)"
            >
              <Flame className={`w-4 h-4 ${surgeActive ? 'text-yellow-300' : 'text-orange-400'}`} />
              <span>{surgeActive ? '🚨 Surge Active (60)' : 'Simulate 3× Surge'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetData}
              disabled={loading}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
              title="Reset to 20 baseline benchmark patients"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
