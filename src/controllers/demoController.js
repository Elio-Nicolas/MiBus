/**
 * ==========================================================
 * Archivo: controllers/demoController.js
 * ----------------------------------------------------------
 * Controlador de datos simulados (modo demo) del sistema MiBus.
 *
 * Descripción:
 * Este controlador expone información simulada de unidades y
 * choferes, utilizada para pruebas, demostraciones y validación
 * del sistema sin necesidad de conexión a datos reales.
 *
 * La información proviene de una fuente estática definida en
 * el mismo archivo, representando un conjunto reducido de
 * colectivos y conductores ficticios.
 *
 * Funcionalidades principales:
 * - Proveer estado básico del sistema en modo demo
 * - Exponer cantidad de unidades simuladas
 * - Exponer lista de choferes asociados
 *
 * Tipo de lógica:
 * - Datos mockeados (hardcoded)
 * - Sin acceso a base de datos
 * - Sin lógica de negocio compleja
 *
 * Observaciones de arquitectura:
 * - Este controlador cumple una función auxiliar orientada
 *   exclusivamente a testing y demostración.
 * - No representa el comportamiento real del sistema productivo.
 * - Puede ser reemplazado en el futuro por una capa de simulación
 *   más avanzada o eliminada en entornos productivos.
 *
 * Este archivo NO:
 * - Consulta base de datos
 * - Aplica lógica de negocio real
 * - Maneja estados persistentes
 *
 * Rol dentro del sistema:
 * Actúa como proveedor de datos ficticios para pruebas rápidas,
 * desarrollo frontend y validación de flujos sin dependencia
 * del backend completo.
 * ==========================================================
 */

// 🔹 MISMA fuente que tu simulador
const DEMO_BUSES = [
  { unitId: "DEMO-A-01", driverName: "Carlos Gómez" },
  { unitId: "DEMO-A-02", driverName: "Lucía Fernández" },
  { unitId: "DEMO-A-03", driverName: "Miguel Rojas" }
];

exports.getDemoStatus = (req, res) => {
  res.json({
    buses: DEMO_BUSES.length,
    choferes: DEMO_BUSES.length,
    drivers: DEMO_BUSES.map(b => b.driverName)
  });
};