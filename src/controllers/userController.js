/**
 * ==========================================================
 * Archivo: controllers/userController.js
 * ----------------------------------------------------------
 * Controlador de gestión de usuarios.
 *
 * Responsabilidad:
 * - Actualizar perfil de usuario
 * - Administrar roles y asignaciones
 * - Obtener listado de usuarios
 *
 * Centraliza la lógica de negocio vinculada a usuarios.
 *
 * Este archivo NO define rutas.
 *
 * Estado:
 * ✔ Refactorizado
 * ⚠ Contiene funcionalidades que se solapan con adminController
 * ==========================================================
 */

const User = require("../models/User");

/**
 * ==========================================================
 * PUT /api/users/upload/:id
 * ==========================================================
 */
exports.updateProfile = async (req, res) => {
  const { username } = req.body;
  const imagePath = req.file ? req.file.path : undefined;

  try {
    const updates = {};
    if (username) updates.username = username;
    if (imagePath) updates.image = imagePath;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Perfil actualizado correctamente",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

/**
 * ==========================================================
 * PUT /api/users/assign-role/:id
 * ==========================================================
 */
exports.assignRole = async (req, res) => {
  const { role, assignedUnit } = req.body;

  try {
    const updates = {};
    if (role) updates.role = role;
    if (assignedUnit !== undefined) updates.assignedUnit = assignedUnit;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Rol / unidad actualizados",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

/**
 * ==========================================================
 * GET /api/users
 * ==========================================================
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};