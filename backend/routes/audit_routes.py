"""
Audit and Governance Routes for PatientTriage.ai
"""

from fastapi import APIRouter, Query
from typing import Optional
from ..services.audit_service import get_audit_logs

router = APIRouter(prefix="/api/audit", tags=["Audit & Governance"])

@router.get("/logs")
def fetch_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    patient_id: Optional[str] = None
):
    logs = get_audit_logs(limit=limit, patient_id=patient_id)
    return {
        "total_records": len(logs),
        "compliance_standard": "HIPAA 45 CFR § 164.312(b) & EU GDPR Article 30 Compliant Audit Trail",
        "audit_logs": logs
    }
