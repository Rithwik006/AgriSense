import os
import time
import json
import base64
import hmac
import hashlib
import secrets
from typing import Optional, Dict, Any

SECRET_KEY = os.getenv("SECRET_KEY", "agrisense_secure_jwt_token_key_2026_xyz").encode()

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes password with a unique 16-byte random salt using PBKDF2-HMAC-SHA256."""
        salt = secrets.token_hex(16)
        h = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
        return f"{salt}:{h}"

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifies plain password against salt:hash string."""
        try:
            parts = hashed_password.split(":", 1)
            if len(parts) != 2:
                return False
            salt, stored_hash = parts
            calc_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
            return hmac.compare_digest(stored_hash, calc_hash)
        except Exception:
            return False

    @staticmethod
    def create_token(user_id: int, email: str, days_valid: int = 7) -> str:
        """Creates a signed URL-safe JWT-like token with expiration."""
        payload = {
            "sub": user_id,
            "email": email,
            "exp": int(time.time()) + (days_valid * 86400)
        }
        payload_json = json.dumps(payload, separators=(",", ":"))
        payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8").rstrip("=")
        sig = hmac.new(SECRET_KEY, payload_b64.encode("utf-8"), "sha256").hexdigest()
        return f"{payload_b64}.{sig}"

    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verifies signature and expiration of token. Returns payload dict or None."""
        try:
            parts = token.split(".")
            if len(parts) != 2:
                return None
            payload_b64, sig = parts
            expected_sig = hmac.new(SECRET_KEY, payload_b64.encode("utf-8"), "sha256").hexdigest()
            if not hmac.compare_digest(sig, expected_sig):
                return None

            rem = len(payload_b64) % 4
            if rem > 0:
                payload_b64 += "=" * (4 - rem)
            
            payload_json = base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8")
            payload = json.loads(payload_json)
            if payload.get("exp", 0) < time.time():
                return None
            return payload
        except Exception:
            return None
