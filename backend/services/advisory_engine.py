from typing import Dict, Any, List

class AdvisoryEngineService:
    @staticmethod
    def generate_advisory(
        crop_name: str,
        ph: float = 6.5,
        nitrogen: float = 30.0,
        phosphorus: float = 20.0,
        potassium: float = 150.0,
        moisture: float = 45.0,
        temperature: float = 28.0,
        rainfall: float = 5.0,
        humidity: float = 60.0
    ) -> Dict[str, Any]:
        """
        Rule-based Advisory Engine evaluating Crop, Soil metrics, and Weather metrics.
        """
        recs: List[str] = []
        reasons: List[str] = []
        high_risk_count = 0
        med_risk_count = 0

        # Soil pH checks
        if ph < 5.5:
            recs.append("Consider suitable soil amendments such as agricultural lime to improve acidic soil pH.")
            reasons.append(f"Soil pH of {ph} is highly acidic, which inhibits root nutrient intake.")
            high_risk_count += 1
        elif ph > 8.5:
            recs.append("Apply gypsum or elemental sulfur to balance high soil alkalinity.")
            reasons.append(f"Soil pH of {ph} is highly alkaline.")
            med_risk_count += 1

        # NPK checks
        if nitrogen < 20:
            recs.append("Consider nitrogen-rich fertilizer (e.g., Urea) or organic manure.")
            reasons.append(f"Nitrogen level ({nitrogen} mg/kg) is low.")
            high_risk_count += 1
        if phosphorus < 15:
            recs.append("Consider phosphorus supplementation (e.g., Single Superphosphate).")
            reasons.append(f"Phosphorus level ({phosphorus} mg/kg) is low.")
            med_risk_count += 1
        if potassium < 100:
            recs.append("Consider potassium-rich fertilizer (e.g., Muriate of Potash).")
            reasons.append(f"Potassium level ({potassium} mg/kg) is low.")
            med_risk_count += 1

        # Soil Moisture & Rainfall checks
        if moisture < 30.0:
            recs.append("Irrigation may be required immediately to prevent drought stress.")
            reasons.append(f"Soil moisture is critically low at {moisture}%.")
            high_risk_count += 1
        elif moisture > 75.0 or rainfall > 40.0:
            recs.append("Reduce unnecessary irrigation and monitor fields for waterlogging and root rot.")
            reasons.append(f"High moisture ({moisture}%) or high rainfall ({rainfall} mm) observed.")
            high_risk_count += 1

        # Temperature checks
        if temperature > 35.0:
            recs.append("Increase irrigation monitoring and protect crops from severe heat stress.")
            reasons.append(f"Ambient temperature of {temperature}°C exceeds optimal threshold.")
            high_risk_count += 1
        elif temperature < 10.0:
            recs.append("Provide frost protection or protective covers for vulnerable crops.")
            reasons.append(f"Ambient temperature of {temperature}°C is close to freezing.")
            med_risk_count += 1

        # Humidity & Disease Risk checks
        if humidity > 80.0:
            recs.append("Monitor crops for fungal disease risk and apply preventive bio-fungicides if necessary.")
            reasons.append(f"High humidity ({humidity}%) creates favorable environment for foliar pathogens.")
            med_risk_count += 1

        # Fallback if all parameters optimal
        if not recs:
            recs.append("Soil and weather conditions are optimal for crop growth. Continue standard cultivation practices.")
            reasons.append("All measured soil nutrients, moisture, temperature, and humidity levels are within ideal ranges.")
            priority = "Low"
        else:
            if high_risk_count >= 2 or (high_risk_count >= 1 and med_risk_count >= 2):
                priority = "High"
            elif high_risk_count == 1 or med_risk_count >= 1:
                priority = "Medium"
            else:
                priority = "Low"

        # Formulate soil condition summary
        soil_cond_str = f"pH {ph} | N:{nitrogen} P:{phosphorus} K:{potassium} | Moist:{moisture}%"
        weather_cond_str = f"Temp {temperature}°C | Rain {rainfall}mm | Hum {humidity}%"

        return {
            "crop_name": crop_name,
            "soil_condition": soil_cond_str,
            "weather_condition": weather_cond_str,
            "recommendation": " ".join(recs),
            "priority": priority,
            "reason": " ".join(reasons)
        }
