import { useEffect, useRef, useState } from "react";
import { Pane } from "react-leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import ParadasLayer from "./ParadasLayer";
import BusPopup from "./BusPopup";
import L from "leaflet";
import LineasDrawer from "./LineasDrawer";
import ClimaDrawer from "./ClimaDrawer";
import ClimaWidget from "../clima/ClimaWidget";
import React from "react";
import "./Drawers.css";
import NearestStopDrawer from "./NearestStopDrawer";
import { useDistance } from "./hooks/useDistance";
import { useUserToStopRoute } from "./hooks/useUserToStopRoute";
import { IconButton } from "@mui/material";
import { useChoferTracking } from "./hooks/useChoferTracking";
import { useAuthUser } from "../auth/useAuthUser";
import { useStoredUserId } from "../auth/useStoredUserId";
import { useMapUI } from "./hooks/useMapUI";
import { useBusLayer } from "./hooks/useBusLayer";
import { useBusSocket } from "./hooks/useBusSocket";
import { useMapUIController } from "./hooks/useMapUIController";
import { useParadas } from "./hooks/useParadas";
import { useUserLocation } from "./hooks/useUserLocation";
import { useNearestStop } from "./hooks/useNearestStop";

const DEFAULT_POSITION = [-33.6756, -65.4578];

const SetViewToLocation = ({ position }) => {
  const map = useMap();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (position && !hasCentered.current) {
      map.setView(position, 15);
      hasCentered.current = true;
    }
  }, [position, map]);

  return null;
};

const getBusIcon = (color = "#007bff") => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
    "></div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("unitId");
  window.location.href = "/login";
};


/* === Componente === */

const MapContainerComponent = () => {

  const { buses, busTrails } = useBusSocket();
  const { uiState, uiActions } = useMapUIController();
  const { validBuses, trails } = useBusLayer(buses, busTrails, uiState.selectedLinea);
  const [selectedUnit, setSelectedUnit] = useState(localStorage.getItem("unitId") || "");
  const {role, username } = useAuthUser();
  const storedUserId = useStoredUserId();
  const ui = useMapUI(role);
  const paradas = useParadas(uiState.selectedLinea);
  const userLocation = useUserLocation();
  const [selectedStop, setSelectedStop] = useState(null);
  const nearestStop = useNearestStop(
  uiState.gpsDrawerOpen ? userLocation : null,
  uiState.gpsDrawerOpen ? paradas : null );
  const activeStop = selectedStop ?? nearestStop;
  const activeDistance = useDistance(userLocation, activeStop);
  
  const routeData = useUserToStopRoute(
  uiState.gpsDrawerOpen ? userLocation : null,
  uiState.gpsDrawerOpen ? activeStop : null
);

const route = routeData?.route;

const {isSharing, startSharing, stopSharing} 
    = useChoferTracking({
    role,
    selectedUnit,
    storedUserId,
    username
});

function FixMapResize() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const t = setTimeout(() => {
      if (map._container) {  
        try {
          map.invalidateSize();
        } catch (e) {}
      }
    }, 150);

    return () => clearTimeout(t);
  }, [map]);

  return null;
}

useEffect(() => {
  if (!uiState.selectedLinea) return;

  //  CERRAR GPS
  uiActions.closeGpsDrawer();

}, [uiState.selectedLinea]);

useEffect(() => {
  uiActions.closeGpsDrawer();

  const t = setTimeout(() => {
    setSelectedStop(null);
  }, 0);

  return () => clearTimeout(t);
}, [uiState.selectedLinea]);

console.log("selectedStop", selectedStop);
console.log("nearestStop", nearestStop);
console.log("activeStop", activeStop);
  // ======================== RENDER ========================
