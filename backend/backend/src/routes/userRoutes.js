/**
 * ==========================================================
 * Archivo: routes/userRoutes.js
 * ----------------------------------------------------------
 * Rutas relacionadas con usuarios.
 *
 * Responsabilidad:
 * - Definir endpoints HTTP
 * - Delegar lógica al UserController
 *
 * Este archivo NO contiene lógica de negocio.
 *
 * Estado:
 * ✔ Refactorizado correctamente
 * ⚠ Presenta solapamiento funcional con adminRoutes
 * ==========================================================
 */

const express = require("express");
const router = express.Router();

const { auth, allowRoles } = require("../middlewares/auth");

const {
  updateProfile,
  assignRole,
  getAllUsers
} = require("../controllers/userController");

/* =========================
   PERFIL
========================= */
router.put("/upload/:id", updateProfile);

/* =========================
   ADMIN
========================= */
router.put("/assign-role/:id", auth, allowRoles("ADMIN"), assignRole);
router.get("/", auth, allowRoles("ADMIN"), getAllUsers);

module.exports = router;