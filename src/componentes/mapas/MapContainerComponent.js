import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Componente para centrar el mapa en la ubicación actual
const SetViewToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15); // Centra en la posición con zoom 15
    }
  }, [position, map]);
  return null;
};

const MapContainerComponent = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error.message);
          setPosition([51.505, -0.09]); // Fallback: Londres
        }
      );
    } else {
      console.error("Geolocalización no soportada");
      setPosition([51.505, -0.09]); // Fallback
    }
  }, []);

  return position ? (
    <MapContainer center={position} zoom={15} className="map-container">
      <SetViewToLocation position={position} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position} icon={customIcon}>
        <Popup>📍 Estás aquí</Popup>
      </Marker>
    </MapContainer>
  ) : (
    <p>Cargando mapa...</p>
  );
};

export default MapContainerComponent;
