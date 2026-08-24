"""
Patient Routes for PatientTriage.ai
Handles intake, detail, repeat vitals, clinician override, and simulation triggers.
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

from ..database import get_db_connection, seed_benchmark_patients
from ..models.schemas import PatientIntakeRequest, AddVitalsRequest, ClinicianOverrideRequest
from ..services.risk_engine import calculate_triage_assessment
from ..services.deterioration_engine import analyze_vital_deterioration
from ..services.safety_expiry_engine import calculate_safety_staleness_and_decay
from ..services.attention_gap_engine import compute_patient_action_priority
from ..services.downgrade_guard import verify_downgrade_safety
from ..services.audit_service import log_audit_event

router = APIRouter(prefix="/api/patients", tags=["Patients"])

def evaluate_patient_dynamic_state(patient_dict: dict, vital_history: list) -> dict:
    """Evaluates real-time staleness, deterioration, and attention gap for a patient."""
    triage_level = patient_dict["override_level"] if patient_dict.get("is_overridden") else patient_dict["triage_level"]
    
    # 1. Deterioration
    det_score, traj_status, det_reasons, is_det = analyze_vital_deterioration(vital_history)

    # 2. Staleness & Confidence Decay
    curr_conf, safety_status, staleness_score, is_exp, mins_left = calculate_safety_staleness_and_decay(
        triage_level=triage_level,
        base_confidence=patient_dict.get("confidence_score", 80.0),
        elapsed_minutes_since_vital=patient_dict.get("elapsed_since_vital", 0),
        total_waiting_minutes=patient_dict.get("total_waiting_mins", 0)
    )

    # 3. Attention Gap Priority
    scoring_payload = {
        "id": patient_dict["id"],
        "triage_level": triage_level,
        "risk_score": patient_dict["risk_score"],
        "deterioration_score": det_score,
        "staleness_score": staleness_score,
        "uncertainty_score": patient_dict["uncertainty_score"],
        "is_uncertain": bool(patient_dict["is_uncertain"]),
        "total_waiting_mins": patient_dict["total_waiting_mins"],
        "is_attended": bool(patient_dict["is_attended"]),
        "safety_status": safety_status,
        "trajectory_status": traj_status
    }
    action_info = compute_patient_action_priority(scoring_payload)

    return {
        **patient_dict,
        "display_triage_level": triage_level,
        "current_confidence": curr_conf,
        "safety_status": safety_status,
        "trajectory_status": traj_status,
        "deterioration_score": det_score,
        "staleness_score": staleness_score,
        "is_expired": is_exp,
        "minutes_until_expiry": mins_left,
        "deterioration_reasons": det_reasons,
        "action_priority_score": action_info["action_priority_score"],
        "action_state": action_info["action_state"],
        "action_badge": action_info["action_badge"],
        "primary_action_reason": action_info["primary_action_reason"],
        "action_reasons": action_info["action_reasons"]
    }

@router.get("")
def list_patients(sort_by_action: bool = True):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients")
    patient_rows = cursor.fetchall()

    patients = []
    for p in patient_rows:
        p_dict = dict(p)
        p_dict["symptoms"] = json.loads(p_dict["symptoms"]) if p_dict["symptoms"] else []
        p_dict["medical_history"] = json.loads(p_dict["medical_history"]) if p_dict["medical_history"] else []

        # Get vital history
        cursor.execute("SELECT * FROM vital_records WHERE patient_id = ? ORDER BY timestamp_mins ASC", (p_dict["id"],))
        v_rows = cursor.fetchall()
        vital_history = [dict(v) for v in v_rows]

        eval_patient = evaluate_patient_dynamic_state(p_dict, vital_history)
        eval_patient["latest_vitals"] = vital_history[-1] if vital_history else {}
        patients.append(eval_patient)

    conn.close()

    if sort_by_action:
        # Sort by action priority score descending (Highest attention gap first)
        patients.sort(key=lambda x: x["action_priority_score"], reverse=True)

    return patients

@router.get("/{patient_id}")
def get_patient_detail(patient_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    p_dict = dict(row)
    p_dict["symptoms"] = json.loads(p_dict["symptoms"]) if p_dict["symptoms"] else []
    p_dict["medical_history"] = json.loads(p_dict["medical_history"]) if p_dict["medical_history"] else []

    cursor.execute("SELECT * FROM vital_records WHERE patient_id = ? ORDER BY timestamp_mins ASC", (patient_id,))
    v_rows = cursor.fetchall()
    vital_history = [dict(v) for v in v_rows]

    cursor.execute("SELECT * FROM audit_logs WHERE patient_id = ? ORDER BY id DESC", (patient_id,))
    a_rows = cursor.fetchall()
    audit_events = [dict(a) for a in a_rows]

    conn.close()

    eval_patient = evaluate_patient_dynamic_state(p_dict, vital_history)
    eval_patient["vital_history"] = vital_history
    eval_patient["audit_events"] = audit_events
    eval_patient["latest_vitals"] = vital_history[-1] if vital_history else {}
    return eval_patient

@router.post("")
def intake_patient(req: PatientIntakeRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Generate patient ID
    cursor.execute("SELECT COUNT(*) FROM patients")
    count = cursor.fetchone()[0]
    patient_id = f"P-{(count + 1):03d}"

    vitals_dict = req.vitals.model_dump(exclude_none=True)

    # Compute AI Triage Assessment
    assessment = calculate_triage_assessment(
        age=req.age,
        chief_complaint=req.chief_complaint,
        symptoms=req.symptoms,
        vitals=vitals_dict,
        pain_score=req.pain_score,
        has_medical_history=req.has_medical_history,
        medical_history=req.medical_history,
        injury_mechanism=req.injury_mechanism
    )

    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    INSERT INTO patients (
        id, name, age, gender, chief_complaint, symptoms, pain_score,
        has_medical_history, medical_history, injury_mechanism,
        triage_level, triage_category, risk_score, confidence_score,
        uncertainty_score, is_uncertain, safety_status, trajectory_status,
        total_waiting_mins, elapsed_since_vital, is_attended, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VALID', 'STABLE', 0, 0, 0, ?, ?)
    """, (
        patient_id, req.name, req.age, req.gender, req.chief_complaint,
        json.dumps(req.symptoms), req.pain_score,
        1 if req.has_medical_history else 0, json.dumps(req.medical_history),
        req.injury_mechanism, assessment["triage_level"], assessment["triage_category"],
        assessment["risk_score"], assessment["confidence_score"], assessment["uncertainty_score"],
        1 if assessment["is_uncertain"] else 0, now_iso, now_iso
    ))

    # Insert initial vital record
    cursor.execute("""
    INSERT INTO vital_records (
        patient_id, timestamp_mins, heart_rate, systolic_bp, diastolic_bp,
        spo2, resp_rate, temperature, recorded_by, created_at
    ) VALUES (?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id, req.vitals.heart_rate, req.vitals.systolic_bp, req.vitals.diastolic_bp,
        req.vitals.spo2, req.vitals.resp_rate, req.vitals.temperature,
        req.vitals.recorded_by or "Intake Nurse", now_iso
    ))

    # Log audit event with same connection
    log_audit_event(
        event_type="NEW_PATIENT_INTAKE",
        patient_id=patient_id,
        ai_recommendation=assessment["triage_category"],
        ai_confidence=assessment["confidence_score"],
        clinician_decision="AUTOMATIC_INITIAL_TRIAGE",
        clinician_role="Intake Staff",
        input_snapshot={"complaint": req.chief_complaint, "vitals": vitals_dict},
        outcome=f"Risk: {assessment['risk_score']}%, Action: {assessment['recommended_action']}",
        conn=conn
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "patient_id": patient_id,
        "assessment": assessment
    }

@router.post("/{patient_id}/vitals")
def add_patient_vitals(patient_id: str, req: AddVitalsRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    p = dict(row)
    now_iso = datetime.now(timezone.utc).isoformat()
    new_total_wait = p["total_waiting_mins"] + (req.elapsed_mins or 15)

    cursor.execute("""
    INSERT INTO vital_records (
        patient_id, timestamp_mins, heart_rate, systolic_bp, diastolic_bp,
        spo2, resp_rate, temperature, recorded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient_id, new_total_wait, req.heart_rate, req.systolic_bp, req.diastolic_bp,
        req.spo2, req.resp_rate, req.temperature, req.recorded_by or "ED Nurse", now_iso
    ))

    # Reset elapsed_since_vital to 0 since fresh vitals just recorded!
    cursor.execute("""
    UPDATE patients
    SET elapsed_since_vital = 0, total_waiting_mins = ?, updated_at = ?
    WHERE id = ?
    """, (new_total_wait, now_iso, patient_id))

    # Re-evaluate deterioration & audit
    cursor.execute("SELECT * FROM vital_records WHERE patient_id = ? ORDER BY timestamp_mins ASC", (patient_id,))
    all_vitals = [dict(v) for v in cursor.fetchall()]

    det_score, traj_status, reasons, is_det = analyze_vital_deterioration(all_vitals)

    log_audit_event(
        event_type="VITAL_SIGNS_UPDATED",
        patient_id=patient_id,
        ai_recommendation=traj_status,
        clinician_role=req.recorded_by or "ED Nurse",
        input_snapshot=req.model_dump(exclude_none=True),
        outcome=f"Deterioration Score: {det_score}, Trajectory: {traj_status}. Reasons: {'; '.join(reasons)}",
        conn=conn
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "deterioration_score": det_score,
        "trajectory_status": traj_status,
        "reasons": reasons
    }

