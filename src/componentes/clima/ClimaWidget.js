/**
 * ===============================
 * WIDGET DE CLIMA (UI)
 * ===============================
 *
 * Este componente:
 *
 * - Obtiene la ubicación del usuario (geolocalización del navegador)
 * - Llama al servicio de clima (obtenerClima)
 * - Muestra un widget simple con información meteorológica
 *
 * ===============================
 * FLUJO PRINCIPAL
 * ===============================
 *
 * 1. Al montar el componente:
 *    → solicita ubicación al navegador
 *
 * 2. Con lat/lon:
 *    → consulta ClimaService
 *    → recibe datos normalizados del clima
 *
 * 3. Renderiza:
 *    → icono del clima
 *    → ciudad detectada
 *    → temperatura
 *    → descripción del clima
 *
 * ===============================
 * RESPONSABILIDADES
 * ===============================
 *
 * Este componente SOLO:
 * - Maneja estado visual del clima
 * - Solicita ubicación al navegador
 * - Renderiza información climática
 *
 * La lógica de API está externalizada en ClimaService
 *
 * ===============================
 * DEPENDENCIAS
 * ===============================
 *
 * - ClimaService (obtenerClima)
 * - Geolocalización del navegador
 * - Material UI (Typography)
 *
 */

import React, { useEffect, useState } from "react";
import { obtenerClima } from "./ClimaService";
import { Typography } from "@mui/material";

const ClimaWidget = () => {
  const [clima, setClima] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        obtenerClima(position.coords.latitude, position.coords.longitude).then(
          (data) => setClima(data)
        );
      },
      (error) => console.error("Error al obtener ubicación:", error)
    );
  }, []);

  if (!clima) return null;

  return (
    <div style={{ textAlign: "center", padding: 10 }}>
      <img src={clima.icono} alt="Clima" />
      <Typography variant="subtitle1">
        {clima.ciudad}: {clima.temperatura}°C - {clima.descripcion}
      </Typography>
    </div>
  );
};

export default ClimaWidget;
