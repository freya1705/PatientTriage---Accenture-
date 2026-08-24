"""
Uncertainty and Data Quality Engine for PatientTriage.ai
Core Principle: "Unknown is NOT Safe."
Missing information penalizes confidence and enforces safe escalation / verification.
"""

from typing import Dict, Any, List, Tuple

def evaluate_uncertainty_and_confidence(
    vitals: Dict[str, Any],
    has_medical_history: bool,
    chief_complaint: str,
    symptoms: List[str],
    pain_score: int,
    vital_abnormality_score: float
) -> Tuple[float, float, List[str], bool, str]:
    """
    Evaluates missing fields, data quality, and symptom discordance.
    Returns:
    - uncertainty_score: float (0.0 to 100.0)
    - confidence_score: float (0.0 to 100.0)
    - uncertainty_reasons: List[str]
    - is_uncertain: bool
    - safe_action_modifier: str
    """
    uncertainty = 0.0
    reasons = []

    # 1. Missing Critical Vitals
    critical_vitals = ["spo2", "systolic_bp", "heart_rate", "resp_rate"]
    missing_critical = [v for v in critical_vitals if vitals.get(v) is None]

    if "spo2" in missing_critical:
        uncertainty += 22.0
        reasons.append("Critical vital missing: SpO₂ (cannot rule out silent hypoxia)")
    if "systolic_bp" in missing_critical:
        uncertainty += 20.0
        reasons.append("Critical vital missing: Blood Pressure (shock/hypoperfusion unconfirmed)")
    if "heart_rate" in missing_critical:
        uncertainty += 15.0
        reasons.append("Critical vital missing: Heart Rate")
    if "resp_rate" in missing_critical:
        uncertainty += 12.0
        reasons.append("Vital missing: Respiratory Rate")

    # 2. Medical History Availability (Round 2 specific: 50% mixed history)
    if not has_medical_history:
        uncertainty += 18.0
        reasons.append("Zero medical history on file (first-time patient / unconfirmed comorbidities/allergies)")

    # 3. Clinical Discordance & Ambiguous Presentation Checks
    complaint_lower = (chief_complaint or "").lower()
    symptoms_str = " ".join((symptoms or [])).lower()

    # Discordance 1: Severe reported pain (9-10/10) with completely normal vitals
    if pain_score >= 8 and vital_abnormality_score < 5.0:
        uncertainty += 12.0
        reasons.append("Clinical discordance: Severe subjective pain (8-10/10) with normal autonomic baseline vitals")

    # Discordance 2: Low reported pain (0-2/10) with marked vital abnormalities (silent ischemia/diabetic neuropathy)
    if pain_score <= 2 and vital_abnormality_score >= 15.0:
        uncertainty += 16.0
        reasons.append("High-risk discordance: Minimal pain reported despite significant vital sign derangement (potential under-reporting / silent shock)")

    # Discordance 3: Ambiguous constitutional presentation (e.g. fatigue, dizziness, nausea)
    ambiguous_keywords = ["fatigue", "general malaise", "weakness", "dizziness", "nausea", "not feeling right", "unwell"]
    is_ambiguous = any(kw in complaint_lower or kw in symptoms_str for kw in ambiguous_keywords)
    if is_ambiguous and len(symptoms or []) <= 2:
        uncertainty += 14.0
        reasons.append("Ambiguous non-specific presentation with high overlap across benign and occult critical conditions")

    # Bound uncertainty to 0 - 85%
    uncertainty_score = min(85.0, uncertainty)
    confidence_score = max(15.0, 100.0 - uncertainty_score)

    is_uncertain = confidence_score < 65.0 or len(missing_critical) > 0

    # Determine safe action modifier based on uncertainty
    safe_action_modifier = ""
    if is_uncertain:
        if "spo2" in missing_critical or "systolic_bp" in missing_critical:
            safe_action_modifier = "VERIFY_CRITICAL_VITALS"
        elif not has_medical_history:
            safe_action_modifier = "EXPEDITE_INITIAL_CLINICAL_VERIFICATION"
        else:
            safe_action_modifier = "REASSESS_AMBIGUOUS_SYMPTOMS"

    return uncertainty_score, confidence_score, reasons, is_uncertain, safe_action_modifier
