/**
 * ==========================================================
 * Archivo: models/User.js
 * ----------------------------------------------------------
 * Modelo de Usuario del sistema.
 *
 * Responsabilidad:
 * - Representar las cuentas de acceso al sistema
 * - Gestionar autenticación (username / password)
 * - Definir roles operativos dentro de la plataforma
 *
 * Roles soportados:
 * - ADMIN: acceso total al sistema
 * - INSPECTOR: control operativo y monitoreo
 * - CHOFER: unidad asignada
 * - USUARIO: usuario final / pasajero
 *
 * Atributos operativos:
 * - assignedUnit: unidad asignada (principalmente chofer)
 * - assignedLine: línea asignada
 *
 * Uso en el sistema:
 * - Autenticación (login con JWT)
 * - Control de permisos (middleware allowRoles)
 * - Relación indirecta con:
 *   - Bus (chofer)
 *   - Líneas
 *   - Sesiones
 *
 * Observación importante:
 * Este modelo mezcla:
 * - identidad (auth)
 * - permisos (roles)
 * - asignación operativa (unidad / línea)
 *
 * Esto es válido en MVP, pero a escala puede generar
 * acoplamiento fuerte entre dominio de usuarios
 * y dominio operativo del transporte.
 *
 * Riesgos:
 * - Dificultad para escalar roles complejos
 * - Problemas si un usuario tiene múltiples asignaciones
 * - Lógica de negocio dispersa (ej: chofer vs inspector)
 *
 * Decisión sugerida (a futuro):
 * Separar en:
 * - User (identidad)
 * - Assignment / Profile (rol operativo dinámico)
 *
 * Estado:
 * ✔ Correcto para MVP
 *
 * Refactorización:
 * ⚠️ RECOMENDADA A FUTURO (no urgente)
 * ==========================================================
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String },

  // ===== ROLES ===== //
  role: {
    type: String,
    enum: ["ADMIN", "CHOFER", "USUARIO","INSPECTOR"],
    default: "USUARIO",
  },

  assignedUnit: {
    type: String,
    default: null,
  },

  assignedLine: {
    type: String,
    default: null, 
  },

});

module.exports = mongoose.model("User", UserSchema, "users");

