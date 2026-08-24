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
      injury_mechanism: 'Acute respiratory distress',
      vitals: { heart_rate: 110, systolic_bp: null, diastolic_bp: null, spo2: null, resp_rate: null, temperature: 37.1 }
    }
  },
  {
    id: 'ambiguous_cardiac',
    label: '❓ Ambiguous Female Cardiac',
    description: '62yo Diabetic F, Fatigue, Nausea, Cold sweat',
    data: {
      name: 'Priya Sharma (Synthetic)',
      age: 62,
      gender: 'Female',
      chief_complaint: 'Persistent upper epigastric nausea, extreme fatigue, and dizziness',
      symptoms: ['Epigastric fullness', 'General exhaustion', 'Cold diaphoresis'],
      pain_score: 2,
      has_medical_history: true,
      medical_history: ['Type 2 Diabetes (20 yrs)', 'Hypertension'],
      injury_mechanism: 'Atypical Cardiac Equivalent',
      vitals: { heart_rate: 96, systolic_bp: 108, diastolic_bp: 68, spo2: 95, resp_rate: 20, temperature: 36.9 }
    }
  },
  {
    id: 'zero_history',
    label: '🆕 Zero-History First-Timer',
    description: '28yo deep sheet metal cut, no hospital EHR records',
    data: {
      name: 'Tariq Al-Mansoor (Synthetic)',
      age: 28,
      gender: 'Male',
      chief_complaint: 'Deep industrial forearm laceration with controlled venous bleeding',
      symptoms: ['Laceration 5cm', 'Mild finger numbness'],
      pain_score: 6,
      has_medical_history: false,
      medical_history: [],
      injury_mechanism: 'Industrial machinery laceration',
      vitals: { heart_rate: 84, systolic_bp: 128, diastolic_bp: 82, spo2: 98, resp_rate: 16, temperature: 36.7 }
    }
  },
  {
    id: 'high_pain_stable',
    label: '⚡ High Pain vs Stable Vitals',
    description: '39yo Kidney stone 10/10 pain, perfectly stable vitals',
    data: {
      name: 'Dmitri Volkov (Synthetic)',
      age: 39,
      gender: 'Male',
      chief_complaint: 'Excruciating spasmodic left flank pain radiating to groin',
      symptoms: ['Severe colicky pain', 'Nausea', 'Restlessness'],
      pain_score: 10,
      has_medical_history: true,
      medical_history: ['Prior nephrolithiasis'],
      injury_mechanism: 'Renal colic',
      vitals: { heart_rate: 88, systolic_bp: 138, diastolic_bp: 86, spo2: 99, resp_rate: 18, temperature: 36.7 }
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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Rapid Patient Intake & Decision-Support Simulator
            </h1>
            <p className="text-xs text-slate-400">
              Enter clinical presentation under real-world time pressure with incomplete or ambiguous data.
            </p>
          </div>
        </div>

        {/* Demo Presets Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center space-x-2 mb-2.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-slate-200">
              One-Click Clinical Benchmark Demo Presets (Round 2 Test Scenarios):
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                  {preset.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Intake Form & Live AI Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <form onSubmit={handleIntakeSubmit} className="space-y-4">
            {/* Section A: Patient Basics */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Section A: Patient Basics & Demographics
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Patient Name (Synthetic)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      runLiveAssessment();
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Section B: Clinical Presentation */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Section B: Presenting Chief Complaint & Symptoms
              </h3>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Chief Complaint *</label>
                <input
                  type="text"
                  required
                  value={chiefComplaint}
                  onChange={(e) => {
                    setChiefComplaint(e.target.value);
                    runLiveAssessment();
                  }}
                  placeholder="e.g. Crushing retrosternal chest pain radiating to left shoulder"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Symptoms (comma separated)</label>
                  <input
                    type="text"
                    value={symptomsText}
                    onChange={(e) => {
                      setSymptomsText(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. Diaphoresis, Shortness of breath"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">Pain Score (0-10)</label>
                    <span className="text-xs font-bold text-cyan-400">{painScore} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => {
                      setPainScore(e.target.value);
                      runLiveAssessment();
                    }}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Section C: Vitals (Supports Missing / Unavailable) */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Section C: Intake Vital Signs
                </h3>
                <span className="text-[10px] text-slate-400">Leave blank if not measured yet</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">SpO₂ (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => {
                      setSpo2(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. 96"
                    className={`w-full bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none ${
                      spo2 === '' ? 'border-purple-800/80 placeholder-purple-400' : 'border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">HR (bpm)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => {
                      setHr(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. 104"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">SBP (mmHg)</label>
                  <input
                    type="number"
                    value={sbp}
                    onChange={(e) => {
                      setSbp(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. 120"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">DBP (mmHg)</label>
                  <input
                    type="number"
                    value={dbp}
                    onChange={(e) => {
                      setDbp(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. 80"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">RR (/min)</label>
                  <input
                    type="number"
                    value={rr}
                    onChange={(e) => {
                      setRr(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. 20"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => {
                      setTemp(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. 37.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section D: Medical History Availability */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Section D: Medical History Availability
              </h3>

              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasHistory}
                    onChange={(e) => {
                      setHasHistory(e.target.checked);
                      runLiveAssessment();
                    }}
                    className="rounded accent-cyan-500"
                  />
                  <span>Prior Hospital EHR Records Available on File</span>
                </label>
              </div>

              {hasHistory && (
                <div>
                  <input
                    type="text"
                    value={historyText}
                    onChange={(e) => {
                      setHistoryText(e.target.value);
                      runLiveAssessment();
                    }}
                    placeholder="e.g. Coronary Artery Disease, Type 2 Diabetes, COPD"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => runLiveAssessment()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center space-x-1.5"
              >
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Re-Evaluate AI Sandbox</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Registering...' : 'Register & Admit to Waiting Queue'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live AI Triage Decision Support Preview (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Activity className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-white">
                Live AI Triage Decision Preview
              </h2>
            </div>
            {assessing && <span className="text-[10px] text-cyan-400 animate-pulse font-bold">Evaluating...</span>}
          </div>

          {aiPreview ? (
            <div className="space-y-4 animate-fadeIn">
              {/* Level & Category Ribbon */}
              <div
                className={`p-4 rounded-xl border ${
                  aiPreview.triage_level === 1
                    ? 'bg-red-950/40 border-red-700 text-red-300'
                    : aiPreview.triage_level === 2
                    ? 'bg-orange-950/40 border-orange-700 text-orange-300'
                    : aiPreview.triage_level === 3
                    ? 'bg-amber-950/40 border-amber-700 text-amber-300'
                    : 'bg-blue-950/40 border-blue-700 text-blue-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Recommended Triage Urgency
                    </span>
                    <div className="text-xl font-black text-white mt-0.5">
                      {aiPreview.triage_category}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Risk Score
                    </span>
                    <div className="text-xl font-black">
                      {aiPreview.risk_score}%
                    </div>
                  </div>
                </div>

                {/* Demographic Active Profile */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-slate-300">
                  Profile Active: <span className="text-cyan-400 font-bold">{aiPreview.age_group} Thresholds</span>
                </div>
              </div>

              {/* Confidence & Uncertainty Indicator */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Confidence Calibration:</span>
                  <span className="font-bold text-white">{aiPreview.confidence_score}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      aiPreview.confidence_score > 70
                        ? 'bg-emerald-500'
                        : aiPreview.confidence_score > 50
                        ? 'bg-amber-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${aiPreview.confidence_score}%` }}
                  />
                </div>

                {aiPreview.is_uncertain && (
                  <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800 text-purple-200 text-[11px]">
                    ⚠️ <strong>Uncertainty-as-Risk Active:</strong> Missing vital signs prevent low-risk classification. Safe escalation enabled.
                  </div>
                )}
              </div>

              {/* Why This Decision */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-300">Clinical Explanation Factors:</span>
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-1">
                  {aiPreview.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Action */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-xs space-y-1">
                <span className="font-bold text-cyan-400">Action Protocol:</span>
                <p className="text-slate-200 font-medium text-[11px]">
                  {aiPreview.recommended_action}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-center p-6 text-slate-500 text-xs">
              Select a Demo Preset above or enter patient presentation to view real-time AI decision-support intelligence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
