import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { api } from '../services/api';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export const OverrideModal = () => {
  const { overrideModalPatient, setOverrideModalPatient, fetchQueue, showToast } = useTriage();
  const [targetLevel, setTargetLevel] = useState(2);
  const [clinicianRole, setClinicianRole] = useState('Attending Emergency Physician');
  const [overrideReason, setOverrideReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [downgradeWarnings, setDowngradeWarnings] = useState([]);

  if (!overrideModalPatient) return null;

  const currentLevel = overrideModalPatient.display_triage_level;

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason || overrideReason.length < 5) {
      showToast('Please provide a specific clinical reason for the override.', 'error');
      return;
    }

    try {
      setSaving(true);
      const res = await api.overrideTriage(overrideModalPatient.id, {
        new_triage_level: parseInt(targetLevel),
        clinician_role: clinicianRole,
        override_reason: overrideReason
      });

      if (res.downgrade_advisory && res.downgrade_advisory.length > 0) {
        setDowngradeWarnings(res.downgrade_advisory);
      }

      await fetchQueue();
      showToast(`✓ Decision saved: ${overrideModalPatient.id} updated to Level ${targetLevel} with audit log.`, 'success');
      setOverrideModalPatient(null);
    } catch (err) {
      showToast('Failed to save override', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Clinician Triage Override
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{overrideModalPatient.id}</strong> — {overrideModalPatient.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOverrideModalPatient(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveOverride} className="p-6 space-y-4">
          {/* Current AI State Box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">AI Initial Classification: </span>
              <strong className="text-cyan-400">Level {overrideModalPatient.triage_level}</strong> ({overrideModalPatient.triage_category})
            </div>
            <div className="text-slate-400">
              Confidence: <strong className="text-white">{overrideModalPatient.confidence_score}%</strong>
            </div>
          </div>

          {/* Select New Triage Level */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Select Clinician-Determined Triage Level
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const isSelected = targetLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`py-2 px-1 rounded-xl text-xs font-black border transition-all ${
                      isSelected
                        ? lvl <= 2
                          ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-500/20'
                          : lvl === 3
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-blue-600 text-white border-blue-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    Level {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinician Role */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1.5">
              Clinician Identifier & Role
            </label>
            <select
              value={clinicianRole}
              onChange={(e) => setClinicianRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Attending Emergency Physician">Attending Emergency Physician (Dr. Lead)</option>
              <option value="Charge Nurse">Charge Nurse (RN Triage Supervisor)</option>
              <option value="Emergency Resident (PGY-3)">Emergency Medicine Resident (PGY-3)</option>
              <option value="Pediatric Emergency Specialist">Pediatric Emergency Specialist</option>
              <option value="Trauma Team Leader">Trauma Team Leader</option>
            </select>
          </div>

          {/* Mandatory Rationale */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Mandatory Clinical Rationale (Audit Record)
              </label>
              <span className="text-[10px] text-slate-400">HIPAA & GDPR Enforced</span>
            </div>
            <textarea
              rows={3}
              required
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="E.g., Patient clinically appears in severe acute respiratory distress with silent accessory muscle use despite borderline vital readings."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Downgrade Guardrail Warning if target > current */}
          {targetLevel > currentLevel && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Counterfactual Safety Advisory:</strong>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  Downgrading priority requires documented recent objective stability. This override and reasoning will be permanently recorded in the immutable compliance audit trail.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setOverrideModalPatient(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Recording Log...' : 'Confirm & Log Override'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
