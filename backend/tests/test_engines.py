"""
Unit tests for PatientTriage.ai Core Intelligence Engines.
Validates all Accenture Round 2 requirements.
"""

import pytest
from backend.services.age_rules import evaluate_age_adjusted_vitals, get_age_group
from backend.services.safety_guardrails import check_deterministic_safety_red_flags
from backend.services.uncertainty_engine import evaluate_uncertainty_and_confidence
from backend.services.risk_engine import calculate_triage_assessment
from backend.services.deterioration_engine import analyze_vital_deterioration
from backend.services.safety_expiry_engine import calculate_safety_staleness_and_decay
from backend.services.downgrade_guard import verify_downgrade_safety
from backend.services.attention_gap_engine import compute_patient_action_priority

def test_age_group_classification():
    assert get_age_group(3) == "Pediatric"
    assert get_age_group(15) == "Pediatric"
    assert get_age_group(35) == "Adult"
    assert get_age_group(65) == "Geriatric"
    assert get_age_group(82) == "Geriatric"

def test_pediatric_fever_vs_adult():
    # 1yo with 38.6 C fever vs 35yo with 38.6 C fever
    ped_vitals = {"temperature": 38.6, "heart_rate": 145, "resp_rate": 36}
    ped_score, ped_alerts, _ = evaluate_age_adjusted_vitals(1, ped_vitals)
    
    adult_vitals = {"temperature": 38.6, "heart_rate": 88, "resp_rate": 16}
    adult_score, adult_alerts, _ = evaluate_age_adjusted_vitals(35, adult_vitals)
    
    assert ped_score > adult_score
    assert any("Pediatric high fever in toddler" in a for a in ped_alerts)

def test_geriatric_hypothermia_sepsis_warning():
    ger_vitals = {"temperature": 35.7, "heart_rate": 105, "systolic_bp": 96}
    score, alerts, flags = evaluate_age_adjusted_vitals(78, ger_vitals)
    assert flags.get("temperature") == "critical"
    assert any("Geriatric hypothermia" in a for a in alerts)

def test_uncertainty_penalty_for_missing_vitals_and_zero_history():
    vitals_missing_spo2 = {"heart_rate": 85, "systolic_bp": 120}
    unc_score, conf_score, reasons, is_unc, action_mod = evaluate_uncertainty_and_confidence(
        vitals=vitals_missing_spo2,
        has_medical_history=False,
        chief_complaint="Dizziness and fatigue",
        symptoms=["Fatigue"],
        pain_score=2,
        vital_abnormality_score=5.0
    )
    assert is_unc is True
    assert conf_score < 65.0
    assert any("SpO₂" in r for r in reasons)
    assert any("Zero medical history" in r for r in reasons)

def test_asymmetric_safety_bias_on_uncertainty():
    # Patient with mild complaint but missing SpO2 and no history
    assessment = calculate_triage_assessment(
        age=45,
        chief_complaint="Mild dizziness",
        symptoms=["Dizziness"],
        vitals={"heart_rate": 90},  # Missing BP, SpO2, RR
        pain_score=2,
        has_medical_history=False
    )
    # Even if complaint is mild, cannot be Level 5 / Less urgent without vitals
    assert assessment["triage_level"] <= 3
    assert assessment["is_uncertain"] is True

def test_vital_deterioration_detection():
    history = [
        {"timestamp_mins": 0, "spo2": 96, "heart_rate": 92},
        {"timestamp_mins": 15, "spo2": 93, "heart_rate": 105},
        {"timestamp_mins": 25, "spo2": 89, "heart_rate": 120}
    ]
    det_score, status, reasons, is_det = analyze_vital_deterioration(history)
    assert is_det is True
    assert status in ["WORSENING", "RAPID_DETERIORATION"]
    assert any("Critical SpO₂ desaturation" in r for r in reasons)

def test_safety_expiry_and_confidence_decay():
    # Level 3 triage patient whose last vitals were taken 48 minutes ago (max window = 30 mins)
    curr_conf, safety_status, staleness_score, is_exp, mins_left = calculate_safety_staleness_and_decay(
        triage_level=3,
        base_confidence=85.0,
        elapsed_minutes_since_vital=48,
        total_waiting_minutes=48
    )
    assert is_exp is True
    assert safety_status == "EXPIRED"
    assert mins_left < 0
    assert curr_conf < 85.0
    assert staleness_score >= 20.0

def test_counterfactual_downgrade_guard():
    # Attempting to downgrade Level 2 patient to Level 4 without recent vitals
    is_allowed, reasons = verify_downgrade_safety(
        current_level=2,
        target_level=4,
        vital_history=[{"timestamp_mins": 0, "spo2": 92}],
        elapsed_minutes_since_vital=35,
        confidence_score=50.0,
        is_red_flag=False
    )
    assert is_allowed is False
    assert any("Stale Evidence" in r for r in reasons)
    assert any("Insufficient Trend" in r for r in reasons)

def test_attention_gap_priority_ranking():
    # Patient A: Critical Level 2, but DOCTOR IS CURRENTLY ATTENDING
    patient_a = {
        "id": "P-002",
        "triage_level": 2,
        "risk_score": 75.0,
        "deterioration_score": 0.0,
        "staleness_score": 5.0,
        "uncertainty_score": 10.0,
        "is_uncertain": False,
        "total_waiting_mins": 10,
        "is_attended": True,
        "safety_status": "VALID",
        "trajectory_status": "STABLE"
    }
    score_a = compute_patient_action_priority(patient_a)

    # Patient B: Level 3 initial, but UNATTENDED, SpO2 DROPPING, SAFETY EXPIRED
    patient_b = {
        "id": "P-017",
        "triage_level": 3,
        "risk_score": 60.0,
        "deterioration_score": 25.0,
        "staleness_score": 22.0,
        "uncertainty_score": 15.0,
        "is_uncertain": False,
        "total_waiting_mins": 35,
        "is_attended": False,
        "safety_status": "EXPIRED",
        "trajectory_status": "RAPID_DETERIORATION"
    }
    score_b = compute_patient_action_priority(patient_b)

    # Patient B MUST have a higher Action Priority Score than Patient A due to Attention Gap!
    assert score_b["action_priority_score"] > score_a["action_priority_score"]
    assert "REASSESS / ESCALATE" in score_b["action_state"]
    assert "CONTINUE DIRECT CARE" in score_a["action_state"]
