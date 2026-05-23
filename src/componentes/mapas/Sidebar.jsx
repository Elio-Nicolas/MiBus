import { Drawer, Typography, Avatar, Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  open,
  onClose,
  image,
  username,
  handleImageChange,
  handleChangeUsername,
  handleLogout,
  setOpenLineasDrawer,
  setMostrarClima
}) => {
  const navigate = useNavigate();

  // Leemos el objeto completo "user" desde localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user.role?.toUpperCase() || null;

  // Quién puede ver la sección de usuario y cerrar sesión
  const canShowUserSection = ["ADMIN", "CHOFER", "INSPECTOR"].includes(role);

  //console.log("ROLE EN SIDEBAR:", role);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      container={document.getElementById("map-wrapper")}
      PaperProps={{
        elevation: 0,
        sx: {
          backgroundColor: "rgba(169, 213, 238, 0.8)",
          boxShadow: "none",
        },
      }}
      ModalProps={{
        BackdropProps: { invisible: true },
      }}
    >
      <div style={{ width: 250, padding: 16 }}>
        <Typography variant="h7">🚌 VILLA MERCEDES SL</Typography>

        {canShowUserSection && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              id="avatarUpload"
              onChange={handleImageChange}
            />
            <label htmlFor="avatarUpload">
              <Avatar
                alt="Perfil"
                src={image || ""}
                sx={{ width: 85, height: 85, margin: "0 auto", cursor: "pointer" }}
              />
            </label>
            <Typography
              variant="subtitle1"
              sx={{ mt: 1, cursor: "pointer" }}
              onClick={handleChangeUsername}
            >
              Usuario: {username}
            </Typography>
          </div>
        )}

        {/* Botones */}
        <div style={{ marginTop: 100, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenLineasDrawer(true)}
            sx={{ mt: 1, width: "80%" }}
          >
            LINEAS
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 1, width: "80%" }}
          >
            SALDO
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 1, width: "80%" }}
          >
            RECARGA
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setMostrarClima(true)}
            sx={{ mt: 1, width: "80%" }}
          >
            CLIMA
          </Button>

          {role === "ADMIN" && (
            <Button
              variant="contained"
              color="warning"
              sx={{ mt: 1, width: "80%" }}
              onClick={() => {
                onClose();
                navigate("/admin");
              }}
            >
              PANEL ADM
            </Button>
          )}

          {canShowUserSection && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{ mt: 1, width: "80%" }}
            >
              Cerrar sesión
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default Sidebar;
