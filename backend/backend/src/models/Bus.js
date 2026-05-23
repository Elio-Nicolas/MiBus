/**
 * ==========================================================
 * Archivo: models/Bus.js
 * ----------------------------------------------------------
 * Modelo de datos para representar unidades de transporte (colectivos).
 *
 * Responsabilidad:
 * - Definir la estructura de persistencia de una unidad (bus)
 * - Representar el estado actual de cada unidad en el sistema
 * - Almacenar información operativa y de geolocalización
 *
 * Entidad representada:
 * - Bus / Unidad de transporte
 *
 * Campos principales:
 * - unitId: Identificador único de la unidad
 * - driverId: Identificador del chofer asociado
 * - driverName: Nombre del chofer (dato redundante para acceso rápido)
 * - lineCode: Línea a la que pertenece la unidad
 * - lat / lon: Posición geográfica actual
 * - active: Indica si la unidad está operativa
 * - isDemo: Determina si la unidad pertenece a un entorno de simulación
 * - lastUpdate: Timestamp de la última actualización de posición
 *
 * Otros atributos visuales:
 * - color
 * - shape
 *
 * Uso dentro del sistema:
 * - Persistencia de ubicación en tiempo real
 * - Seguimiento de unidades activas
 * - Visualización en mapas (frontend)
 * - Simulación de flota (modo demo)
 *
 * Este modelo NO contiene lógica de negocio.
 * Solo define la estructura de datos en la base de datos.
 *
 * Notas de diseño:
 * - Se utiliza un fallback con mongoose.models para evitar
 *   errores de redefinición del modelo en entornos con hot-reload.
 *
 * Evaluación de arquitectura:
 * - Cumple correctamente su responsabilidad como modelo de dominio
 * - Presenta acoplamiento leve entre datos de dominio y datos de presentación
 *   (ej: color, shape)
 *
 * Estado de refactorización:
 * - Requiere refactorización leve para separación de responsabilidades:
 *   • Extraer atributos de UI (color, shape) a capa de presentación
 *   • Evaluar normalización de driverName (evitar duplicación)
 * ==========================================================
 */

const mongoose = require("mongoose");

// console.log(" Cargando Bus model");

// Mostrar modelos ya cargados (útil para debug)
//console.log("Modelos cargados actualmente:", Object.keys(mongoose.models));

const busSchema = new mongoose.Schema({
  unitId: { type: String, required: true },      // Unidad / colectivo
  driverId: { type: String, required: true },    // Chofer (userId)

  lineCode: {
    type: String,
    enum: ["A", "E", "ZONA ESTE", "ZONA OESTE"],
    required: true, // obligatorio
  },
  driverName: String,
  lat: Number,
  lon: Number,

  color: String,
  shape: { type: String, default: "circle" },
  isDemo: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  lastUpdate: { type: Date, default: Date.now },
});

// ✅ Exportar modelo, evitando OverwriteModelError
module.exports = mongoose.models.Bus || mongoose.model("Bus", busSchema);
