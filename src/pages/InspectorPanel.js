import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../componentes/admin/AdminHeader";
import { useThemeMode } from "../context/ThemeContext";
import MapContainerComponent from "../componentes/mapas/MapContainerComponent";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box
} from "@mui/material";

const InspectorPanel = () => {
  const navigate = useNavigate ();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;
  const [drivers, setDrivers] = useState([]);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const {toggleMode } = useThemeMode();
  
  useEffect(() => {
    fetch("https://mibus-backend-1.onrender.com/api/inspector/drivers", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log("Choferes recibidos:", data);
        setDrivers(Array.isArray(data) ? data : []);
      });
  }, [token]);

  const lines = useMemo(() => {
    return [...new Set(drivers.map(d => d.assignedLine).filter(Boolean))];
  }, [drivers]);

  const driversByLine = useMemo(() => {
    if (!selectedLine) return [];
    return drivers.filter(d => d.assignedLine === selectedLine);
  }, [drivers, selectedLine]);

  //  =====================  HANDLES ===============================  //

   const handleLogout = () => {
  // lo mínimo indispensable
  localStorage.removeItem("token"); // o lo que uses
  navigate("/login");
 };


  // ======================  RETURN  =============================== //
  return (


  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>

    {/* HEADER INSPECTOR */}

    <AdminHeader
  title="Inspector"
  subtitle="Panel de monitoreo"
  showDemo={false}
  onLogout={handleLogout}
  onToggleMode={toggleMode}
/>


     {/*CONTENIDO */}
     <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>

    <Box
  sx={{
    width: 320,
    borderRight: "1px solid",
    borderColor: "divider",
    p: 2,
    overflow: "auto"
  }}
>
  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
    <InputLabel>Línea</InputLabel>
    <Select
      value={selectedLine}
      label="Línea"
      onChange={e => {
        setSelectedLine(e.target.value);
        setSelectedDriver(null);
      }}
    >
      {lines.map(line => (
        <MenuItem key={line} value={line}>
          {line}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell><b>Chofer</b></TableCell>
        <TableCell><b>Unidad</b></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {driversByLine.map(d => (
        <TableRow
          key={d._id}
          hover
          sx={{ cursor: "pointer" }}
          selected={selectedDriver?._id === d._id}
          onClick={() => setSelectedDriver(d)}
        >
          <TableCell>{d.username}</TableCell>
          <TableCell>{d.assignedUnit || "-"}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Box>


      {/* MAPA */}
     <Box sx={{ flex: 1, minWidth: 0 }}>
       <MapContainerComponent focusDriver={selectedDriver} />
     </Box>
    </Box>
  </Box>
);
};
export default InspectorPanel;
