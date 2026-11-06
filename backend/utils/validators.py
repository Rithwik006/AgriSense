import re
from datetime import datetime
from typing import Tuple

# RFC 5322 compliant email regex supporting internationalized domains & standard addresses
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$"
)

def validate_email(email: str) -> Tuple[bool, str]:
    """
    Validates an email address.
    Returns (is_valid, error_message).
    """
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    
    clean = email.strip()
    if len(clean) < 5:
        return False, "Email address is too short (minimum 5 characters)."
    if len(clean) > 254:
        return False, "Email address is too long (maximum 254 characters)."
    
    # Check for invalid dot patterns
    if ".." in clean:
        return False, "Email address cannot contain consecutive dots."
    if clean.startswith(".") or clean.endswith("."):
        return False, "Email address cannot start or end with a dot."
    
    parts = clean.split("@")
    if len(parts) != 2:
        return False, "Email address must contain exactly one '@' symbol."
    
    user_part, domain_part = parts
    if not user_part:
        return False, "Email address must contain a username before '@'."
    if not domain_part:
        return False, "Email address must contain a domain after '@'."
    
    if "." not in domain_part:
        return False, "Email domain must include a top-level domain (e.g. .com, .org, .in)."
    
    tld = domain_part.split(".")[-1]
    if len(tld) < 2 or not tld.isalpha():
        return False, "Email top-level domain must contain at least 2 letters (e.g. .com, .in, .org)."
    
    if not EMAIL_REGEX.match(clean):
        return False, "Invalid email format. Please enter a valid email address (e.g., farmer@domain.com)."
    
    return True, ""

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
