"""
Baseline Clinical Risk Engine & ESI 5-Level Triage Classifier for PatientTriage.ai
Combines age-adjusted vitals, symptom severity, medical history, guardrails, and uncertainty.
"""

from typing import Dict, Any, List, Optional
from .age_rules import evaluate_age_adjusted_vitals, get_age_group
from .safety_guardrails import check_deterministic_safety_red_flags
from .uncertainty_engine import evaluate_uncertainty_and_confidence

HIGH_RISK_COMPLAINTS = {
    "chest pain": 28.0,
    "shortness of breath": 26.0,
    "difficulty breathing": 26.0,
    "severe abdominal pain": 20.0,
    "severe headache": 18.0,
    "syncope": 22.0,
    "seizure": 24.0,
    "head injury": 22.0,
    "poisoning": 25.0,
    "acute confusion": 24.0,
    "high fever": 16.0,
    "uncontrolled bleeding": 25.0,
    "asthma flare-up": 22.0,
    "allergic reaction": 22.0,
    "diabetic crisis": 24.0,
    "septic shock suspicion": 28.0,
    "polytrauma": 30.0
}

MODERATE_RISK_COMPLAINTS = {
    "moderate abdominal pain": 14.0,
    "vomiting": 12.0,
    "flank pain": 14.0,
    "laceration": 10.0,
    "fever": 12.0,
    "dizziness": 12.0,
    "mild shortness of breath": 15.0,
    "asthma": 16.0,
    "wheezing": 16.0,
    "wheeze": 16.0,
    "palpitations": 14.0,
    "burn": 15.0
}

LOW_RISK_COMPLAINTS = {
    "ankle sprain": 5.0,
    "wrist injury": 5.0,
    "sore throat": 4.0,
    "mild rash": 4.0,
    "prescription refill": 2.0,
    "earache": 5.0,
    "chronic joint pain": 6.0,
    "minor abrasion": 3.0,
    "suture removal": 2.0,
    "mild cough": 5.0,
    "routine check": 2.0
}

