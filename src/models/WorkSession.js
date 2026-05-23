/**
 * ==========================================================
 * Archivo: models/WorkSession.js
 * ----------------------------------------------------------
 * Modelo de sesiones de trabajo operativas.
 *
 * Responsabilidad:
 * - Registrar el inicio y fin de una jornada de trabajo
 *   para un usuario dentro del sistema.
 * - Representar el estado activo/inactivo de una sesión.
 *
 * Alcance:
 * - Aplica principalmente a roles operativos:
 *   - CHOFER
 *   - INSPECTOR
 *
 * Atributos clave:
 * - userId: referencia al usuario que inicia la sesión
 * - role: rol bajo el cual opera durante la sesión
 * - unitId: unidad asignada (si aplica)
 * - line: línea en la que opera
 * - startTime / endTime: duración de la sesión
 * - status: control de estado (ACTIVE / CLOSED)
 *
 * Uso en el sistema:
 * - Control de sesiones activas (ej: inspector activo)
 * - Registro de actividad operativa
 * - Base para auditoría y análisis de uso
 *
 * Relación con otros modelos:
 * - User → identidad del operador
 * - Bus → unidad asociada (implícita vía unitId)
 * - Lap → eventos dentro de la sesión (no explícito aún)
 *
 * Observación importante:
 * Este modelo define claramente el concepto de "sesión",
 * lo cual lo posiciona como la fuente principal de verdad
 * para el estado operativo de usuarios.
 *
 * Evaluación arquitectónica:
 * - Está bien definido
 * - Tiene una única responsabilidad clara
 * - Encaja correctamente en el dominio
 *
 * Posible mejora:
 * - Referenciar Line mediante ObjectId en lugar de string
 *   para mantener consistencia con el modelo Line
 *
 * Estado:
 * ✔ Correcto y bien enfocado
 *
 * Refactorización:
 * ⚠️ MENOR (mejora de consistencia en referencias)
 * ==========================================================
 */

const mongoose = require("mongoose");

const WorkSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  role: {
    type: String,
    enum: ["CHOFER", "INSPECTOR"],
    required: true,
  },

  unitId: {
    type: String,
    default: null,
  },

  line: {
    type: String,
    default: null,
  },

  startTime: {
    type: Date,
    required: true,
  },

  endTime: Date,

  status: {
    type: String,
    enum: ["ACTIVE", "CLOSED"],
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("WorkSession", WorkSessionSchema);
