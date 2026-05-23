// src/context/weatherTheme.js

export const getWeatherTheme = (code) => {
  // fallback seguro
  if (code === null || code === undefined) {
    return {
      bg: "#0f172a",
      border: "#1e293b",
      accent: "#38bdf8"
    };
  }

  // ☀️ Despejado
  if (code < 3) {
    return {
      bg: "#0c4a6e",        // azul cielo profundo
      border: "#38bdf8",
      accent: "#7dd3fc"
    };
  }

  // ⛅ Parcialmente nublado
  if (code < 45) {
    return {
      bg: "#1e293b",        // slate
      border: "#64748b",
      accent: "#94a3b8"
    };
  }

  // 🌧️ Lluvia
  if (code < 55) {
    return {
      bg: "#020617",        // noche lluviosa
      border: "#1e40af",
      accent: "#60a5fa"
    };
  }

  // 🌨️ Nieve / frío
  if (code < 75) {
    return {
      bg: "#082f49",
      border: "#38bdf8",
      accent: "#bae6fd"
    };
  }

  // ⛈️ Tormenta
  if (code < 95) {
    return {
      bg: "#020617",
      border: "#7c3aed",
      accent: "#c4b5fd"
    };
  }

  // default
  return {
    bg: "#0f172a",
    border: "#1e293b",
    accent: "#38bdf8"
  };
};