def calculate_triage_assessment(
    age: int,
    chief_complaint: str,
    symptoms: List[str],
    vitals: Dict[str, Any],
    pain_score: int = 0,
    has_medical_history: bool = True,
    medical_history: Optional[List[str]] = None,
    injury_mechanism: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes a comprehensive initial triage assessment.
    Returns:
    - triage_level: int (1 to 5)
    - triage_category: str ("Level 1 — Immediate", etc.)
    - risk_score: float (0.0 to 100.0)
    - confidence_score: float (0.0 to 100.0)
    - uncertainty_score: float (0.0 to 100.0)
    - is_uncertain: bool
    - age_group: str
    - reasons: List[str]
    - uncertainty_reasons: List[str]
    - recommended_action: str
    - is_red_flag: bool
    """
    age_group = get_age_group(age)
    reasons = []

    # Step 1: Check Deterministic Safety Red Flags
    is_red_flag, red_flag_level, red_flag_reasons = check_deterministic_safety_red_flags(
        age=age,
        chief_complaint=chief_complaint,
        symptoms=symptoms,
        vitals=vitals
    )

    # Step 2: Age-Adjusted Vitals Abnormality Score (0-40)
    vital_score, vital_alerts, vital_flags = evaluate_age_adjusted_vitals(age, vitals)
    reasons.extend(vital_alerts)

    # Step 3: Symptom & Complaint Severity Score (0-30)
    complaint_lower = (chief_complaint or "").lower().strip()
    complaint_score = 10.0  # default baseline

    matched_complaint = False
    for comp, weight in HIGH_RISK_COMPLAINTS.items():
        if comp in complaint_lower:
            complaint_score = max(complaint_score, weight)
            matched_complaint = True
            reasons.append(f"High-risk chief complaint: '{chief_complaint}' (+{weight:.0f} risk)")
            break

    if not matched_complaint:
        for comp, weight in MODERATE_RISK_COMPLAINTS.items():
            if comp in complaint_lower:
                complaint_score = max(complaint_score, weight)
                matched_complaint = True
                reasons.append(f"Moderate-risk chief complaint: '{chief_complaint}'")
                break

    if not matched_complaint:
        for comp, weight in LOW_RISK_COMPLAINTS.items():
            if comp in complaint_lower:
                complaint_score = min(complaint_score, weight)
                matched_complaint = True
                break

    # Add symptom count bonus
    symptom_bonus = min(len(symptoms or []) * 2.0, 8.0)
    complaint_score = min(30.0, complaint_score + symptom_bonus)

    # Step 4: Medical History & Comorbidity Risk (0-15)
    history_score = 0.0
    if has_medical_history and medical_history:
        high_risk_history = ["copd", "chf", "coronary artery disease", "diabetes", "ckd", "cancer", "immunocompromised", "stroke"]
        found_conditions = []
        for cond in medical_history:
            if any(h in cond.lower() for h in high_risk_history):
                found_conditions.append(cond)
                history_score += 4.5

        history_score = min(15.0, history_score)
        if found_conditions:
            reasons.append(f"Relevant comorbidities: {', '.join(found_conditions)} (+{history_score:.0f} vulnerability)")

    # Step 5: Pain & Vulnerability (0-15)
    pain_vuln_score = 0.0
    if pain_score >= 7:
        pain_vuln_score += 5.0
    if age_group == "Geriatric" or (age_group == "Pediatric" and age < 2):
        pain_vuln_score += 6.0
        reasons.append(f"{age_group} vulnerability weighting active")

    if injury_mechanism and ("high speed" in injury_mechanism.lower() or "fall >" in injury_mechanism.lower() or "rollover" in injury_mechanism.lower()):
        pain_vuln_score += 8.0
        reasons.append(f"High-energy injury mechanism: {injury_mechanism}")

    pain_vuln_score = min(15.0, pain_vuln_score)

    # Step 6: Total Continuous Risk (0-100)
    raw_risk = vital_score + complaint_score + history_score + pain_vuln_score
    calculated_risk = min(100.0, max(5.0, raw_risk))

    # Step 7: Uncertainty Assessment
    uncertainty_score, confidence_score, uncertainty_reasons, is_uncertain, action_mod = evaluate_uncertainty_and_confidence(
        vitals=vitals,
        has_medical_history=has_medical_history,
        chief_complaint=chief_complaint,
        symptoms=symptoms,
        pain_score=pain_score,
        vital_abnormality_score=vital_score
    )

    # Step 8: ESI 5-Level Mapping with Safety Guardrails & Uncertainty Bias
    if is_red_flag and red_flag_level is not None:
        triage_level = red_flag_level
        reasons = red_flag_reasons + reasons
        calculated_risk = max(calculated_risk, 85.0 if triage_level == 1 else 70.0)
    else:
        if calculated_risk >= 75.0:
            triage_level = 1
        elif calculated_risk >= 50.0:
            triage_level = 2
        elif calculated_risk >= 28.0:
            triage_level = 3
        elif calculated_risk >= 14.0:
            triage_level = 4
        else:
            triage_level = 5

        # ASYMMETRIC SAFETY BIAS:
        # If model would assign Level 4 or Level 5, but data is highly uncertain or missing vital,
        # escalate to Level 3 / require verification. "Unknown != Safe".
        if triage_level in [4, 5] and is_uncertain:
            triage_level = 3
            reasons.append("⚠️ Asymmetric Safety Guardrail: Escalated from Low/Moderate to Urgent due to missing data / high uncertainty")

    category_map = {
        1: "Level 1 — Resuscitation / Immediate",
        2: "Level 2 — Emergent / High Risk",
        3: "Level 3 — Urgent",
        4: "Level 4 — Less Urgent",
        5: "Level 5 — Non-Urgent"
    }

    # Generate next best recommended action
    if triage_level == 1:
        recommended_action = "CRITICAL RESUSCITATION: Mobilize trauma/code team to Resus Bay 1 immediately."
    elif triage_level == 2:
        recommended_action = "EMERGENT CARE: Place in monitored bed immediately; continuous SpO₂ and ECG."
    elif is_uncertain:
        if action_mod == "VERIFY_CRITICAL_VITALS":
            recommended_action = "ACQUIRE VITALS: Missing critical parameters; complete bedside vitals immediately."
        elif action_mod == "EXPEDITE_INITIAL_CLINICAL_VERIFICATION":
            recommended_action = "VERIFY HISTORY: Zero prior records; conduct rapid physician intake check."
        else:
            recommended_action = "AMBIGUOUS SYMPTOM CHECK: Reassess patient at bedside to clarify trajectory."
    elif triage_level == 3:
        recommended_action = "URGENT WORKUP: Assign acute cubicle; initiate standard labs/imaging."
    elif triage_level == 4:
        recommended_action = "SEMI-URGENT: Fast-track care area; reassess within 60 minutes."
    else:
        recommended_action = "ROUTINE CARE: Non-urgent fast-track queue; re-evaluate if symptoms change."

    return {
        "triage_level": triage_level,
        "triage_category": category_map[triage_level],
        "risk_score": round(calculated_risk, 1),
        "confidence_score": round(confidence_score, 1),
        "uncertainty_score": round(uncertainty_score, 1),
        "is_uncertain": is_uncertain,
        "age_group": age_group,
        "reasons": reasons,
        "uncertainty_reasons": uncertainty_reasons,
        "recommended_action": recommended_action,
        "is_red_flag": is_red_flag,
        "vital_flags": vital_flags,
        "action_modifier": action_mod
    }
