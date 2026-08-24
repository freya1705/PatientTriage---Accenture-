"""
API Integration tests for PatientTriage.ai FastAPI backend.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, seed_benchmark_patients

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    init_db(seed_if_empty=True)
    seed_benchmark_patients()

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_list_patients():
    res = client.get("/api/patients")
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 20
    assert any(p["id"] == "P-017" for p in patients)

def test_live_queue_kpis():
    res = client.get("/api/queue/live")
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert data["kpis"]["total_patients"] >= 20
    assert "top_action_queue" in data

def test_patient_detail():
    res = client.get("/api/patients/P-001")
    assert res.status_code == 200
    p = res.json()
    assert p["id"] == "P-001"
    assert "vital_history" in p
    assert len(p["vital_history"]) >= 1

def test_intake_new_patient():
    new_patient_data = {
        "name": "Test Intake Case",
        "age": 72,
        "gender": "Female",
        "chief_complaint": "Shortness of breath and low blood pressure",
        "symptoms": ["Dyspnea", "Dizziness"],
        "pain_score": 4,
        "has_medical_history": False,
        "medical_history": [],
        "injury_mechanism": "Medical",
        "vitals": {
            "heart_rate": 112,
            "systolic_bp": 94,
            "diastolic_bp": 60,
            "spo2": 92,
            "resp_rate": 24,
            "temperature": 37.8
        }
    }
    res = client.post("/api/patients", json=new_patient_data)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["assessment"]["triage_level"] <= 2
    assert data["assessment"]["age_group"] == "Geriatric"

def test_surge_mode_toggle():
    # Toggle surge ON
    res_on = client.post("/api/surge/toggle", json={"active": True})
    assert res_on.status_code == 200
    assert res_on.json()["surge_active"] is True

    # Check live queue count expanded
    res_queue = client.get("/api/queue/live")
    assert res_queue.json()["kpis"]["total_patients"] >= 60

    # Toggle surge OFF
    res_off = client.post("/api/surge/toggle", json={"active": False})
    assert res_off.status_code == 200
    assert res_off.json()["surge_active"] is False

def test_clinician_override_and_audit():
    override_payload = {
        "new_triage_level": 2,
        "clinician_role": "Attending Emergency Physician",
        "override_reason": "Patient clinically appears in severe acute respiratory distress despite borderline initial reading."
    }
    res = client.post("/api/patients/P-004/override", json=override_payload)
    assert res.status_code == 200
    assert res.json()["new_level"] == 2

    # Check audit log contains the override
    res_audit = client.get("/api/audit/logs?patient_id=P-004")
    assert res_audit.status_code == 200
    logs = res_audit.json()["audit_logs"]
    assert any(l["event_type"] == "CLINICIAN_OVERRIDE" for l in logs)
