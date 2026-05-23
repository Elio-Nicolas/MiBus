/**
 * ==========================================================
 * Archivo: models/Lap.js
 * ----------------------------------------------------------
 * Modelo de datos para representar vueltas completas realizadas
 * por una unidad de transporte dentro del sistema.
 *
 * Responsabilidad:
 * - Persistir eventos operativos relevantes (vueltas completas)
 * - Registrar métricas de rendimiento por unidad y línea
 * - Servir como base para análisis y métricas del sistema
 *
 * Enfoque de diseño:
 * - Se almacenan únicamente eventos significativos
 *   (inicio y fin de vuelta)
 * - NO se persisten datos GPS crudos
 * - Esto reduce volumen de datos y mejora la escalabilidad
 *
 * Entidad representada:
 * - Lap (vuelta completa de un colectivo)
 *
 * Campos principales:
 * - unitId: Identificador de la unidad
 * - lineId: Referencia a la línea (relación con modelo Line)
 * - startedAt: Fecha/hora de inicio de la vuelta
 * - completedAt: Fecha/hora de finalización
 * - durationSeconds: Duración total en segundos
 *
 * Uso dentro del sistema:
 * - Cálculo de métricas operativas (dashboard)
 * - Análisis de rendimiento por unidad
 * - Detección de patrones (horas pico, frecuencia)
 * - Base para reportes y estadísticas
 *
 * Este modelo NO contiene lógica de negocio.
 * Solo define la estructura de datos persistida.
 *
 * Evaluación de arquitectura:
 * - Modelo correctamente desacoplado
 * - Representa un evento de dominio claro (event-driven)
 * - Diseño orientado a eficiencia y escalabilidad
 *
 * Estado de refactorización:
 * - No requiere refactorización
 * - Implementación alineada con buenas prácticas
 * ==========================================================
 */

const mongoose = require("mongoose");

const lapSchema = new mongoose.Schema({
  unitId: {
    type: String,
    required: true
  },

  lineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Line",
    required: true
  },

  startedAt: {
    type: Date,
    required: true
  },

  completedAt: {
    type: Date,
    required: true
  },

  durationSeconds: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Lap", lapSchema);