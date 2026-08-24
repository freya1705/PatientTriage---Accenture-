"""
Deterministic Safety Red-Flag Guardrails for PatientTriage.ai
Bypasses heuristic/ML scores whenever hard clinical red-flags are detected.
"""

from typing import Dict, Any, Optional, Tuple, List

def check_deterministic_safety_red_flags(
    age: int,
    chief_complaint: str,
    symptoms: List[str],
    vitals: Dict[str, Any]
) -> Tuple[bool, Optional[int], List[str]]:
    """
    Checks for immediate life-threatening physiological states or high-risk syndromes.
    Returns:
    - triggered: bool
    - mandatory_level: Optional[int] (1 for Immediate, 2 for Emergency)
    - reasons: List[str]
    """
    complaint_lower = (chief_complaint or "").lower()
    symptoms_lower = [s.lower() for s in (symptoms or [])]
    all_text = complaint_lower + " " + " ".join(symptoms_lower)

    reasons = []

    hr = vitals.get("heart_rate")
    sbp = vitals.get("systolic_bp")
    spo2 = vitals.get("spo2")
    rr = vitals.get("resp_rate")

    # 1. Immediate Resuscitation Red Flags (Level 1)
    if spo2 is not None and spo2 < 85:
        reasons.append("Critical hypoxia (SpO₂ < 85%) requiring emergent airway/oxygenation")
    if sbp is not None and sbp < 75 and age >= 16:
        reasons.append(f"Profound shock state (SBP {sbp} mmHg < 75)")
    if hr is not None and (hr > 170 or hr < 35):
        reasons.append(f"Extreme cardiac decompensation / peri-arrest rhythm hazard (HR {hr} bpm)")
    if "unresponsive" in all_text or "cardiac arrest" in all_text or "severe polytrauma" in all_text or "apnea" in all_text:
        reasons.append("Clinical presentation indicates unresponsiveness or extreme trauma collapse")

    if reasons:
        return True, 1, reasons

    # 2. Emergent Red Flags (Level 2)
    # Pediatric stridor / severe retractions
    if age < 16 and ("stridor" in all_text or "barking cough" in all_text or "retractions" in all_text):
        reasons.append("Pediatric upper airway compromise / stridor detected")

    # Acute Coronary Syndrome indicators
    if ("chest pain" in all_text or "chest pressure" in all_text) and (
        "radiat" in all_text or "diaphor" in all_text or "sweat" in all_text or age >= 50 or "shortness of breath" in all_text
    ):
        reasons.append("High-probability Acute Coronary Syndrome (ACS) presentation with radiating pain/diaphoresis")

    # Stroke / Acute Neurological Deficit (FAST signs)
    if "stroke" in all_text or "facial droop" in all_text or "arm weakness" in all_text or "slurred speech" in all_text or "sudden numbness" in all_text:
        reasons.append("Acute neurological deficit meeting acute stroke protocol criteria")

    # Anaphylaxis
    if ("lip swelling" in all_text or "tongue swelling" in all_text or "hives" in all_text) and ("short of breath" in all_text or "wheez" in all_text):
        reasons.append("Suspected systemic anaphylaxis with airway/breathing involvement")

    # Severe respiratory distress
    if (rr is not None and rr >= 32) or (spo2 is not None and spo2 < 90):
        reasons.append(f"Severe respiratory compromise (RR {rr}, SpO₂ {spo2}%)")

    # SBP Shock in elderly
    if age >= 65 and sbp is not None and sbp < 90:
        reasons.append(f"Geriatric acute hypoperfusion/shock (SBP {sbp} mmHg < 90)")

    if reasons:
        return True, 2, reasons

    return False, None, []
