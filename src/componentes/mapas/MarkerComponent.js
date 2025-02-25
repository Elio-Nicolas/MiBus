import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const MarkerComponent = ({ position }) => {
  return (
    <Marker position={position} icon={customIcon}>
      <Popup>Ubicación en tiempo real</Popup>
    </Marker>
  );
};

export default MarkerComponent;
