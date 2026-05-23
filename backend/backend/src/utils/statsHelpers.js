/**
 * ==========================================================
 * Archivo: utils/statsHelpers.js
 * ----------------------------------------------------------
 * Funciones utilitarias para transformar métricas del sistema.
 *
 * Se usan para convertir segundos a minutos/horas y
 * facilitar la lectura de métricas del dashboard.
 *
 * Estas funciones NO consultan base de datos.
 * Solo procesan números.
 * ==========================================================
 */

function secondsToMinutes(seconds) {
  return Math.round(seconds / 60);
}

function secondsToHours(seconds) {
  return (seconds / 3600).toFixed(2);
}

module.exports = {
  secondsToMinutes,
  secondsToHours
};