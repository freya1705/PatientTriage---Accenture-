"""
Age-Aware Threshold Engine for PatientTriage.ai
Handles distinct physiological baselines and risk calibrations for:
- Pediatric (0 - 15 years)
- Adult (16 - 64 years)
- Geriatric (65+ years)
"""

from typing import Dict, Any, Tuple

def get_age_group(age: int) -> str:
    if age < 16:
        return "Pediatric"
    elif age >= 65:
        return "Geriatric"
    return "Adult"

def evaluate_age_adjusted_vitals(age: int, vitals: Dict[str, Any]) -> Tuple[float, list[str], Dict[str, str]]:
    """
    Evaluates vital signs against age-stratified thresholds.
    Returns:
    - abnormality_score (0.0 to 40.0)
    - list of plain-English clinical alerts
    - dictionary of abnormal flags per vital sign
    """
    age_group = get_age_group(age)
    score = 0.0
    alerts = []
    flags = {}

    hr = vitals.get("heart_rate")
    sbp = vitals.get("systolic_bp")
    dbp = vitals.get("diastolic_bp")
    spo2 = vitals.get("spo2")
    rr = vitals.get("resp_rate")
    temp = vitals.get("temperature")

    # 1. Pediatric Vitals Evaluation (<16yo)
    if age_group == "Pediatric":
        if hr is not None:
            if age < 2:
                if hr > 160 or hr < 80:
                    score += 15.0
                    alerts.append(f"Pediatric infant extreme heart rate: {hr} bpm (normal: 80-160)")
                    flags["heart_rate"] = "critical"
                elif hr > 140 or hr < 90:
                    score += 8.0
                    alerts.append(f"Pediatric infant elevated heart rate: {hr} bpm")
                    flags["heart_rate"] = "abnormal"
            else:
                if hr > 140 or hr < 60:
                    score += 12.0
                    alerts.append(f"Pediatric tachycardia/bradycardia: {hr} bpm (normal: 70-130)")
                    flags["heart_rate"] = "critical"
                elif hr > 120 or hr < 70:
                    score += 6.0
                    flags["heart_rate"] = "abnormal"

        if rr is not None:
            if rr > 40 or rr < 16:
                score += 15.0
                alerts.append(f"Pediatric severe tachypnea/bradypnea: {rr}/min (normal: 20-30)")
                flags["resp_rate"] = "critical"
            elif rr > 30 or rr < 18:
                score += 8.0
                alerts.append(f"Pediatric tachypnea: {rr}/min")
                flags["resp_rate"] = "abnormal"

        if temp is not None:
            if age <= 3 and temp >= 38.5:
                score += 14.0
                alerts.append(f"Pediatric high fever in toddler (<3yo): {temp}°C (high risk of rapid decompensation/sepsis)")
                flags["temperature"] = "critical"
            elif temp >= 39.0:
                score += 10.0
                alerts.append(f"Pediatric high fever: {temp}°C")
                flags["temperature"] = "abnormal"
            elif temp < 36.0:
                score += 12.0
                alerts.append(f"Pediatric hypothermia: {temp}°C")
                flags["temperature"] = "critical"

        if sbp is not None:
            min_expected_sbp = 70 + (2 * age)
            if sbp < min_expected_sbp:
                score += 18.0
                alerts.append(f"Pediatric hypotension: {sbp} mmHg (min expected: {min_expected_sbp} mmHg)")
                flags["systolic_bp"] = "critical"

    # 2. Geriatric Vitals Evaluation (65+yo)
    elif age_group == "Geriatric":
        if hr is not None:
            if hr > 110 or hr < 50:
                score += 14.0
                alerts.append(f"Geriatric abnormal heart rate: {hr} bpm (blunted cardiac reserve)")
                flags["heart_rate"] = "critical"
            elif hr > 95 or hr < 55:
                score += 7.0
                alerts.append(f"Geriatric tachycardia: {hr} bpm")
                flags["heart_rate"] = "abnormal"

        if sbp is not None:
            if sbp < 100:
                score += 16.0
                alerts.append(f"Geriatric hypotension: {sbp} mmHg (critical hypoperfusion risk)")
                flags["systolic_bp"] = "critical"
            elif sbp > 180:
                score += 10.0
                alerts.append(f"Geriatric severe hypertensive crisis risk: {sbp} mmHg")
                flags["systolic_bp"] = "abnormal"

        if temp is not None:
            # Geriatric patients frequently fail to mount high fevers during severe infections (blunted thermoregulation)
            if temp < 36.0:
                score += 16.0
                alerts.append(f"Geriatric hypothermia ({temp}°C) — occult sepsis warning signal")
                flags["temperature"] = "critical"
            elif temp >= 38.0:
                score += 12.0
                alerts.append(f"Geriatric fever: {temp}°C (significant infection in elderly)")
                flags["temperature"] = "critical"

        if rr is not None:
            if rr > 24 or rr < 10:
                score += 14.0
                alerts.append(f"Geriatric tachypnea: {rr}/min (early respiratory failure indicator)")
                flags["resp_rate"] = "critical"
            elif rr > 20:
                score += 7.0
                flags["resp_rate"] = "abnormal"

    # 3. Adult Vitals Evaluation (16-64yo)
    else:
        if hr is not None:
            if hr > 130 or hr < 45:
                score += 14.0
                alerts.append(f"Severe adult tachycardia/bradycardia: {hr} bpm")
                flags["heart_rate"] = "critical"
            elif hr > 100 or hr < 55:
                score += 7.0
                alerts.append(f"Adult elevated heart rate: {hr} bpm")
                flags["heart_rate"] = "abnormal"

        if sbp is not None:
            if sbp < 90:
                score += 16.0
                alerts.append(f"Adult hypotension: {sbp} mmHg (shock criteria)")
                flags["systolic_bp"] = "critical"
            elif sbp > 190:
                score += 10.0
                alerts.append(f"Adult severe hypertension: {sbp} mmHg")
                flags["systolic_bp"] = "abnormal"

        if rr is not None:
            if rr > 28 or rr < 10:
                score += 14.0
                alerts.append(f"Adult abnormal respiratory rate: {rr}/min")
                flags["resp_rate"] = "critical"
            elif rr > 22:
                score += 7.0
                flags["resp_rate"] = "abnormal"

        if temp is not None:
            if temp >= 39.5:
                score += 10.0
                alerts.append(f"Adult high fever: {temp}°C")
                flags["temperature"] = "abnormal"
            elif temp < 35.5:
                score += 12.0
                alerts.append(f"Adult hypothermia: {temp}°C")
                flags["temperature"] = "critical"

    # Universal SpO2 checks with age vulnerability adjustments
    if spo2 is not None:
        if spo2 < 90:
            score += 18.0
            alerts.append(f"Severe hypoxemia: SpO₂ {spo2}%")
            flags["spo2"] = "critical"
        elif spo2 < 94:
            score += (12.0 if age_group in ["Pediatric", "Geriatric"] else 8.0)
            alerts.append(f"Low oxygen saturation: SpO₂ {spo2}%")
            flags["spo2"] = "abnormal"

    # Cap abnormality score to 40.0 max
    score = min(score, 40.0)
    return score, alerts, flags
