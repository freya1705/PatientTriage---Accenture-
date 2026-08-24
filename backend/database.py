"""
SQLite Database connection and initialization for PatientTriage.ai
Provides persistent storage for Patients, Vital Sign Histories, Audit Logs, and Hospital Config.
"""

import sqlite3
import json
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "triage.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, timeout=25.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=10000;")
    return conn

def init_db(seed_if_empty: bool = True):
    """Initializes SQLite schema and seeds 20 benchmark patients if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT,
        chief_complaint TEXT NOT NULL,
        symptoms TEXT, -- JSON array
        pain_score INTEGER DEFAULT 0,
        has_medical_history INTEGER DEFAULT 1,
        medical_history TEXT, -- JSON array
        injury_mechanism TEXT,
        triage_level INTEGER NOT NULL,
        triage_category TEXT NOT NULL,
        risk_score REAL NOT NULL,
        confidence_score REAL NOT NULL,
        uncertainty_score REAL NOT NULL,
        is_uncertain INTEGER DEFAULT 0,
        safety_status TEXT DEFAULT 'VALID',
        trajectory_status TEXT DEFAULT 'STABLE',
        total_waiting_mins INTEGER DEFAULT 0,
        elapsed_since_vital INTEGER DEFAULT 0,
        is_attended INTEGER DEFAULT 0,
        attending_physician TEXT,
        is_overridden INTEGER DEFAULT 0,
        override_level INTEGER,
        override_reason TEXT,
        override_by TEXT,
        override_timestamp TEXT,
        scenario_tag TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vital_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        timestamp_mins INTEGER NOT NULL,
        heart_rate INTEGER,
        systolic_bp INTEGER,
        diastolic_bp INTEGER,
        spo2 INTEGER,
        resp_rate INTEGER,
        temperature REAL,
        recorded_by TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        ai_recommendation TEXT,
        ai_confidence REAL,
        clinician_decision TEXT,
        clinician_role TEXT,
        override_reason TEXT,
        input_snapshot TEXT, -- JSON
        outcome TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospital_config (
        id INTEGER PRIMARY KEY,
        hospital_name TEXT NOT NULL,
        profile_type TEXT NOT NULL,
        surge_active INTEGER DEFAULT 0,
        reassess_window_l1 INTEGER DEFAULT 5,
        reassess_window_l2 INTEGER DEFAULT 15,
        reassess_window_l3 INTEGER DEFAULT 30,
        reassess_window_l4 INTEGER DEFAULT 60,
        reassess_window_l5 INTEGER DEFAULT 120
    )
    """)

    conn.commit()

    # Check if hospital config exists
    cursor.execute("SELECT COUNT(*) FROM hospital_config")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO hospital_config (id, hospital_name, profile_type, surge_active)
        VALUES (1, 'Metro Central Academic Emergency Center', 'LEVEL_1_TRAUMA', 0)
        """)
        conn.commit()

    # Seed 20 patients if empty
    if seed_if_empty:
        cursor.execute("SELECT COUNT(*) FROM patients")
        if cursor.fetchone()[0] == 0:
            seed_benchmark_patients(conn)

    conn.close()

def seed_benchmark_patients(conn=None):
    """Populates the database with the 20 benchmark clinical patients."""
    close_at_end = False
    if conn is None:
        conn = get_db_connection()
        close_at_end = True

    from .services.risk_engine import calculate_triage_assessment
    from .services.deterioration_engine import analyze_vital_deterioration
    from .services.safety_expiry_engine import calculate_safety_staleness_and_decay

    data_file = os.path.join(os.path.dirname(__file__), "data", "simulated_patients.json")
    if not os.path.exists(data_file):
        if close_at_end:
            conn.close()
        return

    with open(data_file, "r", encoding="utf-8") as f:
        patients_data = json.load(f)

    cursor = conn.cursor()
    cursor.execute("DELETE FROM vital_records")
    cursor.execute("DELETE FROM patients")
    cursor.execute("DELETE FROM audit_logs")

    now_iso = datetime.now(timezone.utc).isoformat()

    for p in patients_data:
        # Run triage assessment on initial vitals
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

        # Deterioration
        _, traj_status, _, _ = analyze_vital_deterioration(p.get("vital_history", []))

        # Staleness & decay
        decayed_conf, safety_status, _, _, _ = calculate_safety_staleness_and_decay(
            triage_level=assessment["triage_level"],
            base_confidence=assessment["confidence_score"],
            elapsed_minutes_since_vital=p.get("elapsed_since_vital", 0),
            total_waiting_minutes=p.get("total_waiting_mins", 0)
        )

        cursor.execute("""
        INSERT INTO patients (
            id, name, age, gender, chief_complaint, symptoms, pain_score,
            has_medical_history, medical_history, injury_mechanism,
            triage_level, triage_category, risk_score, confidence_score,
            uncertainty_score, is_uncertain, safety_status, trajectory_status,
            total_waiting_mins, elapsed_since_vital, is_attended, attending_physician,
            scenario_tag, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["name"], p["age"], p.get("gender", "Unknown"),
            p["chief_complaint"], json.dumps(p.get("symptoms", [])), p.get("pain_score", 0),
            1 if p.get("has_medical_history", True) else 0,
            json.dumps(p.get("medical_history", [])), p.get("injury_mechanism"),
            assessment["triage_level"], assessment["triage_category"],
            assessment["risk_score"], decayed_conf, assessment["uncertainty_score"],
            1 if assessment["is_uncertain"] else 0,
            safety_status, traj_status,
            p.get("total_waiting_mins", 0), p.get("elapsed_since_vital", 0),
            1 if p.get("is_attended", False) else 0, p.get("attending_physician"),
            p.get("scenario_tag"), now_iso, now_iso
        ))

        # Insert vital records
        for v in p.get("vital_history", []):
            cursor.execute("""
            INSERT INTO vital_records (
                patient_id, timestamp_mins, heart_rate, systolic_bp, diastolic_bp,
                spo2, resp_rate, temperature, recorded_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["id"], v.get("timestamp_mins", 0), v.get("heart_rate"),
                v.get("systolic_bp"), v.get("diastolic_bp"), v.get("spo2"),
                v.get("resp_rate"), v.get("temperature"), v.get("recorded_by", "Intake Nurse"),
                now_iso
            ))

        # Add initial audit log
        cursor.execute("""
        INSERT INTO audit_logs (
            timestamp, event_type, patient_id, ai_recommendation, ai_confidence,
            clinician_decision, clinician_role, override_reason, input_snapshot, outcome
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            now_iso, "INITIAL_TRIAGE_ASSESSMENT", p["id"],
            assessment["triage_category"], assessment["confidence_score"],
            "ACCEPTED", "Triage Nurse (Auto-Logged)", None,
            json.dumps({"complaint": p["chief_complaint"], "vitals": p["initial_vitals"]}),
            f"Assigned {assessment['triage_category']} (Risk: {assessment['risk_score']}%)"
        ))

    conn.commit()
    if close_at_end:
        conn.close()
