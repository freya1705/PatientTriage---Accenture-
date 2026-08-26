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

1. **Silent Post-Triage Deterioration**: A patient triaged as Level 3 or 4 silently deteriorates in the waiting room (e.g. progressive desaturation from viral pneumonia or occult hemorrhage) without triggering an alert.
2. **Missing Vitals & Stale Data Assumed Safe**: In incomplete records, missing oxygen saturation or blood pressure is treated as "benign" instead of being flagged as high uncertainty (*"Unknown is NOT Safe"*).
3. **The Attention Bottleneck**: Attended critical patients who are already receiving active physician care remain at the top of static lists, while **unattended deteriorating waiting patients** remain hidden.

**PatientTriage.ai** shifts the paradigm from:
> *"Who was the sickest when they arrived?"* $\longrightarrow$ **“Who is no longer safe to keep waiting?”**

---

## 🏛️ The 3-Tier Layered Architecture

PatientTriage.ai deliberately separates deterministic clinical safety rules from statistical AI scoring and clinician authority:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TIER 1: DETERMINISTIC SAFETY LAYER                   │
│  Hard Red-Flags (SpO₂ < 85%, SBP < 75, FAST stroke, Airway stridor)   │
│  Counterfactual Downgrade Blocking (Proof required to de-escalate)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│              TIER 2: AI & DECISION-SUPPORT SURVEILLANCE                │
│  • Vital Trajectory & Delta Velocity (ΔSpO₂, ΔHR)                      │
│  • Dynamic Confidence Decay (τ_staleness)                             │
│  • Uncertainty-as-Risk Engine ("Unknown ≠ Safe")                       │
│  • Attention Gap Re-Ranking (Need vs. Active Coverage)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    TIER 3: CLINICIAN GOVERNANCE                        │
│  Licensed Clinician Retains Final Override Authority                   │
│  Mandatory Rationale Logged to Append-Only Audit Ledger               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Core Mathematical Formulation: The Attention Gap

Instead of a static ESI score, PatientTriage.ai computes an **Action Priority Score**:

$$\text{Action Priority} = (w_r \cdot \text{Risk} + \text{Urgency}) + (w_d \cdot \text{Deterioration}) + (w_s \cdot \text{Staleness}) + \text{Wait Hazard} + (w_u \cdot \text{Uncertainty}) - (w_c \cdot \text{Clinical Coverage})$$

- **Deterioration Score ($w_d$)**: Scaled from vital sign velocity ($\Delta\text{SpO}_2 \le -5\%$ adds $+25$ pts).
- **Staleness Score ($w_s$)**: Increases as $(t - t_{\text{vital}})$ exceeds the ESI reassessment window (Level 2 = 15m, Level 3 = 30m).
- **Confidence Decay**: Evidence decays over time via $\text{Confidence}(t) = \text{Base} \times \max\left(0.20, 1.0 - \frac{t - t_{\text{last}}}{\text{Window} \times 1.5} \times 0.65\right)$.
- **Clinical Coverage Offset ($w_c$)**: Deducts priority when an attending physician is already actively managing the patient, allowing **unattended deteriorating patients** to surface to Rank #1.

---

## 🎯 20 Benchmark Clinical Scenarios (5 Systematic Categories)

| Category | Clinical Focus | Benchmark Patient IDs |
|---|---|---|
| **Cat A: Immediate Resuscitation** | Polytrauma shock, pediatric airway stridor, geriatric shock | `P-001`, `P-003`, `P-014` |
| **Cat B: Hidden / Age-Specific** | Toddler fever decompensation, geriatric hypothermic sepsis, atypical cardiac nausea | `P-007`, `P-008`, `P-009` |
| **Cat C: Incomplete Data / Uncertainty** | Zero EHR history, missing critical SpO₂ & BP ("Unknown ≠ Safe") | `P-010`, `P-011` |
| **Cat D: Active Deterioration** | Post-fall occult hemorrhage, viral pneumonia progressive desaturation | `P-015`, `P-017` |
| **Cat E: Attention Gap & Staleness** | Attended STEMI vs. unattended waiting patient, 68-min stale asthma wait | `P-002`, `P-016` |

---

## 📊 Measured Impact (Simulated 20-Patient Benchmark)

| Performance Dimension | Traditional Static Triage | PatientTriage.ai | Impact Delta |
|---|---|---|---|
| **Waiting Deterioration Catch Rate** | **0%** (Undetected until complaint) | **100%** (Continuous delta surveillance) | **+100% Safety Catch** |
| **Stale Observation Flagging** | **0%** (Assumed permanently safe) | **100%** (Status flipped to `EXPIRED`) | **Zero unmonitored stale waits** |
| **False Reassurance on Missing Data** | **High** (Missing vitals treated as normal) | **0%** (Penalizes confidence; forces verify) | **Eliminates under-triage** |
| **Unsafe Priority Downgrades Blocked** | **0 Guardrails** | **100% Guarded** (Requires objective stability) | **100% Downgrade Guarded** |

*Note: Results reflect simulated evaluation across 20 synthetic clinical benchmark scenarios for prototype demonstration.*

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

## 📈 Scalability & Enterprise Roadmap

- **Multi-Hospital Profiles**: Configurable between *Urban Level-1 Trauma Center* (strict 15-min timeouts) and *Community / Rural Clinic* (telemedicine triggers).
- **🚨 3× Surge Mode Disaster Simulator**: 1-click test expanding census from 20 to 60 patients with automatic queue compression.
- **Production Architecture**: API Gateway $\rightarrow$ CDS Hooks & HL7 FHIR Interoperability $\rightarrow$ Apache Kafka Event Streaming $\rightarrow$ Distributed Clinical Microservices $\rightarrow$ EHR (Epic/Cerner) Integration.

---

## 📜 Regulatory & Safety Notice
*PatientTriage.ai is a clinical decision-support research prototype developed for the Accenture Innovation Challenge 2026. All patient cohorts are synthetically generated. This system is not a certified medical device and does not replace licensed clinical judgment.*