@router.post("/{patient_id}/override")
def override_triage_decision(patient_id: str, req: ClinicianOverrideRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    p = dict(row)
    now_iso = datetime.now(timezone.utc).isoformat()

    # Get vital history for downgrade verification check
    cursor.execute("SELECT * FROM vital_records WHERE patient_id = ? ORDER BY timestamp_mins ASC", (patient_id,))
    vital_history = [dict(v) for v in cursor.fetchall()]

    # If attempting to downgrade (e.g. from Level 2 to Level 3 or 4), run Counterfactual Downgrade Guardrail
    current_active_level = p["override_level"] if p["is_overridden"] else p["triage_level"]
    is_downgrade_allowed, blocked_reasons = verify_downgrade_safety(
        current_level=current_active_level,
        target_level=req.new_triage_level,
        vital_history=vital_history,
        elapsed_minutes_since_vital=p["elapsed_since_vital"],
        confidence_score=p["confidence_score"],
        is_red_flag=False
    )

    cursor.execute("""
    UPDATE patients
    SET is_overridden = 1, override_level = ?, override_reason = ?,
        override_by = ?, override_timestamp = ?, updated_at = ?
    WHERE id = ?
    """, (req.new_triage_level, req.override_reason, req.clinician_role, now_iso, now_iso, patient_id))

    log_audit_event(
        event_type="CLINICIAN_OVERRIDE",
        patient_id=patient_id,
        ai_recommendation=p["triage_category"],
        ai_confidence=p["confidence_score"],
        clinician_decision=f"OVERRIDDEN TO LEVEL {req.new_triage_level}",
        clinician_role=req.clinician_role,
        override_reason=req.override_reason,
        outcome=f"Changed from Level {current_active_level} to Level {req.new_triage_level}. Guardrail Advisory: {'; '.join(blocked_reasons) if blocked_reasons else 'Safety verified.'}",
        conn=conn
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "new_level": req.new_triage_level,
        "downgrade_advisory": blocked_reasons
    }

@router.post("/{patient_id}/toggle-attend")
def toggle_attending_status(patient_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT is_attended, attending_physician FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    curr_attended = row["is_attended"]
    new_attended = 0 if curr_attended else 1
    new_physician = "Dr. Emily Zhang, MD (Staff Physician)" if new_attended else None
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    UPDATE patients
    SET is_attended = ?, attending_physician = ?, updated_at = ?
    WHERE id = ?
    """, (new_attended, new_physician, now_iso, patient_id))

    log_audit_event(
        event_type="CLINICAL_COVERAGE_CHANGE",
        patient_id=patient_id,
        clinician_decision=f"Status changed to {'ATTENDED' if new_attended else 'UNATTENDED'}",
        clinician_role="Charge Nurse",
        outcome=f"Physician assignment: {new_physician or 'None (Waiting Queue)'}",
        conn=conn
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "is_attended": bool(new_attended),
        "attending_physician": new_physician
    }

@router.post("/{patient_id}/simulate-deterioration")
def simulate_deterioration(patient_id: str):
    """Interactive demo helper: drops SpO2 and spikes HR on patient to demonstrate real-time queue reordering."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    p = dict(row)
    cursor.execute("SELECT * FROM vital_records WHERE patient_id = ? ORDER BY timestamp_mins DESC LIMIT 1", (patient_id,))
    latest_v = dict(cursor.fetchone())

    # Create deteriorating vitals
    new_spo2 = max(86, (latest_v.get("spo2") or 95) - 6)
    new_hr = min(150, (latest_v.get("heart_rate") or 80) + 26)
    new_sbp = max(80, (latest_v.get("systolic_bp") or 120) - 18)
    new_rr = min(36, (latest_v.get("resp_rate") or 18) + 8)
    new_wait = p["total_waiting_mins"] + 15
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    INSERT INTO vital_records (
        patient_id, timestamp_mins, heart_rate, systolic_bp, diastolic_bp,
        spo2, resp_rate, temperature, recorded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Continuous Bedside Monitor', ?)
    """, (
        patient_id, new_wait, new_hr, new_sbp, int(new_sbp * 0.65),
        new_spo2, new_rr, latest_v.get("temperature", 37.0), now_iso
    ))

    cursor.execute("""
    UPDATE patients
    SET elapsed_since_vital = 0, total_waiting_mins = ?, updated_at = ?
    WHERE id = ?
    """, (new_wait, now_iso, patient_id))

    log_audit_event(
        event_type="RAPID_DETERIORATION_ALERT",
        patient_id=patient_id,
        ai_recommendation="ESCALATE_IMMEDIATELY",
        outcome=f"Simulated deterioration: SpO₂ {new_spo2}%, HR {new_hr} bpm. Triggered instant rank elevation.",
        conn=conn
    )

    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Deterioration simulated on {patient_id}",
        "new_vitals": {"spo2": new_spo2, "heart_rate": new_hr, "systolic_bp": new_sbp, "resp_rate": new_rr}
    }

@router.post("/reset")
def reset_benchmark_data():
    """Resets the system back to the clean 20 benchmark clinical patients."""
    seed_benchmark_patients()
    return {"success": True, "message": "Database reset to 20 benchmark clinical cases."}
