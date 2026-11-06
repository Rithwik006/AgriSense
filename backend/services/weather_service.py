import httpx
import re
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snowfall",
    73: "Moderate Snowfall",
    75: "Heavy Snowfall",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Light Hail",
    99: "Thunderstorm with Heavy Hail"
}

# Pre-indexed agricultural hubs and major regions across India & the world
KNOWN_LOCATIONS: Dict[str, Tuple[float, float, str]] = {
    # Telangana
    "hyderabad": (17.3850, 78.4867, "Hyderabad, Telangana, India"),
    "warangal": (17.9784, 79.5941, "Warangal, Telangana, India"),
    "karimnagar": (18.4386, 79.1288, "Karimnagar, Telangana, India"),
    "nizamabad": (18.6725, 78.0941, "Nizamabad, Telangana, India"),
    "khammam": (17.2473, 80.1514, "Khammam, Telangana, India"),
    "nalgonda": (17.0575, 79.2684, "Nalgonda, Telangana, India"),
    "mahbubnagar": (16.7488, 78.0035, "Mahbubnagar, Telangana, India"),
    "adilabad": (19.6640, 78.5320, "Adilabad, Telangana, India"),

    # Andhra Pradesh
    "vijayawada": (16.5062, 80.6480, "Vijayawada, Andhra Pradesh, India"),
    "guntur": (16.3067, 80.4365, "Guntur, Andhra Pradesh, India"),
    "visakhapatnam": (17.6868, 83.2185, "Visakhapatnam, Andhra Pradesh, India"),
    "rajahmundry": (17.0005, 81.8040, "Rajahmundry, Andhra Pradesh, India"),
    "tirupati": (13.6288, 79.4192, "Tirupati, Andhra Pradesh, India"),
    "kurnool": (15.8281, 78.0373, "Kurnool, Andhra Pradesh, India"),
    "anantapur": (14.6819, 77.6006, "Anantapur, Andhra Pradesh, India"),
    "nellore": (14.4426, 79.9865, "Nellore, Andhra Pradesh, India"),
    "kadapa": (14.4673, 78.8242, "Kadapa, Andhra Pradesh, India"),

    # Maharashtra
    "mumbai": (19.0760, 72.8777, "Mumbai, Maharashtra, India"),
    "pune": (18.5204, 73.8567, "Pune, Maharashtra, India"),
    "nagpur": (21.1458, 79.0882, "Nagpur, Maharashtra, India"),
    "nashik": (19.9975, 73.7898, "Nashik, Maharashtra, India"),
    "aurangabad": (19.8762, 75.3433, "Chhatrapati Sambhajinagar, Maharashtra, India"),
    "solapur": (17.6599, 75.9064, "Solapur, Maharashtra, India"),
    "kolhapur": (16.7050, 74.2433, "Kolhapur, Maharashtra, India"),
    "amravati": (20.9320, 77.7523, "Amravati, Maharashtra, India"),
    "nanded": (19.1383, 77.3210, "Nanded, Maharashtra, India"),

    # Karnataka
    "bengaluru": (12.9716, 77.5946, "Bengaluru, Karnataka, India"),
    "bangalore": (12.9716, 77.5946, "Bengaluru, Karnataka, India"),
    "mysuru": (12.2958, 76.6394, "Mysuru, Karnataka, India"),
    "mysore": (12.2958, 76.6394, "Mysuru, Karnataka, India"),
    "hubballi": (15.3647, 75.1240, "Hubballi-Dharwad, Karnataka, India"),
    "belagavi": (15.8497, 74.4977, "Belagavi, Karnataka, India"),
    "mangaluru": (12.9141, 74.8560, "Mangaluru, Karnataka, India"),
    "shimoga": (13.9299, 75.5681, "Shivamogga, Karnataka, India"),

    # Punjab
    "ludhiana": (30.9010, 75.8573, "Ludhiana, Punjab, India"),
    "amritsar": (31.6340, 74.8723, "Amritsar, Punjab, India"),
    "jalandhar": (31.3260, 75.5762, "Jalandhar, Punjab, India"),
    "patiala": (30.3398, 76.3869, "Patiala, Punjab, India"),
    "bathinda": (30.2110, 74.9455, "Bathinda, Punjab, India"),
    "hoshiarpur": (31.5273, 75.9149, "Hoshiarpur, Punjab, India"),
    "chandigarh": (30.7333, 76.7794, "Chandigarh, India"),

    # Tamil Nadu
    "chennai": (13.0827, 80.2707, "Chennai, Tamil Nadu, India"),
    "coimbatore": (11.0168, 76.9558, "Coimbatore, Tamil Nadu, India"),
    "madurai": (9.9252, 78.1198, "Madurai, Tamil Nadu, India"),
    "tiruchirappalli": (10.7905, 78.7047, "Tiruchirappalli, Tamil Nadu, India"),
    "salem": (11.6643, 78.1460, "Salem, Tamil Nadu, India"),
    "erode": (11.3410, 77.7172, "Erode, Tamil Nadu, India"),
    "thanjavur": (10.7870, 79.1378, "Thanjavur, Tamil Nadu, India"),

    # North & Central India
    "delhi": (28.6139, 77.2090, "New Delhi, Delhi, India"),
    "new delhi": (28.6139, 77.2090, "New Delhi, Delhi, India"),
    "jaipur": (26.9124, 75.7873, "Jaipur, Rajasthan, India"),
    "jodhpur": (26.2389, 73.0243, "Jodhpur, Rajasthan, India"),
    "lucknow": (26.8467, 80.9462, "Lucknow, Uttar Pradesh, India"),
    "kanpur": (26.4499, 80.3319, "Kanpur, Uttar Pradesh, India"),
    "varanasi": (25.3176, 82.9739, "Varanasi, Uttar Pradesh, India"),
    "agra": (27.1767, 78.0081, "Agra, Uttar Pradesh, India"),
    "patna": (25.5941, 85.1376, "Patna, Bihar, India"),
    "kolkata": (22.5726, 88.3639, "Kolkata, West Bengal, India"),
    "ahmedabad": (23.0225, 72.5714, "Ahmedabad, Gujarat, India"),
    "surat": (21.1702, 72.8311, "Surat, Gujarat, India"),
    "bhopal": (23.2599, 77.4126, "Bhopal, Madhya Pradesh, India"),
    "indore": (22.7196, 75.8577, "Indore, Madhya Pradesh, India"),
    "raipur": (21.2514, 81.6296, "Raipur, Chhattisgarh, India"),
    "ranchi": (23.3441, 85.3096, "Ranchi, Jharkhand, India"),
    "bhubaneswar": (20.2961, 85.8245, "Bhubaneswar, Odisha, India"),
    "kochi": (9.9312, 76.2673, "Kochi, Kerala, India"),
    "thiruvananthapuram": (8.5241, 76.9366, "Thiruvananthapuram, Kerala, India"),

    # Global
    "london": (51.5074, -0.1278, "London, United Kingdom"),
    "new york": (40.7128, -74.0060, "New York, United States"),
    "tokyo": (35.6762, 139.6503, "Tokyo, Japan"),
    "sydney": ( -33.8688, 151.2093, "Sydney, Australia"),
    "paris": (48.8566, 2.3522, "Paris, France"),
    "dubai": (25.2048, 55.2708, "Dubai, United Arab Emirates")
}

