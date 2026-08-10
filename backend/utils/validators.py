from datetime import datetime

def validate_soil_input(ph: float, n: float, p: float, k: float, moisture: float):
    errors = []
    if ph < 0 or ph > 14:
        errors.append("pH must be between 0.0 and 14.0.")
    if n < 0:
        errors.append("Nitrogen level cannot be negative.")
    if p < 0:
        errors.append("Phosphorus level cannot be negative.")
    if k < 0:
        errors.append("Potassium level cannot be negative.")
    if moisture < 0 or moisture > 100:
        errors.append("Moisture level must be between 0% and 100%.")
    return errors

def validate_crop_dates(planting_date: str, harvest_date: str):
    try:
        p_date = datetime.strptime(planting_date, "%Y-%m-%d")
        h_date = datetime.strptime(harvest_date, "%Y-%m-%d")
        if h_date < p_date:
            return "Expected harvest date cannot be earlier than planting date."
    except ValueError:
        return "Dates must be in YYYY-MM-DD format."
    return None
