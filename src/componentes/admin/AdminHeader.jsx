/**
 * ==========================================================
 * ARCHIVO: AdminHeader.jsx
 * ----------------------------------------------------------
 * COMPONENTE: Header principal del panel Admin / UI global
 *
 * ESTADO ACTUAL:
 * Componente funcional pero todavía ACOPLADO.
 * Mezcla UI + lógica de permisos + estado interno + menús.
 *
 * ==========================================================
 *
 *  RESPONSABILIDADES ACTUALES:
 *
 * 1. UI principal del sistema
 *    - AppBar
 *    - Toolbar
 *    - Branding (MiBus)
 *
 * 2. Gestión de estado UI local
 *    - Menú configuración (anchorConfig)
 *    - Menú usuario (userAnchorEl)
 *    - Menú settings (anchorEl)
 *
 * 3. Permisos de UI por rol
 *    - ROLE_UI define qué botones se muestran
 *    - Depende directamente de AuthContext
 *
 * 4. Integración con contexto global
 *    - useAuth (user / logout)
 *
 * 5. Datos externos de UI
 *    - useWeatherClock (hora / clima / ciudad)
 *
 * ==========================================================
 *
 *  PROBLEMAS DETECTADOS:
 *
 * - DEMASIADAS RESPONSABILIDADES en un solo componente
 * - Menús embebidos (no reutilizables)
 * - Lógica de roles acoplada al render
 * - Estados UI repetitivos (anchors múltiples)
 * - Dependencia directa de Auth + Weather + Theme
 *
 * ==========================================================
 *
 *  REDUNDANCIA POTENCIAL EN EL PROYECTO:
 *
 * Puede existir duplicación en otros componentes de:
 * - ROLE_UI (permisos visuales)
 * - Menús de usuario / settings
 * - Lógica de logout
 * - Lógica de clima/ubicación
 *
 * ==========================================================
 *
 *  REFACTORIZACIÓN FUTURA (NO OBLIGATORIA AHORA):
 *
 * Se recomienda dividir en:
 *
 * - UserMenu.jsx        → menú usuario + logout
 * - ConfigMenu.jsx      → demo + theme toggle
 * - WeatherStatus.jsx   → clima + hora + ciudad
 * - useHeaderMenus.js   → estado de anchors
 * - useRoleUI.js        → lógica de permisos por rol
 *
 * ==========================================================
 *
 *  ESTADO FUNCIONAL ACTUAL:
 *
 * ✔ No tiene bugs estructurales
 * ✔ Funciona correctamente
 * ✔ Refactor seguro sin romper UI
 *
 * ==========================================================
 */

import { useState } from "react";
import ScienceIcon from "@mui/icons-material/Science";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import MapIcon from "@mui/icons-material/Map";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import {getWeatherTheme} from "../../context/weatherTheme"
import Skeleton from "@mui/material/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useWeatherClock } from "./hooks/useWeatherClock";
import { ROLE_UI } from "./config/roleUI";

// ========================== HELPER ==========================


