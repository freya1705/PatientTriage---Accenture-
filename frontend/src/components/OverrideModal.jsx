import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export const OverrideModal = () => {
  const {
    overrideModalPatient,
    setOverrideModalPatient,
    handleConfirmOverride,
    showToast
  } = useTriage();

  const [newLevel, setNewLevel] = useState(2);
  const [role, setRole] = useState('Attending Emergency Physician');
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!overrideModalPatient) return null;

  const currentLevel = overrideModalPatient.display_triage_level;
  const isDowngrade = newLevel > currentLevel;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rationale.trim()) {
      showToast('Mandatory clinical rationale is required for override.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await handleConfirmOverride(
        overrideModalPatient.id,
        newLevel,
        role,
        rationale
      );
      setOverrideModalPatient(null);
      setRationale('');
    } catch (err) {
      // toast is shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Clinician Triage Override
              </h2>
              <p className="text-xs text-slate-500">
                Patient: <strong className="text-slate-800">{overrideModalPatient.id} ({overrideModalPatient.name})</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setOverrideModalPatient(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State vs Proposed */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Current AI Urgency</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              Level {currentLevel} &bull; {overrideModalPatient.triage_category}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
            <span className="text-purple-700 font-medium block">Overridden Level</span>
            <div className="text-base font-bold text-purple-900 mt-0.5">
              Level {newLevel}
            </div>
          </div>
        </div>

        {/* Downgrade Guard Advisory */}
        {isDowngrade && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Counterfactual Safety Check (Downgrade Advisory)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              De-escalating triage priority (Level {currentLevel} → Level {newLevel}) requires recent stable vital signs and clinical absence of red flags.
            </p>
          </div>
        )}

        {/* Override Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Level Selector */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Select New Triage Level (ESI 1–5):
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setNewLevel(lvl)}
                  className={`py-2 rounded-lg font-bold border transition-all ${
                    newLevel === lvl
                      ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  Level {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Clinician Role */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Clinician Role:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-cyan-600"
            >
              <option>Attending Emergency Physician</option>
              <option>Charge Nurse (RN Lead)</option>
              <option>Emergency Medicine Resident</option>
              <option>Trauma Team Leader</option>
            </select>
          </div>

          {/* Mandatory Clinical Rationale */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Mandatory Clinical Rationale (HIPAA/GDPR Audit Log): <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Document physical exam findings, bedside changes, or reason for overriding recommendation..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setOverrideModalPatient(null)}
              className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {submitting ? 'Recording Audit...' : 'Confirm & Log Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
