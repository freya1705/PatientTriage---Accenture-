# 🎬 PatientTriage.ai — Official Prototype Demonstration Video Script
**Accenture Innovation Challenge 2026 — Round 2 Video Submission**  
**Target Duration:** 2 Minutes 45 Seconds (165 Seconds)  
**Target Output Format:** MP4 / MOV (H.264 / AAC, 1080p/720p, < 20 MB)

---

## ⏱️ Video Structure & Scene-by-Scene Rundown

| Scene | Time | Focus Area | Key Visual / Action on Screen |
|---|---|---|---|
| **Scene 1** | `0:00 – 0:30` | **The Hook & Problem** | Live Command Center & Right Safety Summary Panel |
| **Scene 2** | `0:30 – 0:55` | **"Unknown ≠ Safe" Engine** | Rapid Intake Page & Missing Vitals Preset |
| **Scene 3** | `0:55 – 1:30` | **The Hero Demo: Deterioration & Attention Gap** | Live Action Queue & "Simulate Vital Drop" |
| **Scene 4** | `1:30 – 1:55` | **Explainable AI & Clinician Governance** | Decision Rationale Modal & Override Audit Trail |
| **Scene 5** | `1:55 – 2:25` | **Scalability: 3× Surge & Profiles** | 1-Click 🚨 3× Surge Mode & Hospital Profile Toggle |
| **Scene 6** | `2:25 – 2:45` | **Measurable Impact & Closing** | Empirical Evaluation Matrix Page & GitHub Outro |

---

## 🎙️ Complete Shot-by-Shot Video Script

---

### 📍 Scene 1: The Problem & The Core Hook (`0:00 – 0:30`)
- **Visual on Screen:**  
  Start on the **Live Command Center** (`http://localhost:5173`). Show the crisp 3-zone cockpit: Left navigation rail, Center Live Action Queue, and Right persistent Safety Summary Panel.
- **Presenter Action:**  
  Mouse slowly hovers over the header showing `● Monitoring 20 patients` and points to the waiting room census.
- **Voiceover (Audio Track):**  
  > *"Welcome to PatientTriage.ai. In emergency medicine today, triage is treated as a one-time snapshot at the front door. But patients wait for hours, and risk continuously changes.*  
  >  
  > *Traditional static systems fail because they only ask: 'Who was the sickest when they arrived?'  
  > PatientTriage.ai shifts the paradigm to answer: **'Who is no longer safe to keep waiting?'**"*

---

### 📍 Scene 2: Uncertainty-as-Risk — "Unknown is NOT Safe" (`0:30 – 0:55`)
- **Visual on Screen:**  
  Click **Rapid Intake** on the left sidebar. Click the demo preset button: **`⚠️ Incomplete Vitals (Missing SpO₂ & BP)`**.
- **Presenter Action:**  
  Show the rapid intake form populate with missing vitals, and click **Assess & Admit to Waiting Queue**.
- **Voiceover (Audio Track):**  
  > *"Traditional systems make a fatal assumption: if a vital sign is missing, they default to low urgency and assume the patient is safe.*  
  >  
  > *In PatientTriage.ai, our Uncertainty-as-Risk Engine enforces the principle that **Unknown is NOT Safe**. Missing oxygen saturation or zero prior history immediately penalizes confidence, prevents false reassurance, and assigns a mandatory Next-Best-Action: **[ ACQUIRE VITALS ]**."*

---

### 📍 Scene 3: The Killer Feature — Deterioration & Attention Gap (`0:55 – 1:30`)
- **Visual on Screen:**  
  Navigate back to **Command Center**. Point out patient **`P-002`** (Marcus Vance — Attended STEMI with a doctor) vs. patient **`P-017`** (Grace Hopper — Unattended viral pneumonia in the waiting room).
- **Presenter Action:**  
  Click the **`⚡ Simulate Vital Drop`** button on **`P-017`**.  
  Watch `P-017`'s SpO₂ drop from $96\% \rightarrow 89\%$, and see `P-017` dynamically surge straight to **Rank #1** in the Live Action Queue with `🔴 RAPID DETERIORATION` and action `[ REASSESS NOW ]`.
