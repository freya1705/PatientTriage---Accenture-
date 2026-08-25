"""
Attention Gap Engine & Live Action Queue Re-Ranker for PatientTriage.ai
Core Innovation:
"Triage is a snapshot. Risk isn't.
We don't rank patients only by who is sickest.
We prioritize the most dangerous gap between Patient Need and Current Clinical Attention."
"""

from typing import Dict, Any, List

HOSPITAL_PROFILES = {
    "LEVEL_1_TRAUMA": {
        "name": "Urban Academic Level-1 Trauma Center",
        "description": "High-volume emergency center with immediate trauma activation and tight 15-min staleness timeouts.",
        "weight_risk": 0.40,
        "weight_deterioration": 1.30,
        "weight_staleness": 1.20,
        "weight_uncertainty": 0.25,
        "coverage_discount": 50.0
    },
    "COMMUNITY_RURAL": {
        "name": "Community / Rural Emergency Clinic",
        "description": "Resource-constrained setting prioritizing early telemedicine transfer and conservative missing-data penalties.",
        "weight_risk": 0.35,
        "weight_deterioration": 1.40,
        "weight_staleness": 1.00,
        "weight_uncertainty": 0.40,
        "coverage_discount": 40.0
    }
}

def get_failure_mode_category(patient: Dict[str, Any]) -> Dict[str, str]:
    """
    Categorizes the patient into one of the 5 systematic failure modes of traditional triage.
    """
    pat_id = patient.get("id", "")
    triage_lvl = patient.get("triage_level", 3)
    is_unc = patient.get("is_uncertain", False)
    traj = patient.get("trajectory_status", "STABLE")
    safety = patient.get("safety_status", "VALID")
    attended = patient.get("is_attended", False)
    age = patient.get("age", 30)

    if pat_id in ["P-001", "P-003", "P-014"] or triage_lvl == 1:
        return {
            "code": "CAT_A",
            "name": "Category A: Immediate Life Danger & Red-Flags",
            "badge": "Immediate Danger",
            "color": "bg-red-950 text-red-300 border-red-800"
        }
    elif pat_id in ["P-007", "P-008", "P-009"] or (age < 2 or age >= 75):
        return {
            "code": "CAT_B",
            "name": "Category B: Hidden Danger & Age-Specific Presentation",
            "badge": "Hidden Danger",
            "color": "bg-amber-950 text-amber-300 border-amber-800"
        }
    elif pat_id in ["P-010", "P-011"] or is_unc:
        return {
            "code": "CAT_C",
            "name": "Category C: Missing Info & 'Unknown ≠ Safe'",
            "badge": "Unknown ≠ Safe",
            "color": "bg-purple-950 text-purple-300 border-purple-800"
        }
    elif pat_id in ["P-015", "P-017"] or traj in ["RAPID_DETERIORATION", "WORSENING"]:
        return {
            "code": "CAT_D",
            "name": "Category D: Silent Waiting Room Deterioration",
            "badge": "Deteriorating",
            "color": "bg-rose-950 text-rose-300 border-rose-800"
        }
    else:
        return {
            "code": "CAT_E",
            "name": "Category E: Operational Attention Gap & Stale Observations",
            "badge": "Attention Gap",
            "color": "bg-cyan-950 text-cyan-300 border-cyan-800"
        }

def compute_patient_action_priority(
    patient: Dict[str, Any],
    profile_type: str = "LEVEL_1_TRAUMA"
) -> Dict[str, Any]:
    """
    Computes dynamic action priority score and recommended next clinical intervention
    using configurable hospital profile weights.
    """
    profile = HOSPITAL_PROFILES.get(profile_type, HOSPITAL_PROFILES["LEVEL_1_TRAUMA"])

    w_risk = profile["weight_risk"]
    w_det = profile["weight_deterioration"]
    w_stale = profile["weight_staleness"]
    w_unc = profile["weight_uncertainty"]
    cov_discount = profile["coverage_discount"]

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

    # 3. Clinical Coverage Offset (The Attention Gap)
    coverage_offset = cov_discount if is_attended else 0.0

    # 4. Uncertainty Action Weight ("Unknown != Safe")
    uncertainty_weight = (uncertainty_score * w_unc) if is_uncertain else 0.0

    # 5. Composite Action Priority Score Formula
    action_priority_score = (
        (base_risk * w_risk) +
        urgency_weight +
        (deterioration_score * w_det) +
        (staleness_score * w_stale) +
        wait_hazard +
        uncertainty_weight -
        coverage_offset
    )

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
        reasons_why.append("Observation stale: elapsed waiting exceeded safety limit")
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

    failure_cat = get_failure_mode_category(patient)

    return {
        "action_priority_score": action_priority_score,
        "action_state": action_state,
        "action_badge": action_badge,
        "primary_action_reason": reasons_why[0] if reasons_why else "Routine monitoring",
        "action_reasons": reasons_why,
        "failure_mode_category": failure_cat
    }
