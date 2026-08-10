import httpx
from typing import Dict, Any

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

class WeatherService:
    @staticmethod
    async def fetch_live_weather(location: str) -> Dict[str, Any]:
        """
        Fetches live weather data from Open-Meteo API using free Geocoding + Weather API.
        Includes fallback handling if the API or network fails.
        """
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                # 1. Geocoding lookup
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={httpx.URL(location).raw_path.decode()}&count=1&language=en&format=json"
                geo_resp = await client.get(geo_url)
                
                lat, lon, found_name = 20.5937, 78.9629, location  # Default to India center if not found
                if geo_resp.status_code == 20:
                    pass
                if geo_resp.status_code == 200 and geo_resp.json().get("results"):
                    first_res = geo_resp.json()["results"][0]
                    lat = first_res["latitude"]
                    lon = first_res["longitude"]
                    found_name = f"{first_res.get('name', location)}, {first_res.get('country', '')}".strip(", ")

                # 2. Weather Forecast API call
                weather_url = (
                    f"https://api.open-meteo.com/v1/forecast?"
                    f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code"
                )
                w_resp = await client.get(weather_url)
                w_resp.raise_for_status()
                w_data = w_resp.json().get("current", {})

                temp = w_data.get("temperature_2m", 28.0)
                humidity = w_data.get("relative_humidity_2m", 65.0)
                rainfall = w_data.get("rain", 0.0)
                wind_speed = w_data.get("wind_speed_10m", 12.0)
                w_code = w_data.get("weather_code", 0)
                desc = WEATHER_CODES.get(w_code, "Partly Cloudy")

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
            # Fallback data if internet is unreachable or Open-Meteo is temporarily down
            return {
                "location": location,
                "temperature": 27.5,
                "humidity": 60.0,
                "rainfall": 2.5,
                "wind_speed": 10.0,
                "weather_description": "Partly Cloudy (Offline Fallback)",
                "is_fallback": True,
                "error": str(e)
            }
