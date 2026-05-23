/**
 * ==========================================================
 * Archivo: routes/inspectorRoutes.js
 * ----------------------------------------------------------
 * Rutas relacionadas con el inspector.
 *
 * Responsabilidad:
 * - Definir endpoints HTTP
 * - Delegar la lógica al InspectorController
 *
 * Este archivo NO contiene lógica de negocio.
 *
 * Estado:
 * ✔ Refactorizado correctamente
 * ✔ Desacoplado (routing separado de lógica)
 * ==========================================================
 */

const express = require("express");
const router = express.Router();

const { auth, allowRoles } = require("../middlewares/auth");

const {
  getMe,
  getDrivers,
  getActiveSession,
  startSession,
  stopSession
} = require("../controllers/inspectorController");

/* =========================
   DATOS DEL INSPECTOR
========================= */
router.get("/me", auth, allowRoles("INSPECTOR"), getMe);

/* =========================
   CHOFERES
========================= */
router.get("/drivers", auth, allowRoles("INSPECTOR"), getDrivers);

/* =========================
   SESIONES
========================= */
router.get("/session/active", auth, allowRoles("INSPECTOR"), getActiveSession);
router.post("/session/start", auth, allowRoles("INSPECTOR"), startSession);
router.post("/session/stop", auth, allowRoles("INSPECTOR"), stopSession);

module.exports = router;