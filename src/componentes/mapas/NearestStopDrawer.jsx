import React from "react";
import { useEffect } from "react";

const NearestStopDrawer = ({ open, onClose, stop, distance, routeInfo, streetName, }) => {

   useEffect(() => {
     console.log("DRAWER STOP:", stop);
   }, [stop]);

  if (!open || !stop) return null;

  const [lon, lat] = stop.geometry.coordinates;

   console.log("STOP DRAWER:", stop);
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "white",
      padding: "16px",
      boxShadow: "0 -2px 10px rgba(0,0,0,0.3)",
      zIndex: 3000,
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px"
    }}>
      <h3> 🚏 Parada</h3>

    <p>
  <strong>CALLE </strong>
   {streetName }
</p>

      <p>
        <strong>Distancia:</strong>{" "}
        {distance ? (distance * 1000).toFixed(0) : "-"} metros
      </p>

      <p>
        <strong>Coordenadas:</strong><br/>
        {lat.toFixed(6)}, {lon.toFixed(6)}
      </p>

      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default NearestStopDrawer;