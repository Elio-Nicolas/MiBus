/**
 * ==========================================================
 * Archivo: utils/geo.js
 * ----------------------------------------------------------
 * Responsabilidad:
 * Funciones matemáticas geoespaciales utilizadas por el sistema.
 *
 * Actualmente:
 * - Cálculo de distancia entre dos coordenadas usando fórmula Haversine.
 *
 * Importante:
 * - No depende de MongoDB.
 * - Se usa para lógica en tiempo real en memoria.
 * - Mucho más eficiente que hacer consultas geoespaciales constantes.
 * ==========================================================
 */

const toRad = (value) => (value * Math.PI) / 180;

/**
 * Calcula la distancia en metros entre dos puntos geográficos.
 *
 * @param {Object} coord1 { lat, lng }
 * @param {Object} coord2 { lat, lng }
 * @returns {Number} distancia en metros
 */
function haversineDistanceMeters(coord1, coord2) {
  const R = 6371000; // Radio de la Tierra en metros

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);

  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = {
  haversineDistanceMeters
};