"""
3x Surge Mode Simulation Endpoint for PatientTriage.ai
"""

import json
import os
from datetime import datetime, timezone
from fastapi import APIRouter
from ..database import get_db_connection, seed_benchmark_patients
from ..models.schemas import SurgeToggleRequest
from ..services.risk_engine import calculate_triage_assessment
from ..services.audit_service import log_audit_event

router = APIRouter(prefix="/api/surge", tags=["Surge Mode"])

@router.post("/toggle")
def toggle_surge_mode(req: SurgeToggleRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("UPDATE hospital_config SET surge_active = ? WHERE id = 1", (1 if req.active else 0,))
    now_iso = datetime.now(timezone.utc).isoformat()

    if req.active:
        # Load surge patients from data/surge_patients.json
        surge_file = os.path.join(os.path.dirname(__file__), "..", "data", "surge_patients.json")
        if os.path.exists(surge_file):
            with open(surge_file, "r", encoding="utf-8") as f:
                surge_data = json.load(f)

            for p in surge_data:
                # Check if already exists
                cursor.execute("SELECT id FROM patients WHERE id = ?", (p["id"],))
                if not cursor.fetchone():
                    assessment = calculate_triage_assessment(
                        age=p["age"],
                        chief_complaint=p["chief_complaint"],
                        symptoms=p["symptoms"],
                        vitals=p["initial_vitals"],
                        pain_score=p.get("pain_score", 0),
                        has_medical_history=p.get("has_medical_history", True),
                        medical_history=p.get("medical_history", []),
                        injury_mechanism=p.get("injury_mechanism")
                    )

                    cursor.execute("""
                    INSERT INTO patients (
                        id, name, age, gender, chief_complaint, symptoms, pain_score,
                        has_medical_history, medical_history, injury_mechanism,
                        triage_level, triage_category, risk_score, confidence_score,
                        uncertainty_score, is_uncertain, safety_status, trajectory_status,
                        total_waiting_mins, elapsed_since_vital, is_attended, scenario_tag,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', 'STABLE', ?, ?, ?, ?, ?, ?)
                    """, (
                        p["id"], p["name"], p["age"], p.get("gender", "Unknown"),
                        p["chief_complaint"], json.dumps(p.get("symptoms", [])), p.get("pain_score", 0),
                        1 if p.get("has_medical_history", True) else 0,
                        json.dumps(p.get("medical_history", [])), p.get("injury_mechanism"),
                        assessment["triage_level"], assessment["triage_category"],
                        assessment["risk_score"], assessment["confidence_score"], assessment["uncertainty_score"],
                        1 if assessment["is_uncertain"] else 0,
                        p.get("total_waiting_mins", 10), p.get("elapsed_since_vital", 10),
                        1 if p.get("is_attended", False) else 0,
                        p.get("scenario_tag"), now_iso, now_iso
                    ))

                    # Insert vitals
                    for v in p.get("vital_history", []):
                        cursor.execute("""
                        INSERT INTO vital_records (
                            patient_id, timestamp_mins, heart_rate, systolic_bp, diastolic_bp,
                            spo2, resp_rate, temperature, recorded_by, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            p["id"], v.get("timestamp_mins", 0), v.get("heart_rate"),
                            v.get("systolic_bp"), v.get("diastolic_bp"), v.get("spo2"),
                            v.get("resp_rate"), v.get("temperature"), v.get("recorded_by", "Surge Triage"),
                            now_iso
                        ))

        log_audit_event(
            event_type="SURGE_MODE_ACTIVATED",
            patient_id="SYSTEM",
            clinician_decision="3X SURGE PROTOCOL INITIATED",
            clinician_role="Emergency Incident Commander",
            outcome="Volume expanded to 60 patients. Attention Gap Queue compression active.",
            conn=conn
        )
    else:
        # Revert back to 20 baseline (delete P-021 to P-060 only, preserving P-001 to P-020)
        cursor.execute("DELETE FROM patients WHERE id >= 'P-021'")
        cursor.execute("DELETE FROM vital_records WHERE patient_id >= 'P-021'")

        log_audit_event(
            event_type="SURGE_MODE_DEACTIVATED",
            patient_id="SYSTEM",
            clinician_decision="STANDARD VOLUME PROTOCOL RESTORED",
            clinician_role="Charge Nurse",
            outcome="Reverted to normal emergency department operations.",
            conn=conn
        )

    # Get total count
    cursor.execute("SELECT COUNT(*) FROM patients")
    total_census = cursor.fetchone()[0]

    conn.commit()
    conn.close()

    return {
        "success": True,
        "surge_active": req.active,
        "total_census": total_census,
        "message": f"Surge mode {'activated (60 patients loaded)' if req.active else 'deactivated (reverted to standard 20)'}"
    }

@router.get("/status")
def get_surge_status():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT surge_active FROM hospital_config WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    return {"surge_active": bool(row["surge_active"]) if row else False}
