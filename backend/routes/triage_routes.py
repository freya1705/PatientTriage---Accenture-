"""
Triage Assessment Simulation and Evaluation Routes
"""

from fastapi import APIRouter
from ..models.schemas import PatientIntakeRequest
from ..services.risk_engine import calculate_triage_assessment

router = APIRouter(prefix="/api/triage", tags=["Triage Assessment Engine"])

@router.post("/assess")
def assess_patient_simulation(req: PatientIntakeRequest):
    """
    Runs full triage intelligence engine (Age rules + Guardrails + Risk + Uncertainty)
    and returns rich explainability details without requiring database persistence.
    """
    vitals_dict = req.vitals.model_dump(exclude_none=True)
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
    return assessment
