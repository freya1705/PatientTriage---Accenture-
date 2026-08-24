"""
Pydantic v2 Schemas for PatientTriage.ai API
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class VitalsInput(BaseModel):
    heart_rate: Optional[int] = Field(None, description="Heart rate in bpm")
    systolic_bp: Optional[int] = Field(None, description="Systolic BP in mmHg")
    diastolic_bp: Optional[int] = Field(None, description="Diastolic BP in mmHg")
    spo2: Optional[int] = Field(None, description="SpO2 percentage (0-100)")
    resp_rate: Optional[int] = Field(None, description="Respiratory rate per min")
    temperature: Optional[float] = Field(None, description="Core temperature in Celsius")
    recorded_by: Optional[str] = "Triage Staff"
    timestamp_mins: Optional[int] = 0

class PatientIntakeRequest(BaseModel):
    name: str = Field(..., description="Patient Name or Synthetic Pseudonym")
    age: int = Field(..., ge=0, le=125, description="Patient age in years")
    gender: Optional[str] = "Unknown"
    chief_complaint: str = Field(..., description="Primary presenting complaint")
    symptoms: List[str] = Field(default_factory=list, description="List of observed/reported symptoms")
    pain_score: int = Field(0, ge=0, le=10, description="Numerical pain rating 0-10")
    has_medical_history: bool = Field(True, description="Whether prior EHR is available")
    medical_history: List[str] = Field(default_factory=list, description="Past medical history / comorbidities")
    injury_mechanism: Optional[str] = Field(None, description="Injury mechanism if trauma")
    vitals: VitalsInput = Field(default_factory=VitalsInput)

class ClinicianOverrideRequest(BaseModel):
    new_triage_level: int = Field(..., ge=1, le=5, description="Clinician selected triage level (1-5)")
    clinician_role: str = Field(..., description="E.g., 'Attending Emergency Physician', 'Charge Nurse'")
    override_reason: str = Field(..., min_length=5, description="Mandatory clinical rationale for override")

class AddVitalsRequest(BaseModel):
    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    spo2: Optional[int] = None
    resp_rate: Optional[int] = None
    temperature: Optional[float] = None
    recorded_by: Optional[str] = "ED Nurse"
    elapsed_mins: Optional[int] = 15

class SurgeToggleRequest(BaseModel):
    active: bool = Field(..., description="True to activate 3x surge, False for normal volume")

class HospitalConfigUpdate(BaseModel):
    hospital_name: Optional[str] = None
    profile_type: Optional[str] = None
    reassess_window_l1: Optional[int] = None
    reassess_window_l2: Optional[int] = None
    reassess_window_l3: Optional[int] = None
    reassess_window_l4: Optional[int] = None
    reassess_window_l5: Optional[int] = None
