/**
 * ==========================================================
 * Archivo: controllers/busController.js
 * ----------------------------------------------------------
 * Controlador de unidades (colectivos).
 *
 * Responsabilidad:
 * - Obtener listado de colectivos
 * - Centralizar la lógica de acceso a datos del modelo Bus
 * - Preparar la respuesta para el cliente
 *
 * Este archivo NO define rutas.
 * Solo contiene lógica de negocio.
 *
 * Estado:
 * ✔ Correcto (desacoplado)
 * ==========================================================
 */

const Bus = require("../models/Bus");

/**
 * ==========================================================
 * GET /api/buses
 *
 * Devuelve todos los colectivos registrados.
 * ==========================================================
 */
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo colectivos" });
  }
};