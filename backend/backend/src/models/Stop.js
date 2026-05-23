/**
 * ==========================================================
 * Archivo: models/Stop.js
 * ----------------------------------------------------------
 * Modelo de datos para representar paradas de transporte.
 *
 * Responsabilidad:
 * - Definir la estructura de una parada dentro del sistema
 * - Asociar cada parada a una línea de transporte
 * - Permitir clasificación por dirección del recorrido
 *   (ida / vuelta)
 *
 * Entidad representada:
 * - Parada (Stop / Bus Stop)
 *
 * Campos principales:
 * - name: Nombre de la parada
 * - lat / lon: Ubicación geográfica
 * - lineId: Referencia a la línea asociada
 * - direction: Sentido del recorrido
 * - isTerminal: Indica si es cabecera de línea
 *
 * Uso dentro del sistema:
 * - Representación de paradas en base de datos
 * - Asociación con líneas para consultas dinámicas
 * - Posible uso en cálculos de proximidad o lógica operativa
 *
 * Evaluación de arquitectura:
 * - Modelo válido como representación persistente de paradas
 * - Bien relacionado con Line mediante referencia
 *
 * Observación importante:
 * - Existe otra fuente de datos de paradas en formato GeoJSON
 *   dentro del sistema (data/lineaA.geojson)
 * - Esto implica duplicación de la misma entidad en dos orígenes:
 *   • Base de datos (modelo Stop)
 *   • Archivo estático (GeoJSON)
 *
 * Estado de refactorización:
 * - Requiere definición de estrategia (no urgente pero importante):
 *   • Unificar fuente de verdad (DB vs GeoJSON)
 *   • Evitar inconsistencias entre ambas representaciones
 *
 * Nota:
 * - Mantener ambas fuentes sin sincronización puede generar
 *   divergencia de datos y errores en el sistema.
 * ==========================================================
 */

const stopSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lon: Number,

  lineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Line",
    required: true
  },

  direction: {
    type: String,
    enum: ["ida", "vuelta"],
    required: true
  },

  isTerminal: {
    type: Boolean,
    default: false
  }
});