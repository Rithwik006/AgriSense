from typing import Dict, Any, List

class SoilAnalyzerService:
    @staticmethod
    def analyze(ph: float, nitrogen: float, phosphorus: float, potassium: float, moisture: float) -> Dict[str, Any]:
        # pH Classification
        if ph < 5.5:
            ph_cond = "Highly Acidic"
        elif 5.5 <= ph < 6.5:
            ph_cond = "Slightly Acidic"
        elif 6.5 <= ph <= 7.5:
            ph_cond = "Neutral"
        elif 7.5 < ph <= 8.5:
            ph_cond = "Slightly Alkaline"
        else:
            ph_cond = "Highly Alkaline"

        # NPK Classification
        n_cond = "Low" if nitrogen < 20 else ("Medium" if nitrogen <= 50 else "High")
        p_cond = "Low" if phosphorus < 15 else ("Medium" if phosphorus <= 30 else "High")
        k_cond = "Low" if potassium < 100 else ("Medium" if potassium <= 250 else "High")

        # Moisture Classification
        if moisture < 30.0:
            m_cond = "Dry"
        elif 30.0 <= moisture <= 60.0:
            m_cond = "Optimal"
        else:
            m_cond = "Wet"

        # Overall Condition Assessment
        optimal_count = sum([
            1 if ph_cond in ["Slightly Acidic", "Neutral", "Slightly Alkaline"] else 0,
            1 if n_cond in ["Medium", "High"] else 0,
            1 if p_cond in ["Medium", "High"] else 0,
            1 if k_cond in ["Medium", "High"] else 0,
            1 if m_cond == "Optimal" else 0
        ])

        if optimal_count == 5:
            overall = "Optimal Fertility"
        elif optimal_count >= 3:
            overall = "Moderate Fertility"
        else:
            overall = "Poor / Deficient Soil"

        # Construct actionable suggestions
        suggestions: List[str] = []
        if ph < 5.5:
            suggestions.append("Apply agricultural lime (calcium carbonate) to increase soil pH to an optimal level.")
        elif ph > 8.5:
            suggestions.append("Apply elemental sulfur or gypsum to reduce soil alkalinity.")

        if n_cond == "Low":
            suggestions.append("Incorporate nitrogen-rich fertilizers (e.g. Urea, Ammonium Nitrate) or legume green manure.")
        if p_cond == "Low":
            suggestions.append("Apply single superphosphate (SSP) or rock phosphate to boost root development.")
        if k_cond == "Low":
            suggestions.append("Apply Muriate of Potash (MOP) or composted organic matter to strengthen crop disease resistance.")

        if m_cond == "Dry":
            suggestions.append("Schedule drip or sprinkler irrigation immediately to restore root zone moisture.")
        elif m_cond == "Wet":
            suggestions.append("Ensure proper field drainage to prevent waterlogging and root rot.")

        if not suggestions:
            suggestions.append("Soil parameters are well balanced. Maintain current organic matter management.")

        return {
            "ph_condition": ph_cond,
            "nitrogen_condition": n_cond,
            "phosphorus_condition": p_cond,
            "potassium_condition": k_cond,
            "moisture_condition": m_cond,
            "overall_condition": overall,
            "suggestions": suggestions
        }
