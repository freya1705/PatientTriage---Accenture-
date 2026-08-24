"""
Counterfactual Downgrade Safety Check for PatientTriage.ai
Core Guardrail: "Escalation requires suspicion; Downgrading requires PROOF of safety."
"""

from typing import Dict, Any, List, Tuple

def verify_downgrade_safety(
    current_level: int,
    target_level: int,
    vital_history: List[Dict[str, Any]],
    elapsed_minutes_since_vital: int,
    confidence_score: float,
    is_red_flag: bool
) -> Tuple[bool, List[str]]:
    """
    Checks whether reducing triage urgency (e.g. Level 2 -> Level 3, 4, 5) is clinically safe.
    Returns:
    - is_allowed: bool
    - blocked_reasons: List[str]
    """
    # If not a downgrade (e.g. target_level <= current_level means maintaining or escalating urgency), always allow
    if target_level <= current_level:
        return True, []

    blocked_reasons = []

    # Check 1: Deterministic red flags cannot be overridden to low priority
    if is_red_flag and target_level > 2:
        blocked_reasons.append("Safety Guardrail: Active physiological red flag or high-risk complaint is present.")

    # Check 2: Must have recent vitals within last 15 minutes
    if elapsed_minutes_since_vital > 15:
        blocked_reasons.append(f"Stale Evidence: Last recorded vitals are {elapsed_minutes_since_vital} minutes old (must be < 15 min to downgrade).")

    # Check 3: Must have at least 2 vital readings showing stability
    if len(vital_history or []) < 2:
        blocked_reasons.append("Insufficient Trend: At least 2 consecutive vital sign recordings are required to confirm physiological stability.")
    else:
        # Check latest SpO2 and HR
        sorted_v = sorted(vital_history, key=lambda v: v.get("timestamp_mins", 0))
        latest = sorted_v[-1]
        prev = sorted_v[-2]
        if latest.get("spo2") and prev.get("spo2") and latest["spo2"] < prev["spo2"]:
            blocked_reasons.append(f"Downward Trajectory: SpO₂ is trending downward ({prev['spo2']}% → {latest['spo2']}%).")

    # Check 4: Assessment confidence must not be low/uncertain
    if confidence_score < 60.0:
        blocked_reasons.append(f"High Uncertainty: Current confidence is {confidence_score:.0f}%. Low confidence precludes safe downgrade.")

    is_allowed = len(blocked_reasons) == 0
    return is_allowed, blocked_reasons
