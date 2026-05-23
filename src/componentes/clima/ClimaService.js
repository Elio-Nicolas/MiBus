/**
 * ===============================
 * SERVICIO DE CLIMA
 * ===============================
 *
 * Este módulo:
 *
 * - Consulta la API de OpenWeatherMap
 * - Obtiene datos climáticos por coordenadas (lat/lon)
 *
 * - Retorna información procesada del clima:
 *   → temperatura actual (°C)
 *   → descripción del clima (texto en español)
 *   → icono del clima (URL oficial de OpenWeather)
 *   → nombre de la ciudad detectada
 *
 * ===============================
 * RESPONSABILIDAD ÚNICA
 * ===============================
 *
 * Este archivo actúa como capa de servicio:
 *
 * - Encapsula la llamada a la API externa
 * - Normaliza la respuesta
 * - Evita que los componentes consuman la API directamente
 *
 * ===============================
 * OBSERVACIONES
 * ===============================
 *
 * - La API key está embebida (se recomienda mover a .env)
 * - Maneja errores de red y respuestas inválidas
 * - Devuelve null si la consulta falla
 *
 */

export const obtenerClima = async (lat, lon) => {
    const apiKey = "f5b73a20062204806abd00ebe9c39b3c";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.cod === 200) {
        return {
          temperatura: data.main.temp,
          descripcion: data.weather[0].description,
          icono: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          ciudad: data.name
        };
      } else {
        console.error("Error en la API:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error de red:", error);
      return null;
    }
  };
  