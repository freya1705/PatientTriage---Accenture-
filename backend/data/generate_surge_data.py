"""
Generates 40 realistic synthetic surge patients (P-021 to P-060) representing a sudden
mass-casualty / high-volume disaster influx to demonstrate 3x Surge Mode (20 -> 60 patients).
"""

import json

SURGE_TEMPLATES = [
    {"complaint": "Smoke inhalation and bronchospasm", "symptoms": ["Stridor", "Cough", "Dyspnea"], "age": 42, "hr": 128, "sbp": 136, "spo2": 88, "rr": 30, "pain": 6, "level_hint": 2},
    {"complaint": "Deep shrapnel laceration to thigh", "symptoms": ["Active bleeding", "Tachycardia"], "age": 29, "hr": 115, "sbp": 105, "spo2": 97, "rr": 22, "pain": 8, "level_hint": 2},
    {"complaint": "Closed head injury with brief loss of consciousness", "symptoms": ["Confusion", "Vomiting", "Scalp hematoma"], "age": 52, "hr": 95, "sbp": 148, "spo2": 96, "rr": 18, "pain": 7, "level_hint": 2},
    {"complaint": "Blunt abdominal trauma from crowd crush", "symptoms": ["Diffuse tenderness", "Guarding"], "age": 31, "hr": 110, "sbp": 98, "spo2": 97, "rr": 24, "pain": 8, "level_hint": 2},
    {"complaint": "Pediatric forearm fracture with displacement", "symptoms": ["Visible deformity", "Severe pain", "Crying"], "age": 7, "hr": 130, "sbp": 98, "spo2": 99, "rr": 26, "pain": 9, "level_hint": 3},
    {"complaint": "Severe asthma attack triggered by dust and smoke", "symptoms": ["Wheezing", "Speaking in 2-word phrases", "Retractions"], "age": 19, "hr": 135, "sbp": 128, "spo2": 90, "rr": 32, "pain": 4, "level_hint": 2},
    {"complaint": "Acute panic and hyperventilation syndrome", "symptoms": ["Tingling hands", "Tachypnea", "Carpopedal spasm"], "age": 26, "hr": 118, "sbp": 138, "spo2": 100, "rr": 34, "pain": 2, "level_hint": 4},
    {"complaint": "Partial thickness burn to both forearms (10% TBSA)", "symptoms": ["Blistering", "Erythema", "Severe pain"], "age": 36, "hr": 105, "sbp": 120, "spo2": 98, "rr": 20, "pain": 9, "level_hint": 3},
    {"complaint": "Geriatric fall during evacuation with hip pain", "symptoms": ["Shortened and externally rotated right leg"], "age": 82, "hr": 88, "sbp": 142, "spo2": 94, "rr": 18, "pain": 8, "level_hint": 3},
    {"complaint": "Corneal chemical/dust irritation", "symptoms": ["Severe eye pain", "Photophobia", "Blepharospasm"], "age": 28, "hr": 82, "sbp": 124, "spo2": 99, "rr": 16, "pain": 7, "level_hint": 4},
    {"complaint": "Crush injury to left foot", "symptoms": ["Severe swelling", "Ecchymosis", "Inability to bear weight"], "age": 45, "hr": 90, "sbp": 130, "spo2": 98, "rr": 18, "pain": 7, "level_hint": 3},
    {"complaint": "Superficial glass abrasions across face and neck", "symptoms": ["Multiple shallow cuts", "Anxiety"], "age": 23, "hr": 86, "sbp": 118, "spo2": 99, "rr": 16, "pain": 3, "level_hint": 5},
    {"complaint": "Severe dehydration and exhaustion in relief volunteer", "symptoms": ["Dry mucous membranes", "Orthostasis", "Cramping"], "age": 34, "hr": 112, "sbp": 102, "spo2": 98, "rr": 18, "pain": 3, "level_hint": 3},
    {"complaint": "Acute exacerbation of chronic heart failure", "symptoms": ["Bilateral leg edema", "Orthopnea", "Crackles at lung bases"], "age": 74, "hr": 102, "sbp": 168, "spo2": 91, "rr": 26, "pain": 2, "level_hint": 2},
    {"complaint": "Pediatric laceration to chin requiring sutures", "symptoms": ["Laceration 3cm", "Hemostasis achieved"], "age": 5, "hr": 115, "sbp": 92, "spo2": 99, "rr": 22, "pain": 5, "level_hint": 4},
    {"complaint": "Mild shoulder strain from lifting debris", "symptoms": ["Tenderness over deltoid", "Full range of motion"], "age": 38, "hr": 74, "sbp": 122, "spo2": 99, "rr": 14, "pain": 4, "level_hint": 5},
    {"complaint": "Tension pneumothorax suspicion post steering-wheel impact", "symptoms": ["Tracheal deviation", "Unilateral absent breath sounds", "Profound shock"], "age": 49, "hr": 144, "sbp": 72, "spo2": 82, "rr": 38, "pain": 9, "level_hint": 1},
    {"complaint": "Subdural hematoma suspicion in anticoagulated elderly", "symptoms": ["Sudden severe headache", "Lethargy", "Unequal pupils"], "age": 86, "hr": 62, "sbp": 188, "spo2": 95, "rr": 14, "pain": 8, "level_hint": 1},
    {"complaint": "Ankle inversion sprain during building evacuation", "symptoms": ["Mild edema", "Walking with limp"], "age": 27, "hr": 78, "sbp": 118, "spo2": 99, "rr": 14, "pain": 4, "level_hint": 5},
    {"complaint": "Diabetic ketoacidosis crisis during shelter stay", "symptoms": ["Kussmaul breathing", "Fruity breath", "Confusion", "Extreme thirst"], "age": 21, "hr": 132, "sbp": 96, "spo2": 98, "rr": 34, "pain": 4, "level_hint": 2}
]

