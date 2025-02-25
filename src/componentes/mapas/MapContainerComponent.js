import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useGeolocation from "./GeolocationMap";
import MarkerComponent from "./MarkerComponent";
import "../mapas/GeolocationMap.css";

const MapContainerComponent = () => {
  const position = useGeolocation();

  return (
    <div className="map-container">
      {position ? (
        <MapContainer center={position} zoom={13} className="map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MarkerComponent position={position} />
        </MapContainer>
      ) : (
        <p>Obteniendo ubicación...</p>
      )}
    </div>
  );
};

export default MapContainerComponent;
