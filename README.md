# PatientTriage.ai 🏥
**Decide First. Watch Continuously. Act in Time.**  
*Accenture Innovation Challenge 2026 — Round 2 Prototype Development*

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)

---

## 📌 Problem Statement & Innovation
Traditional emergency department triage treats prioritization as a **one-time static snapshot at intake**. In reality, patients wait for hours, vitals deteriorate, symptoms are ambiguous across pediatric/geriatric cohorts, and critical data is often missing.

**PatientTriage.ai** is an AI-powered clinical decision-support and continuous safety surveillance platform that answers two vital operational questions:
1. *Who needs clinical attention first upon arrival?*
2. *Who in the waiting queue is no longer safe to wait?*

---

## 🚀 Key Differentiators (Accenture Round 2 Highlights)
- **👶 Age-Aware Multi-Tier Rules**: Specialized physiological threshold models for Pediatric (<16yo), Adult (16-64yo), and Geriatric (65+yo) demographics.
- **⚠️ Uncertainty-as-Risk Engine ("Unknown ≠ Safe")**: Missing vitals or zero history actively penalize confidence and bias the system toward safe escalation rather than false reassurance.
- **⏳ Dynamic Confidence Decay & Safety Expiry**: Observations age over time ($\tau_{\text{staleness}}$). Stale data decays confidence and triggers automatic `SAFETY_EXPIRED` reassessment actions.
- **🧠 Attention Gap Engine**: Live Action Queue ranks patients by **Need vs. Current Clinical Coverage** ($\text{Risk} + \text{Deterioration} + \text{Wait Hazard} + \text{Uncertainty} - \text{Clinical Coverage}$).
- **📉 Vital Trend & Deterioration Monitor**: Automatic delta calculations (e.g. SpO₂ dropping 96% $\rightarrow$ 90%) flag deteriorating patients in real-time.
- **🛡️ Counterfactual Downgrade Guardrail**: Downgrading triage level is blocked unless recent objective safety evidence is verified.
- **🚨 3× Surge Stress Simulator**: One-click simulation of mass casualty / surge overload (20 $\rightarrow$ 60 patients) with queue compression.
- **🔒 Clinician Override & Immutable Audit Trail**: Complete human-in-the-loop governance with reason recording and HIPAA/GDPR aligned logging.
- **🎯 20 Curated Clinical Benchmarks**: Handcrafted test scenarios spanning pediatric fever, subtle geriatric sepsis, ambiguous cardiac equivalents, silent internal hemorrhage, and zero-history arrivals.

---

## 🛠️ Architecture & Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLite.
- **Intelligence Layer**: Modular rule engines, hazard functions, and uncertainty calibrators.

---

## ⚡ Quick Start

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd PatientTriageAI
```

### 2. Run Backend (FastAPI)
```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 3. Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to explore the Live Command Dashboard.

---

## 📜 Regulatory & Safety Disclaimer
*PatientTriage.ai is a clinical decision-support research prototype developed for the Accenture Innovation Challenge 2026. Recommendations do not replace licensed medical judgment. All simulated patient data is synthetic.*
