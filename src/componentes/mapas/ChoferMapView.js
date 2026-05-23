/**
 * ===============================
 * MAPA DEL CHOFER (VIEW PRINCIPAL)
 * ===============================
 *
 * Este componente:
 *
 * - Renderiza un mapa Leaflet centrado en la ubicación del chofer
 * - Muestra la posición actual en tiempo real con un Marker
 *
 * ===============================
 * FUNCIONALIDAD PRINCIPAL
 * ===============================
 *
 * - Recibe la posición del chofer como prop (posicion)
 * - Renderiza un mapa base (OpenStreetMap)
 * - Coloca un marcador en la ubicación actual
 * - Re-centra automáticamente el mapa cuando cambia la posición
 *
 * ===============================
 * SUBCOMPONENTES INTERNOS
 * ===============================
 *
 * RecenterMap:
 * - Escucha cambios en la posición
 * - Ajusta la vista del mapa suavemente (setView)
 *
 * ===============================
 * CONFIGURACIÓN LEAFLET
 * ===============================
 *
 * - Corrige rutas de íconos por defecto de Leaflet
 * - Asegura que los markers se rendericen correctamente en producción
 *
 * ===============================
 * RESPONSABILIDAD
 * ===============================
 *
 * Este componente es principalmente PRESENTACIONAL con mínima lógica:
 *
 * - Render del mapa
 * - Render de marcador
 * - Recentrado de vista
 *
 * ===============================
 * OBSERVACIÓN
 * ===============================
 *
 * El useEffect global de desmontaje es solo para debugging
 *
 */

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// FIX iconos leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});



const ChoferMapView = ({ posicion }) => {
 // console.log(" ChoferMapView render");

 // mueve el mapa cuando cambia la posición
const RecenterMap = ({ posicion }) => {
  const map = useMap();

  useEffect(() => {
    if (!posicion) return;

    map.setView(
      [posicion.lat, posicion.lon],
      map.getZoom(),
      { animate: true }
    );
  }, [posicion, map]);

  return null;
};

 useEffect(() => {
  return () => {
    console.log("❌ ChoferMapView DESMONTADO");
  };
}, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
     <MapContainer
  key="chofer-map"   //  CLAVE
  center={[-33.6757, -65.4578]}
  zoom={13}
  style={{ height: "100%", width: "100%" }}
>

        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {posicion && (
          <Marker
  position={
    posicion
      ? [posicion.lat, posicion.lon]
      : [-33.6757, -65.4578]
  }
/>

        )}

        <RecenterMap posicion={posicion} />
      </MapContainer>
    </div>
  );
};

export default ChoferMapView;
