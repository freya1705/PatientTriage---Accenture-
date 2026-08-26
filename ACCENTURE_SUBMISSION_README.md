# PatientTriage.ai: Continuous Safety Decision-Support for Emergency Waiting Rooms

**“Triage is a snapshot. Risk isn't.”**  
*Accenture Innovation Challenge 2026 — Round 2 Technical Submission Document*

---

## Table of Contents
1. [Project Overview & Introduction](#1-project-overview--introduction)
2. [The Core Problem: 3 Failure Modes of Traditional Triage](#2-the-core-problem-3-failure-modes-of-traditional-triage)
3. [Solution Approach & Innovation](#3-solution-approach--innovation)
4. [System Architecture & 3-Tier Layered Design](#4-system-architecture--3-tier-layered-design)
5. [Core Intelligence Engines & Mathematical Formulations](#5-core-intelligence-engines--mathematical-formulations)
   - 5.1 Age-Aware Threshold Calibrations
   - 5.2 Deterministic Safety Red-Flag Guardrails
   - 5.3 Uncertainty-as-Risk Engine ("Unknown ≠ Safe")
   - 5.4 Vital Trajectory & Delta Velocity Analysis
   - 5.5 Dynamic Confidence Decay & Safety Expiry ($\tau_{\text{staleness}}$)
   - 5.6 The Attention Gap Priority Equation
   - 5.7 Counterfactual Downgrade Safety Verification
6. [Implementation Details & Tech Stack](#6-implementation-details--tech-stack)
7. [Key Features & Clinical Workflow](#7-key-features--clinical-workflow)
8. [Requirements & Prerequisites](#8-requirements--prerequisites)
9. [Installation & Quick Start Guide](#9-installation--quick-start-guide)
10. [Configuration & Hospital Deployment Profiles](#10-configuration--hospital-deployment-profiles)
11. [Benchmark Cohort & Empirical Impact Evaluation](#11-benchmark-cohort--empirical-impact-evaluation)
12. [Security, Privacy-by-Design & Governance](#12-security-privacy-by-design--governance)
13. [Troubleshooting & Frequently Asked Questions (FAQ)](#13-troubleshooting--frequently-asked-questions-faq)
14. [Maintainers, Project Links & Regulatory Disclaimer](#14-maintainers-project-links--regulatory-disclaimer)

---

## 1. Project Overview & Introduction

**PatientTriage.ai** is an emergency department decision-support system and continuous physiological safety surveillance layer. While traditional emergency triage treats prioritization as a static, one-time snapshot at hospital intake, PatientTriage.ai continuously tracks patient wait times, physiological trajectory velocity ($\Delta\text{SpO}_2, \Delta\text{HR}$), data uncertainty, and active clinical attention.

The platform answers the single most critical operational question facing emergency clinicians:
> **“Who in the waiting room is no longer safe to keep waiting?”**

### Key Project Details:
- **Repository**: [https://github.com/freya1705/PatientTriage---Accenture-](https://github.com/freya1705/PatientTriage---Accenture-)
- **Competition Track**: Accenture Innovation Challenge 2026 — Round 2 Prototype Track
- **License**: MIT Open Source License
- **Deployment Profile**: Air-gapped, on-premise edge deployable with zero third-party cloud API dependencies.

---

## 2. The Core Problem: 3 Failure Modes of Traditional Triage

In emergency departments globally, intake triage is performed using standard 5-level frameworks (such as the Emergency Severity Index / ESI or Manchester Triage System). Once triaged, patients are directed to waiting lounges where they routinely wait 2 to 6 hours before physician contact.

Traditional static triage exhibits three concrete systemic failure modes:

1. **Silent Post-Triage Waiting Room Deterioration**:
   A patient triaged as Level 3 (Urgent) or Level 4 (Less Urgent) may develop acute respiratory failure, septic shock, or internal hemorrhage while unmonitored in the waiting room. Static systems cannot re-rank patients without manual nurse intervention.
2. **Missing Vitals & Stale Data Assumed Safe**:
   When intake records lack vital parameters (such as pulse oximetry or blood pressure), standard systems default to lower severity bands, giving false reassurance. Under the clinical reality of *"Unknown is NOT Safe"*, missing data should heighten vigilance.
3. **The Clinical Attention Bottleneck**:
   Static triage lists rank patients purely by initial acuity. Consequently, critical patients who are *already attended* by trauma teams occupy the top slots, while *unattended deteriorating patients* remain buried lower down the list.

---

## 3. Solution Approach & Innovation

PatientTriage.ai transforms triage from a **static admission gate** into a **continuous safety surveillance loop**:

```
[ ARRIVAL & RAPID INTAKE ]
          │
          ▼
[ INITIAL TRIAGE ASSESSMENT (ESI 1-5 + Uncertainty Penalty) ]
          │
          ▼
[ CONTINUOUS WAITING SURVEILLANCE ] ───► Dynamic Confidence Decay (τ_staleness)
          │                                     │
          ▼                                     ▼
[ DELTA VITAL MONITORING ] ──────────► Deterioration Alert (ΔSpO₂ ≤ -5%)
          │                                     │
          ▼                                     ▼
[ ATTENTION GAP ENGINE ] ────────────► Live Action Queue (Need vs. Coverage)
          │
          ▼
[ CLINICIAN ACTION & GOVERNANCE ] ───► Override Guardrail & Audit Log
```

---

## 4. System Architecture & 3-Tier Layered Design

To ensure patient safety and ethical AI alignment, PatientTriage.ai implements a **3-Tier Layered Architecture**:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: DETERMINISTIC SAFETY LAYER                     │
│  • Hard Red-Flags: SpO₂ < 85%, SBP < 75, FAST Stroke, Pediatric Stridor  │
│  • Counterfactual Downgrade Blocking: Objective proof required to lower  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│               TIER 2: AI & DECISION-SUPPORT SURVEILLANCE                 │
│  • Continuous Vital Trajectory Velocity (ΔSpO₂, ΔHR, ΔSBP, ΔRR)          │
│  • Dynamic Confidence Decay (Evidence half-life based on elapsed time)    │
│  • Uncertainty-as-Risk Engine ("Unknown ≠ Safe" penalty)                 │
│  • Attention Gap Re-Ranking (Clinical Severity - Active Coverage)        │
│  • Dynamic Natural Language Explainability ("Why Rank #1?")              │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼─────────────────────────────────────┐
│                     TIER 3: CLINICIAN GOVERNANCE                         │
│  • Human-in-the-Loop: Licensed Clinicians retain final authority         │
│  • Mandatory Rationale Capture for all overrides                         │
│  • Append-Only Audit Ledger for HIPAA/GDPR clinical traceability         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Core Intelligence Engines & Mathematical Formulations

### 5.1 Age-Aware Threshold Calibrations
Physiological normal ranges vary dramatically by age demographic:
- **Pediatric (<16y)**: Specialized infant tachycardia ($>160$ bpm), toddler high fever ($>38.5^\circ\text{C}$ in $<3$yo triggering sepsis alert), and age-stratified minimum systolic blood pressure:
  $$\text{SBP}_{\min} = 70 + (2 \times \text{Age})$$
- **Geriatric ($\ge 65$y)**: Calibrated for blunted autonomic responses. Hypothermia ($<36.0^\circ\text{C}$) triggers occult sepsis warnings, and blood pressure shock threshold is elevated ($\text{SBP} < 100\text{ mmHg}$).

### 5.2 Deterministic Safety Red-Flag Guardrails
Critical conditions bypass statistical heuristics to force immediate Level 1 or Level 2 priority:
- Immediate Resuscitation (Level 1): $\text{SpO}_2 < 85\%$, $\text{SBP} < 75\text{ mmHg}$, $\text{HR} > 170\text{ bpm}$ or $<35\text{ bpm}$, unresponsive/trauma arrest.
- Emergent Life Threats (Level 2): Pediatric stridor, acute coronary syndrome (retrosternal radiating chest pain with diaphoresis), acute stroke (FAST symptoms), systemic anaphylaxis.

### 5.3 Uncertainty-as-Risk Engine ("Unknown $\neq$ Safe")
Missing physiological signals reduce system confidence and introduce uncertainty penalties:
- Missing $\text{SpO}_2$: $+22\%$ uncertainty.
- Missing Blood Pressure: $+20\%$ uncertainty.
- Zero Prior EHR History: $+18\%$ uncertainty.
- Clinical Discordance: Severe pain ($10/10$) with normal vitals or minimal pain with marked vital derangement.

$$\text{Confidence} = \max(15.0, 100.0 - \text{Uncertainty})$$

*Asymmetric Safety Bias*: If a patient with missing critical vitals would otherwise fall into Level 4 or 5, the engine escalates them to Level 3 Urgent and mandates an `[ ACQUIRE VITALS ]` action.

### 5.4 Vital Trajectory & Delta Velocity Analysis
Sequential vital readings are evaluated for negative velocity derangements:
- $\Delta\text{SpO}_2 \le -5\%$ or drop below $90\%$: $+25$ points (`RAPID_DETERIORATION`).
- $\Delta\text{HR} \ge +30\text{ bpm}$ or heart rate $>130\text{ bpm}$: $+20$ points.
- $\Delta\text{SBP} \le -25\text{ mmHg}$ or collapse below $90\text{ mmHg}$: $+22$ points.

### 5.5 Dynamic Confidence Decay & Safety Expiry ($\tau_{\text{staleness}}$)
Observations decay in validity over time:
$$\text{Confidence}(t) = \text{Base Confidence} \times \max\left(0.20, 1.0 - \frac{t - t_{\text{last}}}{\text{Window} \times 1.5} \times 0.65\right)$$

Standard reassessment windows: Level 1 = 5m, Level 2 = 15m, Level 3 = 30m, Level 4 = 60m, Level 5 = 120m. When elapsed time exceeds the window, safety status flips to `EXPIRED`, triggering `[ REASSESS NOW ]`.

### 5.6 The Attention Gap Priority Equation
The **Action Priority Score** surfaces unattended deteriorating cases:
$$\text{Action Priority} = (w_r \cdot \text{Risk} + \text{Urgency}) + (w_d \cdot \text{Deterioration}) + (w_s \cdot \text{Staleness}) + \text{Wait Hazard} + (w_u \cdot \text{Uncertainty}) - (w_c \cdot \text{Clinical Coverage})$$

Where $w_c$ deducts up to $-35$ points when a patient is actively being managed by an attending physician (`is_attended = True`), allowing unattended waiting patients to rise to Rank #1.

### 5.7 Counterfactual Downgrade Safety Verification
Clinicians attempting to de-escalate triage level (e.g. Level 2 $\rightarrow$ Level 4) must pass strict objective checks:
- No active physiological red-flags.
- Last recorded vitals must be $<15$ minutes old.
- Minimum 2 consecutive vital recordings showing physiological stability.
- Assessment confidence $\ge 60\%$.

---

## 6. Implementation Details & Tech Stack

```
PatientTriageAI/
├── backend/
│   ├── data/
│   │   ├── simulated_patients.json     # 20 Curated Benchmark Scenarios
│   │   └── surge_patients.json         # 40 Disaster Surge Patients
│   ├── models/schemas.py              # Pydantic v2 Validation Schemas
│   ├── routes/                        # Modular FastAPI Endpoints
│   │   ├── patient_routes.py          # CRUD, vitals, overrides, simulations
│   │   ├── queue_routes.py            # Live Action Queue & evaluation
│   │   ├── surge_routes.py            # 3× Surge toggle & census expansion
│   │   ├── audit_routes.py            # Append-only audit logs
│   │   └── triage_routes.py           # Standalone triage inference
│   ├── services/                      # 8 Core Intelligence Engines
│   │   ├── age_rules.py               # Age-stratified thresholds
│   │   ├── safety_guardrails.py       # Deterministic red-flag triggers
│   │   ├── uncertainty_engine.py      # Missing-data & discordance scoring
│   │   ├── risk_engine.py             # ESI 5-level risk classifier
│   │   ├── deterioration_engine.py    # Delta rate-of-change tracker
│   │   ├── safety_expiry_engine.py    # Dynamic confidence decay
│   │   ├── attention_gap_engine.py    # Action priority & hospital profiles
│   │   ├── downgrade_guard.py         # Downgrade verification guardrail
│   │   └── audit_service.py           # Traceability & audit logging
│   ├── database.py                    # SQLite engine with WAL mode
│   └── main.py                        # FastAPI entry point & CORS configuration
├── frontend/
│   ├── src/
│   │   ├── components/                # Modular Clinical UI Components
│   │   │   ├── Sidebar.jsx            # Left collapsible navigation rail
│   │   │   ├── Header.jsx             # Top bar with surge toggle & time
│   │   │   ├── SafetySummaryPanel.jsx # Right persistent safety & task panel
│   │   │   ├── ActionQueue.jsx        # Live prioritized patient cards
│   │   │   ├── KPICards.jsx           # Clean clinical metric tiles
│   │   │   ├── OverrideModal.jsx      # Clinician override modal
│   │   │   ├── WhyExplanationModal.jsx# Natural language rationale modal
│   │   │   └── VitalTrendModal.jsx    # Vital trajectory chart modal
│   │   ├── pages/                     # Full Workflow Views
│   │   │   ├── Dashboard.jsx          # 3-Zone Clinical Command Center
│   │   │   ├── IntakePage.jsx         # Rapid intake & 7 demo presets
│   │   │   ├── PatientDetailPage.jsx  # Full dossier & bedside vital logger
│   │   │   ├── AboutScoringPage.jsx   # Mathematical scoring & profiles
│   │   │   ├── EvaluationPage.jsx     # Baseline vs AI empirical impact
│   │   │   ├── AuditPage.jsx          # Traceability ledger & filter
│   │   │   └── PrivacyPage.jsx        # Privacy, security & scalability
│   │   ├── context/TriageContext.jsx  # Global React state management
│   │   └── services/api.js            # Axios client integration
└── tests/                             # 33 Automated Pytest Tests
```

---

## 7. Key Features & Clinical Workflow

1. **3-Zone Clinical Command Center**: Left navigation rail, Center live action workspace, and Right persistent safety summary panel.
2. **Hero Live Action Queue**: Real-time rank ordering with SpO₂ sparklines, Attention Gap meters, and one Next-Best-Action button.
3. **7 One-Click Demo Presets**: Test toddler fever, geriatric sepsis, missing vitals, ambiguous diabetic nausea, zero-history trauma, and silent hemorrhage.
4. **Bedside Vital Sign Logger**: Add repeat vitals directly in the patient dossier to refresh safety validity.
5. **Interactive Deterioration Simulator (Zap)**: Injects an SpO₂ drop ($96\% \rightarrow 89\%$) to demonstrate instant real-time queue elevation.
6. **🚨 3× Surge Mode Disaster Simulator**: 1-click expansion to 60 patients with automatic queue compression to prevent nurse alarm fatigue.
7. **Hospital Profile Switcher**: Toggle live between *Urban Level-1 Trauma Center* and *Community Rural Clinic*.

---

## 8. Requirements & Prerequisites

- **Operating System**: Windows 10/11, macOS, or Linux
- **Python**: Python 3.10+ (Tested on Python 3.13.2)
- **Node.js**: Node.js v18+ (Tested on Node.js v20+)
- **Browser**: Google Chrome, Microsoft Edge, or Mozilla Firefox

---

## 9. Installation & Quick Start Guide

### Step 1: Clone Repository
```bash
git clone https://github.com/freya1705/PatientTriage---Accenture-.git
cd PatientTriageAI
```

### Step 2: One-Command Full-Stack Launch (Windows PowerShell)
```powershell
.\start.ps1
```

### Step 3: Manual Startup

**1. Launch Intelligence Backend:**
```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```
*Interactive Swagger API documentation: `http://localhost:8000/docs`*

**2. Launch React Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Access Live Command Center: `http://localhost:5173`*

### Step 4: Run Automated Test Suite
```bash
python -m pytest -v
```
*(33 automated tests validating APIs, benchmarks, and intelligence engines)*

---

## 10. Configuration & Hospital Deployment Profiles

PatientTriage.ai supports customizable hospital configuration profiles in `backend/services/attention_gap_engine.py`:

| Profile Parameter | Level-1 Academic Trauma Center | Community / Rural Emergency Center |
|---|---|---|
| **Target Daily Census** | 500+ visits/day | 50–120 visits/day |
| **Level 2 Reassessment Window** | 15 minutes | 20 minutes |
| **Level 3 Reassessment Window** | 30 minutes | 45 minutes |
| **Missing Data Weight ($w_u$)** | 1.0 (Standard) | 1.3 (Heightened conservative penalty) |
| **Telemedicine Triggers** | On-site specialist dispatch | Automatic remote telemedicine escalation |

---

## 11. Benchmark Cohort & Empirical Impact Evaluation

Evaluated across 20 synthetic clinical scenarios representing 5 systematic failure modes:

| Metric Dimension | Traditional Static Triage (Baseline) | PatientTriage.ai (Continuous Safety) | Measured Impact |
|---|---|---|---|
| **Waiting Deterioration Catch Rate** | **0%** (Undetected until complaint) | **100%** (Continuous delta surveillance) | **+100% Safety Catch** |
| **Stale Observation Flagging Rate** | **0%** (Assumed permanently safe) | **100%** (Flipped to `SAFETY_EXPIRED`) | **Zero unmonitored stale waits** |
| **False Reassurance on Missing Vitals** | **High** (Missing SpO₂/BP assumed benign) | **0% False Reassurance** (Unknown $\neq$ Safe) | **Eliminates under-triage** |
| **Attention Gap Optimization** | **None** (Attended critical cases block queue) | **Active** (Unattended deteriorating cases elevated) | **Optimized clinician utilization** |
| **Unsafe Priority Downgrades Blocked** | **0 Guardrails** | **100% Guarded** (Requires objective stability) | **100% Guarded against under-triage** |

*Note: Results reflect simulated evaluations on 20 synthetic benchmark scenarios for prototype demonstration.*

---

## 12. Security, Privacy-by-Design & Governance

- **Zero PHI**: 100% synthetic physiological datasets; no real patient health information.
- **Air-Gapped Operation**: Runs entirely on local edge hardware with zero external cloud LLM dependencies.
- **Append-Only Audit Ledger**: Every intake, vital update, deterioration event, and clinician override is recorded in an immutable SQLite audit log with timestamps and clinical roles.
- **Human Oversight**: AI recommendations never supersede licensed clinician authority.

---

## 13. Troubleshooting & Frequently Asked Questions (FAQ)

### Troubleshooting
- **Port 8000 already in use**: Terminate existing Python process with `Stop-Process -Name python -Force` or specify `--port 8001`.
- **Port 5173 already in use**: Vite will automatically bind to `http://localhost:5174`.
- **Resetting Database**: Call `POST http://localhost:8000/api/patients/reset` or click **Reset Benchmark Data** on the Command Center to restore clean baseline states.

### FAQ
- **Q: Does PatientTriage.ai replace the emergency triage nurse?**  
  *A: No. PatientTriage.ai is an assistive continuous safety decision-support layer that augments clinicians by monitoring physiological trajectories and data staleness while patients wait.*
- **Q: How does the system handle patients with zero medical history?**  
  *A: Under the "Unknown is NOT Safe" engine, zero medical history incurs an uncertainty penalty, preventing false low-urgency classification and flagging the patient for early physician intake verification.*

---

## 14. Maintainers, Project Links & Regulatory Disclaimer

### Maintainers & Team
- **Lead Developer & Healthcare Product Designer**: Freya & Team
- **Project Repository**: [https://github.com/freya1705/PatientTriage---Accenture-](https://github.com/freya1705/PatientTriage---Accenture-)

### Regulatory & Safety Disclaimer
*PatientTriage.ai is a clinical decision-support research prototype developed for the Accenture Innovation Challenge 2026. All patient cohorts are synthetically generated. This system is not a certified medical device and does not replace professional clinical judgment.*
