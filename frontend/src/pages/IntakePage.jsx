import React, { useState } from 'react';
import { useTriage } from '../context/TriageContext';
import { api } from '../services/api';
import {
  UserPlus,
  Zap,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const DEMO_PRESETS = [
  {
    id: 'pediatric_fever',
    label: '👶 Pediatric High Fever',
    description: '18mo toddler, Temp 39.3°C, HR 162, Lethargic',
    data: {
      name: 'Baby Olivia (Synthetic)',
      age: 1,
      gender: 'Female',
      chief_complaint: 'High fever, extreme lethargy, and poor fluid intake for 24 hours',
      symptoms: ['Lethargy', 'Decreased wet diapers', 'High fever', 'Irritability'],
      pain_score: 5,
      has_medical_history: true,
      medical_history: ['Full-term birth, immunizations up to date'],
      injury_mechanism: 'Infectious febrile illness',
      vitals: { heart_rate: 162, systolic_bp: 82, diastolic_bp: 50, spo2: 96, resp_rate: 38, temperature: 39.3 }
    }
  },
  {
    id: 'geriatric_sepsis',
    label: '👴 Geriatric Subtle Sepsis',
    description: '79yo, Hypothermic 35.7°C, Missing SpO₂, Altered mentation',
    data: {
      name: 'Arthur Vance (Synthetic)',
      age: 79,
      gender: 'Male',
      chief_complaint: 'General weakness, sluggish response, and hypothermia',
      symptoms: ['Altered mental status', 'Cool clammy skin', 'Sluggish mentation'],
      pain_score: 1,
      has_medical_history: false,
      medical_history: [],
      injury_mechanism: 'Geriatric occult sepsis / hypoperfusion',
      vitals: { heart_rate: 108, systolic_bp: 94, diastolic_bp: 58, spo2: null, resp_rate: 26, temperature: 35.7 }
    }
  },
  {
    id: 'missing_vitals',
    label: '⚠️ Missing Critical Vitals',
    description: '45yo dyspnea, SpO₂ & BP not measured yet',
    data: {
      name: 'Carlos Gomez (Synthetic)',
      age: 45,
      gender: 'Male',
      chief_complaint: 'Progressive shortness of breath and chest tightness on exertion',
      symptoms: ['Dyspnea on minimal exertion', 'Dry cough', 'Anxiety'],
      pain_score: 4,
      has_medical_history: false,
      medical_history: [],
      injury_mechanism: 'Acute respiratory complaint',
      vitals: { heart_rate: 110, systolic_bp: null, diastolic_bp: null, spo2: null, resp_rate: 28, temperature: 37.2 }
    }
  },
  {
    id: 'ambiguous_cardiac',
    label: '❓ Ambiguous Cardiac',
    description: '62yo diabetic female, epigastric nausea & fatigue',
    data: {
      name: 'Eleanor Davis (Synthetic)',
      age: 62,
      gender: 'Female',
      chief_complaint: 'Sudden severe nausea, epigastric pressure, and profound fatigue',
      symptoms: ['Diaphoresis', 'Epigastric fullness', 'Extreme fatigue', 'Nausea'],
      pain_score: 3,
      has_medical_history: true,
      medical_history: ['Type 2 Diabetes (20 yrs)', 'Hypertension'],
      injury_mechanism: 'Atypical cardiac equivalent in diabetic',
      vitals: { heart_rate: 98, systolic_bp: 138, diastolic_bp: 86, spo2: 95, resp_rate: 20, temperature: 36.8 }
    }
  },
  {
    id: 'zero_history',
    label: '🆕 Zero-History First-Timer',
    description: '28yo deep laceration, completely empty EHR',
    data: {
      name: 'Mateo Rossi (Synthetic)',
      age: 28,
      gender: 'Male',
      chief_complaint: 'Deep jagged laceration to forearm from broken glass, active oozing',
      symptoms: ['Active bleeding', 'Pain', 'Anxiety'],
      pain_score: 7,
      has_medical_history: false,
      medical_history: [],
      injury_mechanism: 'Penetrating glass injury',
      vitals: { heart_rate: 92, systolic_bp: 122, diastolic_bp: 78, spo2: 99, resp_rate: 16, temperature: 36.9 }
    }
  },
  {
    id: 'high_pain_stable',
    label: '⚡ High Pain vs Stable Vitals',
    description: '39yo severe 10/10 flank pain, normal hemodynamics',
    data: {
      name: 'David Kim (Synthetic)',
      age: 39,
      gender: 'Male',
      chief_complaint: 'Excruciating sudden right flank colicky pain radiating to groin (10/10)',
      symptoms: ['Severe flank pain', 'Nausea', 'Microscopic hematuria'],
      pain_score: 10,
      has_medical_history: true,
      medical_history: ['Prior nephrolithiasis'],
      injury_mechanism: 'Renal colic',
      vitals: { heart_rate: 88, systolic_bp: 130, diastolic_bp: 82, spo2: 99, resp_rate: 18, temperature: 37.0 }
    }
  },
  {
    id: 'silent_bleed',
    label: '📉 Silent Internal Bleed',
    description: '29yo post-fall, initially stable vitals',
    data: {
      name: 'Jessica Taylor (Synthetic)',
      age: 29,
      gender: 'Female',
      chief_complaint: 'Fell from 8ft ladder 2 hours ago; now feeling dizzy with left upper quadrant tenderness',
      symptoms: ['Abdominal pain', 'Lightheadedness', 'Pale conjunctiva'],
      pain_score: 6,
      has_medical_history: false,
      medical_history: [],
      injury_mechanism: 'Blunt trauma / Fall from height',
      vitals: { heart_rate: 102, systolic_bp: 108, diastolic_bp: 68, spo2: 97, resp_rate: 22, temperature: 36.7 }
    }
  }
];

export const IntakePage = () => {
  const { fetchQueue, setActiveTab, showToast } = useTriage();

  // Form fields
  const [name, setName] = useState('');
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState('Male');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [painScore, setPainScore] = useState(4);
  const [hasHistory, setHasHistory] = useState(true);
  const [historyText, setHistoryText] = useState('');
  const [injuryMechanism, setInjuryMechanism] = useState('Medical non-trauma');

  // Vitals
  const [hr, setHr] = useState('');
  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [rr, setRr] = useState('');
  const [temp, setTemp] = useState('');

  // Sandbox AI Assessment
  const [aiPreview, setAiPreview] = useState(null);
  const [assessing, setAssessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const applyPreset = (preset) => {
    const d = preset.data;
    setName(d.name);
    setAge(d.age);
    setGender(d.gender);
    setChiefComplaint(d.chief_complaint);
    setSymptomsText(d.symptoms.join(', '));
    setPainScore(d.pain_score);
    setHasHistory(d.has_medical_history);
    setHistoryText(d.medical_history.join(', '));
    setInjuryMechanism(d.injury_mechanism);

    setHr(d.vitals.heart_rate ?? '');
    setSbp(d.vitals.systolic_bp ?? '');
    setDbp(d.vitals.diastolic_bp ?? '');
    setSpo2(d.vitals.spo2 ?? '');
    setRr(d.vitals.resp_rate ?? '');
    setTemp(d.vitals.temperature ?? '');

    runLiveAssessment(d);
    showToast(`Loaded Preset: ${preset.label}`, 'info');
  };

  const getPayload = () => {
    const symptoms = symptomsText.split(',').map((s) => s.trim()).filter(Boolean);
    const medicalHistory = historyText.split(',').map((s) => s.trim()).filter(Boolean);

    return {
      name: name || 'Anonymous Patient (Synthetic)',
      age: parseInt(age) || 30,
      gender,
      chief_complaint: chiefComplaint || 'Unspecified acute illness',
      symptoms,
      pain_score: parseInt(painScore) || 0,
      has_medical_history: hasHistory,
      medical_history: medicalHistory,
      injury_mechanism: injuryMechanism,
      vitals: {
        heart_rate: hr !== '' ? parseInt(hr) : null,
        systolic_bp: sbp !== '' ? parseInt(sbp) : null,
        diastolic_bp: dbp !== '' ? parseInt(dbp) : null,
        spo2: spo2 !== '' ? parseInt(spo2) : null,
        resp_rate: rr !== '' ? parseInt(rr) : null,
        temperature: temp !== '' ? parseFloat(temp) : null,
        recorded_by: 'Intake Triage Desk'
      }
    };
  };

  const runLiveAssessment = async (overrideData = null) => {
    try {
      setAssessing(true);
      const payload = overrideData ? overrideData : getPayload();
      const assessment = await api.assessPatientSandbox(payload);
      setAiPreview(assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setAssessing(false);
    }
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    if (!chiefComplaint) {
      showToast('Please enter a chief complaint.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = getPayload();
      const res = await api.intakePatient(payload);
      await fetchQueue();
      showToast(`✓ Registered patient ${res.patient_id} (${res.assessment.triage_category}) into Live Action Queue.`, 'success');
      setActiveTab('dashboard');
    } catch (err) {
      showToast('Intake registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Rapid Patient Intake &amp; Decision-Support Simulator
            </h1>
            <p className="text-xs text-slate-500">
              Enter clinical presentation under real-world time pressure with incomplete or ambiguous data.
            </p>
          </div>
        </div>

        {/* Demo Presets Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Clinical Benchmark Scenarios (Accenture Round 2)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 text-left transition-all group shadow-xs"
              >
                <div className="text-xs font-semibold text-slate-800 group-hover:text-cyan-900 truncate">
                  {p.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Intake Form & Live Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Form Input */}
        <form onSubmit={handleIntakeSubmit} className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              1. Patient Demographics &amp; Chief Complaint
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name / Synthetic ID
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="115"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Chief Complaint <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Describe presenting symptoms, onset, and severity..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Symptoms (comma-separated)
                </label>
                <input
                  type="text"
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="Chest tightness, diaphoresis..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pain Score (0 - 10): <span className="font-bold text-slate-900">{painScore}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={(e) => setPainScore(e.target.value)}
                  className="w-full accent-cyan-600 mt-1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  Prior Medical History (EHR on file)
                </label>
                <label className="inline-flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHistory}
                    onChange={(e) => setHasHistory(e.target.checked)}
                    className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>History Available</span>
                </label>
              </div>

              <input
                type="text"
                disabled={!hasHistory}
                value={hasHistory ? historyText : 'ZERO PRIOR MEDICAL HISTORY ON FILE (First-time visitor)'}
                onChange={(e) => setHistoryText(e.target.value)}
                placeholder="e.g. Hypertension, COPD, Diabetes..."
                className={`w-full border rounded-lg px-3 py-1.5 text-xs ${
                  hasHistory
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-cyan-600'
                    : 'bg-purple-50 border-purple-200 text-purple-800 font-semibold'
                }`}
              />
            </div>
          </div>

          {/* Vitals Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Physiological Vitals (Leave blank if unavailable)
              </h2>
              <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Unknown ≠ Safe Enabled
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">HR (bpm)</label>
                <input
                  type="number"
                  placeholder="e.g. 84"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Systolic BP</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={sbp}
                  onChange={(e) => setSbp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Diastolic BP</label>
                <input
                  type="number"
                  placeholder="e.g. 80"
                  value={dbp}
                  onChange={(e) => setDbp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">SpO₂ (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Resp Rate (/min)</label>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  value={rr}
                  onChange={(e) => setRr(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 37.0"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:border-cyan-600"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => runLiveAssessment()}
                disabled={assessing}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-cyan-700" />
                <span>{assessing ? 'Evaluating...' : 'Preview AI Decision'}</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all"
              >
                <span>{submitting ? 'Admitting...' : 'Admit to Live Action Queue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>

        {/* Right 5 Columns: Live AI Sandbox Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-800" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live AI Decision Support Sandbox
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Continuous Calibrator</span>
            </div>

            {aiPreview ? (
              <div className="space-y-3 text-xs">
                {/* Level & Category */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Assigned Acuity</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      Level {aiPreview.triage_level} &bull; {aiPreview.triage_category}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Confidence</span>
                    <div className={`text-base font-bold mt-0.5 ${aiPreview.confidence_score < 60 ? 'text-purple-700' : 'text-emerald-700'}`}>
                      {aiPreview.confidence_score}% {aiPreview.confidence_score < 60 && '⚠️'}
                    </div>
                  </div>
                </div>

                {/* Risk Score & Reassessment Window */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px]">Calculated Risk Score</span>
                    <div className="text-sm font-bold text-slate-900">{aiPreview.risk_score} / 100</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[10px]">Max Safe Wait Time</span>
                    <div className="text-sm font-bold text-slate-900">{aiPreview.reassessment_window_mins} mins</div>
                  </div>
                </div>

                {/* Uncertainty Flag */}
                {aiPreview.is_uncertain && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-1">
                    <span className="text-xs font-bold text-purple-800 flex items-center space-x-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Uncertainty Guardrail Active (Unknown ≠ Safe)</span>
                    </span>
                    <ul className="text-[11px] text-purple-900 list-disc list-inside space-y-0.5">
                      {(aiPreview.uncertainty_reasons || []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Primary Action Plan */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Recommended Next Action:</span>
                  <div className="text-xs font-bold text-cyan-900">
                    {aiPreview.recommended_action}
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {aiPreview.primary_rationale}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Activity className="w-6 h-6 text-slate-300 mx-auto" />
                <p>Click any preset above or fill the form to preview the real-time AI decision-support evaluation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
