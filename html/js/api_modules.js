const OPENWEATHER_API_KEY = 'f705c9641c740e04e617f0c023707357';

export async function getWeatherByCoords(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error(`Weather fetch failed: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
}