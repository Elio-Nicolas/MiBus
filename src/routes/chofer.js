/**
 * ==========================================================
 * Archivo: routes/chofer.js
 * ----------------------------------------------------------
 * Rutas relacionadas con el chofer.
 *
 * Responsabilidad:
 * - Definir endpoints HTTP
 * - Delegar la lógica al DriverController
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
  getActiveSession,
  getLastSessions,
  startSession,
  stopSession
} = require("../controllers/driverController");

/* =========================
   DATOS DEL CHOFER
========================= */
router.get("/me", auth, allowRoles("CHOFER"), getMe);

/* =========================
   SESIONES
========================= */
router.get("/session/active", auth, getActiveSession);
router.get("/session/last", auth, getLastSessions);
router.post("/session/start", auth, startSession);
router.post("/session/stop", auth, stopSession);

module.exports = router;