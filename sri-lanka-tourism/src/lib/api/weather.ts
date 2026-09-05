export interface LiveWeatherReport {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  isDay: boolean;
  weatherCode: number;
  condition: string;
  icon: string;
  timestamp: string;
}

export function decodeWmoWeatherCode(code: number, isDay: boolean): { condition: string; icon: string } {
  if (code === 0) {
    return { condition: isDay ? "Clear Sky" : "Clear Night", icon: isDay ? "☀️" : "🌙" };
  }
  if (code === 1) {
    return { condition: isDay ? "Mainly Sunny" : "Mainly Clear", icon: isDay ? "🌤️" : "✨" };
  }
  if (code === 2) {
    return { condition: "Partly Cloudy", icon: "⛅" };
  }
  if (code === 3) {
    return { condition: "Overcast", icon: "☁️" };
  }
  if (code === 45 || code === 48) {
    return { condition: "Misty Fog", icon: "🌫️" };
  }
  if (code >= 51 && code <= 55) {
    return { condition: "Light Drizzle", icon: "🌦️" };
  }
  if (code >= 61 && code <= 67) {
    return { condition: "Rain Showers", icon: "🌧️" };
  }
  if (code >= 80 && code <= 82) {
    return { condition: "Tropical Rain Showers", icon: "🌧️" };
  }
  if (code >= 95) {
    return { condition: "Thunderstorm", icon: "⛈️" };
  }
  return { condition: "Fair Weather", icon: "⛅" };
}

/**
 * Fetches free, live real-time meteorological observations from Open-Meteo
 * for any coordinates in Sri Lanka.
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number
): Promise<LiveWeatherReport | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const isDay = current.is_day === 1;
    const { condition, icon } = decodeWmoWeatherCode(current.weather_code, isDay);

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      isDay,
      weatherCode: current.weather_code,
      condition,
      icon,
      timestamp: current.time,
    };
  } catch (error) {
    console.warn("Failed to fetch live weather, falling back to seasonal estimates:", error);
    return null;
  }
}