- **Voiceover (Audio Track):**  
  > *"Here is our core differentiator: The **Attention Gap Engine**.*  
  >  
  > *Notice Patient P-002 is a critical cardiac case, but is already attended by an emergency physician. Meanwhile, Patient P-017 is waiting unmonitored with pneumonia.*  
  >  
  > *When we simulate a sudden drop in oxygen saturation—from 96% down to 89%—our continuous delta analyzer instantly detects the negative trajectory velocity.  
  > The Attention Gap formula balances clinical need against active coverage, dynamically elevating the unattended deteriorating patient to Rank Number 1 with an immediate **[ REASSESS NOW ]** directive."*

---

### 📍 Scene 4: Explainable AI & Human Governance (`1:30 – 1:55`)
- **Visual on Screen:**  
  Click the **`🔍 Info`** icon on `P-017` to open the **Decision Explainability Modal**. Then open patient dossier and click **`🛡️ Override`**.
- **Presenter Action:**  
  Show the plain-English physiological rationale. In the override modal, show the Counterfactual Downgrade Safety check and enter a mandatory clinical rationale. Then click **Audit Ledger** on the sidebar to show the tamper-evident entry.
- **Voiceover (Audio Track):**  
  > *"Crucially, AI never operates as an opaque black box. Clicking explainability displays exact physiological velocity and staleness contributors.*  
  >  
  > *Furthermore, licensed clinicians maintain 100% governance. Our Counterfactual Downgrade Guardrail blocks unsafe de-escalation without objective proof of stability, and all overrides require mandatory rationale logged to an append-only audit ledger."*

---

### 📍 Scene 5: Scalability — 🚨 3× Surge Mode & Hospital Profiles (`1:55 – 2:25`)
- **Visual on Screen:**  
  Click **`🚨 Simulate 3× Surge`** in the top header.  
  Show the census expand from 20 to 60 patients, and show the UI compress into a focused **Top Action Priority Queue**.
- **Presenter Action:**  
  Navigate to **About & Scoring** page and toggle between **Level-1 Academic Trauma Center** and **Community Rural Clinic**.
- **Voiceover (Audio Track):**  
  > *"To prove enterprise scalability, PatientTriage.ai features a live **3× Surge Mode Simulator** for disaster mass-casualty events.*  
  >  
  > *With one click, volume expands from 20 to 60 patients. Instead of flooding staff with alarm fatigue, the system compresses into a high-yield Action Queue.*  
  >  
  > *The architecture also adapts across hospital profiles—from Level-1 Trauma Centers with tight 15-minute staleness windows to Rural Clinics with automated telemedicine dispatch."*

---

### 📍 Scene 6: Measurable Impact & Outro (`2:25 – 2:45`)
- **Visual on Screen:**  
  Navigate to **Baseline vs AI Impact** (`EvaluationPage.jsx`). Show the side-by-side evaluation table.
- **Presenter Action:**  
  Point to the $100\%$ deterioration detection rate and zero unmonitored stale waits. Transition to closing title card with GitHub link.
- **Voiceover (Audio Track):**  
  > *"Across 20 synthetic clinical benchmark scenarios, PatientTriage.ai achieved a 100% deterioration detection rate and completely eliminated unmonitored stale waits.*  
  >  
  > *Built with Python 3.13, FastAPI, and React 19, PatientTriage.ai is open-source, air-gapped, and ready for deployment.*  
  >  
  > *Thank you—because **Triage is a snapshot. Risk isn't.**"*

---

## 🛠️ Video Recording & Compression Guidelines (< 20 MB)

To ensure your recording stays well below the 20 MB competition limit while maintaining crystal-clear text readability:

### Recommended OBS / Screen Recorder Settings:
- **Resolution**: 1920 × 1080 (or 1280 × 720)
- **Framerate**: 30 fps
- **Video Bitrate**: 800–1200 kbps (H.264)
- **Audio Bitrate**: 128 kbps (AAC)
- **Expected File Size**: ~12 MB to 16 MB for a 2.5-minute video.

### 1-Command FFmpeg Compression (If needed):
If your raw recorded video is over 20 MB, run this command to compress it to ~12 MB without losing text sharpness:
```bash
ffmpeg -i raw_demo.mp4 -vcodec libx264 -crf 24 -preset fast -acodec aac -b:a 128k PatientTriage_Demo_Accenture.mp4
```
