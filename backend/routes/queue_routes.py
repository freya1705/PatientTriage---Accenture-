"""
Live Queue and Emergency Operations Analytics for PatientTriage.ai
"""

from fastapi import APIRouter
from .patient_routes import list_patients
from ..database import get_db_connection

router = APIRouter(prefix="/api/queue", tags=["Live Queue"])

@router.get("/live")
def get_live_queue_dashboard():
    patients = list_patients(sort_by_action=True)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospital_config WHERE id = 1")
    config_row = cursor.fetchone()
    conn.close()

    surge_active = bool(config_row["surge_active"]) if config_row else False

    # Calculate KPIs
    total_patients = len(patients)
    escalate_count = sum(1 for p in patients if p["action_badge"] in ["ESCALATE", "IMMEDIATE"])
    reassess_count = sum(1 for p in patients if p["action_badge"] in ["REASSESS", "REASSESS_SOON"])
    uncertain_count = sum(1 for p in patients if p["action_badge"] == "VERIFY" or p["is_uncertain"])
    attended_count = sum(1 for p in patients if p["is_attended"])
    unattended_count = total_patients - attended_count

    # Calculate ED Capacity Pressure (0 - 100%)
    if surge_active:
        capacity_pressure = min(98, 70 + (total_patients // 3))
    else:
        capacity_pressure = min(85, 25 + int((total_patients / 30.0) * 45.0) + (escalate_count * 5))

    return {
        "hospital_name": config_row["hospital_name"] if config_row else "Metro Academic Emergency Center",
        "surge_active": surge_active,
        "capacity_pressure_percent": capacity_pressure,
        "kpis": {
            "total_patients": total_patients,
            "escalations_due": escalate_count,
            "reassessments_due": reassess_count,
            "uncertain_cases": uncertain_count,
            "currently_attended": attended_count,
            "unattended_waiting": unattended_count
        },
        "top_action_queue": patients[:8] if surge_active else patients[:10],
        "all_patients": patients
    }
