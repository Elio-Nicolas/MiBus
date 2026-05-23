/**
 * ===============================
 * DRAWER DE LÍNEAS DE COLECTIVOS
 * ===============================
 *
 * Este componente:
 *
 * - Renderiza un Drawer inferior (bottom sheet) con Material UI
 * - Muestra lista de buses activos en el sistema
 * - Permite seleccionar líneas de colectivo disponibles
 *
 * ===============================
 * FUNCIONALIDAD PRINCIPAL
 * ===============================
 *
 * - Recibe como props:
 *   → open: controla apertura del drawer
 *   → onClose: cierra el drawer
 *   → buses: lista de buses activos
 *   → onLineaSelect: callback al seleccionar una línea
 *
 * - Renderiza:
 *   → listado de buses con información básica
 *   → botones de selección de líneas
 *
 * ===============================
 * DATOS MOSTRADOS
 * ===============================
 *
 * Por cada bus:
 * - Nombre o identificador
 * - Coordenadas (lat/lon)
 * - Timestamp de última actualización
 *
 * ===============================
 * RESPONSABILIDAD
 * ===============================
 *
 * Este componente es principalmente PRESENTACIONAL:
 *
 * - No obtiene datos por sí mismo
 * - No maneja lógica de backend
 * - Solo renderiza información recibida por props
 *
 * ===============================
 * OBSERVACIÓN
 * ===============================
 *
 * - lineasDisponibles está hardcodeado (A, E, Z E, Z O)
 * - Podría moverse a configuración central si escala el sistema
 *
 */

import React from "react";
import {
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const LineasDrawer = ({ open, onClose, buses = [], onLineaSelect }) => {
  const lineasDisponibles = ["A", "E", "ZE", "Z O"];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      container={document.getElementById("map-wrapper")}
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ color: "#000" }}>Líneas de colectivo</Typography>
          <IconButton onClick={onClose} sx={{ color: "#000" }}>
            <CloseIcon />
          </IconButton>
        </div>

        <Divider sx={{ my: 1, borderColor: "#000" }} />

        <List>
          {buses.length === 0 ? (
            <ListItem>
              <ListItemText primary="No hay autobuses disponibles" sx={{ color: "#000" }} />
            </ListItem>
          ) : (
            buses.map((bus) => (
              <ListItem key={bus._id}>
                <ListItemText
                  primary={`🚌 ${bus.nombre || "Bus"}`}
                  secondary={`📍 ${bus.lat.toFixed(4)}, ${bus.lon.toFixed(4)} ⏰ ${new Date(bus.timestamp).toLocaleTimeString()}`}
                  primaryTypographyProps={{ sx: { color: "#000" } }}
                  secondaryTypographyProps={{ sx: { color: "#000" } }}
                />
              </ListItem>
            ))
          )}
        </List>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          {lineasDisponibles.map((linea) => (
            <Button
              key={linea}
              variant="contained"
              sx={{
                borderRadius: "50%",
                width: 60,
                height: 60,
                fontSize: 16,
                background: "green",
                opacity: 0.8,
                color: "rgba(169, 213, 238, 0.8)",
              }}
              onClick={() => onLineaSelect(linea)}
            >
              {linea}
            </Button>
          ))}
        </Box>
      </div>
    </Drawer>
  );
};

export default LineasDrawer;
