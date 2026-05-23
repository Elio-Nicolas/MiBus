import React, { useEffect, useState } from "react";
import AdminMap from "../componentes/admin/AdminMap";
import "react-resizable/css/styles.css";
import { useThemeMode } from "../context/ThemeContext";
import AdminHeader from "../componentes/admin/AdminHeader";
import { socket } from "../socket";

// MUI
import {
  Typography,
  IconButton,
  Box,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  TableContainer,
  Select,
  MenuItem,
  Stack,
  FormControl,
  InputLabel
} from "@mui/material";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";

export default function AdminPanel() {
  
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [editingUnit, setEditingUnit] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingLine, setEditingLine] = useState("");
  const { mode, toggleMode } = useThemeMode();
  const [buses, setBuses] = useState([]);
  const navigate = useNavigate();
  const [roleFilter] = useState("ALL");
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const token = user?.token || null;
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [leftWidth, setLeftWidth] = useState(60); // %
  const isDraggingRef = React.useRef(false);
  const [busTrails, setBusTrails] = useState({});
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "PASAJERO",
  });

 /* useEffect(() => {
  socket.connect();

  return () => {
    socket.disconnect();
  };
}, []);*/

  // ================== HANDLE ===============
  // REEMPLAZAR toggleDemo
const toggleDemo = () => {
  // ❌ no tocar demoEnabled aquí
  socket.emit(demoEnabled ? "demo:stop" : "demo:start");
};

useEffect(() => {
  const onMouseMove = (e) => {
    if (!isDraggingRef.current) return;

    const container = document.getElementById("admin-layout");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;

    // límites 
    percent = Math.max(30, Math.min(80, percent));

    setLeftWidth(percent);
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
}, []);
// ===================== DEMO
useEffect(() => {
  const handler = ({ enabled }) => {
    setDemoEnabled(enabled);

    // 👇 SI LA DEMO SE DETIENE → LIMPIAR ESTADO REAL
    if (!enabled) {
      setBuses([]);
      setBusTrails({});
    }
  };

  socket.on("demo:status", handler);

  return () => socket.off("demo:status", handler);
}, []);

// =============== Registro del usuario================
useEffect(() => {
  if (!socket.connected) {
    socket.connect();
  }

  if (user) {
    socket.emit("register", {
      userId: user.userId,
      username: user.username,
      role: user.role,
      assignedUnit: null,
      assignedLine: null
    });
  }
}, []);

  // ================= FETCH =================
  useEffect(() => {
    fetch("https://mibus-backend-1.onrender.com/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("No autorizado");
        }
        return res.json();
      })
      .then(data => {
        console.log("USERS DESDE API:", data);
        setUsers(data);
      })
      .catch(err => {
        console.error("Error cargando usuarios:", err);
      });
  }, [token]);

 // ================== ESCUCHA =====================
useEffect(() => {
  if (!socket.connected) {
    socket.connect();
  }

  const handler = (bus) => {
    console.log("🔥 BUS COMPLETO RECIBIDO:", JSON.stringify(bus, null, 2));

    setBuses(prev => {
      const existing = prev.find(b => b.unitId === bus.unitId);

      if (existing) {
        return prev.map(b =>
          b.unitId === bus.unitId
            ? { ...b, ...bus }   // 🔥 no perder datos
            : b
        );
      }

      return [...prev, bus];
    });
  };

  socket.on("busUpdate", handler);

  return () => {
    socket.off("busUpdate", handler);
  };
}, []);

  /* ================= FILTRO ================= */
