/**
 * ==========================================================
 * Archivo: routes/authRoutes.js
 * ----------------------------------------------------------
 * Rutas de autenticación del sistema.
 *
 * Responsabilidad:
 * - Definir endpoints de acceso público
 * - Delegar la lógica al authController
 *
 * Endpoints:
 * - POST /signup
 * - POST /signin
 *
 * Este archivo NO contiene lógica de negocio.
 * Solo enruta las solicitudes.
 * ==========================================================
 */

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

/* =========================
   AUTH
========================= */
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);

module.exports = router;