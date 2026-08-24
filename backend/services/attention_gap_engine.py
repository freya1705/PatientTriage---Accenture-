"""
Attention Gap Engine & Live Action Queue Re-Ranker for PatientTriage.ai
Core Innovation:
"We don't rank patients only by who is sickest.
We prioritize the most dangerous gap between Patient Need and Current Clinical Attention."
"""

from typing import Dict, Any, List

def compute_patient_action_priority(
    patient: Dict[str, Any],
    surge_mode: bool = False
) -> Dict[str, Any]:
    """
    Computes dynamic action priority score and recommended next clinical intervention.
    """
    triage_level = patient.get("triage_level", 3)
    base_risk = patient.get("risk_score", 50.0)
    deterioration_score = patient.get("deterioration_score", 0.0)
    staleness_score = patient.get("staleness_score", 0.0)
    uncertainty_score = patient.get("uncertainty_score", 0.0)
    is_uncertain = patient.get("is_uncertain", False)
    total_waiting_mins = patient.get("total_waiting_mins", 0)
    is_attended = patient.get("is_attended", False)
    safety_status = patient.get("safety_status", "VALID")
    trajectory_status = patient.get("trajectory_status", "STABLE")

    # 1. Level-based baseline urgency weight
    level_weights = {1: 45.0, 2: 35.0, 3: 20.0, 4: 10.0, 5: 5.0}
    urgency_weight = level_weights.get(triage_level, 20.0)

    # 2. Wait Hazard Penalty (exponential after 45 mins)
    wait_hazard = min(25.0, (total_waiting_mins / 30.0) * 8.0)
    if total_waiting_mins > 60:
        wait_hazard += 10.0

    # 3. Clinical Coverage Offset
    # If a physician/nurse is currently assigned and actively managing the patient,
    # the urgency for the central triage queue to intervene is significantly reduced.
    coverage_discount = 45.0 if is_attended else 0.0

    # 4. Uncertainty Action Weight
    uncertainty_weight = (uncertainty_score * 0.25) if is_uncertain else 0.0

    # 5. Composite Action Priority Score
    action_priority_score = (
        (base_risk * 0.4) +
        urgency_weight +
        (deterioration_score * 1.2) +
        (staleness_score * 1.1) +
        wait_hazard +
        uncertainty_weight -
        coverage_discount
    )

    # Bound score
    action_priority_score = round(max(5.0, action_priority_score), 1)

    # 6. Next Action Recommendation & Action Badge
    reasons_why = []

    if trajectory_status in ["RAPID_DETERIORATION", "WORSENING"]:
        action_state = "🔴 REASSESS / ESCALATE NOW"
        action_badge = "ESCALATE"
        reasons_why.append(f"Vital signs deteriorating ({trajectory_status.replace('_', ' ')})")
    elif safety_status == "EXPIRED":
        action_state = "🔴 SAFETY EXPIRED — REASSESS NOW"
        action_badge = "REASSESS"
        reasons_why.append(f"Observation stale: elapsed waiting exceeded safety limit")
    elif is_uncertain:
        action_state = "⚠️ ACQUIRE VITALS & VERIFY"
        action_badge = "VERIFY"
        reasons_why.append("Missing critical data / unconfirmed clinical safety")
    elif triage_level == 1 and not is_attended:
        action_state = "🔴 IMMEDIATE RESUSCITATION NEEDED"
        action_badge = "IMMEDIATE"
        reasons_why.append("Level 1 critical patient currently unattended")
    elif is_attended:
        action_state = "🟢 CONTINUE DIRECT CARE"
        action_badge = "COVERED"
        reasons_why.append("Clinician currently assigned & actively providing care")
    elif safety_status == "EXPIRING_SOON":
        action_state = "🟡 SCHEDULED REASSESSMENT DUE"
        action_badge = "REASSESS_SOON"
        reasons_why.append("Safety window expiring within 5 minutes")
    else:
        action_state = "🟢 MONITOR IN QUEUE"
        action_badge = "CONTINUE"
        reasons_why.append("Patient stable within configured monitoring parameters")

    if not is_attended and triage_level <= 3:
        reasons_why.append("⚠️ Unattended in waiting room (Attention Gap)")

    return {
        "action_priority_score": action_priority_score,
        "action_state": action_state,
        "action_badge": action_badge,
        "primary_action_reason": reasons_why[0] if reasons_why else "Routine monitoring",
        "action_reasons": reasons_why
    }
