import React, { useState, useEffect } from 'react';
import { useTriage } from '../context/TriageContext';
import {
  Activity,
  Flame,
  RotateCcw,
  Clock,
  Building2,
  Bell,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const Header = () => {
  const {
    queueData,
    surgeActive,
    handleToggleSurge,
    handleResetData,
    loading
  } = useTriage();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalPatients = queueData?.kpis?.total_patients || 20;
  const hospitalName = queueData?.hospital_name || 'Metro Academic Emergency Center';
  const profileName = queueData?.profile_details?.name || 'Level-1 Trauma Center';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left Title & Live Pulse */}
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Live Emergency Command Center
            </h1>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Monitoring {totalPatients} patients</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            “Triage is a snapshot. <span className="text-slate-800 font-semibold">Risk isn't.</span>” &bull; {profileName}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center space-x-1 text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>

        {/* 3x Surge Simulator Toggle */}
        <button
          onClick={handleToggleSurge}
          disabled={loading}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            surgeActive
              ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
          title="Simulate 3x mass influx (20 -> 60 patients)"
        >
          <Flame className={`w-3.5 h-3.5 ${surgeActive ? 'text-rose-600' : 'text-slate-400'}`} />
          <span>{surgeActive ? 'Surge Active (60 pts)' : 'Simulate 3× Surge'}</span>
        </button>

        {/* Reset Benchmark */}
        <button
          onClick={handleResetData}
          disabled={loading}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          title="Reset to 20 baseline benchmark cases"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
