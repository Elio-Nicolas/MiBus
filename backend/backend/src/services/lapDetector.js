/**
 * ==========================================================
 * Archivo: services/lapDetector.js
 * ----------------------------------------------------------
 * Motor principal de detección de vueltas completas.
 *
 * Funciona completamente en memoria.
 *
 * No consulta Mongo en cada GPS.
 * Solo guarda cuando se confirma una vuelta.
 *
 * Diseñado para:
 * - Múltiples unidades simultáneas
 * - Alto rendimiento
 * - Evitar falsos positivos
 * ==========================================================
 */

const { haversineDistanceMeters } = require("../utils/geo");
const Lap = require("../models/Lap");

/**
 * Mapa en memoria que guarda el estado
 * actual de cada unidad.
 *
 * Estructura:
 * unitStates.get(unitId) => {
 *   status: "IDLE" | "IN_PROGRESS",
 *   startedAt: timestamp,
 *   hasMovedAway: boolean,
 *   lapCount: number
 * }
 */
const unitStates = new Map();

/**
 * Procesa una nueva posición GPS recibida.
 */
async function processLocation(unitId, line, lat, lng, driverName, timestamp, io) {
  const now = Date.now();

  if (!unitStates.has(unitId)) {
    unitStates.set(unitId, {
      status: "IDLE",
      startedAt: null,
      hasMovedAway: false,
      lapCount: 0
    });
  }

  const state = unitStates.get(unitId);

  const currentPos = { lat, lng };

  const startCoords = {
    lat: line.startPoint.coordinates[1],
    lng: line.startPoint.coordinates[0]
  };

  const endCoords = {
    lat: line.endPoint.coordinates[1],
    lng: line.endPoint.coordinates[0]
  };

  const distToStart = haversineDistanceMeters(currentPos, startCoords);
  const distToEnd = haversineDistanceMeters(currentPos, endCoords);

  //console.log("START:", lat, lng);
  //console.log("BUS:", currentLat, currentLng);

  /**
   * ==============================
   * DETECTAR INICIO DE VUELTA
   * ==============================
   */
  if (
    state.status === "IDLE" &&
    distToStart <= line.toleranceStartMeters
  ) {
    state.status = "IN_PROGRESS";
    state.startedAt = now;
    state.hasMovedAway = false;

    console.log(`Unidad ${unitId} inició vuelta`);
    return;
  }

  /**
   * ==============================
   * CONFIRMAR ALEJAMIENTO REAL
   * Evita contar vuelta si solo
   * vibró el GPS en la zona inicio
   * ==============================
   */
  if (
    state.status === "IN_PROGRESS" &&
    !state.hasMovedAway &&
    distToStart > 120
  ) {
    state.hasMovedAway = true;
  }

  /**
   * ==============================
   * DETECTAR FINAL DE VUELTA
   * ==============================
   */
  if (
    state.status === "IN_PROGRESS" &&
    state.hasMovedAway &&
    distToEnd <= line.toleranceEndMeters
  ) {
    const duration = (now - state.startedAt) / 1000;

    if (duration >= line.minLapTimeSeconds) {
      await Lap.create({
        unitId,
        lineId: line._id,
        startedAt: new Date(state.startedAt),
        completedAt: new Date(now),
        driverName,
        lineName: line.name,
        durationSeconds: duration
      });

      io.emit("lapCompleted", {
        unitId,
        lineId: line._id,
        duration
      });

      //  INCREMENTA CONTADOR EN MEMORIA
      state.lapCount += 1;

      console.log(`Unidad ${unitId} completó vuelta`);
      console.log(`🚌 Total vueltas unidad ${unitId}: ${state.lapCount}`);

      state.status = "IDLE";
      state.startedAt = null;
      state.hasMovedAway = false;
    }
  }
}

module.exports = {
  processLocation
};