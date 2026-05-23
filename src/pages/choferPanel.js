import React, { useEffect, useState, useRef } from "react";
import MapContainerComponent from "../componentes/mapas/MapContainerComponent";
import { socket } from "../socket";
import AdminHeader from "../componentes/admin/AdminHeader";
import { useThemeMode } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} → ${text}`);
  }
  return res.json();
};

//console.log("🔁 RENDER del componente");


const ChoferPanel = () => {
  const stored = JSON.parse(localStorage.getItem("user"));
  const token = stored?.token;
  const navigate = useNavigate ();
  const [chofer, setChofer] = useState(null);
  const [position, setPosition] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [lastSessions, setLastSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const watchIdRef = useRef(null);
  const [startTime] = useState(null);
  const {toggleMode } = useThemeMode();

  // =========================
  // CARGAR CHOFER Y SESIONES
  // =========================
  const loadSessions = async () => {
    try {
      // Sesión activa
      const resActive = await fetch(
        "https://mibus-backend-1.onrender.com/api/chofer/session/active",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resActive.ok) {
        const data = await resActive.json();
        setActiveSession(data);
      }

      // Últimas sesiones
      const resLast = await fetch(
        "https://mibus-backend-1.onrender.com/api/chofer/session/last",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (resLast.ok) {
        const data = await resLast.json();
        setLastSessions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("❌ Error cargando sesiones", err);
    }
  };

  useEffect(() => {
  console.log("🧨 startTime cambió:", startTime);
}, [startTime]);


  useEffect(() => {
    if (token) loadSessions();
  }, [token]);

  useEffect(() => {
    const fetchChofer = async () => {
      try {
        const res = await fetch("https://mibus-backend-1.onrender.com/api/chofer/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo obtener");
        const data = await res.json();
        setChofer(data);

        // Registrar chofer en socket
        socket.emit("register", {
          userId: data._id,
          username: data.username,
          role: data.role,
          assignedUnit: data.assignedUnit,
          assignedLine: data.assignedLine,
        });
      } catch (err) {
        console.error("❌ Error fetch chofer:", err);
      }
    };
    fetchChofer();
  }, [token]);

  useEffect(() => {
    if (!lastSessions.length) {
      setEvents([]);
      return;
    }
    const ev = buildEventsFromSessions(lastSessions);
    setEvents(ev);
  }, [lastSessions]);

  // =========================
  // RELOJ
  // =========================
  useEffect(() => {
    let interval = null;
    if (activeSession && activeSession.status === "ACTIVE") {
      interval = setInterval(() => {
        const start = new Date(activeSession.startTime).getTime();
        setElapsedTime(Date.now() - start);
      }, 1000);
    } else setElapsedTime(0);

    return () => interval && clearInterval(interval);
  }, [activeSession]);

  const formatElapsed = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // =========================
  // GEOFENCING / TRACKING
  // =========================
  const startTracking = () => {
    if (!navigator.geolocation || !chofer) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const payload = {
          userId: chofer._id,
          role: chofer.role,
          linea: chofer.assignedLine,
          unidad: chofer.assignedUnit,
          lat: latitude,
          lon: longitude,
          timestamp: new Date(),
        };
        setPosition({ lat: latitude, lon: longitude });
        socket.emit("locationUpdate", payload);
      },
      (err) => console.error("❌ geoloc error", err),
      { enableHighAccuracy: true }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // =====================  HANDLES  ===========================  //

  const handleLogout = () => {
  localStorage.removeItem("token"); // o lo que uses
  navigate("/login");
 };


  const handleToggleSharing = () => {
    if (!sharing) {
      startTracking();
      socket.emit("startSharing");
      setSharing(true);
    } else {
      stopTracking();
      socket.emit("stopSharing");
      setSharing(false);
    }
  };

  // =========================
  // INICIAR RECORRIDO
  // =========================
  const handleInicio = async () => {
  try {
  
    const res = await safeFetch(
      "https://mibus-backend-1.onrender.com/api/chofer/session/start",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await loadSessions();

    console.log("✅ Recorrido iniciado:", res);
  } catch (err) {
    console.error("❌ Error iniciando recorrido:", err.message);
  }
};


  // =========================
  // FINALIZAR RECORRIDO
  // =========================
 const handleFinRecorrido = async () => {
  if (!activeSession) return;

  try {
    await safeFetch("https://mibus-backend-1.onrender.com/api/chofer/session/stop", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId: activeSession._id }),
    });

    setElapsedTime(0);

    await loadSessions();

    console.log("✅ Recorrido finalizado");
  } catch (err) {
    console.error("❌ Error finalizando recorrido:", err.message);
  }
};


  // =========================
  // CONSTRUCCIÓN DE EVENTOS
  // =========================
  const buildEventsFromSessions = (sessions) => {
    const events = [];
    sessions.forEach(s => {
      if (s.startTime) events.push({ type: "INICIO", time: s.startTime });
      if (s.endTime) events.push({ type: "CIERRE", time: s.endTime });
    });
    return events.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  };

  const unitStatus = activeSession && !activeSession.endTime ? "EN SERVICIO" : "SIN SERVICIO";

  if (!chofer) return <p>Cargando chofer...</p>;

  // =========================
  // RENDER
  // =========================
 return (
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    {/* HEADER */}
    <AdminHeader
      title="Chofer"
      subtitle="Panel de monitoreo"
      showDemo={false}
      onLogout={handleLogout}
      onToggleMode={toggleMode}
    />

    {/* CONTENIDO */}
    <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 370,
          borderRight: "1px solid",
          borderColor: "divider",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          overflow: "auto",
        }}
      >
        <div><strong>Nombre:</strong> {chofer.username}</div>
        <div><strong>Unidad:</strong> {chofer.assignedUnit}</div>
        <div><strong>Línea:</strong> {chofer.assignedLine}</div>

        <p>
          <strong>Estado:</strong>{" "}
          <span
            style={{
              color: unitStatus === "EN SERVICIO" ? "#4ade80" : "#f87171",
              fontWeight: "bold",
            }}
          >
            {unitStatus}
          </span>
        </p>

        <p>
          <strong>Inicio:</strong>{" "}
          {events
            .filter(e => e.type === "INICIO")
            .slice(0, 1)
            .map((e, i) => (
              <span key={i}>{new Date(e.time).toLocaleString()}</span>
            ))}
        </p>

        <p>
          <strong>Tiempo en recorrido:</strong>{" "}
          <span style={{ fontWeight: "bold" }}>
            {activeSession && activeSession.status === "ACTIVE"
              ? formatElapsed(elapsedTime)
              : "00:00"}
          </span>
        </p>

        <button
          onClick={handleToggleSharing}
          disabled={!activeSession || activeSession.endTime}
        >
          {sharing ? "Detener ubicación" : "Compartir ubicación"}
        </button>

        <button
          onClick={handleInicio}
          disabled={!!activeSession && activeSession.status === "ACTIVE"}
        >
          Iniciar recorrido
        </button>

        <button
          onClick={handleFinRecorrido}
          disabled={!activeSession || activeSession.endTime}
        >
          Finalizar recorrido
        </button>

        <Box sx={{ mt: 2 }}>
          <strong>Últimos eventos</strong>
          <table style={{ width: "100%", fontSize: 12, marginTop: 8 }}>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "bold" }}>{e.type}</td>
                  <td>{new Date(e.time).toLocaleTimeString()}</td>
                  <td>{new Date(e.time).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* MAPA */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <MapContainerComponent position={position} />
      </Box>
    </Box>
  </Box>
);

};

export default ChoferPanel;