class WeatherService:
    @staticmethod
    def _get_preset_location(query: str) -> Optional[Tuple[float, float, str]]:
        clean = query.strip().lower()
        if clean in KNOWN_LOCATIONS:
            return KNOWN_LOCATIONS[clean]
        
        # Check first token (e.g. "Hyderabad, India" -> "hyderabad")
        first_token = clean.split(",")[0].strip().replace(".", "")
        if first_token in KNOWN_LOCATIONS:
            return KNOWN_LOCATIONS[first_token]
        
        # Substring match
        for key, val in KNOWN_LOCATIONS.items():
            if key in clean or clean in key:
                return val
        return None

    @staticmethod
    def _generate_deterministic_weather(location: str, lat: float = 20.59, lon: float = 78.96) -> Dict[str, Any]:
        """
        Generates realistic, physically-plausible weather for any location
        when Open-Meteo or the network is temporarily unreachable.
        Varies by latitude, month, and unique location characteristics
        instead of repeating an uninformative constant.
        """
        now = datetime.utcnow()
        month = now.month
        hour = now.hour

        # Create hash seed from location name
        h = int(hashlib.md5(location.lower().encode("utf-8")).hexdigest()[:6], 16)
        variation = (h % 50) / 10.0 - 2.5  # -2.5 to +2.5

        # Base temperature by latitude zone
        if lat > 28.0:
            # Northern zone (e.g. Punjab, Delhi, UP)
            base_temp = 20.0 if month in [11, 12, 1, 2] else (34.0 if month in [4, 5, 6] else 28.0)
            base_hum = 55.0
            base_rain = 0.0 if month in [11, 12, 1, 2] else 5.0
        elif lat > 18.0:
            # Central / Deccan zone (Telangana, Maharashtra, Gujarat, MP)
            base_temp = 28.5 if month in [11, 12, 1, 2] else (36.0 if month in [3, 4, 5] else 30.0)
            base_hum = 60.0
            base_rain = 1.0 if month in [10, 11] else (12.0 if month in [7, 8, 9] else 0.0)
        else:
            # Southern / Coastal zone (Tamil Nadu, Kerala, AP, Karnataka)
            base_temp = 29.5
            base_hum = 72.0
            base_rain = 8.0 if month in [10, 11, 12] else 3.0

        # Diurnal temperature cycle (cooler at night/early morning)
        diurnal = 3.5 if 10 <= hour <= 16 else (-2.5 if 0 <= hour <= 6 else 0.5)

        calculated_temp = round(base_temp + variation + diurnal, 1)
        calculated_hum = round(min(98.0, max(25.0, base_hum + ((h % 30) - 15))), 1)
        calculated_rain = round(max(0.0, base_rain + ((h % 10) / 2.0)), 1)
        calculated_wind = round(8.0 + (h % 12), 1)

        if calculated_rain > 10.0:
            desc = "Moderate Rain Showers"
        elif calculated_rain > 2.0:
            desc = "Light Drizzle"
        elif calculated_temp > 35.0:
            desc = "Hot & Sunny"
        elif calculated_hum > 75.0:
            desc = "Partly Cloudy & Humid"
        elif calculated_wind > 15.0:
            desc = "Breezy & Clear"
        else:
            desc = "Mainly Clear"

        return {
            "location": location,
            "temperature": calculated_temp,
            "humidity": calculated_hum,
            "rainfall": calculated_rain,
            "wind_speed": calculated_wind,
            "weather_description": f"{desc} (Offline Simulation)",
            "is_fallback": True
        }

    @staticmethod
    async def fetch_live_weather(location: str) -> Dict[str, Any]:
        """
        Fetches live weather data from Open-Meteo with headers, geocoding resolution,
        timeout safety, and rich agricultural meteorological metrics.
        """
        clean_loc = location.strip()
        if not clean_loc:
            clean_loc = "Hyderabad, Telangana, India"

        # Check pre-defined high-accuracy coordinates first
        preset = WeatherService._get_preset_location(clean_loc)
        lat: Optional[float] = None
        lon: Optional[float] = None
        found_name: str = clean_loc

        if preset:
            lat, lon, found_name = preset

        headers = {
            "User-Agent": "AgriSense-Precision-Agri/1.0 (contact: support@agrisense.org)",
            "Accept": "application/json"
        }

        try:
            timeout_cfg = httpx.Timeout(8.0, connect=4.0)
            async with httpx.AsyncClient(timeout=timeout_cfg, headers=headers, follow_redirects=True) as client:
                # 1. If coordinates not found in preset, do Open-Meteo Geocoding
                if lat is None or lon is None:
                    # Clean search string: remove commas or country tags if necessary
                    search_query = clean_loc.split(",")[0].strip()
                    geo_resp = await client.get(
                        "https://geocoding-api.open-meteo.com/v1/search",
                        params={"name": search_query, "count": 1, "language": "en", "format": "json"}
                    )
                    
                    if geo_resp.status_code == 200 and geo_resp.json().get("results"):
                        res = geo_resp.json()["results"][0]
                        lat = res["latitude"]
                        lon = res["longitude"]
                        name_parts = [res.get("name", clean_loc)]
                        if res.get("admin1"):
                            name_parts.append(res["admin1"])
                        if res.get("country"):
                            name_parts.append(res["country"])
                        found_name = ", ".join(name_parts)

                # If still unresolved, default to central Deccan agricultural zone
                if lat is None or lon is None:
                    lat, lon = 17.3850, 78.4867
                    found_name = clean_loc

                # 2. Weather Forecast API call with accurate metrics
                forecast_params = {
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code"
                }
                w_resp = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params=forecast_params
                )
                w_resp.raise_for_status()
                w_data = w_resp.json().get("current", {})

                temp = w_data.get("temperature_2m")
                humidity = w_data.get("relative_humidity_2m")
                rainfall = w_data.get("rain", 0.0)
                wind_speed = w_data.get("wind_speed_10m", 10.0)
                w_code = w_data.get("weather_code", 1)
                desc = WEATHER_CODES.get(w_code, "Mainly Clear")

                if temp is not None and humidity is not None:
                    return {
                        "location": found_name,
                        "temperature": round(float(temp), 1),
                        "humidity": round(float(humidity), 1),
                        "rainfall": round(float(rainfall), 1),
                        "wind_speed": round(float(wind_speed), 1),
                        "weather_description": desc,
                        "is_fallback": False
                    }

        except Exception as e:
            # Pass through to dynamic deterministic calculation if network or API is down
            pass

        # Intelligent offline fallback if network is unreachable
        return WeatherService._generate_deterministic_weather(
            found_name,
            lat=lat if lat is not None else 20.59,
            lon=lon if lon is not None else 78.96
        )
