/**
 * ==========================================================
 * Archivo: pages/Dashboard.jsx
 * ----------------------------------------------------------
 * Página principal del dashboard operativo.
 *
 * Responsabilidades:
 * - Solicitar métricas al backend
 * - Mostrar tarjetas con indicadores
 * - Renderizar gráficos
 * - Mostrar historial de vueltas jerárquico
 *
 * ==========================================================
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

import {
  Button,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText
} from "@mui/material";

import MapContainerComponent from "../componentes/mapas/MapContainerComponent";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const lineNames = {
  "64f0000000000000000000a1": " A",
  "64f0000000000000000000e1": " E",
  "64f0000000000000000000e2": " Este",
  "64f0000000000000000000o1": " Oeste"
};


/* ==========================================================
   KPI CARD
========================================================== */

const KpiCard = ({ title, value }) => (
  <Card
    sx={{
      height: 110,
      borderRadius: 3,
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
    }}
  >
    <CardContent>

      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {title}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          fontWeight: 600,
          color: "#1e293b"
        }}
      >
        {value}
      </Typography>

    </CardContent>
  </Card>
);


/* ==========================================================
   DASHBOARD
========================================================== */

const Dashboard = () => {

  /* ================= STATE ================= */

  const [stats, setStats] = useState({
    buses: 0,
    choferes: 0,
    pasajeros: 0,
    rutas: 0
  });

  const [rutasData, setRutasData] = useState([]);

  const [alertas, setAlertas] = useState([]);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [lapsDayLine, setLapsDayLine] = useState([]);

  const [selectedLine, setSelectedLine] = useState(null);

  const [selectedDay, setSelectedDay] = useState(null);

  const navigate = useNavigate();

  const [drivers, setDrivers] = useState([]);

  const [demoState, setDemoState] = useState({
    totalBuses: 0,
    drivers: []
   });
  /* ================= FETCH DASHBOARD ================= */

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const res = await fetch("https://mibus-backend-1.onrender.com/api/dashboard/summary");

        const data = await res.json();

        if (data.stats) setStats(data.stats);
        if (data.rutas) setRutasData(data.rutas);
        if (data.alertas) setAlertas(data.alertas);

      } catch (err) {
        console.error("Error cargando dashboard", err);
      }

    };

    loadDashboard();

    const loadDemo = async () => {
  try {
    const res = await fetch("https://mibus-backend-1.onrender.com/api/demo/status");
    const data = await res.json();

    setStats(prev => ({
      ...prev,
      buses: data.buses,
      choferes: data.choferes
    }));

    setDrivers(data.drivers);

  } catch (err) {
    console.error("Error cargando demo", err);
  }
};

