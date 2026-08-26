"""
Comprehensive QA, Security, and Scenario Verification Test Suite
Tests all 20 Benchmark Scenarios, API Edge Cases, and Intelligence Engines
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db_connection, seed_benchmark_patients
from backend.services.age_rules import get_age_group, evaluate_age_adjusted_vitals
from backend.services.safety_guardrails import check_deterministic_safety_red_flags
from backend.services.uncertainty_engine import evaluate_uncertainty_and_confidence
from backend.services.deterioration_engine import analyze_vital_deterioration
from backend.services.safety_expiry_engine import calculate_safety_staleness_and_decay
from backend.services.downgrade_guard import verify_downgrade_safety
from backend.services.attention_gap_engine import compute_patient_action_priority, HOSPITAL_PROFILES

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db_before_tests():
    seed_benchmark_patients()
    yield

# =========================================================================
# 1. API AUDIT & EDGE CASES
# =========================================================================

def test_api_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_api_patients_crud_and_not_found():
    # 1. List patients
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) == 20

    # 2. Get existing patient
    res_single = client.get("/api/patients/P-001")
    assert res_single.status_code == 200
    assert res_single.json()["id"] == "P-001"

    # 3. Nonexistent patient
    res_404 = client.get("/api/patients/P-999")
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()

def test_api_intake_validation():
    # Missing required fields should fail gracefully (HTTP 422)
    res_bad = client.post("/api/patients", json={})
    assert res_bad.status_code == 422

    # Valid intake with partial missing vitals
    valid_payload = {
        "name": "Test Intake Patient",
        "age": 35,
        "gender": "Female",
        "chief_complaint": "Acute abdominal pain",
        "symptoms": ["Nausea", "Localized tenderness"],
        "pain_score": 7,
        "has_medical_history": True,
        "medical_history": ["Appendectomy"],
        "injury_mechanism": "Non-trauma",
        "vitals": {
            "heart_rate": 92,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "spo2": 98,
            "resp_rate": 18,
            "temperature": 37.2
        }
    }
    res_good = client.post("/api/patients", json=valid_payload)
    assert res_good.status_code == 200
    res_json = res_good.json()
    assert res_json["success"] is True
    assert "P-" in res_json["patient_id"]
    assert res_json["assessment"]["triage_level"] in [1, 2, 3, 4, 5]

def test_api_surge_mode_toggle_and_census():
    # Toggle Surge ON (60 patients)
    res_on = client.post("/api/surge/toggle", json={"active": True})
    assert res_on.status_code == 200
    assert res_on.json()["surge_active"] is True
    assert res_on.json()["total_census"] == 60

    # Verify queue returns 60 patients
    res_queue = client.get("/api/queue/live")
    assert res_queue.status_code == 200
    data = res_queue.json()
    assert data["kpis"]["total_patients"] == 60
    assert data["surge_active"] is True

    # Toggle Surge OFF (20 patients)
    res_off = client.post("/api/surge/toggle", json={"active": False})
    assert res_off.status_code == 200
    assert res_off.json()["surge_active"] is False
    assert res_off.json()["total_census"] == 20

def test_api_evaluation_experiment_endpoint():
    res = client.get("/api/queue/evaluation")
    assert res.status_code == 200
    eval_data = res.json()
    assert "metrics_comparison" in eval_data
    assert "benchmark_summary" in eval_data
    assert len(eval_data["metrics_comparison"]) >= 4

def test_api_hospital_profile_switcher():
    # Switch to Community / Rural Profile
    res = client.post("/api/queue/profile", json={"profile_type": "COMMUNITY_RURAL"})
    assert res.status_code == 200
    assert res.json()["profile_type"] == "COMMUNITY_RURAL"

    # Switch back to Level-1 Trauma Profile
    res2 = client.post("/api/queue/profile", json={"profile_type": "LEVEL_1_TRAUMA"})
    assert res2.status_code == 200
    assert res2.json()["profile_type"] == "LEVEL_1_TRAUMA"

def test_api_clinician_override_and_audit_trail():
    # Override P-004 to Level 2
    override_payload = {
        "new_triage_level": 2,
        "clinician_role": "Attending Emergency Physician",
        "override_reason": "Patient exhibiting severe peritoneal signs on bedside palpation"
    }
    res_override = client.post("/api/patients/P-004/override", json=override_payload)
    assert res_override.status_code == 200
    assert res_override.json()["success"] is True

    # Check audit log contains override entry
    res_audit = client.get("/api/audit/logs?patient_id=P-004")
    assert res_audit.status_code == 200
    logs = res_audit.json()["audit_logs"]
    assert len(logs) >= 1
    override_log = [l for l in logs if l["event_type"] == "CLINICIAN_OVERRIDE"][0]
    assert "peritoneal signs" in override_log["override_reason"]

def test_api_simulate_deterioration():
    # Simulate vital drop on P-017
    res_sim = client.post("/api/patients/P-017/simulate-deterioration")
    assert res_sim.status_code == 200
    assert res_sim.json()["success"] is True
    assert "new_vitals" in res_sim.json()

    # Verify patient detail shows updated vitals and deterioration trajectory
    res_p17 = client.get("/api/patients/P-017")
    assert res_p17.status_code == 200
    p17 = res_p17.json()
    assert p17["trajectory_status"] in ["RAPID_DETERIORATION", "WORSENING"]

# =========================================================================
# 2. CORE INTELLIGENCE ENGINES AUDIT
# =========================================================================

def test_pediatric_vital_calibrations():
    # Infant (1yo) with HR 165 (Extreme)
    score, alerts, flags = evaluate_age_adjusted_vitals(1, {"heart_rate": 165})
    assert score >= 12.0
    assert flags.get("heart_rate") == "critical"

    # Toddler (2yo) with Temp 39.4C
    score_fever, alerts_fever, flags_fever = evaluate_age_adjusted_vitals(2, {"temperature": 39.4})
    assert score_fever >= 10.0
    assert flags_fever.get("temperature") == "critical"

def test_geriatric_hypothermic_sepsis_calibration():
    # 80yo with Temp 35.6C (Blunted response)
    score, alerts, flags = evaluate_age_adjusted_vitals(80, {"temperature": 35.6})
    assert score >= 12.0
    assert flags.get("temperature") == "critical"

def test_deterministic_safety_red_flag_overrides():
    # Severe hypoxia SpO2 82% must force Level 1
    triggered, level, reasons = check_deterministic_safety_red_flags(
        age=40,
        chief_complaint="Shortness of breath",
        symptoms=["Cyanosis"],
        vitals={"spo2": 82, "heart_rate": 120}
    )
    assert triggered is True
    assert level == 1
    assert any("SpO₂ < 85%" in r for r in reasons)

def test_uncertainty_engine_unknown_not_safe():
    # Missing SpO2 & BP with zero history
    unc_score, conf_score, reasons, is_unc, modifier = evaluate_uncertainty_and_confidence(
        vitals={"heart_rate": 90, "spo2": None, "systolic_bp": None},
        has_medical_history=False,
        chief_complaint="Dizziness",
        symptoms=["Fatigue"],
        pain_score=3,
        vital_abnormality_score=0.0
    )
    assert unc_score >= 40.0
    assert conf_score <= 60.0
    assert is_unc is True
    assert modifier == "VERIFY_CRITICAL_VITALS"

def test_deterioration_delta_detection():
    # Sequence of 3 vitals showing SpO2 falling
    vitals = [
        {"timestamp_mins": 0, "spo2": 97, "heart_rate": 80, "systolic_bp": 120, "resp_rate": 16},
        {"timestamp_mins": 15, "spo2": 93, "heart_rate": 96, "systolic_bp": 115, "resp_rate": 20},
        {"timestamp_mins": 30, "spo2": 88, "heart_rate": 118, "systolic_bp": 105, "resp_rate": 26}
    ]
    det_score, traj, reasons, is_det = analyze_vital_deterioration(vitals)
    assert det_score >= 25.0
    assert traj == "RAPID_DETERIORATION"
    assert is_det is True
    assert any("Critical SpO₂ desaturation" in r for r in reasons)

def test_safety_expiry_and_confidence_decay():
    # Level 2 patient with vitals taken 35 minutes ago (Window is 15m)
    curr_conf, safety_status, staleness_score, is_exp, mins_left = calculate_safety_staleness_and_decay(
        triage_level=2,
        base_confidence=85.0,
        elapsed_minutes_since_vital=35,
        total_waiting_minutes=40
    )
    assert safety_status == "EXPIRED"
    assert is_exp is True
    assert mins_left < 0
    assert curr_conf < 85.0
    assert staleness_score >= 20.0

def test_counterfactual_downgrade_guard():
    # Attempting to downgrade Level 2 to Level 4 without recent vitals
    is_allowed, reasons = verify_downgrade_safety(
        current_level=2,
        target_level=4,
        vital_history=[{"timestamp_mins": 0, "spo2": 94, "heart_rate": 90}],
        elapsed_minutes_since_vital=30,
        confidence_score=70.0,
        is_red_flag=False
    )
    assert is_allowed is False
    assert len(reasons) >= 1

def test_attention_gap_ranking():
    # Unattended deteriorating patient (Patient B) vs Attended critical patient (Patient A)
    patient_a = {
        "id": "P-A",
        "triage_level": 1,
        "risk_score": 90.0,
        "deterioration_score": 0.0,
        "staleness_score": 0.0,
        "uncertainty_score": 0.0,
        "is_uncertain": False,
        "total_waiting_mins": 5,
        "is_attended": True,
        "safety_status": "VALID",
        "trajectory_status": "STABLE"
    }
    patient_b = {
        "id": "P-B",
        "triage_level": 2,
        "risk_score": 80.0,
        "deterioration_score": 40.0,
        "staleness_score": 25.0,
        "uncertainty_score": 20.0,
        "is_uncertain": True,
        "total_waiting_mins": 35,
        "is_attended": False,
        "safety_status": "EXPIRED",
        "trajectory_status": "RAPID_DETERIORATION"
    }

    res_a = compute_patient_action_priority(patient_a)
    res_b = compute_patient_action_priority(patient_b)

    # Unattended deteriorating patient B must outrank attended patient A
    assert res_b["action_priority_score"] > res_a["action_priority_score"]
    assert res_b["action_badge"] == "ESCALATE"

# =========================================================================
# 3. 20 BENCHMARK PATIENTS VALIDATION
# =========================================================================

def test_all_20_benchmark_patients_integrity_and_behavior():
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) == 20

    pat_map = {p["id"]: p for p in patients}

    # P-001: Polytrauma shock -> Level 1
    assert pat_map["P-001"]["display_triage_level"] == 1

    # P-002: Attended STEMI -> Level 2, is_attended=True
    assert pat_map["P-002"]["display_triage_level"] == 2
    assert pat_map["P-002"]["is_attended"] is True

    # P-003: Pediatric Stridor (3yo) -> Level 2
    assert pat_map["P-003"]["display_triage_level"] == 2
    assert pat_map["P-003"]["age"] < 16

    # P-007: Infant High Fever (1yo) -> High risk
    assert pat_map["P-007"]["age"] == 1
    assert pat_map["P-007"]["display_triage_level"] <= 2

    # P-008: Geriatric Sepsis -> Missing SpO2 -> is_uncertain=True
    assert pat_map["P-008"]["age"] >= 65
    assert pat_map["P-008"]["is_uncertain"] is True

    # P-011: Missing SpO2 & BP -> is_uncertain=True
    assert pat_map["P-011"]["is_uncertain"] is True

    # P-014: Silent Shock in Elderly -> SBP 84/50 -> Level 2
    assert pat_map["P-014"]["display_triage_level"] <= 2

    # P-016: Stale Assessment (waited 68m) -> Safety Status EXPIRED
    assert pat_map["P-016"]["safety_status"] == "EXPIRED"

    # Simulate deterioration on P-017 and verify it elevates dynamically to Rank #1
    res_sim = client.post("/api/patients/P-017/simulate-deterioration")
    assert res_sim.status_code == 200
    queue_after_sim = client.get("/api/patients").json()
    assert queue_after_sim[0]["id"] == "P-017"
    assert queue_after_sim[0]["trajectory_status"] in ["RAPID_DETERIORATION", "WORSENING"]
