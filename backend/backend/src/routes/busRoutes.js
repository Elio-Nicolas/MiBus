/**
 * ==========================================================
 * Archivo: routes/busRoutes.js
 * ----------------------------------------------------------
 * Rutas relacionadas con unidades (colectivos).
 *
 * Responsabilidad:
 * - Definir endpoints HTTP
 * - Delegar la lógica al BusController
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

const { getAllBuses } = require("../controllers/busController");

/**
 * ==========================================================
 * GET /api/buses
 * ==========================================================
 */
router.get("/", getAllBuses);

module.exports = router;