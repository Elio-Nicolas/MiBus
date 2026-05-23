import { useEffect, useState } from "react";

export function useWeatherClock() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(null);

  const formattedDate = time.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData.current_weather);

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoRes.json();

        const address = geoData.address;
        setCity(address.city || address.town || address.village || address.state);
      } catch (err) {
        console.warn("Error clima/ciudad", err);
      }
    });
  }, []);

  return {
    time,
    weather,
    city,
    formattedDate,
  };
}