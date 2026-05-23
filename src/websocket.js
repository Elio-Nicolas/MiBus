const WebSocket = require("ws");
const busRuntime = require("../services/busRuntime");

let wss;

/**
 * ==========================================================
 * Archivo: websocket.js
 * ----------------------------------------------------------
 * Capa de transporte WebSocket del sistema.
 *
 * Responsabilidad:
 * - Mantener conexión con clientes legacy o alternativos
 * - Emitir estado de buses en tiempo real
 * - Funcionar como "mirror" del estado central (busRuntime)
 *
 * IMPORTANTE:
 * Este módulo NO mantiene estado propio.
 * La única fuente de verdad es busRuntime.
 *
 * Depende de:
 * - services/busRuntime (estado en memoria de buses)
 *
 * Sustituye lógica anterior basada en:
 * - clients[]
 * - busStore
 * - broadcast manual con estado duplicado
 * ==========================================================
 */

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Conectado");

    ws.on("close", () => {
      console.log("Desconectado");
    });
  });

  /**
   * ======================================================
   * LOOP DE BROADCAST CENTRALIZADO
   * ======================================================
   *
   * Se ejecuta cada segundo y emite:
   * - snapshot del estado actual de buses desde busRuntime
   *
   * Esto reemplaza cualquier estado interno del WS.
   */
  setInterval(() => {
    if (!wss) return;

    const data = busRuntime.getAllBuses();

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }, 1000);
}

module.exports = { setupWebSocket };