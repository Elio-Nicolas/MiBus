/**
 * ===============================
 * DRAWER DE CLIMA
 * ===============================
 *
 * Este componente:
 *
 * - Renderiza un panel lateral (Drawer) usando Material UI
 * - Muestra información climática en forma de panel flotante
 *
 * ===============================
 * FUNCIONALIDAD PRINCIPAL
 * ===============================
 *
 * - Controlado por props:
 *   → open: abre/cierra el drawer
 *   → onClose: callback de cierre
 *   → children: contenido dinámico del clima
 *
 * - Se posiciona en el lado derecho de la pantalla
 * - Se monta dentro del contenedor del mapa ("map-wrapper")
 *
 * ===============================
 * RESPONSABILIDAD
 * ===============================
 *
 * Este componente es puramente PRESENTACIONAL:
 *
 * - No obtiene datos
 * - No maneja lógica de clima
 * - No hace fetch ni geolocalización
 *
 * Solo actúa como contenedor visual del widget climático
 *
 * ===============================
 * DISEÑO
 * ===============================
 *
 * - Fondo semitransparente celeste
 * - Layout centrado
 * - Optimizado para overlay sobre mapa
 *
 */

import React from "react";
import { Drawer, Typography, Box } from "@mui/material";

const ClimaDrawer = ({ open, onClose, children }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      container={document.getElementById("map-wrapper")}
      PaperProps={{
        sx: {
          width: 300,
          backgroundColor: "rgba(169, 213, 238, 0.8)",
          padding: 2,
          textAlign: "center",
        },
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🌤️ Clima actual
      </Typography>
      <Box>{children}</Box>
    </Drawer>
  );
};

export default ClimaDrawer;
