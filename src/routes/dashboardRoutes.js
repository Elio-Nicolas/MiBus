/**
 * ==========================================================
 * Archivo: routes/dashboardRoutes.js
 * ----------------------------------------------------------
 * Define los endpoints HTTP del dashboard.
 *
 * Cada endpoint llama a un método del dashboardController.
 *
 * Este archivo solo maneja rutas.
 * No contiene lógica de negocio.
 * ==========================================================
 */

const router = require("express").Router();
const dashboardController = require("../controllers/dashboardController");

router.get("/summary", dashboardController.getDashboardSummary);

router.get("/laps-by-unit", dashboardController.getLapsByUnit);

router.get("/laps-hourly", dashboardController.getHourlyLaps);

router.get("/laps-by-day-line", dashboardController.getLapsByDayLine);

module.exports = router;