/**
 * ==========================================================
 * Archivo: services/busRuntime.js
 * ----------------------------------------------------------
 * Fuente única de estado en memoria para buses activos.
 *
 * Responsabilidad:
 * - Mantener estado actual de buses en tiempo real
 * - Actualizar ubicación de unidades
 * - Obtener snapshot global de buses activos
 * - Marcar buses inactivos (timeout lógico externo)
 *
 * IMPORTANTE:
 * Este módulo reemplaza la duplicación de estado entre:
 * - Socket.IO (activeBuses en memoria)
 * - WebSocket (busStore / updateBus)
 *
 * No maneja:
 * - Persistencia en base de datos (MongoDB)
 * - Transporte (Socket.IO o WebSocket)
 *
 * Es la capa intermedia única de verdad en runtime.
 * ==========================================================
 */

// services/busRuntime.js

const buses = {};

/**
 * Actualiza o crea bus en memoria
 */
function updateBus(userId, data) {
  if (!userId) return;

  buses[userId] = {
    ...(buses[userId] || {}),
    ...data,
    lastUpdate: new Date(),
  };
}

/**
 * Devuelve todos los buses activos
 */
function getAllBuses() {
  return Object.values(buses);
}

/**
 * Elimina un bus del estado en memoria
 */
function removeBus(userId) {
  delete buses[userId];
}

/**
 * Limpia buses inactivos por timeout
 */
function deactivateOld(thresholdMs = 30000) {
  const limit = Date.now() - thresholdMs;

  for (const [userId, bus] of Object.entries(buses)) {
    if (bus.lastUpdate && new Date(bus.lastUpdate).getTime() < limit) {
      delete buses[userId];
    }
  }
}

module.exports = {
  updateBus,
  getAllBuses,
  removeBus,
  deactivateOld,
};