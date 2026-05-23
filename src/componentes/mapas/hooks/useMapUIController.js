import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useMapUIController = () => {
  const navigate = useNavigate();

  // === ESTADOS UI ===
  const [openLineasDrawer, setOpenLineasDrawer] = useState(false);
  const [mostrarClima, setMostrarClima] = useState(false);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [gpsDrawerOpen, setGpsDrawerOpen] = useState(false);

  // === ACCIONES ===
  const openLineas = () => setOpenLineasDrawer(true);
  const closeLineas = () => setOpenLineasDrawer(false);

  const openClima = () => setMostrarClima(true);
  const closeClima = () => setMostrarClima(false);

  const openGpsDrawer = () => setGpsDrawerOpen(true);
  const closeGpsDrawer = () => setGpsDrawerOpen(false);

  const selectLinea = (linea) => {
    setSelectedLinea(linea);
    setOpenLineasDrawer(false);
  };

  const goAdmin = () => navigate("/admin");
  const goChoferes = () => navigate("/admin/choferes");
  const goInspectores = () => navigate("/admin/inspectores");

  return {
    // estado
    uiState: {
      openLineasDrawer,
      mostrarClima,
      selectedLinea,
      gpsDrawerOpen,
    },

    // acciones
    uiActions: {
     openLineas,
     closeLineas,
     openClima,
     closeClima,
     selectLinea,
     openGpsDrawer,
     closeGpsDrawer,
     goAdmin,
     goChoferes,
     goInspectores,
    },
  };
};