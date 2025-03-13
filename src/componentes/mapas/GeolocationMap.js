import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";

import { io } from "socket.io-client";
const socket = io("http://localhost:3000"); // Conectamos con el backend


const getLocation = (setPosition) => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Ubicación enviada al backend:", latitude, longitude);
        setPosition([latitude, longitude]);

        // Enviar la ubicación al backend
        socket.emit("locationUpdate", {
          id: "colectivo1", // ID del colectivo simulado
          lat: latitude,
          lon: longitude,
        });
      },
      (error) => console.error("❌ Error obteniendo la ubicación:", error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  } else {
    console.error("❌ Geolocalización no soportada en este navegador.");
  }
};

function GeolocationMap() {
  const [position, setPosition] = useState(null);
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    getLocation(setPosition);

    // Escuchar actualizaciones de ubicación desde el backend
    socket.on("busUpdate", (data) => {
      console.log("📍 Ubicaciones recibidas del backend:", data);
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
            <Popup>📍 Mi PC (colectivo)</Popup>
          </Marker>

          {/* Markers de los colectivos en el backend */}
          {buses.map((bus) => (
            <Marker key={bus.id} position={[bus.lat, bus.lon]}>
              <Popup>🚌 Colectivo {bus.id}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <p>📍 Obteniendo ubicación...</p>
      )}
    </div>
  );
}

export default GeolocationMap;