loadDemo();

  }, 

  []);

  useEffect(() => {

  const handler = (data) => {
    console.log("DEMO STATE:", data);
    setDemoState(data);
  };

  socket.on("demo:state", handler);

  return () => {
    socket.off("demo:state", handler);
  };

}, []);
  /* ================= FETCH LAPS ================= */

  const loadDayLine = async () => {

    const res = await fetch(
      "https://mibus-backend-1.onrender.com/api/dashboard/laps-by-day-line"
    );

    const data = await res.json();

    setLapsDayLine(data);

  };


  /* ================= MENU CONTROL ================= */

  const openMenu = async (event) => {

    setMenuAnchor(event.currentTarget);

    if (!lapsDayLine.length) {
      await loadDayLine();
    }

  };

  const closeMenu = () => {

    setMenuAnchor(null);
    setSelectedLine(null);
    setSelectedDay(null);

  };


  /* ==========================================================
     DATOS DERIVADOS
  ========================================================== */

  const lines = [
    ...new Set(lapsDayLine.map((i) => i._id.line))
  ];

  const days = lapsDayLine
    .filter((i) => i._id.line === selectedLine)
    .map((i) => i._id.day);

  const units =
    lapsDayLine.find(
      (i) =>
        i._id.line === selectedLine &&
        i._id.day === selectedDay
    )?.units || [];


  /* ==========================================================
                            RENDER
  ========================================================== */

  return (

    <Box
      sx={{
        p: 3,
        bgcolor: "#f4f6f8",
        minHeight: "100vh"
      }}
    >

      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3
        }}
      >

        <Typography variant="h4">
          Centro de Control
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
  
         <Button
          variant="outlined"
          onClick={() => navigate("/admin")}
         >
          Volver al Panel
         </Button>

         <Button
           variant="contained"
           onClick={openMenu}
           >
            Historial de Vueltas
          </Button>

        </Box>

      </Box>


      {/* ==========================================================
         MENU HISTORIAL
      ========================================================== */}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >

        {(selectedLine || selectedDay) && (

          <MenuItem
            onClick={() => {

              if (selectedDay) setSelectedDay(null);
              else setSelectedLine(null);

            }}
          >
            ← Volver
          </MenuItem>

        )}


        {/* NIVEL 1 — LINEAS */}

        {!selectedLine &&

          lines.map((line) => (

            <MenuItem
             key={line}
             onClick={() => setSelectedLine(line)}
            >
             Línea {lineNames[line] || line}
            </MenuItem>

          ))
        }


        {/* NIVEL 2 — FECHAS */}

        {selectedLine && !selectedDay &&

          days.map((day) => (

            <MenuItem
              key={day}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </MenuItem>

          ))
        }


        {/* NIVEL 3 — UNIDADES */}

        {selectedLine && selectedDay &&

          units.map((u) => (

            <MenuItem key={u.unitId}>
              {u.unitId} → {u.laps} vueltas
            </MenuItem>

          ))
        }

      </Menu>


      {/* ==========================================================
         KPI
      ========================================================== */}

      <Grid container spacing={2} sx={{ mb: 2 }}>

        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard title="Buses activos" value={demoState.totalBuses} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard title="Choferes en ruta" value={demoState.drivers.length} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard title="Pasajeros conectados" value={stats.pasajeros} />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <KpiCard title="Rutas activas" value={stats.rutas} />
        </Grid>

      </Grid>


      {/* ==========================================================
         MAPA + ALERTAS
      ========================================================== */}

      <Grid container spacing={2} sx={{ mb: 2 }}>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: 420 }}>
            <CardContent sx={{ height: "100%" }}>

              <Typography variant="h6" sx={{ mb: 1 }}>
                Mapa en tiempo real
              </Typography>

              <Box sx={{ height: "360px" }}>
                <MapContainerComponent />
              </Box>

            </CardContent>
          </Card>
        </Grid>


        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 420 }}>
            <CardContent>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Alertas del sistema
              </Typography>

              <List>
                {alertas.map((a, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`⚠ ${a}`} />
                  </ListItem>
                ))}
              </List>

              <List>
                 {drivers.map((d, i) => (
                   <ListItem key={i}>
                      <ListItemText primary={`Chofer: ${d}`} />
                   </ListItem>
                ))}
              </List>
              
            </CardContent>
          </Card>
        </Grid>

      </Grid>


      {/* ==========================================================
         GRAFICO
      ========================================================== */}

      <Grid container spacing={2}>

        <Grid size={{ xs: 12 }}>

          <Card sx={{ height: 320 }}>

            <CardContent sx={{ height: "100%" }}>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Actividad por rutas
              </Typography>

              <Box sx={{ width: "100%", height: 300 }}>

                <ResponsiveContainer>

                  <BarChart data={rutasData}>

                    <XAxis dataKey="ruta" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="pasajeros"
                      radius={[8, 8, 0, 0]}
                      fill="#3b82f6"
                    />

                  </BarChart>

                </ResponsiveContainer>

              </Box>

            </CardContent>

          </Card>

        </Grid>

      </Grid>

    </Box>

  );

};

export default Dashboard;