return (
  <div id="map-wrapper" style={{ position: "relative", height: "100%", width: "100%", overflow: "hidden" }}>

    <MapContainer
      center={DEFAULT_POSITION}
      zoom={17}
      preferCanvas={true}
      style={{ height: "100%", width: "100%" }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {/* 🔵 PARADAS */}
      <Pane name="paradasPane" style={{ zIndex: 400 }}>
      {paradas && (
    <ParadasLayer
  //key={activeStop ? activeStop.id : "no-stop"}
  paradasData={paradas}
  selectedLinea={uiState.selectedLinea}
  visible={!!uiState.selectedLinea}
  nearestStop={activeStop}
  onStopClick={(stop) => {
  setSelectedStop({
    ...stop,
    id: stop.id || crypto.randomUUID(),
  });

  uiActions.openGpsDrawer();
}}
/>
     )}

{uiState.gpsDrawerOpen && route && (
  <Polyline
    positions={route}
    pathOptions={{
      color: "red",
      weight: 4,
    }}
  />
)}

{uiState.gpsDrawerOpen && activeStop && (
  <Marker
   // key={`active-${activeStop.id}`}
    position={[
      Number(activeStop.geometry.coordinates[1]),
      Number(activeStop.geometry.coordinates[0]),
    ]}
    icon={L.divIcon({
      className: "",
      html: `
        <div style="
          width:18px;
          height:18px;
          background:red;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 0 10px red;
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })}
  >
    {/** <Popup>
  📍 Parada seleccionada<br/>
  Distancia: {(activeDistance * 1000).toFixed(0)} m
</Popup>*/} 
  </Marker>
)}

      </Pane>

      <SetViewToLocation position={userLocation && [userLocation.lat, userLocation.lon]} />

      {userLocation && (
  <Marker
   
    position={[userLocation.lat, userLocation.lon]}
    icon={L.divIcon({
      html: `
        <div style="
          width:14px;
          height:14px;
          background:#00e5ff;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 0 10px #00e5ff;
        "></div>
      `,
      className: "",
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })}
  />
)}

     <Pane name="busesPane" style={{ zIndex: 500 }}>
  {validBuses.map((bus) => {
    const lineColor = bus.color;
    const trail = trails[bus.unitId];

    return (
      <React.Fragment key={bus.unitId}>

        {/* ESTELA */}
        {Array.isArray(trail) && trail.length > 1 && (
          <Polyline
            positions={trail}
            pathOptions={{
              color: lineColor,
              weight: 3,
              opacity: 0.6,
            }}
            pane="busesPane"
          />
        )}

        {/* MARCADOR */}
        <Marker
          position={[bus.lat, bus.lon]}
          icon={getBusIcon(lineColor)}
          pane="busesPane"
        >
          <BusPopup bus={bus} />
        </Marker>

      </React.Fragment>
    );
  })}
</Pane>

      <FixMapResize />

    </MapContainer>

       <div
  style={{
    position: "absolute",
    top: "50%",
    left: 10,
    zIndex: 1000,
    display: "flex",
    transform: "translateY(-50%)",
    flexDirection: "column",
    gap: "10px",
    background: "#739bd3ff",
    padding: "8px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
  }}
>
   {/* ================ ADMINISTRADOR ================= */}
  {/* LÍNEAS */}
  {ui.lineas && (
  <IconButton
  title="Ver líneas"
  onClick={() => {
  if (uiState.selectedLinea) {
    console.log("APAGANDO PARADAS");
    uiActions.selectLinea(null);
  } else {
    console.log("ABRIENDO DRAWER");
    uiActions.openLineas();
  }
}}
>
  🚌
</IconButton>

  )}

  {/* CLIMA */}
 {ui.clima && (
  <IconButton
  title="Clima"
  onClick={uiActions.openClima}
>
  ☀️
</IconButton>

  )}

  {/* PANEL ADMIN */}
  {ui.engranaje && (
  <IconButton
  title="Panel administrador"
  onClick={uiActions.goAdmin}
>
  ⚙️
</IconButton>

  )}

{/* SEGUIMIENTO CHOFERES - SOLO ADMIN */}
{ui.engranaje && (
  <IconButton
    title="Seguimiento de choferes"
    onClick={uiActions.goChoferes}
    sx={{
      backgroundColor: "#2e7d32",
      color: "white",
      "&:hover": { backgroundColor: "#1b5e20" },
      marginBottom: "8px",
    }}
  >
    🚍
  </IconButton>
)}

{/* SEGUIMIENTO INSPECTORES - SOLO ADMIN */}
{ui.engranaje && (
  <IconButton
    title="Seguimiento de inspectores"
    onClick={uiActions.goInspectores}
    sx={{
      backgroundColor: "#1565c0",
      color: "white",
      "&:hover": { backgroundColor: "#0d47a1" },
    }}
  >
    🕵️
  </IconButton>
)}


{ui.cerrarSesion && (
  <IconButton onClick={handleLogout}>
    🔒
  </IconButton>

  
)}

 <IconButton
  title="Mi parada más cercana"
  onClick={uiActions.openGpsDrawer}
>
  🗺️
</IconButton>

</div>

 {/* ================= CHOFER ================= */}

{ui.isChofer && (
  <>
    {/* SELECCIÓN DE UNIDAD */}
    <select
      value={selectedUnit}
      onChange={(e) => {
        setSelectedUnit(e.target.value);
        localStorage.setItem("unitId", e.target.value);
      }}
      style={{
        position: "fixed",
        bottom: 90,
        right: 20,
        zIndex: 2000,
        padding: "10px",
        borderRadius: "8px",
        fontSize: "14px",
      }}
    >
      <option value="">Seleccionar unidad</option>
      <option value="Unidad 1">Unidad 1</option>
      <option value="Unidad 2">Unidad 2</option>
      <option value="Unidad 3">Unidad 3</option>
    </select>

    {/* BOTÓN INICIAR / FINALIZAR SERVICIO */}
    <IconButton
      disabled={!selectedUnit}
      onClick={isSharing ? stopSharing : startSharing}
      title={isSharing ? "Finalizar servicio" : "Iniciar servicio"}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 2000, 
        backgroundColor: !selectedUnit
          ? "#9e9e9e"
          : isSharing
          ? "#d32f2f" // rojo
          : "#2e7d32", // verde
        color: "white",
        width: 56,
        height: 56,
      }}
    >
      {isSharing ? "🚫" : "🚍"}
    </IconButton>
  </>
)}

{/* ================= INSPECTOR ================= */}

{ui.isInspector && (
  <>
    {/* LÍNEAS */}
    <IconButton
      onClick={uiActions.openLineas}
      title="Ver líneas"
      style={{ backgroundColor: "white" }}
    >
      🚌
    </IconButton>

    {/* CLIMA */}
    <IconButton
      onClick={uiActions.openClima}
      title="Ver clima"
      style={{ backgroundColor: "white" }}
    >
      ☀️
    </IconButton>

    {/* CERRAR SESIÓN */}
    <IconButton
      onClick={handleLogout}
      title="Cerrar sesión"
      style={{ backgroundColor: "#d32f2f", color: "white" }}
    >
      🚪
    </IconButton>
  </>
)}

     <LineasDrawer
  open={uiState.openLineasDrawer}
  onClose={uiActions.closeLineas}
  onLineaSelect={(linea) => {
  uiActions.selectLinea(linea);
  uiActions.closeGpsDrawer();
}}
/>

      <ClimaDrawer
         open={uiState.mostrarClima}
         onClose={uiActions.closeClima}
      >
      <ClimaWidget />
      </ClimaDrawer>

      <NearestStopDrawer
       key={`${activeStop?.id}-${activeDistance}`}
       open={uiState.gpsDrawerOpen}
       onClose={uiActions.closeGpsDrawer}
       stop={activeStop}
       distance={activeDistance}
       
       streetName={routeData?.streetName}
      />
    </div>
  );
};

export default MapContainerComponent;
