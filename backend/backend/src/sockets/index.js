/**
 * ===============================
 * SOCKETS PRINCIPALES
 * ===============================
 *
 * Este archivo:
 * - Maneja conexiones Socket.IO
 * - Registra buses activos
 * - Maneja locationUpdate
 * - Maneja demo mode
 * - Maneja startSharing / stopSharing
 * - Maneja timeout automático
 */

const Bus = require("../models/Bus");
const { startDemo } = require("../services/demoTransport");
const Line = require("../models/Line");
const { processLocation } = require("../services/lapDetector");
const busRuntime = require("../services/busRuntime");
/* ======================= ESTADOS INTERNOS ======================= */

// Guarda qué usuarios están compartiendo ubicación
const sharingState = {};


// Control del modo demo
let demoRunning = false;
let demoInstance = null;
let demoOwner = null;

// Tiempo máximo sin update antes de desactivar unidad
const UNIT_TIMEOUT_MS = 30_000;

/* ======================= EXPORT PRINCIPAL ======================= */

module.exports = function initSockets(io) {

  /**
   * ===============================
   * CONEXIÓN PRINCIPAL
   * ===============================
   */
  io.on("connection", (socket) => {

    console.log("🟢 Cliente conectado", socket.id);
    console.log("🚀 SOCKET CREADO 'INDEX'");
    /**
     * ===============================
     * REGISTRO DE USUARIO
     * ===============================
     * Se ejecuta cuando el cliente envía su información
     */

socket.on("register", async ({ userId, username, role, assignedUnit, assignedLine }) => {

  socket.userId = userId;
  socket.username = username;
  socket.role = role;
  socket.unitId = assignedUnit || null;
  socket.lineCode = assignedLine || null;

  // ✅ Cargar línea UNA sola vez y guardarla en memoria del socket
  if (assignedLine) {
    socket.lineData = await Line.findOne({ code: assignedLine });
  }

  if (role !== "CHOFER" || !assignedUnit || !assignedLine) return;

  let bus = await Bus.findOne({ unitId: assignedUnit });

  if (bus) {
    bus.driverId = userId;
    bus.driverName = username;
    bus.lineCode = assignedLine;
    bus.active = true;
    bus.lastUpdate = new Date();
    bus.isDemo = false;
    await bus.save();
  } else {
    await Bus.create({
      unitId: assignedUnit,
      driverId: userId,
      driverName: username,
      lineCode: assignedLine,
      active: true,
      isDemo: false,
      lastUpdate: new Date(),
    });
  }
});

    /**
     * ===============================
     * LOCATION UPDATE
     * ===============================
     * Recibe ubicación en tiempo real
     */
   socket.on("locationUpdate", (data) => {

  if (!data || typeof data.lat !== "number" || typeof data.lon !== "number") {
    console.warn("⚠️ locationUpdate inválido", data);
    return;
  }

  busRuntime.updateBus(socket.userId, {
  userId: socket.userId,
  unitId: socket.unitId,
  line: socket.lineCode,
  driverName: socket.username,
  lat: data.lat,
  lon: data.lon,
});

  // ✅ Usar línea guardada en memoria (NO consulta Mongo cada vez)
  const line = socket.lineData;

  if (line && line.startPoint && line.endPoint) {
    processLocation(
      socket.unitId,
      line,
      data.lat,
      data.lon,
      io
    );
  }

  io.emit("busUpdate", busRuntime.getAllBuses());
});

    /**
     * ===============================
     * START SHARING
     * ===============================
     */
    socket.on("startSharing", () => {
      sharingState[socket.userId] = true;
      console.log("🟢 startSharing", socket.userId);
    });

    /**
     * ===============================
     * STOP SHARING
     * ===============================
     */
    socket.on("stopSharing", () => {
      delete sharingState[socket.userId];
      busRuntime.removeBus(socket.userId);

      console.log("🛑 stopSharing", socket.userId);

      io.emit("busUpdate", busRuntime.getAllBuses());
    });

    /**
     * ===============================
     * DEMO MODE
     * ===============================
     */

    socket.emit("demo:status", { enabled: demoRunning });
    
    socket.on("demo:start", async () => {
      
       if (socket.role !== "ADMIN") return;
       

          if (demoRunning && demoInstance) {
            console.log("⚠️ Había una demo corriendo → la mato");

             demoInstance.stop();
             demoInstance = null;
             demoRunning = false;
           }

          if (demoRunning) return;

             demoRunning = true;
             demoOwner = socket.id;

             demoInstance = await startDemo(io);

         io.emit("demo:status", { enabled: true });
     });

    socket.on("demo:stop", () => {
  if (socket.role !== "ADMIN") return;

  if (!demoRunning) return;

  console.log("🛑 DETENIENDO DEMO...");

  demoRunning = false;

  if (demoInstance) {
    demoInstance.stop();
    console.log("✅ demoInstance.stop() ejecutado");
  } else {
    console.log("❌ demoInstance es null");
  }

  demoInstance = null;
  demoOwner = null;

  io.emit("demo:status", { enabled: false });
});

    /**
     * ===============================
     * DISCONNECT
     * ===============================
     */
   socket.on("disconnect", () => {
  console.log("⚠️ Cliente desconectado", socket.userId);

  if (socket.id === demoOwner && demoInstance) {
    console.log("🛑 Demo detenida por desconexión del admin");

    demoRunning = false;
    demoInstance.stop();
    demoInstance = null;
    demoOwner = null;
    busRuntime.removeBus(socket.userId);
    io.emit("demo:status", { enabled: false });
     }
    });

  });

  /**
   * ===============================
   * TIMEOUT AUTOMÁTICO
   * ===============================
   * Cada 10 segundos verifica
   * si una unidad dejó de enviar updates
   */
  setInterval(async () => {

    const limite = new Date(Date.now() - UNIT_TIMEOUT_MS);

    await Bus.updateMany(
      { active: true, lastUpdate: { $lt: limite } },
      { active: false }
    );

  }, 10_000);

};