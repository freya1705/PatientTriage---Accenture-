"""
Dynamic Confidence Decay & Safety Expiry Engine for PatientTriage.ai
Core Innovation:
"A patient is NOT permanently safe to wait. Safety must be continuously re-earned through fresh observation."
"""

from typing import Dict, Any, Tuple

DEFAULT_REASSESSMENT_WINDOWS = {
    1: 5,    # Level 1: Every 5 minutes
    2: 15,   # Level 2: Every 15 minutes
    3: 30,   # Level 3: Every 30 minutes
    4: 60,   # Level 4: Every 60 minutes
    5: 120   # Level 5: Every 120 minutes
}

def calculate_safety_staleness_and_decay(
    triage_level: int,
    base_confidence: float,
    elapsed_minutes_since_vital: int,
    total_waiting_minutes: int,
    custom_reassessment_window: int = None
) -> Tuple[float, str, float, bool, int]:
    """
    Calculates time-decayed confidence and safety expiry state.
    Returns:
    - current_confidence: float (0.0 to 100.0)
    - safety_status: str ("VALID", "EXPIRING_SOON", "EXPIRED")
    - staleness_score: float (0.0 to 35.0, added to Action Priority)
    - is_expired: bool
    - minutes_until_expiry: int
    """
    max_window = custom_reassessment_window or DEFAULT_REASSESSMENT_WINDOWS.get(triage_level, 30)
    minutes_until_expiry = max_window - elapsed_minutes_since_vital

    # Decay formula: Confidence decays steadily as observations become stale
    # At elapsed == max_window, confidence has lost ~40-50% of its initial value
    decay_factor = max(0.20, 1.0 - (elapsed_minutes_since_vital / (max_window * 1.5)) * 0.65)
    current_confidence = round(base_confidence * decay_factor, 1)

    # Staleness Score for Action Queue
    if elapsed_minutes_since_vital >= max_window:
        safety_status = "EXPIRED"
        is_expired = True
        # Scales upward the longer they have exceeded safety window
        overdue_mins = elapsed_minutes_since_vital - max_window
        staleness_score = min(35.0, 20.0 + (overdue_mins * 0.5))
    elif minutes_until_expiry <= 5:
        safety_status = "EXPIRING_SOON"
        is_expired = False
        staleness_score = 12.0
    else:
        safety_status = "VALID"
        is_expired = False
        staleness_score = max(0.0, (elapsed_minutes_since_vital / max_window) * 8.0)

    return current_confidence, safety_status, round(staleness_score, 1), is_expired, minutes_until_expiry
