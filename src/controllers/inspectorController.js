/**
 * ==========================================================
 * Archivo: controllers/inspectorController.js
 * ----------------------------------------------------------
 * Controlador de funcionalidades del inspector.
 *
 * Responsabilidad:
 * - Obtener datos del inspector logueado
 * - Consultar choferes del sistema
 * - Gestionar sesiones de trabajo del inspector
 *
 * Este archivo NO define rutas.
 * Solo contiene lógica de negocio.
 *
 * Estado:
 * ✔ Refactorizado correctamente
 * ✔ Desacoplado
 * ==========================================================
 */

const User = require("../models/User");
const WorkSession = require("../models/WorkSession");

/**
 * ==========================================================
 * GET /api/inspector/me
 * ==========================================================
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("username role");

    if (!user) {
      return res.status(404).json({ error: "Inspector no encontrado" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo inspector" });
  }
};

/**
 * ==========================================================
 * GET /api/inspector/drivers
 * ==========================================================
 */
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: "CHOFER" })
      .select("username assignedUnit assignedLine location");

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo choferes" });
  }
};

/**
 * ==========================================================
 * GET /api/inspector/session/active
 * ==========================================================
 */
exports.getActiveSession = async (req, res) => {
  try {
    const session = await WorkSession.findOne({
      userId: req.user.userId,
      status: "ACTIVE",
    }).sort({ startTime: -1 });

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo sesión activa" });
  }
};

/**
 * ==========================================================
 * POST /api/inspector/session/start
 * ==========================================================
 */
exports.startSession = async (req, res) => {
  try {
    const userId = req.user.userId;

    await WorkSession.updateMany(
      { userId, status: "ACTIVE" },
      { status: "CLOSED", endTime: new Date() }
    );

    const session = new WorkSession({
      userId,
      role: req.user.role,
      status: "ACTIVE",
      startTime: new Date(),
    });

    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: "Error iniciando sesión" });
  }
};

/**
 * ==========================================================
 * POST /api/inspector/session/stop
 * ==========================================================
 */
exports.stopSession = async (req, res) => {
  try {
    const session = await WorkSession.findOneAndUpdate(
      { userId: req.user.userId, status: "ACTIVE" },
      { status: "CLOSED", endTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(400).json({ error: "No hay sesión activa" });
    }

    res.json(session);
  } catch (err) {
    res.status(500).json({ error: "Error cerrando sesión" });
  }
};