const filteredUsers = users.filter(u => {
  const text = search.toLowerCase();

  const matchesSearch =
    (u.username || "").toLowerCase().includes(text) ||
    (u.role || "").toLowerCase().includes(text) ||
    (u.assignedUnit || "").toString().toLowerCase().includes(text) ||
    (u.assignedLine || "").toLowerCase().includes(text);

  const matchesRole =
    roleFilter === "ALL" || u.role === roleFilter;

  return matchesSearch && matchesRole;
});

  /* ================= EDITAR ================= */
  const startEdit = (u) => {
  setEditingId(u._id);
  setEditingRole(u.role);
  setEditingUnit(u.assignedUnit || "");
  setEditingLine(u.assignedLine || "");
};


  const cancelEdit = () => {
    setEditingId(null);
    setEditingRole("");
  };

  const saveUnit = async (id) => {
    await fetch(`https://mibus-backend-1.onrender.com/api/admin/users/${id}/unit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ unit: editingUnit }),
      }
    );

    setUsers(prev =>
      prev.map(u =>
        u._id === id ? { ...u, assignedUnit: editingUnit } : u
      )
    );
  };

  const saveLine = async (id) => {
  await fetch(`https://mibus-backend-1.onrender.com/api/admin/users/${id}/line`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ line: editingLine }),
  });

  setUsers(prev =>
    prev.map(u =>
      u._id === id ? { ...u, assignedLine: editingLine } : u
    )
  );
};

  const saveRole = async (id) => {
    await fetch(`https://mibus-backend-1.onrender.com/api/admin/users/${id}/role`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: editingRole }),
      }
    );

    setUsers(prev =>
      prev.map(u => u._id === id ? { ...u, role: editingRole } : u)
    );

    cancelEdit();
  };

  /* ================= ELIMINAR ================= */
  const deleteUser = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;

    await fetch(`https://mibus-backend-1.onrender.com/api/admin/users/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setUsers(prev => prev.filter(u => u._id !== id));
  };

  /* ================= AGREGAR ================= */
  const addUser = async () => {
    try {
      const res = await fetch("https://mibus-backend-1.onrender.com/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear usuario");
      }

      setUsers(prev => [...prev, data.user]);
      setAdding(false);
      setNewUser({ username: "", password: "", role: "PASAJERO" });

      alert("Usuario creado correctamente");
    } catch (err) {
      console.error("Error creando usuario:", err);
      alert(err.message);
    }
  };

  if (!user || !token) {
    return <h3>No autorizado</h3>;
  }

const handleLogout = () => {
  localStorage.removeItem("token"); 
  navigate("/login");
};
  
  //                                                              //
  // =========================== RETURN ========================= //
  //                                                              //
return (
  
  <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
  
  <AdminHeader
  user={user}
  onLogout={handleLogout}
  mode={mode}
  onToggleMode={toggleMode}
  demoEnabled={demoEnabled}
  onToggleDemo={toggleDemo}
  onGoMap={() => navigate("/mapa")}
  showDemo={true}
/>

<Box
  sx={{
    flex: 1,
    display: "flex",
    overflow: "hidden",
    minHeight: 0
  }}
>

<Box
    sx={{
      width: `${leftWidth}%`,
      overflow: "auto",
      bgcolor: "background.paper"
    }}
  >
{/* ================= PANEL ADMIN ================= */}
     
       <Paper
          elevation={1}
          sx={{
              height: "100%",
              bgcolor: "background.paper",
              p: 2,
              overflow: "auto",   // scroll
             }}
        >


     <div style={{ padding: 20 }}>


     <Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 1,
    mb: 1,
    px: 1,
    py: 0.5,
    borderBottom: "1px solid",
    borderColor: "divider"
  }}
>

  {/* DEMO */}
  <Tooltip title={demoEnabled ? "Detener DEMO" : "Iniciar DEMO"}>
    <IconButton
      size="small"
      onClick={toggleDemo}
      sx={{
        borderRadius: 1,
        color: demoEnabled ? "error.main" : "success.main",
        boxShadow: demoEnabled
  ? "inset 0 0 0 1px rgba(239,68,68,0.4)"
  : "inset 0 0 0 1px rgba(34,197,94,0.4)",

        bgcolor: demoEnabled
          ? "rgba(239,68,68,0.12)"
          : "rgba(34,197,94,0.12)",
        "&:hover": {
          bgcolor: demoEnabled
            ? "rgba(239,68,68,0.2)"
            : "rgba(34,197,94,0.2)"
        }
      }}
    >
      {demoEnabled ? "🛑" : "▶️"}
    </IconButton>
  </Tooltip>

  {/* VOLVER AL MAPA */}
  <Tooltip title="Volver al mapa">
    <IconButton
      size="small"
      onClick={() =>
        navigate("/mapa", { state: { fromAdmin: true } })
      }
      sx={{
        borderRadius: 1,
        color: "text.secondary",
        "&:hover": {
          bgcolor: "action.hover"
        }
      }}
    >
      🗺️
    </IconButton>
  </Tooltip>

  {/* DASHBOARD */}
<Tooltip title="Ver Dashboard">
  <IconButton
    size="small"
    onClick={() => navigate("/admin/dashboard")}
    sx={{
      borderRadius: 1,
      color: "text.secondary",
      "&:hover": {
        bgcolor: "action.hover"
      }
    }}
  >
    <DashboardIcon />
  </IconButton>
</Tooltip>
</Box>

{/* =================  BUSCADOR  ================= */}
<Stack
  direction="row"
  spacing={2}
  alignItems="center"
  sx={{ mb: 2 }}
>
  <TextField
    size="small"
    label="Buscar por nombre, rol, línea o unidad"
    variant="outlined"
    value={search}
    onChange={e => setSearch(e.target.value)}
    sx={{
      width: 320,
      input: { color: "#e5e7eb" },
      label: { color: "#94a3b8" }
    }}
  />

  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => setAdding(true)}

    sx={{
      textTransform: "none",
      fontWeight: 600,
      borderRadius: 2,
      px: 2.5,
      boxShadow: "0 6px 16px rgba(3,169,155,0.25)",
      "&:hover": {
        boxShadow: "0 8px 22px rgba(3,169,155,0.35)",
        transform: "translateY(-1px)"
      }
    }}
  >
    Agregar usuario
  </Button>
</Stack>
  
<Typography variant="caption">
  users: {users.length} | filteredUsers: {filteredUsers.length}
</Typography>


        <TableContainer
  component={Paper}
  sx={{
    mt: 2,
    width: "100%",
    overflowX: "auto"
  }}
>

 <Table
  size="small"
  sx={{
    minWidth: 0,     
    width: "100%",
    tableLayout: "fixed",
    "& td, & th": {
      py: 0.25,
      fontSize: 13
    }
  }}
>


    <TableHead>
  <TableRow
  hover
  sx={{
    "&:hover": {
      bgcolor: "action.hover"
    }
  }}
>
        <TableCell><b>Usuario</b></TableCell>
        <TableCell><b>Rol</b></TableCell>
        <TableCell><b>Unidad</b></TableCell>
        <TableCell><b>Línea</b></TableCell>
        <TableCell align="center"><b>Acción</b></TableCell>
      </TableRow>
    </TableHead>

    <TableBody>

      {/* ===  AGREGAR USUARIO === */}
      {adding && (
        <TableRow>
          <TableCell>
           <TextField
             size="small"
             label="Usuario"
             value={newUser.username}
             onChange={e =>
             setNewUser({ ...newUser, username: e.target.value })
              }
              />

          </TableCell>

          <TableCell>
            <FormControl size="small" fullWidth>
             <InputLabel>Rol</InputLabel>
              <Select
                 value={newUser.role}
                 label="Rol"
                 onChange={e =>
                 setNewUser({ ...newUser, role: e.target.value })
                  }
              >
               <MenuItem value="ADMIN">ADMIN</MenuItem>
               <MenuItem value="INSPECTOR">INSPECTOR</MenuItem>
               <MenuItem value="USUARIO">USUARIO</MenuItem>
               <MenuItem value="CHOFER">CHOFER</MenuItem>
               <MenuItem value="PASAJERO">PASAJERO</MenuItem>
               </Select>
               </FormControl>

           </TableCell>

          <TableCell>
            {newUser.role === "CHOFER" ? (
              <TextField
               size="small"
               label="Unidad"
               value={newUser.assignedUnit || ""}
               onChange={e =>
                setNewUser({ ...newUser, assignedUnit: e.target.value })
              }
               sx={{ width: 80 }}
              />
            ) : (
              "-"
            )}
          </TableCell>

          <TableCell>
            <TextField
              size="small"
              type="password"
              label="Password"
              value={newUser.password}
              onChange={e =>
              setNewUser({ ...newUser, password: e.target.value })
             }
            />

          </TableCell>

          <TableCell align="center">
            <Tooltip title="Guardar">
              <IconButton color="success"
                 onClick={addUser}
                 sx={{
                      bgcolor: "rgba(34,197,94,0.15)",
                     "&:hover": { bgcolor: "rgba(34,197,94,0.25)" }
                     }}
                    >
                  <SaveIcon />
                </IconButton>

            </Tooltip>

            <Tooltip title="Cancelar">
              <IconButton color="error" onClick={() => setAdding(false)}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      )}

      {/* === USUARIOS EXISTENTES === */}
      {filteredUsers.map(u => {
        const editing = editingId === u._id;

        return (
          <TableRow key={u._id} hover>
            <TableCell>{u.username}</TableCell>

            <TableCell>
              {editing ? (
               <FormControl size="small" fullWidth>
                <Select
                  value={editingRole}
                  onChange={e => setEditingRole(e.target.value)}
                >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="INSPECTOR">INSPECTOR</MenuItem>
                <MenuItem value="USUARIO">USUARIO</MenuItem>
                <MenuItem value="CHOFER">CHOFER</MenuItem>
                <MenuItem value="PASAJERO">PASAJERO</MenuItem>
                </Select>
              </FormControl>
               ) : (
                u.role
              )}
            </TableCell>

            <TableCell>
              {u.role === "CHOFER" ? (
                editing ? (
                  <TextField
  size="small"
  value={editingUnit}
  onChange={e => setEditingUnit(e.target.value)}
  sx={{ width: 80 }}
/>
     ) : ( u.assignedUnit || "-" )) : ("-" )}
         </TableCell>
            <TableCell>
              {u.role === "CHOFER" ? (
                editing ? (
                  <FormControl size="small" fullWidth>
                   <Select
                    value={editingLine}
                    onChange={e => setEditingLine(e.target.value)}
                   >
                   <MenuItem value="">-</MenuItem>
                   <MenuItem value="A">A</MenuItem>
                   <MenuItem value="E">E</MenuItem>
                   <MenuItem value="ZONA ESTE">ZONA ESTE</MenuItem>
                   <MenuItem value="ZONA OESTE">ZONA OESTE</MenuItem>
                   </Select>
                   </FormControl>
                ) : ( u.assignedLine || "-")) : ("-" )}
            </TableCell>

            <TableCell align="center">
              {editing ? (
                <>
                  <Tooltip title="Guardar">
                    <IconButton
                      color="success"
                      onClick={() => {
                        saveRole(u._id);
                        if (editingRole === "CHOFER") {
                          saveUnit(u._id);
                          saveLine(u._id);
                        }
                      }}
                    >
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Cancelar">
                    <IconButton color="error" onClick={cancelEdit}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => startEdit(u)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => deleteUser(u._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
</TableContainer>
            </div>
        </Paper>
  </Box>      
<Box
    
  onMouseDown={() => (isDraggingRef.current = true)}
  sx={{
    width: "4px",
    cursor: "col-resize",
    bgcolor: "divider",
    flexShrink: 0,
    "&:hover": {
      bgcolor: "text.secondary"
    }
  }}
/>


      {/* ================= PANEL MAPA ================= */}


   <Paper
  sx={{
    position:"relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0
  }}
>

          {/* Contenedor del mapa */}
   <Box sx={{ flex: 1 }}>
    <AdminMap 
  buses={buses} 
  busTrails={busTrails} 
  demoEnabled={demoEnabled}
/>
   </Box>

        </Paper>
   </Box>
   </Box>
);
}