export default function AdminHeader({
  mode,
  showDemo = true,
  onToggleMode,
  onToggleDemo,
  demoEnabled,
  onGoMap,
  //user,
  //onLogout
}) {


   //  ===================== CONFIGURACION  =======================//
  const { user, logout } = useAuth();
  const { time, weather, city, formattedDate } = useWeatherClock();
  const role = user?.role ?? "GUEST";
  const ui = ROLE_UI[role] || ROLE_UI.GUEST;

  const weatherTheme = getWeatherTheme(weather?.weathercode);
  const [anchorConfig, setAnchorConfig] = useState(null);
  const openConfig = Boolean(anchorConfig);

  const handleOpenConfig = (e) => setAnchorConfig(e.currentTarget);
  const handleCloseConfig = () => setAnchorConfig(null);



  // ======================== USUAI¡RIO  ==========================//
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const userMenuOpen = Boolean(userAnchorEl);

  const handleOpenUserMenu = (e) => {
   setUserAnchorEl(e.currentTarget);
  };

  const handleCloseUserMenu = () => {
   setUserAnchorEl(null);
  };


return (
  <>
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: weatherTheme?.bg || "#0f172a",
        borderBottom: `1px solid ${weatherTheme?.border || "#1e293b"}`,
        transition: "background-color .4s ease",
        zIndex: theme => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        {/* BRAND */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.5px",
                color: "#e5e7eb",
                lineHeight: 1
              }}
            >
              MiBus
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "#cbd5f5"
              }}
            >
              Transporte Inteligente
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* STATUS – CIUDAD / CLIMA / HORA (SOLO GUEST) */}
  {(role === "GUEST" || role === "PASAJERO") && (
  <Stack
    direction="row"
    alignItems="center"
    spacing={3}
    sx={{
      mr: 2,
      px: 2.5,
      py: 1,
      borderRadius: 3,
      bgcolor: "rgba(2,6,23,.75)",
      border: "1px solid #1e293b",
      backdropFilter: "blur(8px)"
    }}
  >
    {/* CIUDAD */}
    {weather ? (
      <Typography fontSize={14} fontWeight={600} color="#e5e7eb">
      {city || "Detectando…"}
      </Typography>
    ) : (
      <Skeleton width={120} height={20} />
    )}

    {/* CLIMA */}
    {weather ? (
      <Typography
        fontSize={15}
        fontWeight={700}
        sx={{ color: weatherTheme?.accent }}
      >
        {weather.temperature}°C
      </Typography>
    ) : (
      <Skeleton width={40} height={24} />
    )}

    {/* FECHA */}
    <Typography
      fontSize={14}
      fontWeight={600}
      sx={{ color: "#cbd5f5", textTransform: "capitalize" }}
    >
      {formattedDate}
    </Typography>

    {/* HORA */}
    <Typography
      fontSize={15}
      fontWeight={700}
      letterSpacing={0.5}
      color="#e5e7eb"
    >
      {time.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit"
      })}
    </Typography>
  </Stack>
)}

        {/* ACCIONES */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {ui.lineas && (
            <Tooltip title="Volver al mapa">
              <IconButton
                onClick={onGoMap}
                sx={{
                  bgcolor: "#020617",
                  color: "#e5e7eb",
                  border: "1px solid #1e293b",
                  borderRadius: 2,
                  "&:hover": {
                    color: weatherTheme?.accent || "#38bdf8"
                  }
                }}
              >
                <MapIcon />
              </IconButton>
            </Tooltip>
          )}

          {ui.engranaje && (
            <Tooltip title="Configuración">
              <IconButton
                onClick={handleOpenConfig}
                sx={{
                  bgcolor: "#020617",
                  color: "#e5e7eb",
                  border: "1px solid #1e293b",
                  borderRadius: 2,
                  "&:hover": {
                    color: weatherTheme?.accent || "#38bdf8"
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          )}
           {/* BOTÓN USUARIO (ESTO ES LO QUE FALTABA) */}
  {user && ui.cerrarSesion && (
    <Tooltip title="Usuario">
      <IconButton
        onClick={handleOpenUserMenu}
        sx={{
          bgcolor: "#020617",
          color: "#e5e7eb",
          border: "1px solid #1e293b",
          borderRadius: 2,
          "&:hover": {
            color: weatherTheme?.accent || "#38bdf8"
          }
        }}
      >
        <PersonIcon />
      </IconButton>
    </Tooltip>
  )}
        </Box>
      </Toolbar>
    </AppBar>

    {/* MENU CONFIGURACIÓN */}
    <Menu
      anchorEl={anchorConfig}
      open={openConfig}
      onClose={handleCloseConfig}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 240,
          bgcolor: "#020617",
          color: "#e5e7eb",
          border: "1px solid #1e293b"
        }
      }}
    >
      {showDemo && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1
          }}
          onClick={e => e.stopPropagation()}
        >
          <ScienceIcon fontSize="small" />
          <Typography variant="body2">Modo demo</Typography>
          <Switch
            size="small"
            checked={demoEnabled}
            onChange={onToggleDemo}
            sx={{ ml: "auto" }}
          />
        </Box>
      )}

      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
        onClick={e => e.stopPropagation()}
      >
        {mode === "dark" ? (
          <DarkModeIcon fontSize="small" />
        ) : (
          <LightModeIcon fontSize="small" />
        )}
        <Typography variant="body2">Tema</Typography>
        <Switch
          size="small"
          checked={mode === "dark"}
          onChange={onToggleMode}
          sx={{ ml: "auto" }}
        />
      </Box>
    </Menu>

    {/* MENU USUARIO */}
    <Menu
      anchorEl={userAnchorEl}
      open={userMenuOpen}
      onClose={handleCloseUserMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 220,
          bgcolor: "#020617",
          color: "#e5e7eb",
          border: "1px solid #1e293b"
        }
      }}
    >
      <MenuItem disabled>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>
            {user?.username || "Usuario"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {user?.role}
          </Typography>
        </Box>
      </MenuItem>

      <MenuItem
  sx={{ color: "#f87171" }}
  onClick={() => {
    handleCloseUserMenu();
    logout();
  }}
>
  Cerrar sesión
</MenuItem>
    </Menu>
  </>
);
}