/**
 * ===============================
 * MAPA DE GEOLOCALIZACIÓN EN TIEMPO REAL
 * ===============================
 *
 * Este componente:
 *
 * - Obtiene la ubicación del usuario en tiempo real usando Geolocation API
 * - Envía la ubicación al backend mediante Socket.IO
 * - Recibe actualizaciones de buses desde el backend
 * - Renderiza un mapa interactivo con Leaflet
 *
 * ===============================
 * FLUJO PRINCIPAL
 * ===============================
 *
 * 1. Al montar el componente:
 *    → inicia seguimiento de ubicación (watchPosition)
 *    → establece conexión Socket.IO con el backend
 *
 * 2. En cada cambio de ubicación:
 *    → actualiza estado local (position)
 *    → emite evento "locationUpdate" al backend
 *
 * 3. Escucha del backend:
 *    → recibe "busUpdate"
 *    → actualiza lista de buses en tiempo real
 *
 * 4. Render:
 *    → marcador del usuario actual (posición simulada de colectivo)
 *    → marcadores de buses del backend
 *
 * ===============================
 * RESPONSABILIDAD
 * ===============================
 *
 * Este componente mezcla varias capas:
 *
 * - Captura de geolocalización (browser API)
 * - Comunicación en tiempo real (Socket.IO)
 * - Render del mapa (Leaflet)
 * - Estado de buses globales (backend sync)
 *
 * ===============================
 * OBSERVACIÓN IMPORTANTE
 * ===============================
 *
 * Actualmente este archivo contiene duplicación de imports de socket.io
 * y lógica acoplada que debería separarse en:
 *
 * - hook de geolocalización (useGeolocation)
 * - servicio de sockets (socketService)
 * - capa de mapa reutilizable
 *
 */

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";

const socket = io("https://mibus-backend-1.onrender.com"); // conexion con el back

const getLocation = (setPosition) => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("se envio ubicacion al backend:", latitude, longitude);
        setPosition([latitude, longitude]);

        // Envia ubicación al back
        socket.emit("locationUpdate", {
          id: "colectivo1", // ID del colectivo simulado
          lat: latitude,
          lon: longitude,
        });
      },
      (error) => console.error(" Error de ubicación:", error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else {
    console.error(" Geolocalización no soportada en este navegador.");
  }
};

function GeolocationMap() {
  const [position, setPosition] = useState(null);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    getLocation(setPosition);

    // Escuchar actualizaciones de ubicación desde el backend
    socket.on("busUpdate", (data) => {
      console.log("Ubicaciones recibidas del back:", data);
      setBuses(data);
    });

    return () => socket.off("busUpdate");
  }, []);

  return (
    <div>
      <h2>Ubicación en Tiempo Real</h2>
      {position ? (
        <MapContainer center={position} zoom={15} style={{ height: "400px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Marker de la PC (simula el colectivo) */}
          <Marker position={position}>
            <Popup> PC (colectivo)</Popup>
          </Marker>

          {/* Markers de los colectivos en el backend */}
          {buses.map((bus) => (
            <Marker key={bus.id} position={[bus.lat, bus.lon]}>
              <Popup> Colectivo {bus.id}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <p> Obteniendo ubicación...</p>
      )}
    </div>
  );
}

export default GeolocationMap;
