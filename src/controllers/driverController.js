/**
 * ==========================================================
 * Archivo: controllers/driverController.js
 * ----------------------------------------------------------
 * Controlador de funcionalidades del chofer.
 *
 * Responsabilidad:
 * - Obtener datos del chofer logueado
 * - Gestionar sesiones de trabajo (inicio, fin, consulta)
 * - Centralizar la lógica de negocio vinculada al chofer
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
 * GET /api/driver/me
 * ==========================================================
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("username role assignedUnit assignedLine");

    if (!user) {
      return res.status(404).json({ error: "Chofer no encontrado" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo chofer" });
  }
};

/**
 * ==========================================================
 * GET /api/driver/session/active
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
 * GET /api/driver/session/last
 * ==========================================================
 */
exports.getLastSessions = async (req, res) => {
  try {
    const sessions = await WorkSession.find({
      userId: req.user.userId,
    })
      .sort({ startTime: -1 })
      .limit(5);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo sesiones" });
  }
};

/**
 * ==========================================================
 * POST /api/driver/session/start
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
      unitId: req.body.unitId || null,
      line: req.body.line || null,
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
 * POST /api/driver/session/stop
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