patients = []
for i in range(21, 61):
    tmpl = SURGE_TEMPLATES[(i - 21) % len(SURGE_TEMPLATES)]
    pat_id = f"P-{i:03d}"
    age = tmpl["age"]
    has_history = (i % 2 == 0)
    
    # Introduce variability
    wait_mins = 5 + (i * 2) % 45
    elapsed = wait_mins
    
    patients.append({
        "id": pat_id,
        "name": f"Surge Patient #{i} (Synthetic)",
        "age": age,
        "gender": "Female" if (i % 2 == 0) else "Male",
        "chief_complaint": tmpl["complaint"],
        "symptoms": tmpl["symptoms"],
        "pain_score": tmpl["pain"],
        "has_medical_history": has_history,
        "medical_history": ["Hypertension", "Diabetes"] if has_history else [],
        "injury_mechanism": "Disaster surge mass influx",
        "initial_vitals": {
            "heart_rate": tmpl["hr"],
            "systolic_bp": tmpl["sbp"],
            "diastolic_bp": int(tmpl["sbp"] * 0.65) if tmpl["sbp"] else 70,
            "spo2": tmpl["spo2"],
            "resp_rate": tmpl["rr"],
            "temperature": 37.0
        },
        "vital_history": [
            {
                "timestamp_mins": 0,
                "heart_rate": tmpl["hr"],
                "systolic_bp": tmpl["sbp"],
                "diastolic_bp": int(tmpl["sbp"] * 0.65) if tmpl["sbp"] else 70,
                "spo2": tmpl["spo2"],
                "resp_rate": tmpl["rr"],
                "temperature": 37.0,
                "recorded_by": "Surge Rapid Triage"
            }
        ],
        "total_waiting_mins": wait_mins,
        "elapsed_since_vital": elapsed,
        "is_attended": (i % 5 == 0),
        "attending_physician": "Dr. Surge Responder" if (i % 5 == 0) else None,
        "scenario_tag": f"SURGE_RECORD_{i}"
    })

with open("C:/Users/Admin/.gemini/antigravity/scratch/PatientTriageAI/backend/data/surge_patients.json", "w", encoding="utf-8") as f:
    json.dump(patients, f, indent=2)

print(f"Generated {len(patients)} surge patients in backend/data/surge_patients.json")
