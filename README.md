# PatientTriage.ai 🏥
**“Triage is a snapshot. Risk isn't.”**  
*A Continuous Safety Decision-Support Layer for Emergency Waiting Rooms*  
*Accenture Innovation Challenge 2026 — Round 2 Prototype*

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Problem Statement: The 3 Failure Modes of Traditional Triage

In emergency departments, triage is usually a **one-time snapshot taken at the front door**. But patients wait for hours, and risk continuously changes. Traditional static triage fails in three concrete ways:

1. **Silent Post-Triage Deterioration**: A patient triaged as Level 3 or 4 may develop acute hypoxemia or occult shock in the waiting room; physiological decline may remain undetected until a subsequent reassessment or clinical deterioration becomes apparent.
2. **Missing Vitals & Stale Data Assumed Safe**: In incomplete records, missing oxygen saturation or blood pressure is treated as "benign" instead of being flagged as high uncertainty (*"Unknown is NOT Safe"*).
3. **The Attention Bottleneck**: Attended critical patients who are already receiving active physician care remain at the top of static lists, while **unattended deteriorating waiting patients** remain hidden.

**PatientTriage.ai** shifts the paradigm from:
> *"Who was the sickest when they arrived?"* $\longrightarrow$ **“Who is no longer safe to keep waiting?”**

---

## 🏛️ The 3-Tier Layered Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: DETERMINISTIC SAFETY LAYER                   │
│  Hard Red-Flags (SpO₂ < 85%, SBP < 75, FAST stroke, Airway stridor)   │
│  Counterfactual Downgrade Blocking (Proof required to de-escalate)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│              TIER 2: AI & DECISION-SUPPORT SURVEILLANCE                │
│  • The intelligence layer performs continuous physiological trend      │
│    analysis, uncertainty scoring, confidence decay, and dynamic        │
│    attention-gap prioritization, while deterministic safety rules      │
│    provide hard guardrails.                                            │
│  • Multimodal Vital Ingestion: BLE wearable rings/wristbands, waiting  │
│    room kiosks, and nurse tablet walking rounds.                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    TIER 3: CLINICIAN GOVERNANCE                        │
│  Clinician override authority with mandatory justification recording   │
│  Append-only audit ledger aligned with HIPAA & EU AI Act principles    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Core Mathematical Formulation: The Attention Gap

$$\text{Action Priority} = (w_r \cdot \text{Risk} + \text{Urgency}) + (w_d \cdot \text{Deterioration}) + (w_s \cdot \text{Staleness}) + \text{Wait Hazard} + (w_u \cdot \text{Uncertainty}) - (w_c \cdot \text{Clinical Coverage})$$

**Default Parameter Bounds**:
- $w_r$ (Base Clinical Risk / Urgency): **$1.0$**
- $w_d$ (Deterioration Velocity): **$+25\text{ to }+40\text{ pts}$** ($\Delta\text{SpO}_2 \le -5\%$ or $\Delta\text{HR} \ge +20\text{ bpm}$)
- $w_s$ (Staleness Penalty): **$+20\text{ to }+35\text{ pts}$** (upon safety window expiry)
- $w_u$ (Uncertainty Penalty): **$+15\text{ to }+25\text{ pts}$** (missing vital parameters or zero history)
- $w_c$ (Clinical Coverage Offset): **$-35\text{ pts}$** (when `is_attended = True`, surfacing unattended deteriorating cases to Rank #1)

---

## 🛡️ Competitive Differentiation Against Native EHR Scores (The Moat)

1. **Waiting Room vs. Inpatient Focus**: Native EHR algorithms (Epic EDI, Cerner MEWS/NEWS) were designed for admitted patients in inpatient hospital beds with steady telemetry. PatientTriage.ai is engineered specifically for chaotic, ambulatory waiting lounges.
2. **Attention Gap Differentiator**: Native EHR scores only evaluate clinical severity—they do not account for **physician coverage** (whether a doctor is already actively managing the patient) or **evidence decay** over unmonitored wait times.

---

## 📊 Measured Benchmark Evaluation (20 Synthetic Scenarios)

| Performance Dimension | Traditional Static Triage | PatientTriage.ai | Benchmark Impact |
|---|---|---|---|
| **Waiting Deterioration Catch Rate** | **0/20 detected** | **20/20 synthetic scenarios detected** | **100% Benchmark Coverage** |
| **Stale Observation Flagging** | **0/20 flagged** | **20/20 synthetic cases flagged** (`EXPIRED`) | **Zero unmonitored stale waits** |
| **False Reassurance on Missing Data** | **High** (Missing vitals treated as normal) | **0% False Reassurance** (Unknown $\neq$ Safe) | **Eliminates under-triage** |
| **Unsafe Priority Downgrades Blocked** | **0 Guardrails** | **100% Guarded** (Requires objective stability) | **100% Downgrade Guarded** |

*Note: Results reflect simulated evaluations across 20 synthetic clinical benchmark scenarios for prototype demonstration.*

---

## ⚡ Quick Start & Running Locally

### 1. One-Command Launch (PowerShell)
```powershell
.\start.ps1
```

### 2. Manual Startup
**Backend (FastAPI):**
```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```
*API Swagger documentation: `http://localhost:8000/docs`*

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` to access the Command Center.*

### 3. Run Comprehensive Test Suite
```bash
python -m pytest -v
```
*(33 automated unit, API, and intelligence engine tests)*

---

## 📜 Regulatory & Safety Notice
*PatientTriage.ai is a clinical decision-support research prototype developed for the Accenture Innovation Challenge 2026. All patient cohorts are synthetically generated. This system is not a certified medical device and does not replace professional clinical judgment.*
