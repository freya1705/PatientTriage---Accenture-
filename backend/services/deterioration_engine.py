"""
Vital Trend & Deterioration Detection Engine for PatientTriage.ai
Tracks vital trajectories over time, detects silent decompensation, and triggers dynamic alerts.
"""

from typing import List, Dict, Any, Tuple

def analyze_vital_deterioration(vital_history: List[Dict[str, Any]]) -> Tuple[float, str, List[str], bool]:
    """
    Analyzes consecutive vital readings to detect deterioration or improvement.
    Returns:
    - deterioration_score: float (0.0 to 50.0)
    - trajectory_status: str ("RAPID_DETERIORATION", "WORSENING", "STABLE", "IMPROVING")
    - deterioration_reasons: List[str]
    - is_deteriorating: bool
    """
    if not vital_history or len(vital_history) < 2:
        return 0.0, "STABLE", [], False

    # Sort chronological
    sorted_vitals = sorted(vital_history, key=lambda v: v.get("timestamp_mins", 0))
    latest = sorted_vitals[-1]
    prev = sorted_vitals[-2]

    score = 0.0
    reasons = []

    # 1. SpO2 Trend Analysis
    curr_spo2 = latest.get("spo2")
    prev_spo2 = prev.get("spo2")
    if curr_spo2 is not None and prev_spo2 is not None:
        delta_spo2 = curr_spo2 - prev_spo2
        if delta_spo2 <= -5 or (curr_spo2 < 90 and prev_spo2 >= 90):
            score += 25.0
            reasons.append(f"Critical SpO₂ desaturation: {prev_spo2}% → {curr_spo2}% (Δ {delta_spo2}%)")
        elif delta_spo2 <= -3:
            score += 15.0
            reasons.append(f"SpO₂ downward trend: {prev_spo2}% → {curr_spo2}% (Δ {delta_spo2}%)")
        elif delta_spo2 >= 3:
            score -= 5.0

    # 2. Heart Rate Trend Analysis
    curr_hr = latest.get("heart_rate")
    prev_hr = prev.get("heart_rate")
    if curr_hr is not None and prev_hr is not None:
        delta_hr = curr_hr - prev_hr
        if delta_hr >= 30 or (curr_hr > 130 and prev_hr <= 100):
            score += 20.0
            reasons.append(f"Rapid heart rate acceleration: {prev_hr} → {curr_hr} bpm (Δ +{delta_hr} bpm)")
        elif delta_hr >= 18:
            score += 10.0
            reasons.append(f"Tachycardia progression: {prev_hr} → {curr_hr} bpm")
        elif delta_hr <= -30 and curr_hr < 50:
            score += 22.0
            reasons.append(f"Profound bradycardia drop: {prev_hr} → {curr_hr} bpm (peri-arrest warning)")

    # 3. Blood Pressure Trend Analysis
    curr_sbp = latest.get("systolic_bp")
    prev_sbp = prev.get("systolic_bp")
    if curr_sbp is not None and prev_sbp is not None:
        delta_sbp = curr_sbp - prev_sbp
        if delta_sbp <= -25 or (curr_sbp < 90 and prev_sbp >= 105):
            score += 22.0
            reasons.append(f"Acute blood pressure collapse: SBP {prev_sbp} → {curr_sbp} mmHg (Δ {delta_sbp} mmHg)")
        elif delta_sbp <= -15:
            score += 12.0
            reasons.append(f"Systolic BP dropping: {prev_sbp} → {curr_sbp} mmHg")

    # 4. Respiratory Rate Trend Analysis
    curr_rr = latest.get("resp_rate")
    prev_rr = prev.get("resp_rate")
    if curr_rr is not None and prev_rr is not None:
        delta_rr = curr_rr - prev_rr
        if delta_rr >= 8 or curr_rr >= 30:
            score += 16.0
            reasons.append(f"Respiratory rate worsening: {prev_rr} → {curr_rr}/min")

    deterioration_score = max(0.0, min(50.0, score))
    is_deteriorating = deterioration_score >= 12.0

    if deterioration_score >= 25.0:
        trajectory_status = "RAPID_DETERIORATION"
    elif deterioration_score >= 12.0:
        trajectory_status = "WORSENING"
    elif score < -5.0:
        trajectory_status = "IMPROVING"
    else:
        trajectory_status = "STABLE"

    return deterioration_score, trajectory_status, reasons, is_deteriorating
