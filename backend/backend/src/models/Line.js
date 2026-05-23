/**
 * ==========================================================
 * Archivo: models/Line.js
 * ----------------------------------------------------------
 * Modelo de datos para representar una línea de transporte urbano.
 *
 * Responsabilidad:
 * - Definir la estructura de una línea dentro del sistema
 * - Representar configuración operativa y geoespacial
 * - Servir como base para lógica de recorrido y detección de vueltas
 *
 * Evolución del modelo:
 * - Mantiene compatibilidad con implementaciones existentes
 *   (ej: uso de lineCode en Bus)
 * - Incorpora capacidades geoespaciales avanzadas
 * - Permite modelar comportamiento real del transporte
 *
 * Entidad representada:
 * - Línea de transporte (Route / Transit Line)
 *
 * Componentes principales:
 *
 * 🔹 Identificación:
 * - code: Identificador único de la línea
 * - name: Nombre descriptivo
 *
 * 🔹 Configuración visual:
 * - color: Usado para representación en mapa
 *
 * 🔹 Estado operativo:
 * - active: Indica si la línea está en servicio
 * - units: Lista de unidades asignadas
 *
 * 🔹 Definición geoespacial:
 * - route: Recorrido completo (GeoJSON LineString)
 * - startPoint: Punto de inicio de vuelta
 * - endPoint: Punto de fin de vuelta
 *
 * 🔹 Parámetros operativos:
 * - toleranceStartMeters: Radio para detectar inicio
 * - toleranceEndMeters: Radio para detectar fin
 * - minLapTimeSeconds: Tiempo mínimo válido de vuelta
 *
 * Uso dentro del sistema:
 * - Determinación de recorridos
 * - Validación de vueltas completas
 * - Cálculo de eventos operativos (Lap)
 * - Soporte para lógica de tracking y análisis
 *
 * Indexación:
 * - Se utilizan índices geoespaciales (2dsphere)
 *   para optimizar consultas sobre rutas y puntos
 *
 * Este modelo NO contiene lógica de negocio.
 * Representa configuración y estructura del dominio.
 *
 * Evaluación de arquitectura:
 * - Modelo rico en dominio (no anémico)
 * - Bien orientado a comportamiento real del sistema
 * - Integra datos operativos + geoespaciales correctamente
 *
 * Estado de refactorización:
 * - Requiere refactorización leve:
 *   • Separar parcialmente configuración operativa
 *     (tolerancias, minLapTime) de la entidad estructural
 *   • Evaluar si "units" debe persistirse o derivarse dinámicamente
 *
 * Nota:
 * - Actualmente mezcla:
 *   • definición estructural de la línea
 *   • configuración de lógica operativa
 * - No es crítico, pero puede evolucionar a mejor separación
 * ==========================================================
 */

const mongoose = require("mongoose");

const LineSchema = new mongoose.Schema({
  /**
   * Código corto de línea
   * Ej: "A", "E", "ZONA ESTE"
   * Se usa actualmente en Bus.lineCode
   */
  code: {
    type: String,
    required: true,
    unique: true
  },

  /**
   * Nombre descriptivo
   */
  name: {
    type: String
  },

  /**
   * Color usado en el mapa
   */
  color: {
    type: String,
    required: true
  },

  /**
   * Si la línea está activa
   */
  active: {
    type: Boolean,
    default: true
  },

  /**
   * Lista de unidades asignadas
   * Ej: ["A1", "A2", "A3"]
   */
  units: [{
    type: String
  }],

  // ==========================================================
  // 🔽 NUEVA SECCIÓN GEOESPACIAL (NO rompe nada existente)
  // ==========================================================

  /**
   * Recorrido completo de la línea
   * Formato GeoJSON LineString
   *
   * coordinates: [[lng, lat], [lng, lat], ...]
   *
   * Es opcional para no romper líneas existentes.
   */
  route: {
    type: {
      type: String,
      enum: ["LineString"],
      default: undefined
    },
    coordinates: {
      type: [[Number]],
      default: undefined
    }
  },

  /**
   * Punto oficial de inicio de vuelta
   */
  startPoint: {
    type: {
      type: String,
      enum: ["Point"],
      default: undefined
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: undefined
    }
  },

  /**
   * Punto oficial de fin de vuelta
   */
  endPoint: {
    type: {
      type: String,
      enum: ["Point"],
      default: undefined
    },
    coordinates: {
      type: [Number],
      default: undefined
    }
  },

  /**
   * Radio de detección en metros
   * para inicio de vuelta
   */
  toleranceStartMeters: {
    type: Number,
    default: 50
  },

  /**
   * Radio de detección en metros
   * para fin de vuelta
   */
  toleranceEndMeters: {
    type: Number,
    default: 50
  },

  /**
   * Tiempo mínimo válido para vuelta completa
   * Evita falsos positivos por GPS errático
   */
  minLapTimeSeconds: {
    type: Number,
    default: 300
  }

}, { timestamps: true });

/**
 * Indexes geoespaciales
 * Solo se activan si existen los campos.
 */
LineSchema.index({ route: "2dsphere" });
LineSchema.index({ startPoint: "2dsphere" });
LineSchema.index({ endPoint: "2dsphere" });

module.exports = mongoose.models.Line || mongoose.model("Line", LineSchema);