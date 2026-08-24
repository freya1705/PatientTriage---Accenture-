"""
Audit and Governance Service for PatientTriage.ai
Compliant with HIPAA / GDPR Clinical Decision-Support Logging Standards.
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from ..database import get_db_connection

def log_audit_event(
    event_type: str,
    patient_id: str,
    ai_recommendation: Optional[str] = None,
    ai_confidence: Optional[float] = None,
    clinician_decision: Optional[str] = None,
    clinician_role: Optional[str] = None,
    override_reason: Optional[str] = None,
    input_snapshot: Optional[Dict[str, Any]] = None,
    outcome: Optional[str] = None,
    conn = None
) -> int:
    """
    Inserts an immutable audit record into SQLite.
    """
    close_after = False
    if conn is None:
        conn = get_db_connection()
        close_after = True

    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor.execute("""
    INSERT INTO audit_logs (
        timestamp, event_type, patient_id, ai_recommendation, ai_confidence,
        clinician_decision, clinician_role, override_reason, input_snapshot, outcome
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        now_iso,
        event_type,
        patient_id,
        ai_recommendation,
        ai_confidence,
        clinician_decision,
        clinician_role,
        override_reason,
        json.dumps(input_snapshot) if input_snapshot else None,
        outcome
    ))
    conn.commit()
    log_id = cursor.lastrowid
    if close_after:
        conn.close()
    return log_id

def get_audit_logs(limit: int = 100, patient_id: Optional[str] = None) -> list[dict]:
    conn = get_db_connection()
    cursor = conn.cursor()

    if patient_id:
        cursor.execute("SELECT * FROM audit_logs WHERE patient_id = ? ORDER BY id DESC LIMIT ?", (patient_id, limit))
    else:
        cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))

    rows = cursor.fetchall()
    conn.close()

    logs = []
    for r in rows:
        item = dict(r)
        if item.get("input_snapshot"):
            try:
                item["input_snapshot"] = json.loads(item["input_snapshot"])
            except Exception:
                pass
        logs.append(item)
    return logs
